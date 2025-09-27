import cron from 'node-cron';
import { calculateDailyProfitsForAllInvestments } from '../services/profitService';

/**
 * Daily profit calculation cron job
 * Development: Runs every 3 minutes for testing
 * Production: Runs every day at 12:01 AM
 */
export const startDailyProfitCron = () => {
  console.log('🚀 Starting Daily Profit Cron Job...');

  // Schedule based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cronSchedule = isDevelopment ? '*/3 * * * *' : '1 0 * * *'; // Every 3 minutes in dev, daily at 12:01 AM in prod

  console.log(`📅 Cron schedule: ${cronSchedule} (${isDevelopment ? 'DEVELOPMENT - Every 3 minutes' : 'PRODUCTION - Daily at 12:01 AM'})`);

  cron.schedule(cronSchedule, async () => {
    const envLabel = isDevelopment ? '🧪 DEVELOPMENT' : '🚀 PRODUCTION';
    console.log(`⏰ ${envLabel} Daily Profit Cron Job triggered at:`, new Date().toISOString());

    try {
      const summary = await calculateDailyProfitsForAllInvestments();

      console.log('✅ Daily profit calculation completed:', {
        date: new Date().toDateString(),
        totalInvestments: summary.totalInvestments,
        successful: summary.successfulCalculations,
        failed: summary.failedCalculations,
        skipped: summary.skippedCalculations,
        totalProfit: `$${summary.totalProfitDistributed.toFixed(2)}`
      });

      // Log any errors
      if (summary.failedCalculations > 0) {
        console.log('❌ Failed profit calculations:');
        summary.results
          .filter((r: any) => r.status === 'error')
          .forEach((result: any) => {
            console.log(`  - Investment ${result.investmentId}: ${result.message}`);
          });
      }

      // Here you could add notification logic:
      // - Send email to admin if there are failures
      // - Update dashboard statistics
      // - Log to external monitoring service

    } catch (error) {
      console.error('❌ Daily profit cron job failed:', error);

      // Here you could add error notification logic:
      // - Send alert email to admin
      // - Log to error tracking service
    }
  }, {
    scheduled: true,
    timezone: 'UTC' // You can change this to your preferred timezone
  });

  console.log(`✅ Daily Profit Cron Job scheduled successfully (${isDevelopment ? 'DEV: Every 3 minutes' : 'PROD: Daily at 12:01 AM'})`);
};

/**
 * Manual trigger for daily profit calculation (for admin use)
 */
export const triggerDailyProfitCalculation = async (targetDate?: Date) => {
  console.log('🔄 Manual daily profit calculation triggered');

  try {
    const summary = await calculateDailyProfitsForAllInvestments(targetDate);

    console.log('✅ Manual daily profit calculation completed:', {
      date: (targetDate || new Date()).toDateString(),
      totalInvestments: summary.totalInvestments,
      successful: summary.successfulCalculations,
      failed: summary.failedCalculations,
      skipped: summary.skippedCalculations,
      totalProfit: `$${summary.totalProfitDistributed.toFixed(2)}`
    });

    return summary;
  } catch (error) {
    console.error('❌ Manual daily profit calculation failed:', error);
    throw error;
  }
};

/**
 * Get cron job status
 */
export const getDailyProfitCronStatus = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cronSchedule = isDevelopment ? '*/3 * * * *' : '1 0 * * *';

  return {
    isRunning: true,
    schedule: cronSchedule,
    environment: isDevelopment ? 'development' : 'production',
    frequency: isDevelopment ? 'Every 3 minutes' : 'Daily at 12:01 AM',
    timezone: 'UTC',
    nextRun: getNextCronRun(isDevelopment)
  };
};

/**
 * Calculate next cron run time
 */
function getNextCronRun(isDevelopment: boolean = process.env.NODE_ENV === 'development'): string {
  const now = new Date();

  if (isDevelopment) {
    // Next run in 3 minutes
    const nextRun = new Date(now.getTime() + 3 * 60 * 1000);
    return nextRun.toISOString();
  } else {
    // Next run tomorrow at 12:01 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 12:01 AM
    return tomorrow.toISOString();
  }
}

// Auto-start the cron job when this module is imported
startDailyProfitCron();