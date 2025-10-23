# Onboarding Status Update Bug - Root Cause and Fix

## Problem
The `onboardingStatus` field was not updating reliably for some users. The frontend would log successful updates, but the database value remained unchanged.

## Root Causes Identified

### 1. **Race Condition in `authController.ts`** (PRIMARY ISSUE)
**Location:** `server/src/controllers/authController.ts` lines 381-387

**Problem:**
The `updateOnboarding` function had auto-update logic that would **override** the `onboardingStatus` based on which fields were being updated:

```typescript
// OLD CODE - PROBLEMATIC
if (updateData.firstName && updateData.lastName) {
  updateData.onboardingStatus = "basicInfo";
}
if (updateData.investmentGoal && updateData.riskTolerance) {
  updateData.onboardingStatus = "investmentProfile";
}
if (updateData.isAccreditedInvestor !== undefined) {
  updateData.onboardingStatus = "verification";
}
```

**What Was Happening:**
1. User completes a step → `updateStatus('investmentProfile')` is called
2. Same form also updates other profile fields → `updateOnboarding` is called
3. `updateOnboarding` sees the fields and **overwrites** the status back to an earlier value
4. Result: Status update appears to succeed but gets immediately overwritten

**Fix Applied:**
```typescript
// NEW CODE - FIXED
if (!updateData.onboardingStatus) {
  // Only auto-update if onboardingStatus is not explicitly provided
  if (updateData.firstName && updateData.lastName) {
    updateData.onboardingStatus = "basicInfo";
  }
  // ... etc
} else {
  console.log("🔒 [updateOnboarding] onboardingStatus explicitly provided, not auto-updating");
}
```

### 2. **Potential Concurrent Update Issues** (SECONDARY)
**Location:** `server/src/controllers/onboardingController.ts`

**Problem:**
Using `findByIdAndUpdate` can have issues with concurrent updates in high-traffic scenarios.

**Fix Applied:**
Changed from `findByIdAndUpdate` to atomic `updateOne` with `$set`:

```typescript
// More atomic and reliable
const updateResult = await User.updateOne(
  { _id: userId },
  { 
    $set: { onboardingStatus: status },
    $currentDate: { updatedAt: true }
  },
  { runValidators: true }
);
```

## Enhanced Logging
Added comprehensive logging to help diagnose future issues:

```typescript
console.log('🔄 [updateOnboardingStatus] Attempting to update status:', {
  userId, newStatus: status, timestamp: new Date().toISOString()
});

console.log('📊 [updateOnboardingStatus] Current user status:', {
  userId, currentStatus, newStatus
});

console.log('✅ [updateOnboardingStatus] Successfully updated:', {
  userId, previousStatus, newStatus, statusActuallyChanged, modifiedCount
});
```

## Testing Recommendations

1. **Test Sequential Updates:**
   - Complete onboarding steps one by one
   - Verify status updates correctly at each step

2. **Test Concurrent Updates:**
   - Submit form data while status is updating
   - Check if status persists correctly

3. **Monitor Server Logs:**
   - Watch for the new emoji-prefixed logs
   - Check `modifiedCount` to see if updates are actually changing data
   - Look for mismatch warnings

4. **Database Verification:**
   ```javascript
   // In MongoDB shell
   db.users.find({}, { email: 1, onboardingStatus: 1, updatedAt: 1 })
   ```

## Files Modified

1. **server/src/controllers/authController.ts**
   - Added check to prevent auto-override when status is explicitly set

2. **server/src/controllers/onboardingController.ts**
   - Changed to atomic `updateOne` operation
   - Added extensive logging
   - Added verification checks

## Expected Behavior After Fix

- ✅ `onboardingStatus` updates should persist correctly
- ✅ Manual status updates (via `updateStatus`) take precedence
- ✅ Auto-updates only happen when status is not explicitly set
- ✅ Server logs will show detailed update information
- ✅ Mismatches will be logged as warnings for investigation

## Rollback Plan (If Needed)

If issues persist, consider:
1. Adding a dedicated `onboarding_status_history` collection to track all changes
2. Using MongoDB transactions for critical status updates
3. Implementing optimistic locking with version numbers
4. Adding a status update queue to serialize changes
