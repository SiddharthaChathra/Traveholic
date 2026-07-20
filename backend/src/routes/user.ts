import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

// PUT /api/user/update — Update traveller type (existing)
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

// PUT /api/user/profile — Update user profile (bio, website, avatar, fullName)
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { bio, website, avatarUrl, fullName, isPrivate } = req.body;

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (isPrivate !== undefined) updateData.isPrivate = Boolean(isPrivate);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        website: updatedUser.website,
        isVerified: updatedUser.isVerified,
        countriesCount: updatedUser.countriesCount,
        isPrivate: updatedUser.isPrivate,
        role: updatedUser.role,
        travellerType: updatedUser.travellerType
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// GET /api/user/suggestions — Get suggested people to follow
router.get('/suggestions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 30);

    // Get IDs of users already followed
    const following = await prisma.follow.findMany({
      where: { followerId: userId, status: 'accepted' },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);
    const excludeIds = [userId, ...followingIds];

    // Get users we follow's followers (mutual connections)
    const mutualFollowerIds = await prisma.follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: { notIn: excludeIds },
        status: 'accepted'
      },
      select: { followingId: true },
      distinct: ['followingId'],
      take: limit
    });

    const mutualIds = mutualFollowerIds.map(f => f.followingId);

    // Fill remaining slots with other users
    let suggestedUsers;
    if (mutualIds.length >= limit) {
      suggestedUsers = await prisma.user.findMany({
        where: { id: { in: mutualIds } },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          role: true,
          travellerType: true,
        },
        take: limit
      });
    } else {
      // Get mutual-based + fill with other users
      const remainingLimit = limit - mutualIds.length;
      const others = await prisma.user.findMany({
        where: { id: { notIn: [...excludeIds, ...mutualIds] } },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          role: true,
          travellerType: true,
        },
        take: remainingLimit
      });

      const mutuals = mutualIds.length > 0 ? await prisma.user.findMany({
        where: { id: { in: mutualIds } },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          role: true,
          travellerType: true,
        }
      }) : [];

      suggestedUsers = [...mutuals, ...others];
    }

    // For each suggested user, count mutual followers
    const enriched = await Promise.all(suggestedUsers.map(async (su) => {
      const mutualFollowers = await prisma.follow.count({
        where: {
          followingId: su.id,
          followerId: { in: followingIds },
          status: 'accepted'
        }
      });

      const followersCount = await prisma.follow.count({
        where: { followingId: su.id, status: 'accepted' }
      });

      return {
        ...su,
        mutualFollowers,
        followersCount,
        isMutualBased: mutualIds.includes(su.id)
      };
    }));

    // Sort: mutual-based first, then by followers count
    enriched.sort((a, b) => {
      if (a.isMutualBased && !b.isMutualBased) return -1;
      if (!a.isMutualBased && b.isMutualBased) return 1;
      return b.followersCount - a.followersCount;
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch suggestions' });
  }
});

// GET /api/user/:username — Get public profile by username
router.get('/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        website: true,
        isVerified: true,
        countriesCount: true,
        role: true,
        travellerType: true,
        isPrivate: true,
        createdAt: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get follower/following/posts counts
    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id, status: 'accepted' } }),
      prisma.follow.count({ where: { followerId: user.id, status: 'accepted' } }),
      prisma.post.count({ where: { creatorId: user.id } })
    ]);

    // Get user's highlights
    const highlights = await prisma.highlight.findMany({
      where: { userId: user.id },
      include: {
        stories: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      ...user,
      followersCount,
      followingCount,
      postsCount,
      highlights
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user profile' });
  }
});

export default router;
