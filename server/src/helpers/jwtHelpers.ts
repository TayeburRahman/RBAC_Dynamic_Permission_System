import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string,
): string => {
  const options: SignOptions = { expiresIn: expireTime as any };
  return jwt.sign(payload as any, secret as any, options);
};
const createResetToken = (
  payload: any,
  secret: Secret,
  expireTime: string,
): string => {
  const options: SignOptions = { algorithm: 'HS256', expiresIn: expireTime as any } as SignOptions;
  return jwt.sign(payload as any, secret as any, options as SignOptions);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token as any, secret as any) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  createResetToken,
};
