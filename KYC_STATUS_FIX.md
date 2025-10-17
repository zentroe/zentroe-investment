# KYC Status Display Fix

## Problem
The KYC Verification page was showing "pending" status for users even though the database had their status marked as "approved" in the User model.

## Root Cause
The application has **TWO separate KYC data sources**:

1. **User Model** (`User.kyc.status`)
   - Simple status field: `pending`, `approved`, `rejected`
   - Located in the main User document
   - Updated by admin when approving/rejecting KYC
   - This is the **source of truth** for KYC status

2. **KYC Collection** (separate collection)
   - Detailed document verification system
   - Stores uploaded documents (driver's license, passport)
   - Has its own status field
   - More granular with document tracking

### The Issue
The `getUserKYCStatus` controller was **only checking the KYC collection**, ignoring the User model's `kyc.status` field. When an admin approved KYC directly in the User model (e.g., through the admin panel or activity generator), the frontend still showed "pending" because it was reading from the wrong source.

## Solution
Updated the `getUserKYCStatus` controller to:
1. Fetch data from both sources (KYC collection AND User model)
2. **Prioritize User.kyc.status** as the source of truth
3. Merge other fields (documents, dates, notes) from both sources

### Code Changes

**File**: `server/src/controllers/kycController.ts`

**Before**:
```typescript
export const getUserKYCStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    const kycStatus = await KYCService.getUserKYCStatus(userId);
    
    res.status(200).json({
      success: true,
      data: kycStatus || {
        status: 'pending',
        documents: []
      }
    });
  } catch (error) {
    // error handling...
  }
};
```

**After**:
```typescript
export const getUserKYCStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get KYC document status from KYC collection
    const kycDocument = await KYCService.getUserKYCStatus(userId);
    
    // Also get the user's kyc status from User model (this is the source of truth)
    const user = await User.findById(userId).select('kyc').lean();
    
    // Merge both sources - User.kyc.status takes priority if it exists
    let finalStatus: any = {
      status: user?.kyc?.status || kycDocument?.status || 'pending',
      submittedAt: kycDocument?.submittedAt || user?.kyc?.submittedAt,
      reviewedAt: kycDocument?.reviewedAt || user?.kyc?.reviewedAt,
      reviewedBy: kycDocument?.reviewedBy || user?.kyc?.reviewedBy,
      rejectionReason: kycDocument?.rejectionReason,
      notes: kycDocument?.notes || user?.kyc?.notes,
      documents: kycDocument?.documents || []
    };

    res.status(200).json({
      success: true,
      data: finalStatus
    });
  } catch (error) {
    // error handling...
  }
};
```

## Priority Logic

The merged status follows this priority:

1. **Status**: `User.kyc.status` (if exists) → `KYC.status` → default `'pending'`
2. **Dates**: KYC collection (more accurate) → User model → undefined
3. **Documents**: Always from KYC collection (only place they're stored)
4. **Notes**: KYC collection → User model → undefined

## Testing

**Test Case 1**: User with approved status in User model, no KYC collection
- ✅ Result: Shows "approved"

**Test Case 2**: User with pending in User model, approved in KYC collection
- ✅ Result: Shows "pending" (User model takes priority)

**Test Case 3**: User with approved in User model, has documents in KYC collection
- ✅ Result: Shows "approved" with documents

**Test Case 4**: User with no User.kyc field, has KYC collection
- ✅ Result: Shows KYC collection status

**Test Case 5**: New user with neither
- ✅ Result: Shows "pending" by default

## Impact

### Before Fix
- Admin approves user KYC via Edit User Modal
- User model: `kyc.status = "approved"` ✓
- User dashboard still shows: "Pending" ✗

### After Fix
- Admin approves user KYC via Edit User Modal
- User model: `kyc.status = "approved"` ✓
- User dashboard now shows: "Approved" ✓

## Additional Notes

### Why Two Systems?
The dual system exists because:
1. **Historical**: KYC collection was created for detailed document verification
2. **Simplicity**: User.kyc provides quick status checks without joining collections
3. **Flexibility**: Allows manual approval without requiring document upload

### Best Practices Going Forward
When updating KYC status, ensure both are in sync:

```typescript
// Update User model
await User.findByIdAndUpdate(userId, {
  'kyc.status': 'approved',
  'kyc.reviewedAt': new Date(),
  'kyc.reviewedBy': adminId
});

// Update KYC collection if it exists
await KYC.findOneAndUpdate(
  { user: userId },
  {
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: adminId
  }
);
```

### Activity Generator Sync
The activity generator now sets `User.kyc.status = 'approved'` when generating KYC activities. This fix ensures that status is properly displayed on the frontend.

## Files Modified
1. `server/src/controllers/kycController.ts` - Added User model check and merge logic
2. Added import for User model

## Status
✅ **FIXED** - KYC status now properly displays from User model as source of truth
