import express from 'express';
import {
  getAllKYCSubmissions,
  getKYCSubmissionById,
  reviewKYCSubmission,
  getKYCStatistics
} from '../controllers/kycController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// All routes here are protected by admin middleware
router.use(authenticateAdmin);

// Admin KYC Routes - mounted at /admin/kyc
router.get('/submissions', getAllKYCSubmissions as any);
router.get('/submissions/:submissionId', getKYCSubmissionById as any);
router.post('/review/:submissionId', reviewKYCSubmission as any);
router.get('/statistics', getKYCStatistics as any);

export default router;