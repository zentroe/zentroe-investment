import mongoose from 'mongoose';
import { ActivityHistory } from '../models/ActivityHistory';
import { Referral } from '../models/Referral';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration Script: Populate Referral Emails in Activity History
 * 
 * Problem: Existing referral activities don't have referredUserEmail field populated
 * Solution: Extract emails from Referral collection metadata and update ActivityHistory records
 */

async function populateReferralEmails() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zentroe');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding referral activities without emails...');

    // Find all referral activities
    const referralActivities = await ActivityHistory.find({
      activityType: 'referral'
    }).exec();

    console.log(`📊 Found ${referralActivities.length} referral activities`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const activity of referralActivities) {
      try {
        // Skip if already has email
        if (activity.referredUserEmail) {
          skippedCount++;
          continue;
        }

        // Try to find the corresponding referral record by date and user
        const activityDate = new Date(activity.date);
        const startOfDay = new Date(activityDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(activityDate);
        endOfDay.setHours(23, 59, 59, 999);

        const referral = await Referral.findOne({
          referrer: activity.userId,
          signupDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }).exec();

        if (referral && referral.metadata?.fakeUserInfo?.email) {
          // Update activity with email from referral metadata
          await ActivityHistory.findByIdAndUpdate(activity._id, {
            referredUserEmail: referral.metadata.fakeUserInfo.email
          });

          console.log(`✅ Updated activity ${activity._id}: ${referral.metadata.fakeUserInfo.email}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No matching referral found for activity ${activity._id} on ${activityDate.toISOString().split('T')[0]}`);
          notFoundCount++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing activity ${activity._id}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount} activities`);
    console.log(`⏭️  Skipped: ${skippedCount} activities (already have email)`);
    console.log(`⚠️  Not found: ${notFoundCount} activities (no matching referral)`);
    console.log('='.repeat(60));

    if (updatedCount > 0) {
      console.log('\n✨ Referral emails have been populated!');
      console.log('💡 Referral activities can now be edited with email addresses.');
    } else {
      console.log('\n✨ All referral activities already have emails or no updates needed!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    console.log('\n👋 Disconnecting from MongoDB');
    await mongoose.disconnect();
    console.log('✅ Migration completed');
  }
}

// Run the migration
populateReferralEmails();
