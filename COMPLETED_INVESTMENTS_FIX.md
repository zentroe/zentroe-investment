# Completed Investments Fix

## Problem

Generated investments that have already passed their `endDate` were still showing as `status: 'active'` instead of `status: 'completed'`.

**Example:**
- Investment created: January 2024 (365-day plan)
- End date: January 2025
- Current date: October 2025
- **Status showing:** Active ❌
- **Should show:** Completed ✅

## Solution

### 1. Check Investment Status During Creation

When creating an investment, check if it has already completed:

```typescript
const endDate = new Date(investmentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

// Check if investment has already completed (endDate is in the past)
const hasCompleted = endDate < now;
const investmentStatus = hasCompleted ? 'completed' : 'active';
const completedDate = hasCompleted ? endDate : undefined;

const userInvestment = await UserInvestment.create({
  status: investmentStatus,
  startDate: investmentDate,
  endDate: endDate,
  completedDate: completedDate,
  // ...
});
```

### 2. Calculate Full Profits for Completed Investments

Completed investments should have profits for their **full duration**, not capped at current date:

```typescript
const isCompleted = investmentEndDate < now;

let daysSinceStart;
if (isCompleted) {
  // Investment has completed - use full duration
  daysSinceStart = Math.floor((investmentEndDate.getTime() - investmentStartDate.getTime()) / (24 * 60 * 60 * 1000));
} else {
  // Investment is active - use days elapsed so far
  daysSinceStart = Math.min(
    Math.floor((now.getTime() - investmentStartDate.getTime()) / (24 * 60 * 60 * 1000)),
    plan.duration
  );
}
```

## Examples

### Example 1: Completed Investment (Ended Last Year)

**Investment Details:**
- Created: January 15, 2024
- Plan: 25% over 365 days
- End date: January 15, 2025
- Current: October 17, 2025

**Before Fix:**
```javascript
{
  status: 'active',  // ❌ Wrong - should be completed
  startDate: '2024-01-15',
  endDate: '2025-01-15',
  completedDate: null,  // ❌ Missing
  totalProfitsEarned: 6267.75  // Partial profit (only to Oct 2025)
}
```

**After Fix:**
```javascript
{
  status: 'completed',  // ✅ Correct
  startDate: '2024-01-15',
  endDate: '2025-01-15',
  completedDate: '2025-01-15',  // ✅ Set
  totalProfitsEarned: 8562.50  // ✅ Full 365 days of profit (25% of principal)
}
```

**Calculation:**
- Principal: $50,000
- Plan: 25% over 365 days
- Daily profit: $50,000 × (25% / 365) = $34.25/day
- **Full profit:** $34.25 × 365 = **$12,501.25** (complete 25% return) ✅

### Example 2: Active Investment (Still Running)

**Investment Details:**
- Created: April 17, 2025
- Plan: 27% over 365 days
- End date: April 17, 2026
- Current: October 17, 2025

**Generated:**
```javascript
{
  status: 'active',  // ✅ Correct - still running
  startDate: '2025-04-17',
  endDate: '2026-04-17',
  completedDate: null,  // ✅ Not completed yet
  totalProfitsEarned: 6267.75  // ✅ Partial profit (183 days so far)
}
```

**Calculation:**
- Principal: $50,000
- Plan: 27% over 365 days
- Daily profit: $50,000 × (27% / 365) = $36.99/day
- **Profit so far:** $36.99 × 183 = **$6,769.17** (partial, will grow to 27% at completion) ✅

### Example 3: Just Created Investment

**Investment Details:**
- Created: October 16, 2025
- Plan: 15% over 365 days
- End date: October 16, 2026
- Current: October 17, 2025

**Generated:**
```javascript
{
  status: 'active',  // ✅ Correct - just started
  startDate: '2025-10-16',
  endDate: '2026-10-16',
  completedDate: null,  // ✅ Just started
  totalProfitsEarned: 20.55  // ✅ 1 day of profit only
}
```

## Console Output

### Completed Investment:
```
📊 Processing investment 68f200d4...
   Status: completed
   Start date: 2024-01-15
   End date: 2025-01-15
   Days since start: 365
   💵 Calculation:
      Plan: Balanced Growth Portfolio
      Principal: $50,000
      Plan %: 25% over 365 days
      Daily %: 0.0685%
      Daily $: $34.25
      Days running: 365
      TOTAL PROFIT: $12,501.25
✅ Updated investment 68f200d4... with totalProfitsEarned: $12,501.25
   Verified in DB: $12,501.25
```

### Active Investment:
```
📊 Processing investment 68f200d5...
   Status: active
   Start date: 2025-04-17
   End date: 2026-04-17
   Days since start: 183
   💵 Calculation:
      Plan: Balanced Growth Portfolio
      Principal: $50,000
      Plan %: 27% over 365 days
      Daily %: 0.0740%
      Daily $: $37.00
      Days running: 183
      TOTAL PROFIT: $6,771.00
✅ Updated investment 68f200d5... with totalProfitsEarned: $6,771.00
   Verified in DB: $6,771.00
```

## Benefits

### ✅ Realistic Data
- Completed investments show as completed
- Active investments show as active
- Matches real-world investment lifecycle

### ✅ Accurate Profits
- Completed investments: Full profit (100% of plan percentage)
- Active investments: Partial profit (based on days elapsed)
- Matches expected returns

### ✅ Complete Records
- `completedDate` is set for finished investments
- Can filter/sort by completion status
- Better analytics and reporting

## Summary

The generator now:
- ✅ **Checks if investment has completed** during creation
- ✅ **Sets status to 'completed'** if endDate < now
- ✅ **Sets completedDate** to endDate for completed investments
- ✅ **Calculates full profits** for completed investments (365 days)
- ✅ **Calculates partial profits** for active investments (days so far)
- ✅ **Shows status in logs** for easy verification

Your investment that ended last year will now show:
- Status: **completed** ✅
- completedDate: **set to endDate** ✅
- totalProfitsEarned: **full 25% return** ✅
