import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/stories — Get active stories from followed users + own stories
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const now = new Date();

    // Get IDs of users we follow
    const following = await prisma.follow.findMany({
      where: { followerId: userId, status: 'accepted' },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // Include own userId so the user sees their own stories
    const userIds = [userId, ...followingIds];

    // Fetch active (non-expired) stories
    const stories = await prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: now }
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true }
        },
        views: {
          where: { viewerId: userId },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group stories by user
    const grouped: Record<string, any> = {};
    for (const story of stories) {
      const uid = story.userId;
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
          isOwn: uid === userId
        };
      }
      const viewed = story.views.length > 0;
      if (!viewed) grouped[uid].hasUnviewed = true;
      grouped[uid].stories.push({
        id: story.id,
        imageUrl: story.imageUrl,
        caption: story.caption,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        viewed
      });
    }

    // Sort: own stories first, then unviewed first, then by recency
    const result = Object.values(grouped).sort((a: any, b: any) => {
      if (a.isOwn && !b.isOwn) return -1;
      if (!a.isOwn && b.isOwn) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch stories' });
  }
});

// POST /api/stories — Create a new story
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { imageUrl, caption } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: 'imageUrl is required' });
      return;
    }

    // Stories expire in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: { userId, imageUrl, caption, expiresAt }
    });

    res.json({ success: true, story });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create story' });
  }
});

// POST /api/stories/:id/view — Mark a story as viewed
router.post('/:id/view', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const storyId = req.params.id as string;
    const viewerId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    // Upsert: don't fail if already viewed
    await prisma.storyView.upsert({
      where: { storyId_viewerId: { storyId, viewerId } },
      create: { storyId, viewerId },
      update: {} // no-op if exists
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark story as viewed' });
  }
});

// DELETE /api/stories/:id — Delete own story
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const storyId = req.params.id as string;
    const userId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story || story.userId !== userId) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    await prisma.story.delete({ where: { id: storyId } });

    res.json({ success: true, message: 'Story deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete story' });
  }
});

export default router;
