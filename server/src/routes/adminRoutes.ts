import express from 'express';
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  createAdmin,
  getDashboardStats,
  getRecentActivity,
  createInvestmentPlan,
  getAllInvestmentPlans,
  getInvestmentPlanById,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  toggleInvestmentPlanStatus,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserKycStatus,
  getUserInvestments
} from '../controllers/adminController';
import {
  getAllInvestments,
  getInvestmentDetails,
  pauseUserInvestment,
  resumeUserInvestment,
  completeUserInvestment
} from '../controllers/adminInvestmentController';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/profile', authenticateAdmin, getAdminProfile);

// Dashboard analytics routes
router.get('/dashboard/stats', authenticateAdmin, getDashboardStats);
router.get('/dashboard/recent-activity', authenticateAdmin, getRecentActivity);

// Investment management routes
router.get('/investments', authenticateAdmin, getAllInvestments);
router.get('/investments/:id', authenticateAdmin, getInvestmentDetails);
router.put('/investments/:id/pause', authenticateAdmin, pauseUserInvestment as any);
router.put('/investments/:id/resume', authenticateAdmin, resumeUserInvestment as any);
router.put('/investments/:id/complete', authenticateAdmin, completeUserInvestment as any);

// Investment plan management routes
router.post('/investment-plans', authenticateAdmin, createInvestmentPlan);
router.get('/investment-plans', authenticateAdmin, getAllInvestmentPlans);
router.get('/investment-plans/:id', authenticateAdmin, getInvestmentPlanById);
router.put('/investment-plans/:id', authenticateAdmin, updateInvestmentPlan);
router.delete('/investment-plans/:id', authenticateAdmin, deleteInvestmentPlan);
router.patch('/investment-plans/:id/toggle-status', authenticateAdmin, toggleInvestmentPlanStatus);

// User management routes
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/users/:userId', authenticateAdmin, getUserById);
router.patch('/users/:userId/toggle-status', authenticateAdmin, toggleUserStatus);
router.patch('/users/:userId/kyc-status', authenticateAdmin, updateUserKycStatus);
router.get('/users/:userId/investments', authenticateAdmin, getUserInvestments);

// Admin management routes (super admin only)
router.post('/admins', authenticateAdmin, requireSuperAdmin, createAdmin);

export default router;
