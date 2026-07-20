import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, optionalAuth } from '../middleware/auth';
import { parsePaginationQuery, buildPrismaPagination, paginateResults } from '../utils/pagination';

const router = Router();

// GET /api/feed — Personalized feed with cursor pagination
// If authenticated: shows posts from followed users first, then others
// If unauthenticated: shows all posts by recency
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const pagination = parsePaginationQuery(req.query);

    let followingIds: string[] = [];
    if (userId) {
      const following = await prisma.follow.findMany({
        where: { followerId: userId, status: 'accepted' },
        select: { followingId: true }
      });
      followingIds = following.map(f => f.followingId);
    }

    // Fetch posts with pagination
    const posts = await prisma.post.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 3 // Only return last 3 comments for feed preview
        }
      },
      orderBy: { createdAt: 'desc' },
      ...buildPrismaPagination(pagination)
    });

    // Enrich posts with like/save status for authenticated users
    let enrichedPosts = posts;
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

      enrichedPosts = posts.map(post => ({
        ...post,
        isLiked: likedSet.has(post.id),
        isSaved: savedSet.has(post.id),
        isFollowing: followingIds.includes(post.creatorId)
      })) as any;
    }

    // Simple ranking: followed users' posts score higher
    if (userId && followingIds.length > 0) {
      enrichedPosts.sort((a: any, b: any) => {
        const aFollowed = followingIds.includes(a.creatorId) ? 1 : 0;
        const bFollowed = followingIds.includes(b.creatorId) ? 1 : 0;
        if (aFollowed !== bFollowed) return bFollowed - aFollowed;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const result = paginateResults(enrichedPosts, pagination.limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch feed' });
  }
});

export default router;
