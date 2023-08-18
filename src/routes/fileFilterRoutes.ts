import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import {
  getFilesByExtension,
  getSharedFiles,
  getUserFiles,
  searchFilesByName,
} from '../controllers/fileFilterController';

const router = express.Router();

// get files that shared with users
router.get('/shared', verifyToken, getSharedFiles);

router.get('/extension/:extension', verifyToken, getFilesByExtension);

// Route to get all user files (uploaded and shared)
router.get('/user-files', verifyToken, getUserFiles);

// Route to search file by name
router.get('/search', verifyToken, searchFilesByName);

export default router;
