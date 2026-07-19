import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all destinations
router.get('/', async (req: Request, res: Response) => {
  try {
    const destinations = await prisma.destination.findMany();
    // Parse JSON string fields back to objects
    const parsed = destinations.map(dest => ({
      ...dest,
      visaDocuments: JSON.parse(dest.visaDocuments),
      flights: JSON.parse(dest.flights),
      itinerary: JSON.parse(dest.itinerary),
      attractions: JSON.parse(dest.attractions),
      food: JSON.parse(dest.food),
      souvenirs: JSON.parse(dest.souvenirs),
      weatherBackup: JSON.parse(dest.weatherBackup),
      emergencyContacts: JSON.parse(dest.emergencyContacts),
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch destinations' });
  }
});

// GET destination by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dest = await prisma.destination.findUnique({
      where: { id: id.toLowerCase().trim() }
    });

    if (!dest) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const parsed = {
      ...dest,
      visaDocuments: JSON.parse(dest.visaDocuments),
      flights: JSON.parse(dest.flights),
      itinerary: JSON.parse(dest.itinerary),
      attractions: JSON.parse(dest.attractions),
      food: JSON.parse(dest.food),
      souvenirs: JSON.parse(dest.souvenirs),
      weatherBackup: JSON.parse(dest.weatherBackup),
      emergencyContacts: JSON.parse(dest.emergencyContacts),
    };

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch destination' });
  }
});

export default router;
