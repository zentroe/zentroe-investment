// Script to generate payment reference IDs for existing users
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

async function generatePaymentReferences() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    // Find all users without payment reference IDs
    const usersWithoutRef = await User.find({
      $or: [
        { paymentReferenceId: { $exists: false } },
        { paymentReferenceId: null },
        { paymentReferenceId: '' }
      ]
    });

    console.log(`\n📊 Found ${usersWithoutRef.length} users without payment reference IDs\n`);

    if (usersWithoutRef.length === 0) {
      console.log('✅ All users already have payment reference IDs!');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutRef) {
      try {
        // Generate a 6-digit unique number
        let paymentReferenceId = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          const randomNum = Math.floor(100000 + Math.random() * 900000);
          paymentReferenceId = `ZENT-${randomNum}`;

          // Check if this reference ID already exists
          const existing = await User.findOne({ paymentReferenceId });

          if (!existing) {
            isUnique = true;
          } else {
            console.log(`⚠️  Collision detected for ${paymentReferenceId}, retrying...`);
            attempts++;
          }
        }

        if (!isUnique) {
          console.error(`❌ Failed to generate unique reference for user ${user.email} after 10 attempts`);
          errorCount++;
          continue;
        }

        // Update the user
        user.paymentReferenceId = paymentReferenceId;
        await user.save();

        console.log(`✅ ${user.email} → ${paymentReferenceId}`);
        successCount++;

      } catch (error: any) {
        console.error(`❌ Error processing user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📝 Total processed: ${successCount + errorCount} users\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

// Run the script
generatePaymentReferences();
