import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const listingIdMap: Record<string, string> = {
  'vlog-1': 'list-5',
  'vlog-2': 'list-2',
  'vlog-3': 'list-1',
  'vlog-4': 'list-3'
};

// GET all vlogs
router.get('/', async (req: Request, res: Response) => {
  try {
    const vlogs = await prisma.vlog.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Attach featuredStay details
    const result = await Promise.all(vlogs.map(async (vlog) => {
      const listingId = listingIdMap[vlog.id];
      let featuredStay = null;
      if (listingId) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (listing) {
          featuredStay = {
            id: listing.id,
            name: listing.name,
            image: listing.image,
            price: `$${listing.price} / night`,
            location: listing.location
          };
        }
      }
      return { ...vlog, featuredStay };
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch vlogs' });
  }
});

// GET vlog by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const vlog = await prisma.vlog.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!vlog) {
      res.status(404).json({ error: 'Vlog not found' });
      return;
    }

    const listingId = listingIdMap[vlog.id];
    let featuredStay = null;
    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (listing) {
        featuredStay = {
          id: listing.id,
          name: listing.name,
          image: listing.image,
          price: `$${listing.price} / night`,
          location: listing.location
        };
      }
    }

    res.json({ ...vlog, featuredStay });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch vlog details' });
  }
});

// POST a comment on a vlog
router.post('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { user, text, avatarColor } = req.body;

    if (!text || !user) {
      res.status(400).json({ error: 'Username and text are required' });
      return;
    }

    const vlogExists = await prisma.vlog.findUnique({ where: { id } });
    if (!vlogExists) {
      res.status(404).json({ error: 'Vlog not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        user,
        avatarColor: avatarColor || 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        vlogId: id
      }
    });

    res.json({ success: true, comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add comment' });
  }
});

// POST toggle like on a vlog
router.post('/:id/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { increment } = req.body; // boolean: true to like, false to unlike

    const vlog = await prisma.vlog.findUnique({ where: { id } });
    if (!vlog) {
      res.status(404).json({ error: 'Vlog not found' });
      return;
    }

    const updated = await prisma.vlog.update({
      where: { id },
      data: {
        likes: {
          increment: increment ? 1 : -1
        }
      }
    });

    res.json({ success: true, likes: updated.likes });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update vlog likes' });
  }
});

export default router;
