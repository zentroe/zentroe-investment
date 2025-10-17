import mongoose from 'mongoose';
import { UserInvestment } from '../models/UserInvestment';
import '../models/InvestmentPlan'; // Import to register the model
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration Script: Fix Daily Profit Rates
 * 
 * Problem: dailyProfitRate was being calculated as dollar amount instead of percentage
 * Old formula: dailyProfitRate = (amount * totalProfitPercentage) / duration [WRONG - gives dollars]
 * New formula: dailyProfitRate = profitPercentage / duration [CORRECT - gives percentage]
 * 
 * Example:
 * - Investment: $10,000
 * - Plan: 25% over 365 days
 * 
 * Old (Wrong):
 * dailyProfitRate = ($10,000 * 0.25) / 365 = $6.85
 * Displayed as: 6.85% (WRONG! That's 2,500% annually!)
 * 
 * New (Correct):
 * dailyProfitRate = 25% / 365 = 0.0685%
 * Displayed as: 0.0685% (CORRECT! That's 25% annually)
 */

async function fixDailyProfitRates() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zentroe');
    console.log('✅ Connected to MongoDB');

    // Ensure InvestmentPlan model is registered
    console.log('📋 Registering models...');
    // The import at the top already registers the model

    console.log('\n🔍 Finding all investments...');
    const investments = await UserInvestment.find({})
      .populate('investmentPlan')
      .lean()
      .exec();

    console.log(`📊 Found ${investments.length} investments to check`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const investment of investments) {
      try {
        const plan = investment.investmentPlan as any;

        if (!plan || !plan.profitPercentage || !plan.duration) {
          console.log(`⚠️  Investment ${investment._id} has no valid investment plan - skipping`);
          skippedCount++;
          continue;
        }

        // Calculate correct daily profit rate (as percentage)
        const correctDailyRate = plan.profitPercentage / plan.duration;

        // Calculate what the old (wrong) formula would have given (as dollar amount)
        const oldIncorrectRate = (investment.amount * (plan.profitPercentage / 100)) / plan.duration;

        // Check if the current rate is wrong (close to the old formula)
        const isWrong = Math.abs(investment.dailyProfitRate - oldIncorrectRate) < 0.01;

        if (isWrong || Math.abs(investment.dailyProfitRate - correctDailyRate) > 0.0001) {
          console.log(`\n🔧 Fixing investment ${investment._id}:`);
          console.log(`   User: ${investment.user}`);
          console.log(`   Amount: $${investment.amount.toLocaleString()}`);
          console.log(`   Plan: ${plan.name} (${plan.profitPercentage}% over ${plan.duration} days)`);
          console.log(`   Old daily rate: ${investment.dailyProfitRate.toFixed(4)}% ${isWrong ? '❌ WRONG' : ''}`);
          console.log(`   New daily rate: ${correctDailyRate.toFixed(4)}% ✅`);

          // Update the investment using findByIdAndUpdate to avoid .save() on lean document
          await UserInvestment.findByIdAndUpdate(investment._id, {
            dailyProfitRate: correctDailyRate
          });

          fixedCount++;
        } else {
          skippedCount++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing investment ${investment._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixedCount} investments`);
    console.log(`⏭️  Skipped: ${skippedCount} investments (already correct)`);
    console.log(`❌ Errors: ${errorCount} investments`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✨ Daily profit rates have been corrected!');
      console.log('💡 The profit calculation service will now use the correct rates.');
    } else {
      console.log('\n✨ All investments already have correct daily profit rates!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the migration
fixDailyProfitRates()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
