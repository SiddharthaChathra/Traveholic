import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all stays listings
router.get('/', async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch listings' });
  }
});

// GET listing by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch listing' });
  }
});

// POST create listing
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, rating, reviewsCount, location, category, image, businessProfileId } = req.body;

    if (!name || !price || !location || !category || !businessProfileId) {
      res.status(400).json({ error: 'Name, price, location, category, and businessProfileId are required' });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        name,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : 5.0,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 0,
        location,
        category,
        image: image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        businessProfileId
      }
    });

    res.json({ success: true, listing });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create listing' });
  }
});

export default router;
