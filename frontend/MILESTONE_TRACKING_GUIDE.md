# Onboarding Status Milestone System

## ✅ **Implementation Complete**

### Backend (Controller + Route)
- ✅ `updateOnboardingStatus` controller with validation  
- ✅ `PATCH /api/onboarding/status` route with authentication
- ✅ Validates status against allowed values

### Frontend (Service + Context)  
- ✅ `updateOnboardingStatus` service function
- ✅ `updateStatus` method in OnboardingContext
- ✅ Optimistic local updates with error handling

---

## 🎯 **Milestone Status Values**

```typescript
'started'           // User begins onboarding
'basicInfo'         // Account type + personal info complete  
'investmentProfile' // Investment preferences complete
'verification'      // Identity verification complete
'bankConnected'     // Bank account linked  
'completed'         // Full onboarding finished
```

---

## 🚀 **How to Use in Components**

### 1. **Import the Hook**
```typescript
import { useOnboarding } from '@/context/OnboardingContext';
```

### 2. **Use the updateStatus Method**
```typescript
const { updateStatus } = useOnboarding();

const handleCompleteStep = async () => {
  try {
    // Save your component data first
    await saveComponentData();
    
    // Then update milestone status
    await updateStatus('basicInfo'); // or whichever milestone
    
    toast.success("Progress saved");
    navigate("/next-step");
  } catch (error) {
    toast.error("Error saving progress");
  }
};
```

---

## 📍 **Recommended Milestone Placement**

### **'started'** - Set when user first lands on onboarding
```typescript
// In first onboarding component (AccountType)
useEffect(() => {
  updateStatus('started');
}, []);
```

### **'basicInfo'** - After account type + personal info
```typescript
// In LegalName component after successful save
await savePersonalInfo(firstName, lastName);
await updateStatus('basicInfo');
```

### **'investmentProfile'** - After investment preferences complete
```typescript
// In last investment preference component  
await saveRecommendedPortfolio(portfolio);
await updateStatus('investmentProfile');
```

### **'verification'** - After identity verification
```typescript
// In verification success component
await completeVerification();
await updateStatus('verification');
```

### **'bankConnected'** - After bank account linking
```typescript
// In bank connection success component
await linkBankAccount();
await updateStatus('bankConnected');
```

### **'completed'** - After final investment/payment
```typescript
// In final success component
await processPayment();
await updateStatus('completed');
```

---

## 🔄 **Smart Routing Based on Status**

You can use the current `onboardingStatus` to redirect users to the right step:

```typescript
const { data } = useOnboarding();

useEffect(() => {
  if (!data.loading) {
    switch (data.onboardingStatus) {
      case 'started':
        navigate('/onboarding/account-type');
        break;
      case 'basicInfo':
        navigate('/onboarding/investment-profile');
        break;
      case 'investmentProfile':
        navigate('/onboarding/verification');
        break;
      case 'verification':
        navigate('/onboarding/bank-connect');
        break;
      case 'bankConnected':
        navigate('/onboarding/final-investment');
        break;
      case 'completed':
        navigate('/dashboard');
        break;
      default:
        navigate('/onboarding/account-type');
    }
  }
}, [data.onboardingStatus, data.loading]);
```

---

## ⚡ **Benefits**

1. **Progress Tracking**: Know exactly where users left off
2. **Smart Resumption**: Direct users to correct step when they return
3. **Analytics Ready**: Track conversion at each milestone  
4. **Error Recovery**: Users can restart from last successful milestone
5. **Admin Visibility**: See where users typically drop off

---

## 💡 **Pro Tips**

- **Call `updateStatus` AFTER successful data saves**, not before
- **Don't block navigation** if status update fails - it's supplementary
- **Use status for routing logic** in a main onboarding wrapper component
- **Consider progress bars** showing completion based on status
- **Track analytics** at each milestone for optimization

The milestone system is now ready to track user progress intelligently! 🎉
