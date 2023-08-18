import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { File } from '../database/entities/File';
import { AppDataSource } from '../database/data-source';

const storage = multer.diskStorage({
  destination: './uploads',
  filename(req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join('./uploads', fileName);

    // Check if the file with the same name already exists
    if (fs.existsSync(filePath)) {
      const error = new Error('File with the same name already exists.');
      cb(error, ''); // Pass the error as the first argument
    } else {
      cb(null, fileName); // Pass null as the first argument to indicate no error
    }
  },
});

// Upload file using multer
export const uploadFile = multer({ storage }).single('file');

// store file data to database
export const storeFileData = async (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file selected' });
  }

  const { filename, originalname } = req.file;
  const filePath = `/uploads/${filename}`;
  const fileExtension = originalname.split('.').pop();

  try {
    // Get authenticated user data from middleware
    const fileRepository = AppDataSource.getRepository(File);

    // Create a new file entity and set its properties
    const newFile = new File();
    newFile.filename = filename;
    newFile.file_path = filePath;
    newFile.file_extension = fileExtension;
    newFile.ispublic = false;
    newFile.user = req.user_id;

    // Save the new file entity
    await fileRepository.save(newFile);

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error inserting file into database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Set isPublic is true or false
export const setFilePublicStatus = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { ispublic } = req.body;

    const fileRepository = AppDataSource.getRepository(File);
    await fileRepository.update(fileId, { ispublic });

    res
      .status(200)
      .json({ message: 'File public status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get file by filename
export const getFile = async (req: any, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads/', filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const fileRepository = AppDataSource.getRepository(File);

    const fileData = await fileRepository.findOne({
      where: { filename },
      relations: ['user', 'users'],
    });

    if (!fileData) {
      return res.status(404).json({ error: 'File data not found' });
    }

    // Check if the file is public or if the user is the owner or has access
    const isPublic = fileData.ispublic;
    const isOwner = fileData.user.username === req.username;
    const userHasAccess = fileData.users.some(
      user => user.username === req.username
    );

    if (isPublic || isOwner || userHasAccess) {
      console.log('Access Allowed: true (public, owner, or access)');
      sendFileData();
    } else {
      console.log('Access Allowed: false');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    function sendFileData() {
      // Determine the content type
      const contentType = mime.lookup(filePath);

      // Read the contents of the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return res.status(500).json({ error: 'Error reading file' });
        }

        // Set the content type in the response headers
        if (contentType) {
          res.set('Content-Type', contentType);
        }

        res.send(data);
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete file by filename
export const deleteFile = async (req: any, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads/', filename);

  try {
    const fileRepository = AppDataSource.getRepository(File);
    const fileData = await fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'user')
      .where('file.fileName = :filename', { filename })
      .getOne();

    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    const owner = fileData.users.find(user => user.username === req.username);
    if (!owner) {
      return res
        .status(403)
        .json({ error: 'Forbidden: Only the owner can delete the file' });
    }

    await fileRepository.delete(fileData);

    // Delete file from the file system
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
