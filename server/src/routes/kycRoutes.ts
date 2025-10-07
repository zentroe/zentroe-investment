import express from 'express';
import {
  getUserKYCStatus,
  uploadKYCDocuments,
  submitKYCVerification,
  deleteKYCDocument
} from '../controllers/kycController';
import { protectRoute } from '../middleware/protectRoute';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// User KYC Routes
router.get('/status', protectRoute, getUserKYCStatus);
router.post('/upload', protectRoute, uploadKYCDocuments);
router.post('/submit', protectRoute, submitKYCVerification);
router.delete('/documents/:documentId', protectRoute, deleteKYCDocument);



export default router;