/**
 * Cursor-based pagination helper.
 * Uses `createdAt` + `id` as the cursor for stable ordering.
 */
export interface PaginationParams {
  cursor?: string;   // ID of the last item from previous page
  limit: number;     // Number of items to fetch
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function parsePaginationQuery(query: any): PaginationParams {
  const cursor = query.cursor as string | undefined;
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 50);
  return { cursor, limit };
}

/**
 * Builds a Prisma-compatible pagination clause.
 * Usage: const { take, skip, cursor } = buildPrismaPagination(params);
 */
export function buildPrismaPagination(params: PaginationParams): { take: number; skip?: number; cursor?: { id: string } } {
  if (params.cursor) {
    return {
      take: params.limit,
      skip: 1, // Skip the cursor item itself
      cursor: { id: params.cursor },
    };
  }
  return {
    take: params.limit,
  };
}

/**
 * Wraps query results into a paginated response.
 */
export function paginateResults<T extends { id: string }>(
  items: T[],
  limit: number
): PaginatedResult<T> {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;
  return { data: items, nextCursor, hasMore };
}
