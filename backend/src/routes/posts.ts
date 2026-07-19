import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all posts with comments
router.get('/', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch posts' });
  }
});

// POST a new post
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { caption, images, location, creatorId } = req.body;

    if (!caption || !images || !creatorId) {
      res.status(400).json({ error: 'Caption, images, and creatorId are required' });
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

// POST like toggle
router.post('/:id/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { increment } = req.body; // boolean

    const postExists = await prisma.post.findUnique({ where: { id } });
    if (!postExists) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        likesCount: {
          increment: increment ? 1 : -1
        }
      }
    });

    res.json({ success: true, likesCount: updated.likesCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update post likes' });
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

    res.json({ success: true, comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add comment' });
  }
});

export default router;
