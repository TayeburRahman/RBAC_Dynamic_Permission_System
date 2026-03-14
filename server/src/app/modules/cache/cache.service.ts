
import { logger } from '../../../shared/logger';
import redis from '../../../utils/redis';

const set = async (key: string, value: any, ttlSeconds: number = 3600): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    await redis.set(key, stringValue, 'EX', ttlSeconds);
  } catch (error) {
    logger.error(`Cache set error [key: ${key}]:`, error);
  }
};

const get = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error(`Cache get error [key: ${key}]:`, error);
    return null;
  }
};

const del = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache delete error [key: ${key}]:`, error);
  }
};

const delByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error(`Cache delete by pattern error [pattern: ${pattern}]:`, error);
  }
};

export const CacheService = {
  set,
  get,
  del,
  delByPattern,
};
