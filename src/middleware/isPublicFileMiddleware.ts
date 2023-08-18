import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { verifyToken } from './authMiddleware';
import { File } from '../database/entities/File';

export async function checkIsPublicFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { filename } = req.params;

  try {
    const fileRepository = AppDataSource.getRepository(File);

    const fileData = await fileRepository.findOne({
      where: { filename },
    });

    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (fileData.ispublic) {
      // File is public, no need to verify token
      return next();
    }

    // File is not public, proceed with token verification
    verifyToken(req, res, next);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
