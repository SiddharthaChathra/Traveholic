import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/search?q=...&type=users|destinations|posts|all
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string || '').trim();
    const type = (req.query.type as string || 'all').toLowerCase();
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const results: any = {};

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { fullName: { contains: query } },
          ]
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          role: true
        },
        take: limit
      });
      results.users = users;
    }

    // Search destinations
    if (type === 'all' || type === 'destinations') {
      const destinations = await prisma.destination.findMany({
        where: {
          OR: [
            { id: { contains: query.toLowerCase() } },
            { fullName: { contains: query } },
          ]
        },
        select: {
          id: true,
          fullName: true,
          visaStatus: true,
          exchangeRate: true,
        },
        take: limit
      });
      results.destinations = destinations;
    }

    // Search posts (by caption or location)
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { caption: { contains: query } },
            { location: { contains: query } },
          ]
        },
        select: {
          id: true,
          caption: true,
          images: true,
          location: true,
          likesCount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      results.posts = posts;
    }

    // Search listings
    if (type === 'all' || type === 'listings') {
      const listings = await prisma.listing.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { location: { contains: query } },
            { category: { contains: query } },
          ]
        },
        select: {
          id: true,
          name: true,
          price: true,
          rating: true,
          location: true,
          category: true,
          image: true,
        },
        take: limit
      });
      results.listings = listings;
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

export default router;
