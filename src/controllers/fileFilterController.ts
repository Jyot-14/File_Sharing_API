import { Request, Response } from 'express';
import { File } from '../database/entities/File';
import { AppDataSource } from '../database/data-source';
import { paginate } from '../database/paginator';

// Get all shared files for the authenticated user
export const getSharedFiles = async (req: any, res: Response) => {
  try {
    const fileRepository = AppDataSource.getRepository(File);

    const sharedFiles = fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.users', 'user', 'user.user_id = :userId', {
        userId: req.user_id,
      });

    // For pagination
    const { records: files, PaginationInfo } = await paginate(sharedFiles, req);

    res.status(200).json({ files, PaginationInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get files by file extension
export const getFilesByExtension = async (req: any, res: Response) => {
  try {
    const { extension } = req.params;

    const fileRepository = AppDataSource.getRepository(File);
    const filesQuery = fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'owner')
      .leftJoinAndSelect(
        'file.users',
        'sharedUser',
        'sharedUser.user_id = :userId',
        {
          userId: req.user_id,
        }
      )
      .where('file.file_extension = :extension', { extension })
      .andWhere('(file.user_id = :userId OR sharedUser.user_id = :userId)', {
        userId: req.user_id,
      });

    // For pagination
    const { records: files, PaginationInfo } = await paginate(filesQuery, req);

    res.status(200).json({ files, PaginationInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all files uploaded by the user and the files shared with the user
export const getUserFiles = async (req: any, res: Response) => {
  try {
    const fileRepository = AppDataSource.getRepository(File);

    // Retrieve all files where the user has access or is the owner
    let filesQuery = fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'owner')
      .leftJoinAndSelect(
        'file.users',
        'sharedUser',
        'sharedUser.user_id = :userId',
        {
          userId: req.user_id,
        }
      );
    const { ownedByMe, notOwnedByMe } = req.body;

    if (ownedByMe) {
      filesQuery = filesQuery.andWhere('file.user_id = :userId', {
        userId: req.user_id,
      });
    }

    if (notOwnedByMe) {
      filesQuery = filesQuery.andWhere(
        'file.user_id != :userId AND sharedUser.user_id = :userId',
        {
          userId: req.user_id,
        }
      );
    }

    // When no filters are provided, retrieve all files owned by the user or accessible to the user
    if (!ownedByMe && !notOwnedByMe) {
      filesQuery = filesQuery.andWhere(
        'file.user_id = :userId OR sharedUser.user_id = :userId',
        {
          userId: req.user_id,
        }
      );
    }

    // const userFiles = await filesQuery.getMany();

    // For pagination
    const { records: userFiles, PaginationInfo } = await paginate(
      filesQuery,
      req
    );

    res.status(200).json({ userFiles, PaginationInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Search Files By Name
export const searchFilesByName = async (req: Request, res: Response) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({ error: 'File name parameter is required' });
  }

  try {
    const fileRepository = AppDataSource.getRepository(File);

    const filesQuery = fileRepository
      .createQueryBuilder('file')
      .where('LOWER(file.filename) LIKE LOWER(:fileName)', {
        fileName: `%${fileName}%`,
      });

    // For pagination
    const { records: files, PaginationInfo } = await paginate(filesQuery, req);

    res.status(200).json({ files, PaginationInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
