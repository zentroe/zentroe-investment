import { Request, Response } from 'express';
import OnboardingProgress, { IOnboardingProgress } from '../models/OnboardingProgress';
import { calculateProgress, getMilestoneByStep } from '../utils/onboardingMilestones';

export class OnboardingController {

  /**
   * Get onboarding progress for a user by email
   */
  public static async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      let progress = await OnboardingProgress.findOne({
        email: email.toLowerCase().trim()
      });

      // If no progress exists, create initial record
      if (!progress) {
        progress = new OnboardingProgress({
          email: email.toLowerCase().trim(),
          currentStep: 0,
          currentMilestone: 'email_setup',
          completedMilestones: [],
          phase: 'Account Setup',
          progressPercentage: 0,
          userData: {
            email: email.toLowerCase().trim(),
            onboardingStatus: 'in_progress'
          }
        });

        await progress.save();
      }

      // Get the full milestone object for the current step
      const currentMilestoneObject = getMilestoneByStep(progress.currentStep);

      res.status(200).json({
        success: true,
        data: {
          currentStep: progress.currentStep,
          currentMilestone: currentMilestoneObject,
          completedMilestones: progress.completedMilestones,
          phase: progress.phase,
          progressPercentage: progress.progressPercentage,
          userData: progress.userData,
          lastUpdated: progress.lastUpdated
        }
      });

    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve onboarding progress',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Update onboarding progress for a user
   */
  public static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { email, userData, forceStep } = req.body;

      if (!email || !userData) {
        res.status(400).json({
          success: false,
          message: 'Email and userData are required'
        });
        return;
      }

      // Find existing progress or create new
      let progress = await OnboardingProgress.findOne({
        email: email.toLowerCase().trim()
      });

      if (!progress) {
        progress = new OnboardingProgress({
          email: email.toLowerCase().trim(),
          userData: {}
        });
      }

      // Merge userData
      progress.userData = {
        ...progress.userData,
        ...userData,
        email: email.toLowerCase().trim()
      };

      // Calculate new progress based on completed data
      const progressCalculation = calculateProgress(progress.userData);

      // Update progress fields
      progress.currentStep = forceStep !== undefined ? forceStep : progressCalculation.currentStep;
      progress.currentMilestone = progressCalculation.currentMilestone?.id || 'email_setup';
      progress.completedMilestones = progressCalculation.completedMilestones;
      progress.phase = progressCalculation.phase;
      progress.progressPercentage = progressCalculation.progressPercentage;

      await progress.save();

      // Get the full milestone object for the response
      const currentMilestoneObject = getMilestoneByStep(progress.currentStep);

      res.status(200).json({
        success: true,
        message: 'Onboarding progress updated successfully',
        data: {
          currentStep: progress.currentStep,
          currentMilestone: currentMilestoneObject,
          completedMilestones: progress.completedMilestones,
          phase: progress.phase,
          progressPercentage: progress.progressPercentage,
          userData: progress.userData,
          lastUpdated: progress.lastUpdated
        }
      });

    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update onboarding progress',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Reset onboarding progress for a user (for testing/admin purposes)
   */
  public static async resetProgress(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      await OnboardingProgress.findOneAndDelete({
        email: email.toLowerCase().trim()
      });

      res.status(200).json({
        success: true,
        message: 'Onboarding progress reset successfully'
      });

    } catch (error) {
      console.error('Error resetting onboarding progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset onboarding progress',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Get onboarding analytics/statistics (admin endpoint)
   */
  public static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await OnboardingProgress.countDocuments();
      const completedUsers = await OnboardingProgress.countDocuments({
        'userData.onboardingStatus': 'completed'
      });

      const phaseDistribution = await OnboardingProgress.aggregate([
        {
          $group: {
            _id: '$phase',
            count: { $sum: 1 }
          }
        }
      ]);

      const avgProgress = await OnboardingProgress.aggregate([
        {
          $group: {
            _id: null,
            averageProgress: { $avg: '$progressPercentage' },
            averageStep: { $avg: '$currentStep' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          completedUsers,
          completionRate: totalUsers > 0 ? ((completedUsers / totalUsers) * 100).toFixed(2) : 0,
          phaseDistribution,
          averageProgress: avgProgress[0]?.averageProgress || 0,
          averageStep: avgProgress[0]?.averageStep || 0
        }
      });

    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve onboarding analytics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
}
