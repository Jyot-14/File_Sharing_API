import { Response } from 'express';
import { File } from '../database/entities/File';
import { User } from '../database/entities/User';
import { FileAccess } from '../database/entities/FileAccess';
import { AppDataSource } from '../database/data-source';

export async function giveAccess(req: any, res: Response) {
  try {
    const { fileId, userEmail } = req.params;

    // Fetch the authenticated user
    const authenticatedUser = req.user;

    // Check if the current user is the owner of the file
    const fileRepository = AppDataSource.getRepository(File);
    const file = await fileRepository.findOne({
      where: { file_id: fileId },
      relations: ['user', 'users'],
    });

    if (!file || file.user.username !== authenticatedUser.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user based on the provided email
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the target user already has access to the file
    if (file.users.some(u => u.user_id === user.user_id)) {
      return res
        .status(400)
        .json({ error: 'User already has access to the file' });
    }

    // Grant access by creating a new FileAccess record
    const fileAccessRepository = AppDataSource.getRepository(FileAccess);
    const fileAccess = new FileAccess();
    fileAccess.file = file;
    fileAccess.user = user;
    await fileAccessRepository.save(fileAccess);

    res.status(200).json({ message: 'Access granted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function removeAccess(req: any, res: Response) {
  try {
    const { fileId, userEmail } = req.params;

    // Fetch the authenticated user
    const authenticatedUser = req.user;

    // Check if the current user is the owner of the file
    const fileRepository = AppDataSource.getRepository(File);
    const file = await fileRepository.findOne({
      where: { file_id: fileId },
      relations: ['user', 'users'],
    });

    if (!file || file.user.username !== authenticatedUser.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user based on the provided email
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove access by deleting the FileAccess record
    const fileAccessRepository = AppDataSource.getRepository(FileAccess);
    await fileAccessRepository.delete({ file, user });

    res.status(200).json({ message: 'Access removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
