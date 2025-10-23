# Investment Plan Loading Bug - Root Cause and Fix

## Problem
On the Investment Amount page, users would see "No investment plan selected. Please select a plan first." even though they had a selected plan in the database. After refreshing the page, it would work correctly.

## Root Cause: Race Condition in Loading States

### Timeline of What Was Happening:

```
Time 0ms:   Component mounts
            - contextLoading = true ✅
            - loadingPlan = true ✅
            - Shows loading spinner ✅

Time 500ms: Context finishes loading
            - contextLoading = false
            - data.selectedInvestmentPlan exists in data
            - loadingPlan = false (set in else branch because condition was checked when data was empty)
            - selectedPlan = null (hasn't fetched yet)
            - Shows "No plan selected" ❌ WRONG!

Time 600ms: useEffect runs again (dependency changed)
            - Starts fetching plan details
            - loadingPlan = true
            - Shows loading spinner again ✅

Time 1000ms: Plan fetch completes
             - loadingPlan = false
             - selectedPlan = {...plan data}
             - Shows correct UI ✅
```

### The Problem
Between 500ms-600ms, there was a gap where:
- `contextLoading` was `false` (context done)
- `loadingPlan` was `false` (wrongly set)
- `selectedPlan` was `null` (not fetched yet)

This caused the "No plan selected" message to flash briefly or persist if the plan fetch was slow.

## The Fix

### 1. **Wait for Context Before Checking Plan**
Added a guard in the `fetchPlanDetails` function:

```typescript
// Wait for context to finish loading first
if (contextLoading) {
  return;
}
```

This prevents the useEffect from running prematurely when `data` is still empty.

### 2. **Updated Dependencies**
Added `contextLoading` to the dependency array:

```typescript
}, [data.selectedInvestmentPlan?._id, contextLoading]);
```

This ensures the effect re-runs when context loading completes.

### 3. **Better Logging**
Added a log message when no plan is found:

```typescript
console.log('ℹ️ No investment plan selected in user data');
```

## How It Works Now

```
Time 0ms:   Component mounts
            - contextLoading = true ✅
            - loadingPlan = true ✅
            - Shows loading spinner ✅

Time 500ms: Context finishes loading
            - contextLoading = false
            - useEffect runs (contextLoading dependency changed)
            - Checks: contextLoading? No, proceed
            - Checks: data.selectedInvestmentPlan?._id? Yes
            - loadingPlan = true (explicitly set before fetch)
            - Starts fetching plan details
            - Shows loading spinner ✅ STILL LOADING

Time 1000ms: Plan fetch completes
             - loadingPlan = false
             - selectedPlan = {...plan data}
             - Shows correct UI ✅
```

## Files Modified

**frontend/src/pages/onboarding/InvestmentAmount.tsx**
- Added `contextLoading` guard in `fetchPlanDetails`
- Added `contextLoading` to useEffect dependencies
- Added informative log when no plan is selected

## Testing Checklist

- [ ] Navigate to Investment Amount page with a selected plan
  - Should show loading spinner, then the plan's min/max amounts
  - Should NOT show "No plan selected" message at any point

- [ ] Navigate to Investment Amount page WITHOUT a selected plan
  - Should show loading spinner
  - Should then show "No plan selected" message with redirect button

- [ ] Test on slow network (throttle in DevTools)
  - Should maintain loading spinner until plan is fully loaded
  - No flickering between states

- [ ] Check browser console logs
  - Should see plan fetching logs in correct order
  - No errors about undefined properties

## Why Refresh "Fixed" It

When you refreshed the page:
1. Browser cache might have had the plan data
2. Network was faster on second load
3. Timing aligned better so the race condition didn't occur
4. React's hydration might have handled state differently

This is a classic symptom of race conditions - they appear/disappear based on timing!

## Prevention Pattern

This pattern should be used anywhere we have **sequential async operations**:

```typescript
useEffect(() => {
  const fetch = async () => {
    // Wait for first async operation
    if (firstLoading) return;
    
    if (firstData?.neededValue) {
      setSecondLoading(true);
      try {
        // Fetch second data
      } finally {
        setSecondLoading(false);
      }
    } else {
      setSecondLoading(false);
    }
  };
  
  fetch();
}, [firstData?.neededValue, firstLoading]); // Include both!
```

## Additional Notes

The component already had the correct check `if (contextLoading || loadingPlan)` for the loading spinner, but the race condition in state management was causing `loadingPlan` to be incorrectly set to `false` too early.
