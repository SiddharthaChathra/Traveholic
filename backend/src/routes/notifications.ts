import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { parsePaginationQuery, buildPrismaPagination, paginateResults } from '../utils/pagination';

const router = Router();

// GET /api/notifications — Get notifications for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const filter = req.query.filter as string | undefined; // "all", "following", "comments", "follows"
    const pagination = parsePaginationQuery(req.query);

    let typeFilter: any = {};
    if (filter === 'follows') {
      typeFilter = { type: { in: ['follow', 'follow_request'] } };
    } else if (filter === 'comments') {
      typeFilter = { type: 'comment' };
    } else if (filter === 'following') {
      // Notifications from people the user follows
      const followingIds = await prisma.follow.findMany({
        where: { followerId: userId, status: 'accepted' },
        select: { followingId: true }
      });
      typeFilter = { actorId: { in: followingIds.map(f => f.followingId) } };
    }

    const notifications = await prisma.notification.findMany({
      where: { userId, ...typeFilter },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    // Enrich notifications with actor info
    const actorIds = [...new Set(notifications.map(n => n.actorId))];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true }
    });
    const actorMap = new Map(actors.map(a => [a.id, a]));

    const enriched = notifications.map(n => ({
      ...n,
      actor: actorMap.get(n.actorId) || null
    }));

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    });

    const result = paginateResults(enriched, pagination.limit);
    res.json({ ...result, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/read — Mark all or specific notifications as read
router.put('/read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { ids } = req.body; // optional array of notification IDs

    if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { userId, id: { in: ids } },
        data: { read: true }
      });
    } else {
      // Mark all unread notifications as read
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    }

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark notifications as read' });
  }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notificationId = req.params.id as string;
    const userId = req.userId!;

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
});

export default router;
