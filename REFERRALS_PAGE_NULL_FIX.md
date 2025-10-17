# Referrals Page Null Reference Fix

## Problem
The Referrals page was crashing with the error:
```
TypeError: Cannot read properties of null (reading 'firstName')
at ReferralsPage.tsx:339:46
```

## Root Cause
The code was trying to access `referral.referred.firstName` and `referral.referred.email` without checking if `referral.referred` is null first.

This happens because:
1. **Demo-generated referrals** create referral records with dummy/null referred users
2. **Deleted users** may leave referral records with null references
3. The activity generator creates referrals with `new mongoose.Types.ObjectId()` (empty ObjectId) as placeholders

## Solution
Added proper null checks before accessing `referral.referred` properties.

### Code Changes

**File**: `frontend/src/pages/dashboard/ReferralsPage.tsx`

**Before** (Line 337-344):
```tsx
<p className="font-medium text-gray-900">
  {referral.referred.firstName && referral.referred.lastName
    ? `${referral.referred.firstName} ${referral.referred.lastName}`
    : referral.referred.email.split('@')[0]
  }
</p>
<p className="text-sm text-gray-500">{referral.referred.email}</p>
```

**After**:
```tsx
<p className="font-medium text-gray-900">
  {referral.referred && referral.referred.firstName && referral.referred.lastName
    ? `${referral.referred.firstName} ${referral.referred.lastName}`
    : referral.referred && referral.referred.email
    ? referral.referred.email.split('@')[0]
    : 'Demo User'
  }
</p>
<p className="text-sm text-gray-500">
  {referral.referred && referral.referred.email 
    ? referral.referred.email 
    : 'demo@example.com'
  }
</p>
```

## Logic Flow

The fix implements a cascading fallback system:

1. **First Choice**: If `referral.referred` exists AND has both firstName and lastName
   - Display: `"John Doe"`

2. **Second Choice**: If `referral.referred` exists AND has email
   - Display: `"john" ` (email username part)

3. **Fallback**: If `referral.referred` is null
   - Display: `"Demo User"` / `"demo@example.com"`

## Impact

### Before Fix
- Page crashed on load if any referral had null referred user
- Error boundary caught it but page was unusable
- Demo-generated referrals caused immediate crashes

### After Fix
- ✅ Page loads successfully with demo/generated referrals
- ✅ Shows "Demo User" for null referred users
- ✅ Shows actual user data when available
- ✅ Gracefully handles deleted or missing users

## Testing Scenarios

**Test Case 1**: Referral with complete user data
- Input: `{ referred: { firstName: "John", lastName: "Doe", email: "john@example.com" } }`
- Output: "John Doe" / "john@example.com"

**Test Case 2**: Referral with email only
- Input: `{ referred: { email: "jane@example.com" } }`
- Output: "jane" / "jane@example.com"

**Test Case 3**: Referral with null referred user (demo-generated)
- Input: `{ referred: null }`
- Output: "Demo User" / "demo@example.com"

**Test Case 4**: Referral with deleted user
- Input: `{ referred: null }` (user was deleted)
- Output: "Demo User" / "demo@example.com"

## Related Issues

This fix is particularly important after implementing the activity generator, which creates referral records with dummy referred user IDs. Without this fix, any user with generated referral history would see a crashed referrals page.

## Prevention

For future reference, when accessing nested object properties from API data, always:
1. Check if the parent object exists first: `obj && obj.property`
2. Use optional chaining: `obj?.property`
3. Provide fallback values for display
4. Consider TypeScript types to catch these at compile time

## Files Modified
- `frontend/src/pages/dashboard/ReferralsPage.tsx` - Added null checks for `referral.referred`

## Status
✅ **FIXED** - Referrals page now handles null referred users gracefully
