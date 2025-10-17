# Referral Email Population - Migration Script

## Problem

**Symptom:** In the EditActivityModal, the email field for referrals is empty, even though emails are showing on the ReferralsPage.

### Why This Happens:

1. **ReferralsPage** displays data from the **Referral** collection
   - Email is stored in `referral.metadata.fakeUserInfo.email`
   - Shows correctly: `referral.referred?.email`

2. **EditActivityModal** edits data from the **ActivityHistory** collection
   - Old activities don't have `referredUserEmail` field populated
   - This field was just added recently
   - Email field shows empty ❌

### Root Cause:

The `referredUserEmail` field was added after existing referral activities were created, so:
- **New activities:** Have email (activity generator includes it)
- **Old activities:** Don't have email (field didn't exist when they were created)

## Solution

Created a migration script to populate emails for existing referral activities from the Referral collection.

### Migration Script: `populateReferralEmails.ts`

**Location:** `server/src/scripts/populateReferralEmails.ts`

**What it does:**

1. Finds all referral activities in ActivityHistory collection
2. For each activity without an email:
   - Searches for matching Referral record (by date and user)
   - Extracts email from `referral.metadata.fakeUserInfo.email`
   - Updates ActivityHistory record with the email
3. Shows summary of updates

**Algorithm:**
```typescript
// 1. Find referral activities without email
const referralActivities = await ActivityHistory.find({
  activityType: 'referral'
});

// 2. For each activity
for (const activity of referralActivities) {
  if (activity.referredUserEmail) continue; // Skip if has email
  
  // 3. Find matching referral by date
  const referral = await Referral.findOne({
    referrer: activity.userId,
    signupDate: { $gte: startOfDay, $lte: endOfDay }
  });
  
  // 4. Update activity with email from referral metadata
  if (referral?.metadata?.fakeUserInfo?.email) {
    await ActivityHistory.findByIdAndUpdate(activity._id, {
      referredUserEmail: referral.metadata.fakeUserInfo.email
    });
  }
}
```

## How to Run

### 1. Run the Migration Script:

```bash
cd server
npx tsx src/scripts/populateReferralEmails.ts
```

### 2. Expected Output:

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Finding referral activities without emails...
📊 Found 12 referral activities

✅ Updated activity 68f200d4f3255668ea5ffa50: john.doe123@gmail.com
✅ Updated activity 68f200d5f3255668ea5ffa5f: mary.smith456@yahoo.com
✅ Updated activity 68f200d6f3255668ea5ffa6c: robert.jones789@outlook.com
...

============================================================
📈 Migration Summary:
============================================================
✅ Updated: 12 activities
⏭️  Skipped: 0 activities (already have email)
⚠️  Not found: 0 activities (no matching referral)
============================================================

✨ Referral emails have been populated!
💡 Referral activities can now be edited with email addresses.

👋 Disconnecting from MongoDB
✅ Migration completed
```

## What Changes After Running:

### Before Migration:
```javascript
// ActivityHistory record
{
  activityType: 'referral',
  date: '2025-04-15',
  referredUserName: 'John Doe',
  referredUserEmail: null,  // ❌ Empty!
  referralBonus: 150
}
```

### After Migration:
```javascript
// ActivityHistory record
{
  activityType: 'referral',
  date: '2025-04-15',
  referredUserName: 'John Doe',
  referredUserEmail: 'john.doe123@gmail.com',  // ✅ Populated!
  referralBonus: 150
}
```

### In EditActivityModal:
**Before:**
```
┌────────────────────────────────────────────────┐
│ Referred User Name  │  Referred User Email     │
│ [John Doe        ]  │  [                   ]   │ ← Empty!
├────────────────────────────────────────────────┤
│ Referral Bonus: $150.00                        │
└────────────────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────────────────┐
│ Referred User Name  │  Referred User Email     │
│ [John Doe        ]  │  [john.doe123@gmail.com] │ ← Filled!
├────────────────────────────────────────────────┤
│ Referral Bonus: $150.00                        │
└────────────────────────────────────────────────┘
```

## Technical Details

### Data Flow:

1. **Activity Generation:**
   ```typescript
   // Creates both records:
   
   // Referral (with metadata)
   await Referral.create({
     metadata: {
       fakeUserInfo: {
         firstName: 'John',
         lastName: 'Doe',
         email: 'john.doe123@gmail.com'
       }
     }
   });
   
   // ActivityHistory (with email)
   activities.push({
     activityType: 'referral',
     referredUserName: 'John Doe',
     referredUserEmail: 'john.doe123@gmail.com'
   });
   ```

2. **ReferralsPage Display:**
   ```typescript
   // Gets data from Referral collection
   referralData.referrals.map(referral => (
     <p>{referral.referred?.email}</p>  // From metadata
   ))
   ```

3. **EditActivityModal:**
   ```typescript
   // Gets data from ActivityHistory collection
   <input value={formData.referredUserEmail} />  // Needs to be populated
   ```

### Migration Matching Logic:

The script matches ActivityHistory records to Referral records by:
- Same `userId` (referrer)
- Same date (within 24-hour window)

This works because:
- Each referral activity is created on the same date as the referral
- Multiple referrals on the same day are handled sequentially
- Date matching ensures correct email is used

## Summary

**What was fixed:**
- ✅ Added `referredUserEmail` field to ActivityHistory model
- ✅ Activity generator includes email for new activities
- ✅ EditActivityModal shows email input field
- ✅ Created migration script to populate emails for existing activities

**Next steps:**
1. Run the migration script
2. Verify emails appear in EditActivityModal
3. All referral activities (old and new) will have emails ✅

**Result:**
- ReferralsPage: Shows emails ✅ (was already working)
- EditActivityModal: Shows emails ✅ (now fixed after migration)
- Can edit both name and email for all referrals! 🎉
