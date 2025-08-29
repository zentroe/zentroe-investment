# OnboardingContext Implementation Guide

## ✅ What We've Implemented

### 1. OnboardingContext (`/src/context/OnboardingContext.tsx`)
```typescript
// Features:
- ✅ Fetches user data automatically on mount
- ✅ Provides loading states 
- ✅ Error handling
- ✅ Local data updates for optimistic UI
- ✅ Comprehensive data type definitions
- ✅ Authentication-aware (only fetches if token exists)
```

### 2. App-Level Integration (`/src/App.tsx`)
```typescript
// ✅ OnboardingProvider wraps entire app
// ✅ All components now have access to onboarding data
```

### 3. Updated Components
- ✅ **AccountType.tsx** - Shows pre-selected option + optimistic updates
- ✅ **LegalName.tsx** - Pre-populates first/last name + shows previous data
- ✅ **InvestmentAmount.tsx** - Uses context instead of separate API calls

## 🔄 How to Update Remaining Components

### Pattern for any onboarding component:

1. **Import the hook:**
```typescript
import { useOnboarding } from "@/context/OnboardingContext";
```

2. **Use the hook:**
```typescript
const { data, loading: contextLoading, updateLocalData } = useOnboarding();
```

3. **Pre-populate fields:**
```typescript
useEffect(() => {
  if (data.fieldName) {
    setFieldValue(data.fieldName);
  }
}, [data.fieldName]);
```

4. **Update save function:**
```typescript
const handleSave = async () => {
  try {
    await saveFunction(value);
    
    // Update local context for immediate UI feedback
    updateLocalData({ fieldName: value });
    
    toast.success("Saved");
    navigate("/next-page");
  } catch (error) {
    // handle error
  }
};
```

5. **Show loading while context loads:**
```typescript
if (contextLoading) {
  return (
    <OnboardingLayout>
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </OnboardingLayout>
  );
}
```

## 📋 Components to Update (Following Same Pattern)

### Onboarding Components
- [ ] `AnnualIncome.tsx` - field: `annualIncome`
- [ ] `AmountChoice.tsx` - field: `annualInvestmentAmount` 
- [ ] `HowDidYouHear.tsx` - field: `referralSource`
- [ ] `InvestmentProfile.tsx` - field: `portfolioPriority`
- [ ] `InvestmentRecommend.tsx` - field: `recommendedPortfolio`
- [ ] `MostImportant.tsx` - field: `investmentGoal`
- [ ] `PrimaryGoal.tsx` - field: `investmentGoal`
- [ ] `SelectAccType.tsx` - field: `accountSubType`

### Investment Components
- [ ] `RecurringInvestment.tsx` - fields: `recurringInvestment`, `recurringFrequency`, `recurringDay`, `recurringAmount`

## 🎯 Benefits You'll Get

### 1. **Data Persistence**
```typescript
// User fills form → leaves → comes back → form is pre-populated!
// No more starting from scratch
```

### 2. **Better UX**
```typescript
// Shows "Previously selected:" messages
// Instant UI updates with optimistic loading
// Single loading state for entire app
```

### 3. **Simpler Code**
```typescript
// Before: Each component fetches its own data
// After: One context provides everything
// No more getCurrentUser() calls everywhere
```

### 4. **Smart Progress Tracking**
```typescript
// Context knows user's onboardingStatus
// Can redirect to correct step automatically
// Shows completion progress across app
```

## 🚀 Next Steps

1. **Quick wins**: Update 2-3 components using the pattern above
2. **Test the flow**: Fill forms → refresh page → see pre-populated data
3. **Add progress routing**: Use `data.onboardingStatus` to redirect users to correct step
4. **Optimize**: Remove individual `getCurrentUser()` calls from components

## 💡 Pro Tips

- Always use `updateLocalData()` after successful saves for instant UI feedback
- Context loading only happens once per session - much faster than individual API calls
- Error handling is built-in - app keeps working even if context fails to load
- All data is typed - you get full TypeScript intellisense

The pattern is simple and consistent across all components!
