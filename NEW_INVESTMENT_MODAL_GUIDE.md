# New Investment Modal - Portfolio Page Feature

## Overview
A comprehensive multi-stage modal that allows users to create new investments directly from their Portfolio page. This replaces the need to navigate through separate pages and consolidates the entire investment flow into one seamless experience.

## Location
- **Component**: `frontend/src/components/modals/NewInvestmentModal.tsx`
- **Integration**: `frontend/src/pages/dashboard/PortfolioPage.tsx`

## Features

### 4-Stage Investment Flow

#### Stage 1: Select Investment Plan
- **Display**: Shows all available investment plans in a scrollable list
- **UI**: Similar to `OtherPlans.tsx` component
- **Information Shown**:
  - Plan name
  - Description
  - Profit percentage (badge)
  - Duration in days (badge)
  - Minimum investment amount
  - Maximum investment amount (if applicable)
- **Interaction**: Click any plan to proceed to amount entry

#### Stage 2: Enter Investment Amount
- **Display**: Amount input with investment summary
- **Validation**:
  - Must meet minimum investment requirement
  - Must not exceed maximum investment (if set)
  - Real-time calculation of expected profits
- **Information Shown**:
  - Selected plan details (name, return %, duration)
  - Investment amount input
  - Expected profit calculation
  - Investment terms reminder
- **Backend Call**: `saveInitialInvestmentAmount()` - saves amount to user profile
- **Navigation**: Back to plan selection or Continue to payment

#### Stage 3: Payment
- **Payment Methods Supported**:
  1. **Card Payment** - Integrated SimpleCardPaymentForm
  2. **Cryptocurrency** - Shows wallet address, requires proof upload
  3. **Bank Transfer** - Shows bank details, requires proof upload

- **Cryptocurrency Flow**:
  - Display selected crypto wallet address
  - Network information (if available)
  - Copy-to-clipboard functionality
  - Screenshot upload for transaction proof
  - Manual confirmation submission

- **Bank Transfer Flow**:
  - Display bank account details
  - Account holder name, number, routing, etc.
  - Screenshot upload for payment proof
  - Manual confirmation submission

- **Card Payment Flow**:
  - Uses existing `SimpleCardPaymentForm` component
  - Automatic payment processing
  - Real-time validation

- **Backend Calls**:
  - `getPaymentOptions()` - Fetch available payment methods
  - `submitCryptoPayment()` - Submit crypto payment with proof
  - `submitBankTransferPayment()` - Submit bank transfer with proof
  - Card payment handled by SimpleCardPaymentForm

#### Stage 4: Success
- **Display**: Success confirmation with receipt
- **Information Shown**:
  - Receipt ID/Payment ID
  - Investment plan name
  - Amount invested
  - Expected return percentage
  - Duration
  - Next steps information
- **Actions Available**:
  - Download Receipt (opens print dialog with formatted receipt)
  - Go to Portfolio (closes modal and refreshes data)

## Technical Implementation

### State Management
```typescript
- stage: 'select-plan' | 'enter-amount' | 'payment' | 'success'
- selectedPlan: InvestmentPlan | null
- amount: string
- selectedMethod: 'crypto' | 'bank' | 'card' | null
- paymentOptions: PaymentOptions
- transactionScreenshot: base64 string
```

### API Integration
Uses existing services:
- `onboardingService.ts` - `getInvestmentPlans()`
- `investmentService.ts` - `saveInitialInvestmentAmount()`
- `paymentService.ts` - Payment-related calls
- `SimpleCardPaymentForm` - Card payment component

### User Experience
- **Progressive Disclosure**: Only shows relevant information at each stage
- **Real-time Feedback**: Loading states, error messages, success confirmations
- **Easy Navigation**: Back buttons at each stage (except success)
- **Data Persistence**: Amount is saved to database before payment stage
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Keyboard navigation, screen reader friendly

## Button Placements

### Portfolio Page Header
```tsx
<Button onClick={() => setShowNewInvestmentModal(true)}>
  <Plus /> New Investment
</Button>
```

### Empty State (No Investments)
```tsx
<Button onClick={() => setShowNewInvestmentModal(true)}>
  <Plus /> Start Investing
</Button>
```

## Receipt Generation

The modal includes a comprehensive receipt download feature:
- Opens in new window for printing/saving as PDF
- Includes all investment details
- Professional formatting
- Company branding
- Timestamp and receipt ID

## Data Flow

1. **User clicks "New Investment"**
   → Modal opens, fetches investment plans

2. **User selects plan**
   → Shows plan details, amount input

3. **User enters amount**
   → Saves to database via API
   → Proceeds to payment

4. **User completes payment**
   → Card: Automatic processing
   → Crypto/Bank: Manual confirmation with proof upload
   → Payment record created in database

5. **Success stage**
   → Shows confirmation
   → Allows receipt download
   → Closes modal and refreshes portfolio data

## Backend Requirements

### Existing Endpoints Used:
- `GET /onboarding/investment-plans` - Fetch plans
- `PATCH /investment/initial-amount` - Save amount
- `GET /payments/options` - Get payment config
- `POST /payments/crypto` - Submit crypto payment
- `POST /payments/bank-transfer` - Submit bank transfer
- `POST /payments/card/simple` - Card payment (via SimpleCardPaymentForm)

### Database Updates:
1. User's `initialInvestmentAmount` updated
2. Deposit record created with pending status
3. Payment proof stored (crypto/bank transfers)
4. Admin can verify and activate investment from admin panel

## Future Enhancements

Potential improvements:
- [ ] Add plan comparison feature
- [ ] Show historical performance charts per plan
- [ ] Add investment calculator with projections
- [ ] Support multiple payment methods in one transaction
- [ ] Add recurring investment setup option
- [ ] Enable plan switching for existing investments
- [ ] Add social proof (number of investors per plan)
- [ ] Include risk assessment warnings

## Testing Checklist

- [ ] Modal opens correctly from both buttons
- [ ] All investment plans load and display properly
- [ ] Amount validation works (min/max constraints)
- [ ] Payment options load based on admin configuration
- [ ] Card payment processes successfully
- [ ] Crypto payment accepts proof upload
- [ ] Bank transfer accepts proof upload
- [ ] Success stage shows correct information
- [ ] Receipt download works
- [ ] Modal closes and refreshes portfolio data
- [ ] Error states display appropriately
- [ ] Loading states work correctly
- [ ] Back navigation works at each stage
- [ ] Responsive design works on mobile
- [ ] Modal can be closed at any stage (with confirmation if needed)

## Notes

- The modal is fully self-contained with its own state management
- Reuses existing payment components and services
- Follows the same payment flow as the original onboarding payment page
- All payments require admin verification before investment activation
- Users receive email notifications at each stage (handled by backend)
