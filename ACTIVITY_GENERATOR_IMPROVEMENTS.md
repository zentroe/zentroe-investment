# Activity Generator Improvements

## Summary
Completely overhauled the activity generator to create realistic, sparse, and logically consistent demo data.

## Key Improvements

### 1. **Sparse Activity Generation**
**Before:** Too many activities (10 deposits/year, 50 logins/year)
**After:** Realistic frequency (3 deposits/year, 30 logins/year, 2-3 investments/year)

- Added `usedDates` tracking to ensure no duplicate activities on same day
- `getUniqueDate()` helper ensures deposits, investments, withdrawals, and referrals are spread out
- Logins can still occur multiple times per day (realistic)

### 2. **Rounded Amounts (To Tens)**
**Before:** Random decimals like $4,352.67 or $65,385.23
**After:** Clean rounded amounts like $4,350 or $65,380

```typescript
const randomAmount = (min: number, max: number): number => {
  const amount = Math.random() * (max - min) + min;
  // Round to nearest 10
  return Math.round(amount / 10) * 10;
};
```

### 3. **Real Investment Plan Constraints**
**Before:** Hardcoded amounts ignoring plan ranges
**After:** Uses each plan's `minInvestment` and `maxInvestment`

```typescript
// Pick a random plan
const plan = investmentPlans[Math.floor(Math.random() * investmentPlans.length)];

// Use amount within the plan's min/max range and round to tens
const amount = randomAmount(plan.minInvestment || 1000, plan.maxInvestment || 50000);
```

### 4. **Logical Profit Calculations**
**Before:** Profits could exceed principal (showing bigger returns than investment!)
**After:** Profits capped at plan's percentage (max 25%)

```typescript
// Calculate total profit earned so far (must never exceed plan's profitPercentage)
const maxTotalProfit = investment.amount * (plan.profitPercentage / 100); // Max 25% of investment
const dailyProfitAmount = maxTotalProfit / plan.duration; // Spread evenly over duration
```

**Example:**
- Investment: $10,000
- Plan: 25% over 365 days
- Max total profit: $2,500 (never more!)
- Daily profit: $6.85
- Monthly profit: ~$205

### 5. **Limited Ongoing Investments**
**Before:** All investments had profits available
**After:** Only 40% of investments have accumulated profits

```typescript
// Only investments at least 30 days old
const activeInvestments = createdInvestments.filter(inv => {
  const daysSinceStart = (now.getTime() - new Date(inv.startDate).getTime()) / (24 * 60 * 60 * 1000);
  return daysSinceStart >= 30;
});

// Only 40% have profits
const investmentsWithProfits = activeInvestments.slice(0, Math.ceil(investmentsCount * 0.4));
```

### 6. **Logical Withdrawals**
**Before:** Random withdrawal amounts unrelated to profits
**After:** Can only withdraw from investments with profits, only withdraws 30-70% of available

```typescript
// Calculate available profits for this investment
const availableProfits = createdDailyProfits
  .filter(dp => dp.userInvestment.toString() === sourceInvestment._id.toString())
  .reduce((sum, dp) => sum + dp.profitAmount, 0);

// Withdraw only a portion of available profits (30-70%)
const withdrawalPercentage = 0.3 + Math.random() * 0.4;
const amount = Math.round((availableProfits * withdrawalPercentage) / 10) * 10;
```

### 7. **Realistic Deposit Amounts**
**Before:** $500 - $10,000
**After:** $1,000 - $50,000 (more realistic for investment platform)

## Activity Frequency Comparison

| Activity Type | Before | After | Notes |
|--------------|--------|-------|-------|
| Deposits | ~10/year | ~3/year | More realistic, spreads out deposits |
| Investments | ~4/year | ~2-3/year | Users don't invest constantly |
| Withdrawals | ~3/year | ~1-2/year | Only from investments with profits |
| Referrals | ~2/year | ~1-2/year | Same, reasonable frequency |
| Logins | ~50/year | ~30/year | More realistic engagement |

## Data Integrity

### ✅ **Deposits**
- Amounts: $1,000 - $50,000 (rounded to tens)
- Frequency: ~3 per year
- Each on unique date

### ✅ **Investments**
- Amounts: Based on plan's `minInvestment` to `maxInvestment`
- Uses real plan percentages (6.5% to 27%)
- Durations: 365 or 730 days from plan
- Each on unique date

### ✅ **Profits**
- Only generated for investments 30+ days old
- Only 40% of investments have accumulated profits
- Never exceeds plan's profit percentage
- Monthly profit records (not daily, more realistic)
- Formula: `maxProfit = investment × (planPercent / 100)`

### ✅ **Withdrawals**
- Only from investments with available profits (>$100)
- Amount: 30-70% of available profits
- Frequency: 60% of eligible investments
- Each on unique date

### ✅ **Referrals**
- Bonus: $50 - $300 (rounded to tens)
- Each on unique date
- Realistic fake user data

## Testing Recommendations

1. **Generate 1 year of data** - Check that activities are sparse (not crowded)
2. **Check profit amounts** - Ensure no profit exceeds investment amount
3. **Verify withdrawals** - Confirm withdrawal amounts make sense relative to profits
4. **Review dates** - Ensure deposits/investments/withdrawals don't cluster on same dates
5. **Validate amounts** - All amounts should be rounded to tens

## Example Output

For 2 years of data:
- 6 deposits (~$30,000 - $150,000 total)
- 5 investments (~$10,000 - $100,000 total)
- 2-3 investments with profits
- 2-3 withdrawals (only from profitable investments)
- 3 referrals
- 60 logins

All with logical amounts and realistic spacing! 🎉
