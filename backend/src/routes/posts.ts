import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth, optionalAuth } from '../middleware/auth';
import { parsePaginationQuery, buildPrismaPagination, paginateResults } from '../utils/pagination';

const router = Router();

// GET all posts with comments (cursor paginated)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const pagination = parsePaginationQuery(req.query);
    const userId = req.userId;

    const posts = await prisma.post.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    // Enrich with like/save status if authenticated
    if (userId) {
      const postIds = posts.map(p => p.id);
      const [userLikes, userSaves] = await Promise.all([
        prisma.postLike.findMany({
          where: { userId, postId: { in: postIds } },
          select: { postId: true }
        }),
        prisma.savedPost.findMany({
          where: { userId, postId: { in: postIds } },
          select: { postId: true }
        })
      ]);

      const likedSet = new Set(userLikes.map(l => l.postId));
      const savedSet = new Set(userSaves.map(s => s.postId));

      const enriched = posts.map(post => ({
        ...post,
        isLiked: likedSet.has(post.id),
        isSaved: savedSet.has(post.id)
      }));

      const result = paginateResults(enriched, pagination.limit);
      res.json(result.data); // Keep backward compatible — return flat array
      return;
    }

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch posts' });
  }
});

// GET saved posts for authenticated user
router.get('/saved', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const pagination = parsePaginationQuery(req.query);

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            comments: {
              orderBy: { createdAt: 'asc' },
              take: 3
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    const posts = savedPosts.map(sp => ({
      ...sp.post,
      savedAt: sp.createdAt,
      isSaved: true
    }));

    const result = paginateResults(savedPosts, pagination.limit);
    res.json({ ...result, data: posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch saved posts' });
  }
});

// GET posts by a specific user
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.params.userId as string;
    const pagination = parsePaginationQuery(req.query);

    const posts = await prisma.post.findMany({
      where: { creatorId },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    const result = paginateResults(posts, pagination.limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user posts' });
  }
});

// POST a new post
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { caption, images, location } = req.body;
    const creatorId = req.userId;

    if (!caption || !images || !creatorId) {
      res.status(400).json({ error: 'Caption, images, and authentication are required' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        caption,
        images,
        location: location || '',
        creatorId,
        likesCount: 0
      }
    });

    res.json({ success: true, post });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
});

// POST like toggle — per-user idempotent
router.post('/:id/like', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const postId = req.params.id as string;
    const userId = req.userId;
    const { increment } = req.body; // boolean — kept for backward compatibility

    const postExists = await prisma.post.findUnique({ where: { id: postId } });
    if (!postExists) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // If authenticated, use per-user tracking
    if (userId) {
      const existingLike = await prisma.postLike.findUnique({
        where: { userId_postId: { userId, postId } }
      });

      if (existingLike) {
        // Unlike
        await prisma.postLike.delete({ where: { id: existingLike.id } });
        const updated = await prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        });
        res.json({ success: true, liked: false, likesCount: Math.max(0, updated.likesCount) });
      } else {
        // Like
        await prisma.postLike.create({ data: { userId, postId } });
        const updated = await prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        });

        // Create notification for post creator (if not self)
        if (postExists.creatorId !== userId) {
          await prisma.notification.create({
            data: {
              userId: postExists.creatorId,
              actorId: userId,
              type: 'like',
              entityId: postId,
              message: 'liked your post'
            }
          });
        }

        res.json({ success: true, liked: true, likesCount: updated.likesCount });
      }
    } else {
      // Fallback for unauthenticated users (backward compatible)
      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: increment ? 1 : -1
          }
        }
      });

      res.json({ success: true, likesCount: updated.likesCount });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update post likes' });
  }
});

// POST save/unsave toggle
router.post('/:id/save', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const postId = req.params.id as string;
    const userId = req.userId!;

    const postExists = await prisma.post.findUnique({ where: { id: postId } });
    if (!postExists) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const existingSave = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingSave) {
      await prisma.savedPost.delete({ where: { id: existingSave.id } });
      res.json({ success: true, saved: false });
    } else {
      await prisma.savedPost.create({ data: { userId, postId } });
      res.json({ success: true, saved: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle save' });
  }
});

// POST a comment on a post
router.post('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { user, text, avatarColor } = req.body;

    if (!text || !user) {
      res.status(400).json({ error: 'Username and text are required' });
      return;
    }

    const postExists = await prisma.post.findUnique({ where: { id } });
    if (!postExists) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        user,
        avatarColor: avatarColor || 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        postId: id
      }
    });

    // Create notification for post creator
    // Try to find the commenter user to get their ID
    const commenter = await prisma.user.findFirst({ where: { username: user } });
    if (commenter && postExists.creatorId !== commenter.id) {
      await prisma.notification.create({
        data: {
          userId: postExists.creatorId,
          actorId: commenter.id,
          type: 'comment',
          entityId: id,
          message: `commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
        }
      });
    }

    res.json({ success: true, comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add comment' });
  }
});

export default router;
