import { invalidateAllCaches } from '@/lib/cache';
import { logError, logger } from '@/lib/logging/logger';

export async function POST(request: Request) {
  const secret = process.env.CACHE_INVALIDATION_SECRET;
  const provided = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!secret || provided !== secret) {
    logger.warn({ provided: provided ? '[redacted]' : 'none' }, 'Cache invalidation rejected: invalid or missing secret');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await invalidateAllCaches();

    return new Response(JSON.stringify({
      success: true,
      message: 'All caches invalidated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logError('Cache invalidation API error', error);

    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to invalidate caches'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
