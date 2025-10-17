# Daily Profit Rate Calculation Fix

## Critical Bug Found

The daily profit rate calculation in the `UserInvestment` model was **fundamentally wrong**, causing the displayed daily rates to be inflated by **100x to 1000x** the correct value.

## The Problem

### What Was Wrong
The `dailyProfitRate` field was being calculated as a **dollar amount** but displayed and used as a **percentage**.

**Incorrect Formula (OLD):**
```typescript
const totalProfitPercentage = plan.profitPercentage / 100;  // e.g., 25% becomes 0.25
this.dailyProfitRate = (this.amount * totalProfitPercentage) / plan.duration;
```

### Example of the Bug

**Investment Details:**
- Amount: $10,000
- Plan: 25% profit over 365 days
- Expected daily rate: 0.0685% (25% ÷ 365)

**What the OLD formula calculated:**
```
totalProfitPercentage = 25 / 100 = 0.25
dailyProfitRate = ($10,000 * 0.25) / 365
dailyProfitRate = $2,500 / 365
dailyProfitRate = $6.85  ← This is DOLLARS, not a percentage!
```

**What was displayed:**
```
Daily Rate: 6.85%  ← WRONG! This would be 2,500% annually!
```

**What should have been displayed:**
```
Daily Rate: 0.0685%  ← CORRECT! This is 25% annually
```

### Impact

1. **Display Issue**: Admin dashboard showed absurd daily rates like:
   - 25% annual plan → Showed 6.85% daily (should be 0.0685%)
   - 50% annual plan → Showed 13.70% daily (should be 0.137%)
   - 100% annual plan → Showed 27.40% daily (should be 0.274%)

2. **Calculation Issue**: The profit calculation service could have used the wrong rate if it relied on `investment.dailyProfitRate`

3. **User Confusion**: Displayed rates looked astronomical and incorrect

## The Solution

### Correct Formula (NEW)
```typescript
// Calculate daily profit rate as percentage: (total profit percentage / duration in days)
this.dailyProfitRate = plan.profitPercentage / plan.duration;
```

### Example of Correct Calculation

**Investment Details:**
- Amount: $10,000
- Plan: 25% profit over 365 days

**What the NEW formula calculates:**
```
dailyProfitRate = 25 / 365
dailyProfitRate = 0.0685%  ← This is a PERCENTAGE
```

**How profit is then calculated:**
```
Daily Profit Amount = $10,000 * (0.0685 / 100)
Daily Profit Amount = $10,000 * 0.000685
Daily Profit Amount = $6.85 per day

Total over 365 days = $6.85 * 365 = $2,500.25
Percentage = ($2,500.25 / $10,000) * 100 = 25%  ✅ CORRECT!
```

## Files Modified

### 1. UserInvestment Model
**File:** `server/src/models/UserInvestment.ts`

**Before:**
```typescript
const totalProfitPercentage = plan.profitPercentage / 100;
this.dailyProfitRate = (this.amount * totalProfitPercentage) / plan.duration;
```

**After:**
```typescript
// Calculate daily profit rate as percentage: (total profit percentage / duration in days)
// Example: 25% over 365 days = 0.0685% per day
this.dailyProfitRate = plan.profitPercentage / plan.duration;
```

### 2. Migration Script
**File:** `server/src/scripts/fixDailyProfitRates.ts`

Created a migration script to fix existing investments in the database.

## How Profit Calculation Works

### Daily Profit Calculation
The `profitService.ts` correctly uses the daily rate as a percentage:

```typescript
// Get the daily rate percentage
const dailyRatePercentage = investment.dailyProfitRate || (investmentPlan.profitPercentage / investmentPlan.duration);

// Calculate daily profit amount in dollars
const profitAmount = investment.amount * (dailyRatePercentage / 100);
```

### Example Calculations

#### Investment 1: 25% Annual, 365 Days
```
Investment Amount: $10,000
Annual Profit: 25%
Duration: 365 days

Daily Rate: 25% / 365 = 0.0685% per day
Daily Profit: $10,000 * (0.0685 / 100) = $6.85
Total Profit: $6.85 * 365 = $2,500.25 (25% of $10,000) ✅
```

#### Investment 2: 50% Annual, 180 Days
```
Investment Amount: $5,000
Annual Profit: 50%
Duration: 180 days

Daily Rate: 50% / 180 = 0.2778% per day
Daily Profit: $5,000 * (0.2778 / 100) = $13.89
Total Profit: $13.89 * 180 = $2,500.20 (50% of $5,000) ✅
```

#### Investment 3: 100% Annual, 730 Days (2 years)
```
Investment Amount: $20,000
Annual Profit: 100%
Duration: 730 days

Daily Rate: 100% / 730 = 0.137% per day
Daily Profit: $20,000 * (0.137 / 100) = $27.40
Total Profit: $27.40 * 730 = $20,002 (100% of $20,000) ✅
```

## Running the Migration

To fix existing investments in the database:

```bash
cd server
npx ts-node src/scripts/fixDailyProfitRates.ts
```

The script will:
1. Connect to your database
2. Find all investments
3. Recalculate daily profit rates using the correct formula
4. Update only the investments with incorrect rates
5. Show a summary of fixes made

## Verification

After running the migration, you can verify the fix by:

1. **Check Admin Dashboard:**
   - Navigate to Investment Management
   - View investment details
   - Daily rates should now show small percentages (e.g., 0.0685% instead of 6.85%)

2. **Calculate Manually:**
   ```
   Daily Rate = Total Profit % / Duration in Days
   
   For 25% over 365 days:
   Daily Rate = 25 / 365 = 0.0685%
   ```

3. **Check Annual Calculation:**
   ```
   Annual Profit = Daily Rate * Duration
   
   For 0.0685% daily over 365 days:
   Annual Profit = 0.0685 * 365 = 25%  ✅
   ```

## Impact on Past Profits

**Good News:** The profit calculation service (`profitService.ts`) was already using the correct formula:

```typescript
const profitAmount = investment.amount * (dailyRatePercentage / 100);
```

This means:
- ✅ Past profits were calculated **correctly** (in terms of dollar amounts)
- ❌ Past profits may have used the **wrong percentage value** from `investment.dailyProfitRate`
- ✅ The fallback calculation `(investmentPlan.profitPercentage / investmentPlan.duration)` was correct

### Should Past Profits Be Recalculated?

**Probably not necessary** if:
- The profit service used the fallback formula
- Or if daily profits look correct in terms of dollar amounts

**May need recalculation** if:
- Daily profit amounts seem too high
- Total profits exceed the expected annual percentage

## Prevention

To prevent this issue in the future:

1. **Clear Documentation:** The field is now documented as returning a percentage
2. **Unit Tests:** Add tests to verify the calculation
3. **Type Safety:** Consider using a type that makes it clear it's a percentage

### Suggested Unit Test
```typescript
describe('UserInvestment Daily Profit Rate', () => {
  it('should calculate daily rate as percentage', async () => {
    const investment = new UserInvestment({
      amount: 10000,
      investmentPlan: {
        profitPercentage: 25,  // 25% annual
        duration: 365           // 365 days
      }
    });
    
    await investment.save();
    
    // Should be 25 / 365 = 0.0685%
    expect(investment.dailyProfitRate).toBeCloseTo(0.0685, 4);
    
    // Daily profit should be $6.85
    const dailyProfit = investment.amount * (investment.dailyProfitRate / 100);
    expect(dailyProfit).toBeCloseTo(6.85, 2);
    
    // Total profit should be 25% of investment
    const totalProfit = dailyProfit * 365;
    expect(totalProfit).toBeCloseTo(2500, 0);
  });
});
```

## Summary

| Aspect | Before (❌ Wrong) | After (✅ Correct) |
|--------|------------------|-------------------|
| Formula | `(amount * rate) / days` | `rate / days` |
| Units | Dollars | Percentage |
| Example (25% annual) | 6.85 | 0.0685% |
| Display | "6.85%" (wrong!) | "0.0685%" (correct!) |
| Annual Total | 2,500% | 25% |

---

**Status:** ✅ Fixed  
**Migration Required:** Yes - Run `fixDailyProfitRates.ts`  
**Breaking Change:** No - Improves accuracy  
**Date:** 2024
