import express from 'express';
import {
  getUserDetails,
  updateUserDetails,
  generateActivity,
  getUserActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  deleteGeneratedActivities,
  getActivityStats,
  deleteUser,
  createUser
} from '../controllers/adminUserController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// User management routes
router.post('/users', createUser);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId', updateUserDetails);
router.delete('/users/:userId', deleteUser);

// Activity history routes
router.post('/users/:userId/generate-activity', generateActivity);
router.get('/users/:userId/activity', getUserActivity);
router.get('/users/:userId/activity/stats', getActivityStats);
router.post('/users/:userId/activity', createActivity);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);
router.delete('/users/:userId/generated-activities', deleteGeneratedActivities);

export default router;
