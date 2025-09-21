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
  toggleInvestmentPlanStatus
} from '../controllers/adminController';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/profile', authenticateAdmin, getAdminProfile);

// Dashboard analytics routes
router.get('/dashboard/stats', authenticateAdmin, getDashboardStats);
router.get('/dashboard/recent-activity', authenticateAdmin, getRecentActivity);

// Investment plan management routes
router.post('/investment-plans', authenticateAdmin, createInvestmentPlan);
router.get('/investment-plans', authenticateAdmin, getAllInvestmentPlans);
router.get('/investment-plans/:id', authenticateAdmin, getInvestmentPlanById);
router.put('/investment-plans/:id', authenticateAdmin, updateInvestmentPlan);
router.delete('/investment-plans/:id', authenticateAdmin, deleteInvestmentPlan);
router.patch('/investment-plans/:id/toggle-status', authenticateAdmin, toggleInvestmentPlanStatus);

// Super admin only routes
router.post('/create-admin', authenticateAdmin, requireSuperAdmin, createAdmin);

export default router;
