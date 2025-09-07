import express from 'express';
import { adminLogin, adminLogout, getAdminProfile, createAdmin } from '../controllers/adminController';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/profile', authenticateAdmin, getAdminProfile);

// Super admin only routes
router.post('/create-admin', authenticateAdmin, requireSuperAdmin, createAdmin);

export default router;
