# Referral Edit Synchronization Fix

## Problem
When admins edited a generated referral through the Activity History:
1. Changes were saved to the `ActivityHistory` collection's `referredUserName` and `referredUserEmail` fields
2. However, the `description` field (e.g., "Referral bonus for inviting John Doe") was NOT being updated
3. Referrals displayed in the Referrals dashboard come from the `Referral` collection with `metadata.fakeUserInfo`, which also wasn't being updated
4. Result: Changes appeared in the edit modal (which re-fetched from database) but not in the activity list (which displayed the stale description)

## Root Cause
Generated referrals involve **three data points** that need to stay synchronized:

1. **ActivityHistory.referredUserName** and **ActivityHistory.referredUserEmail** - The raw data fields
2. **ActivityHistory.description** - The display text shown in activity cards (e.g., "Referral bonus for inviting John Doe")
3. **Referral.metadata.fakeUserInfo** - The referral record's display data (firstName, lastName, email)

When editing a referral activity, the system was:
- ✅ Updating `referredUserName` and `referredUserEmail`
- ❌ NOT updating the `description` field to reflect the new name
- ❌ NOT updating the `Referral` collection's metadata

This caused the activity list to show the old description even after successful save.

## Solution
Modified `/server/src/controllers/adminUserController.ts` in the `updateActivity` function to:

1. **Detect referral edits** - Added a case for `activityType === 'referral'`
2. **Extract name parts** - Split `referredUserName` into firstName and lastName
3. **Match the Referral record** - Find by referrer, date range, and campaign='demo-generated'
4. **Update Referral metadata** - Synchronize `metadata.fakeUserInfo` with the edited values
5. **Regenerate description** - Update the description field to reflect the new referred user's name
6. **Handle both sources** - Use updateData if provided, otherwise fall back to existing values

### Key Code Changes

#### 1. Synchronize Referral Collection Metadata

```typescript
case 'referral': {
  // Extract referral date and create date range
  const referralDate = new Date(updateData.date || existingActivity.date);
  const startOfDay = new Date(referralDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(referralDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Parse names with fallback to existing values
  let firstName = '';
  let lastName = '';
  if (updateData.referredUserName) {
    const nameParts = updateData.referredUserName.trim().split(/\s+/);
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  } else if (existingActivity.referredUserName) {
    const nameParts = existingActivity.referredUserName.trim().split(/\s+/);
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  const referredEmail = updateData.referredUserEmail || existingActivity.referredUserEmail || '';

  // Build update object with only populated fields
  const referralMetadataUpdate: any = {};
  if (firstName) referralMetadataUpdate['metadata.fakeUserInfo.firstName'] = firstName;
  if (lastName) referralMetadataUpdate['metadata.fakeUserInfo.lastName'] = lastName;
  if (referredEmail) referralMetadataUpdate['metadata.fakeUserInfo.email'] = referredEmail;

  // Update the Referral document
  if (Object.keys(referralMetadataUpdate).length > 0) {
    const referralUpdate = await Referral.findOneAndUpdate(
      {
        referrer: existingActivity.userId,
        signupDate: { $gte: startOfDay, $lte: endOfDay },
        'metadata.campaign': 'demo-generated'
      },
      { $set: referralMetadataUpdate },
      { new: true }
    );
    
    if (referralUpdate) {
      console.log(`✅ Updated Referral metadata for ${firstName} ${lastName} (${referredEmail})`);
    }
  }
  break;
}
```

#### 2. Regenerate Activity Description

```typescript
// For referral activities, regenerate description if name changed
if ((updateData.activityType === 'referral' || existingActivity.activityType === 'referral') && 
    updateData.referredUserName) {
  updateData.description = `Referral bonus for inviting ${updateData.referredUserName}`;
}

// Update the ActivityHistory record
const activity = await ActivityHistory.findByIdAndUpdate(
  activityId,
  {
    ...updateData,
    editedBy: adminId,
    editedAt: new Date()
  },
  { new: true, runValidators: true }
);
```

## Impact
- ✅ Editing a referral now updates THREE synchronized data points:
  1. `ActivityHistory.referredUserName` and `referredUserEmail` 
  2. `ActivityHistory.description` (regenerated with new name)
  3. `Referral.metadata.fakeUserInfo` (firstName, lastName, email)
- ✅ Changes appear **immediately** in the activity list after saving
- ✅ Activity cards show the updated description with the new name
- ✅ Edit modal shows correct values when reopened
- ✅ Changes also reflect in the referrals dashboard
- ✅ Only affects generated referrals (with `campaign: 'demo-generated'`)
- ✅ Real user referrals (with actual User documents) remain unaffected

## Testing Steps
1. Navigate to Admin → Users
2. Select a user with generated referrals
3. Click "Activity History"
4. Find a referral activity and click edit
5. Change the referred user's name and/or email
6. Save changes
7. **Verify**: The list immediately shows the new name
8. **Verify**: Opening the edit modal again shows the updated values
9. **Verify**: Navigating to the user's Referrals page shows the updated name/email

## Files Modified
- `/server/src/controllers/adminUserController.ts` - Added referral synchronization logic in `updateActivity` function
