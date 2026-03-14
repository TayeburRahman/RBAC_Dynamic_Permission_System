import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import Auth from '../modules/auth/auth.model';

const auth =
  (...roles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tokenWithBearer = req.headers.authorization;

        if (!tokenWithBearer) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Login required: Authorization header is missing',
          );
        }

        if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
          const token = tokenWithBearer.split(' ')[1];

          const verifyUser = jwtHelpers.verifyToken(
            token,
            config.jwt.secret as Secret,
          );

          req.user = verifyUser;
          const isExist = await Auth.findById(verifyUser?.authId);

          if (!isExist) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
          }

          const userRoleUpper = verifyUser.role?.toUpperCase();
          const requiredRolesUpper = roles.map(r => r.toUpperCase());

          // Super Admin always bypasses role checks
          if (userRoleUpper === 'SUPER_ADMIN') {
            return next();
          }

          if (roles.length && !requiredRolesUpper.includes(userRoleUpper)) {
            console.error(`[AUTH] Access Forbidden: Role '${verifyUser.role}' is not in [${roles.join(', ')}] for ${req.method} ${req.originalUrl}`);
            throw new ApiError(
              httpStatus.FORBIDDEN,
              'Access Forbidden: You do not have permission to perform this action',
            );
          }
          next();
        }
      } catch (error) {
        next(error);
      }
    };

export default auth;
