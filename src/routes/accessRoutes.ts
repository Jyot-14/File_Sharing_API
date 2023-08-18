import express from 'express';
import { giveAccess, removeAccess } from '../controllers/accessController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/give/:fileId/:userEmail', verifyToken, giveAccess);
router.post('/remove/:fileId/:userEmail', verifyToken, removeAccess);

export default router;
