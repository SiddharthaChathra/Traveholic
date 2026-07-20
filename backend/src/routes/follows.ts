import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { parsePaginationQuery, buildPrismaPagination, paginateResults } from '../utils/pagination';

const router = Router();

// POST /api/follows/:userId — Follow a user
router.post('/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.userId as string;
    const followerId = req.userId!;

    if (followerId === targetUserId) {
      res.status(400).json({ error: 'You cannot follow yourself' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetUserId } }
    });

    if (existing) {
      res.status(409).json({ error: 'Already following this user', status: existing.status });
      return;
    }

    // If target user is private, create a pending follow request
    const status = targetUser.isPrivate ? 'pending' : 'accepted';

    const follow = await prisma.follow.create({
      data: { followerId, followingId: targetUserId, status }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        actorId: followerId,
        type: status === 'pending' ? 'follow_request' : 'follow',
        message: status === 'pending' ? 'sent you a follow request' : 'started following you'
      }
    });

    res.json({ success: true, follow, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to follow user' });
  }
});

// DELETE /api/follows/:userId — Unfollow a user
router.delete('/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.userId as string;
    const followerId = req.userId!;

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetUserId } }
    });

    if (!existing) {
      res.status(404).json({ error: 'Not following this user' });
      return;
    }

    await prisma.follow.delete({
      where: { id: existing.id }
    });

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to unfollow user' });
  }
});

// GET /api/follows/requests — Get pending follow requests for the authenticated user
router.get('/requests', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const requests = await prisma.follow.findMany({
      where: { followingId: userId, status: 'pending' },
      include: {
        follower: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch follow requests' });
  }
});

// PUT /api/follows/requests/:id/accept — Accept a follow request
router.put('/requests/:id/accept', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id as string;
    const userId = req.userId!;

    const followRequest = await prisma.follow.findUnique({ where: { id: requestId } });
    if (!followRequest || followRequest.followingId !== userId) {
      res.status(404).json({ error: 'Follow request not found' });
      return;
    }

    if (followRequest.status !== 'pending') {
      res.status(400).json({ error: 'This request has already been handled' });
      return;
    }

    const updated = await prisma.follow.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    // Notify the follower that their request was accepted
    await prisma.notification.create({
      data: {
        userId: followRequest.followerId,
        actorId: userId,
        type: 'follow',
        message: 'accepted your follow request'
      }
    });

    res.json({ success: true, follow: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to accept follow request' });
  }
});

// DELETE /api/follows/requests/:id — Decline a follow request
router.delete('/requests/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id as string;
    const userId = req.userId!;

    const followRequest = await prisma.follow.findUnique({ where: { id: requestId } });
    if (!followRequest || followRequest.followingId !== userId) {
      res.status(404).json({ error: 'Follow request not found' });
      return;
    }

    await prisma.follow.delete({ where: { id: requestId } });

    res.json({ success: true, message: 'Follow request declined' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to decline follow request' });
  }
});

// GET /api/follows/:userId/followers — Get a user's followers
router.get('/:userId/followers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const pagination = parsePaginationQuery(req.query);

    const followers = await prisma.follow.findMany({
      where: { followingId: userId, status: 'accepted' },
      include: {
        follower: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, isVerified: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    const result = paginateResults(followers, pagination.limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch followers' });
  }
});

// GET /api/follows/:userId/following — Get who a user follows
router.get('/:userId/following', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const pagination = parsePaginationQuery(req.query);

    const following = await prisma.follow.findMany({
      where: { followerId: userId, status: 'accepted' },
      include: {
        following: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, isVerified: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    const result = paginateResults(following, pagination.limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch following' });
  }
});

// GET /api/follows/status/:userId — Check follow status between current user and target
router.get('/status/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.userId as string;
    const currentUserId = req.userId!;

    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } }
    });

    const followedBy = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: targetUserId, followingId: currentUserId } }
    });

    res.json({
      isFollowing: follow?.status === 'accepted' || false,
      isPending: follow?.status === 'pending' || false,
      isFollowedBy: followedBy?.status === 'accepted' || false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to check follow status' });
  }
});

export default router;
