import { NextFunction, Request, Response } from 'express';
import { FileUploadHelper } from '../../helpers/fileUploadHelper';

const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    FileUploadHelper.upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

const uploadArray = (fieldName: string, maxCount: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    FileUploadHelper.upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

export const UploadMiddleware = {
  uploadSingle,
  uploadArray,
};
