import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createAdvisory,
  getUserAdvisories,
  getAdvisoryById,
  deleteAdvisory
} from '../controllers/advisoryController.js';

const router = Router();

// Advisory endpoints
router.post('/advisory', authenticateUser, upload.single('imageFile'), createAdvisory);
router.get('/advisories', authenticateUser, getUserAdvisories);
router.get('/advisory/:id', authenticateUser, getAdvisoryById);
router.delete('/advisory/:id', authenticateUser, deleteAdvisory);

export default router;

