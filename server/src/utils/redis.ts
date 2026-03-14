import Redis from 'ioredis';
import config from '../config';
import { logger } from '../shared/logger';

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  connectTimeout: 5000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

let isErrorLogged = false;
redis.on('error', (error) => {
  if (!isErrorLogged) {
    logger.error('Redis connection error (logging only once):', error);
    isErrorLogged = true;
  }
});

export default redis;
