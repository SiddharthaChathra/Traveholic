import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all bookings (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, businessProfileId } = req.query;

    let whereClause: any = {};
    if (userId) {
      whereClause.userId = String(userId);
    }
    if (businessProfileId) {
      whereClause.listing = {
        businessProfileId: String(businessProfileId)
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        listing: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
});

// POST create booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, price, guestCount, listingId, userId } = req.body;

    if (!checkIn || !checkOut || !price || !listingId || !userId) {
      res.status(400).json({ error: 'CheckIn, checkOut, price, listingId, and userId are required' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        price: parseFloat(price),
        guestCount: guestCount ? parseInt(guestCount) : 1,
        status: 'upcoming',
        listingId,
        userId
      },
      include: {
        listing: true
      }
    });

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// PUT update booking status
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // "upcoming", "ongoing", "completed"

    if (!status || !['upcoming', 'ongoing', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid booking status' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        listing: true
      }
    });

    res.json({ success: true, booking: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update booking status' });
  }
});

export default router;
