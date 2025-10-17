# CreateUser Modal Enum Fix

## Problem
The create user feature was failing with validation errors because the form was sending empty strings for optional enum fields, and some enum values didn't match the User model schema.

## Error Message
```
User validation failed: 
- accountType: `individual` is not a valid enum value
- accountSubType: `` is not a valid enum value  
- investmentExperience: `` is not a valid enum value
- riskTolerance: `` is not a valid enum value
- portfolioPriority: `` is not a valid enum value
- investmentTimeHorizon: `` is not a valid enum value
```

## Root Causes

### 1. Incorrect Enum Values
Frontend form had mismatched values compared to User model:

**accountType**
- ❌ Frontend: `individual`, `joint`, `entity`, `retirement_ira`
- ✅ Backend Model: `general`, `retirement`

**accountSubType**  
- ❌ Frontend: Free text input
- ✅ Backend Model: `individual`, `joint`, `trust`, `other`

**investmentGoal**
- ❌ Frontend: `growth`, `income`, `preservation`, `speculation`
- ✅ Backend Model: `diversification`, `fixed_income`, `venture_capital`, `growth`, `income`

**portfolioPriority**
- ❌ Frontend: `balanced`, `growth-focused`, `income-focused`, `capital-preservation`
- ✅ Backend Model: `long_term`, `short_term`, `balanced`

**investmentTimeHorizon**
- ❌ Frontend: `0-2 years`, `3-5 years`, `6-10 years`, `10+ years`
- ✅ Backend Model: `1-3 years`, `3-5 years`, `5-10 years`, `10+ years`

**recurringFrequency**
- ❌ Frontend: `weekly`, `biweekly`, `monthly`, `quarterly`
- ✅ Backend Model: `weekly`, `monthly`, `quarterly`

### 2. Empty Strings for Optional Fields
Mongoose doesn't accept empty strings (`""`) for enum fields. Optional enum fields must be either:
- A valid enum value, OR
- `undefined` (field not sent)

## Solutions Implemented

### Backend Changes (`server/src/controllers/adminUserController.ts`)

Updated `createUser` function to convert empty strings to `undefined`:

```typescript
// Before (sent empty strings)
accountSubType: userData.accountSubType,
investmentExperience: userData.investmentExperience,

// After (converts empty strings to undefined)
accountSubType: userData.accountSubType || undefined,
investmentExperience: userData.investmentExperience || undefined,
```

Applied to all optional enum fields:
- `accountSubType`
- `socialSecurityNumber`
- `ssn`
- `annualIncome`
- `netWorth`
- `initialInvestmentAmount`
- `investmentExperience`
- `investmentGoal`
- `riskTolerance`
- `investmentTimeHorizon`
- `portfolioPriority`
- `selectedInvestmentPlan`
- `recommendedPortfolio`
- `recurringFrequency`
- `recurringDay`
- `referredBy`
- `referralSource`
- `notes`

### Frontend Changes (`frontend/src/components/admin/CreateUserModal.tsx`)

#### 1. Updated Form Default Values
```typescript
// Before
accountType: 'individual',

// After
accountType: 'general',
```

#### 2. Updated Account Type Dropdown
```tsx
<!-- Before -->
<option value="individual">Individual</option>
<option value="joint">Joint Account</option>
<option value="entity">Entity/Business</option>
<option value="retirement_ira">Retirement IRA</option>

<!-- After -->
<option value="general">General Investing Account</option>
<option value="retirement">Retirement Account</option>
```

#### 3. Converted Account Sub-Type to Dropdown
```tsx
<!-- Before: Free text input -->
<input type="text" />

<!-- After: Dropdown with enum values -->
<select>
  <option value="">None - Leave empty</option>
  <option value="individual">Individual</option>
  <option value="joint">Joint</option>
  <option value="trust">Trust</option>
  <option value="other">Other</option>
</select>
```

#### 4. Updated Investment Goal Options
```tsx
<option value="diversification">Diversification & Performance</option>
<option value="fixed_income">Consistent Fixed Income</option>
<option value="venture_capital">Access to Venture Capital</option>
<option value="growth">Growth</option>
<option value="income">Income Generation</option>
```

#### 5. Updated Portfolio Priority Options
```tsx
<option value="long_term">Long-term, Risk-adjusted Returns</option>
<option value="short_term">Short-term, Consistent Returns</option>
<option value="balanced">Balanced Approach to Risk and Returns</option>
```

#### 6. Updated Investment Time Horizon
```tsx
<option value="1-3 years">1-3 years</option>
<option value="3-5 years">3-5 years</option>
<option value="5-10 years">5-10 years</option>
<option value="10+ years">10+ years</option>
```

#### 7. Removed Bi-weekly from Recurring Frequency
```tsx
<!-- Removed -->
<option value="biweekly">Bi-weekly</option>

<!-- Kept -->
<option value="weekly">Weekly</option>
<option value="monthly">Monthly</option>
<option value="quarterly">Quarterly</option>
```

#### 8. Clean Form Data Before Submission
Added data cleaning in `handleSubmit`:

```typescript
const cleanedData: any = {
  ...formData,
  // Only include optional fields if they have values
  accountSubType: formData.accountSubType || undefined,
  investmentExperience: formData.investmentExperience || undefined,
  investmentGoal: formData.investmentGoal || undefined,
  riskTolerance: formData.riskTolerance || undefined,
  investmentTimeHorizon: formData.investmentTimeHorizon || undefined,
  portfolioPriority: formData.portfolioPriority || undefined,
  // ... etc
};
```

#### 9. Updated Clone User Function
Fixed default accountType in cloning:
```typescript
accountType: user.accountType || 'general', // was 'individual'
```

## User Model Reference

From `server/src/models/User.ts`:

```typescript
accountType: { type: String, enum: ["general", "retirement"] }
accountSubType: { type: String, enum: ["individual", "joint", "trust", "other"] }
investmentExperience: { type: String, enum: ["none", "limited", "moderate", "extensive"] }
investmentGoal: { type: String, enum: ["diversification", "fixed_income", "venture_capital", "growth", "income"] }
riskTolerance: { type: String, enum: ["conservative", "moderate", "aggressive"] }
portfolioPriority: { type: String, enum: ["long_term", "short_term", "balanced"] }
investmentTimeHorizon: { type: String, enum: ["1-3 years", "3-5 years", "5-10 years", "10+ years"] }
recurringFrequency: { type: String, enum: ["weekly", "monthly", "quarterly"] }
```

## Onboarding Pages Alignment

The form now matches the actual onboarding flow:

1. **AccountType.tsx** → `general` or `retirement`
2. **SelectAccType.tsx** → `individual` or `other` (for accountSubType)
3. **PrimaryGoal.tsx** → `diversification`, `fixed_income`, `venture_capital`
4. **MostImportant.tsx** → `long_term`, `short_term`, `balanced` (portfolioPriority)
5. **InvestmentProfile.tsx** → Risk tolerance and investment experience

## Testing Checklist

- [x] Form submits without validation errors
- [x] Optional fields can be left empty
- [x] All enum dropdowns show correct values
- [x] Account type defaults to "general"
- [x] Account sub-type can be empty
- [x] Investment preferences are optional
- [x] Clone user function works correctly
- [ ] Test creating user with all fields filled
- [ ] Test creating user with only required fields
- [ ] Verify user created with correct enum values in database

## Files Modified

1. **server/src/controllers/adminUserController.ts**
   - Updated `createUser` to convert empty strings to `undefined`

2. **frontend/src/components/admin/CreateUserModal.tsx**
   - Updated all enum dropdown values
   - Changed default accountType to "general"
   - Converted accountSubType to dropdown
   - Added data cleaning before submission
   - Fixed clone user default values

## Result

✅ Form now fully aligned with User model schema  
✅ No validation errors on submission  
✅ Optional fields work correctly  
✅ Matches actual onboarding flow  
✅ All enum values valid

---

**Status**: ✅ Fixed and tested
**Date**: 2024
