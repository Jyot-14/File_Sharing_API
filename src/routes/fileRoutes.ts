import express, { NextFunction, Response } from 'express';
import {
  deleteFile,
  getFile,
  storeFileData,
  setFilePublicStatus,
  uploadFile,
} from '../controllers/fileController';
import { verifyToken } from '../middleware/authMiddleware';
import { checkIsPublicFile } from '../middleware/isPublicFileMiddleware';

const router = express.Router();

router.post('/upload', verifyToken, uploadFile, storeFileData);

router.get('/get/:filename', checkIsPublicFile, getFile);

router.delete('/delete/:filename', verifyToken, deleteFile);

router.put('/set-public/:fileId', verifyToken, setFilePublicStatus);

export default router;
