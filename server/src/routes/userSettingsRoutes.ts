import { Router } from 'express';
import {
  getUserSettings,
  updateUserProfile,
  updateNotificationSettings,
  changePassword,
  updatePrivacySettings,
  requestDataDownload,
  deleteAccount
} from '../controllers/userSettingsController';
import { protectRoute } from '../middleware/protectRoute';
import { check } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Get user settings
router.get('/', getUserSettings);

// Update profile information
router.put('/profile',
  check('firstName').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  check('lastName').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  check('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  check('address.zipCode').optional().isPostalCode('any').withMessage('Please provide a valid postal code'),
  validate,
  updateUserProfile
);

// Update notification settings
router.put('/notifications',
  check('emailNotifications').optional().isBoolean().withMessage('Email notifications must be a boolean'),
  check('smsNotifications').optional().isBoolean().withMessage('SMS notifications must be a boolean'),
  validate,
  updateNotificationSettings
);

// Change password
router.put('/password',
  check('currentPassword').notEmpty().withMessage('Current password is required'),
  check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validate,
  changePassword
);

// Update privacy settings
router.put('/privacy', updatePrivacySettings);

// Request account data download
router.post('/data-download', requestDataDownload);

// Delete account
router.delete('/account',
  check('password').notEmpty().withMessage('Password is required for account deletion'),
  validate,
  deleteAccount
);

export default router;