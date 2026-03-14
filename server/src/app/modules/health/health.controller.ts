import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import mongoose from 'mongoose';
import redis from '../../../utils/redis';
import catchAsync from '../../../shared/catchasync';

const checkHealth = catchAsync(async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  let redisStatus = 'down';

  try {
    if (redis && redis.status === 'ready') {
      redisStatus = 'up';
    }
  } catch (err) {
    // Redis down
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System Health Check',
    data: {
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: redisStatus,
        server: 'up'
      },
      env: process.env.NODE_ENV,
    },
  });
});

export const HealthController = {
  checkHealth,
};
