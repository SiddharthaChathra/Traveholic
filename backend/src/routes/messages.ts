import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET private chat logs between two users
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      res.status(400).json({ error: 'SenderId and receiverId are required' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: String(senderId), receiverId: String(receiverId) },
          { senderId: String(receiverId), receiverId: String(senderId) }
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// POST send a new message
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      res.status(400).json({ error: 'SenderId, receiverId, and text are required' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text
      }
    });

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

export default router;
