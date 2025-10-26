// app/lib/rate-limit.ts
import { kv } from '@vercel/kv';
import { logger } from './logger';

interface RateLimitParams {
  ip: string;
  limit: number;
  duration: number; // in seconds
  action: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt?: Date;
}

/**
 * Simple rate limiting implementation using Vercel KV (Redis)
 */
export async function rateLimit({
  ip,
  limit,
  duration,
  action
}: RateLimitParams): Promise<RateLimitResult> {
  // Create a unique key for this IP and action
  const key = `ratelimit:${action}:${ip}`;
  
  try {
    // Get current count from Redis
    const current = await kv.get<number>(key) || 0;
    
    // Check if over limit
    if (current >= limit) {
      // Get TTL to determine reset time
      const ttl = await kv.ttl(key);
      const resetAt = new Date(Date.now() + ttl * 1000);
      
      logger.warn('Rate limit exceeded', { 
        ip, 
        action, 
        current, 
        limit,
        resetAt: resetAt.toISOString() 
      });
      
      return {
        success: false,
        remaining: 0,
        resetAt
      };
    }
    
    // Increment the counter
    const newCount = await kv.incr(key);
    
    // Set expiry if this is the first request
    if (newCount === 1) {
      await kv.expire(key, duration);
    }
    
    // Get TTL for response headers
    const ttl = await kv.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);
    
    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      resetAt
    };
  } catch (error) {
    // If rate limiting fails, log but allow the request
    logger.error('Rate limiting error', { error, ip, action });
    
    return {
      success: true,
      remaining: 999 // Arbitrary high number
    };
  }
}

/**
 * Alternative implementation using in-memory storage
 * Use this if Vercel KV is not available
 */
export function createInMemoryRateLimiter() {
  // Store rate limiting data in memory
  // Note: This will reset when the serverless function cold starts
  const store = new Map<string, { count: number; resetAt: number }>();
  
  return async function inMemoryRateLimit({
    ip,
    limit,
    duration,
    action
  }: RateLimitParams): Promise<RateLimitResult> {
    const key = `${action}:${ip}`;
    const now = Date.now();
    
    // Clean up expired entries
    store.forEach((data, storedKey) => {
      if (data.resetAt < now) {
        store.delete(storedKey);
      }
    });
    
    // Get or create entry
    let entry = store.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        resetAt: now + duration * 1000
      };
      store.set(key, entry);
    } else if (entry.resetAt < now) {
      // Reset expired counter
      entry.count = 0;
      entry.resetAt = now + duration * 1000;
    }
    
    // Check if over limit
    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt)
      };
    }
    
    // Increment counter
    entry.count++;
    
    return {
      success: true,
      remaining: limit - entry.count,
      resetAt: new Date(entry.resetAt)
    };
  };
}