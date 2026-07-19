import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

router.put('/update', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { travellerType } = req.body;

    if (!travellerType || !['normal', 'vlogger'].includes(travellerType)) {
      res.status(400).json({ error: 'Invalid traveller type' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { travellerType }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        travellerType: updatedUser.travellerType
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error occurred' });
  }
});

export default router;
