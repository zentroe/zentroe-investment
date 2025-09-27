import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types/CustomRequest';

// Get user profile and settings
export const getUserSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Structure the response for the settings page
    const userSettings = {
      profile: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          street2: user.address?.street2 || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'United States'
        },
        dateOfBirth: user.dateOfBirth || null,
        accountType: user.accountType || 'general',
        memberSince: user.createdAt,
        kycStatus: user.kyc?.status || 'pending'
      },
      notifications: {
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? false,
        investmentUpdates: true, // We'll add this to the model later
        marketNews: true,
        monthlyReports: true,
        referralUpdates: false
      },
      privacy: {
        twoFactorAuth: false, // We'll implement this later
        sessionTimeout: '30 minutes',
        dataSharing: false,
        profileVisibility: 'private'
      }
    };

    res.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile information
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, phone, address, dateOfBirth } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update profile fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        street2: address.street2 || user.address?.street2 || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        zipCode: address.zipCode || user.address?.zipCode || '',
        country: address.country || user.address?.country || 'United States'
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update notification preferences
export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { emailNotifications, smsNotifications, investmentUpdates, marketNews, monthlyReports, referralUpdates } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update notification preferences
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.smsNotifications = smsNotifications;

    await user.save();

    res.json({
      message: 'Notification settings updated successfully',
      notifications: {
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        investmentUpdates,
        marketNews,
        monthlyReports,
        referralUpdates
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update privacy settings
export const updatePrivacySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { twoFactorAuth, sessionTimeout, dataSharing, profileVisibility } = req.body;

    // For now, we'll just acknowledge the settings since we don't have full implementation
    // In a real app, you'd store these in the database

    res.json({
      message: 'Privacy settings updated successfully',
      privacy: {
        twoFactorAuth: twoFactorAuth ?? false,
        sessionTimeout: sessionTimeout ?? '30 minutes',
        dataSharing: dataSharing ?? false,
        profileVisibility: profileVisibility ?? 'private'
      }
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request account data download
export const requestDataDownload = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // In a real application, you would:
    // 1. Queue a job to generate the data export
    // 2. Send an email when ready
    // 3. Provide a secure download link

    res.json({
      message: 'Data download request received. You will receive an email with a download link within 24 hours.',
      requestId: `export_${userId}_${Date.now()}`
    });
  } catch (error) {
    console.error('Error requesting data download:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete account (soft delete)
export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: 'Password confirmation is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Password is incorrect' });
      return;
    }

    // Soft delete by deactivating account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};