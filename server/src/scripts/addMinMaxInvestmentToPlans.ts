import mongoose from 'mongoose';
import '../models/InvestmentPlan';
import dotenv from 'dotenv';

dotenv.config();

const InvestmentPlan = mongoose.model('InvestmentPlan');

async function addMinMaxInvestmentToPlans() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zentroe-investment');
    console.log('✅ Connected to MongoDB');

    // Get all investment plans
    const plans = await InvestmentPlan.find({});
    console.log(`📊 Found ${plans.length} investment plans`);

    // Define default min/max based on plan category
    const defaultValues: Record<string, { min: number, max?: number }> = {
      'starter': { min: 500, max: 10000 },
      'default': { min: 1000, max: 100000 },
      'retirement': { min: 5000, max: 500000 },
      'highGrowth': { min: 10000, max: 1000000 }
    };

    let updatedCount = 0;

    for (const plan of plans) {
      const planData = plan as any;

      // Check if minInvestment or maxInvestment is missing or 0
      if (!planData.minInvestment || planData.minInvestment === 0) {
        const defaults = defaultValues[planData.category] || defaultValues['default'];

        console.log(`\n📝 Updating plan: ${planData.name}`);
        console.log(`   Category: ${planData.category}`);
        console.log(`   Current minInvestment: ${planData.minInvestment}`);
        console.log(`   Current maxInvestment: ${planData.maxInvestment}`);
        console.log(`   New minInvestment: ${defaults.min}`);
        console.log(`   New maxInvestment: ${defaults.max || 'None (unlimited)'}`);

        await InvestmentPlan.findByIdAndUpdate(planData._id, {
          minInvestment: defaults.min,
          maxInvestment: defaults.max || undefined
        });

        updatedCount++;
        console.log(`   ✅ Updated successfully`);
      } else {
        console.log(`\n✓ Plan "${planData.name}" already has minInvestment: $${planData.minInvestment.toLocaleString()}`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updatedCount} plans.`);

    // Verify the updates
    console.log('\n📋 Verifying all plans:');
    const verifyPlans = await InvestmentPlan.find({}).select('name category minInvestment maxInvestment');
    verifyPlans.forEach((plan: any) => {
      console.log(`   - ${plan.name}: $${plan.minInvestment?.toLocaleString() || 'NOT SET'} - $${plan.maxInvestment?.toLocaleString() || '∞'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMinMaxInvestmentToPlans();
