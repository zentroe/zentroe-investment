# Recurring Investment Setup Analysis & Implementation Plan

## Current Implementation Analysis

### RecurringInvestment.tsx (Onboarding Flow)
**Location:** `frontend/src/pages/onboarding/RecurringInvestment.tsx`

**Features:**
1. **Frequency Selection**: Once a month, Twice a month, Weekly, Every other week
2. **Investment Day Selection**: Dynamic options based on frequency
3. **Amount Options**: 
   - 4 preset amounts calculated from user's annual investment amount
   - Custom amount input field
4. **Smart Calculations**: 
   - Uses `getMidpointFromRange()` to estimate from annual investment amount
   - Generates preset amounts based on frequency periods
5. **Two Actions**:
   - **"I'll do this later"**: Skips setup, sets `recurringInvestment: false`
   - **"Complete Setup"**: Saves recurring settings and navigates to payment

**API Integration:**
```typescript
await saveRecurringInvestmentSettings({
  recurringInvestment: true/false,
  recurringFrequency: "monthly" | "weekly",
  recurringDay: string,
  recurringAmount: number
});
```

---

### RecurringPage.tsx (Dashboard)
**Location:** `frontend/src/pages/dashboard/RecurringPage.tsx`

**Current State:**
1. **Display Logic**:
   - Shows active recurring plan if `user.recurringInvestment === true`
   - Shows "Setup Required" status for investments WITHOUT recurring enabled
   - Shows empty state with "Set Up Recurring Investment" button

2. **Features**:
   - Summary cards (Monthly Investment, Next Investment, Status)
   - List of recurring investments with:
     - Plan name, amount, frequency, next date
     - Active/Paused/Setup Required status
     - Play/Pause toggle
     - Edit button (not functional yet)
   
3. **Empty State**: 
   - Displays when no recurring investments exist
   - Has "Set Up Recurring Investment" button (not functional)

4. **Limitations**:
   - No modal or form to set up recurring investment
   - Edit button doesn't open edit form
   - "Set Up Recurring Investment" button doesn't do anything
   - Can't modify existing recurring settings

---

## Implementation Plan for Dashboard Setup

### Option 1: Modal-Based Approach (Recommended)
Create a modal similar to NewInvestmentModal that opens when:
- User clicks "Set Up Recurring Investment" button
- User clicks "Edit" button on existing recurring plan
- User clicks "Setup Required" plan

**Benefits:**
✅ Consistent with existing UI patterns (NewInvestmentModal)
✅ Doesn't navigate away from dashboard
✅ Can reuse RecurringInvestment logic
✅ Better UX for quick edits

---

### Option 2: Navigate to RecurringInvestment Page
Modify RecurringInvestment.tsx to work in two contexts:
- Onboarding flow (current behavior)
- Dashboard setup (navigate from RecurringPage)

**Benefits:**
✅ Reuses existing complete implementation
✅ No duplication of logic
✅ Familiar interface for users

**Drawbacks:**
❌ Navigation disrupts dashboard flow
❌ Need to handle different return paths

---

## Recommended Implementation: Modal Approach

### Files to Create/Modify:

#### 1. Create: `SetupRecurringModal.tsx`
```typescript
// frontend/src/components/modals/SetupRecurringModal.tsx

interface SetupRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingSettings?: {
    frequency: string;
    day: string;
    amount: number;
  };
  mode: 'create' | 'edit';
}
```

**Features:**
- Reuse frequency options, day selection, amount presets from RecurringInvestment
- Fetch user's annual investment amount for calculations
- Call `saveRecurringInvestmentSettings()` on submit
- Call `refreshData()` after successful save
- Show loading state during save
- Display success toast

#### 2. Modify: `RecurringPage.tsx`
**Changes:**
- Add state for modal: `const [showSetupModal, setShowSetupModal] = useState(false)`
- Add mode state: `const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')`
- Add existing settings state for edit mode
- Wire up "Set Up Recurring Investment" button → Opens modal
- Wire up "Edit" button → Opens modal with existing data
- Wire up "Setup Required" status → Opens modal
- Add modal component with proper props
- Call `refreshData()` on success to refresh dashboard

#### 3. Extract Shared Logic
Create utility functions:
```typescript
// frontend/src/utils/recurringInvestmentHelpers.ts

export const frequencyOptions = [...];
export const investmentDaysMap = {...};
export const frequencyMap = {...};
export function getMidpointFromRange(range: string): number {...}
export function generatePresetAmounts(annualAmount: string, frequency: string): number[] {...}
export function mapFrequencyToBackend(displayFrequency: string): string {...}
```

---

## Implementation Steps

### Step 1: Extract Shared Utilities
Move reusable functions from RecurringInvestment.tsx to a shared utils file.

### Step 2: Create SetupRecurringModal Component
Build modal with same UI as RecurringInvestment but as a modal dialog.

### Step 3: Integrate Modal into RecurringPage
- Import and add modal component
- Add state management for modal
- Wire up all trigger buttons
- Handle success callbacks with refreshData()

### Step 4: Add Context Refresh
Ensure `refreshData()` is called after:
- Creating new recurring setup
- Editing existing recurring setup
- Pausing/resuming recurring plan

### Step 5: Handle Edit Mode
Pre-populate modal fields when editing:
- Frequency → Pre-select correct option
- Day → Pre-select correct day
- Amount → Show as custom amount if not matching presets

---

## User Flow After Implementation

### Flow 1: User Skipped During Onboarding
```
Dashboard → Recurring Tab
  ↓
Empty state or "Setup Required" status
  ↓
Click "Set Up Recurring Investment"
  ↓
Modal opens with frequency/day/amount options
  ↓
User fills form and clicks "Complete Setup"
  ↓
API call → Save settings
  ↓
refreshData() → Update context
  ↓
Modal closes → Dashboard shows active recurring plan
  ↓
Success toast: "Recurring investment activated!"
```

### Flow 2: User Wants to Edit Existing
```
Dashboard → Recurring Tab
  ↓
See active recurring plan
  ↓
Click "Edit" button
  ↓
Modal opens with pre-filled current settings
  ↓
User modifies and clicks "Save Changes"
  ↓
API call → Update settings
  ↓
refreshData() → Update context
  ↓
Modal closes → Dashboard shows updated plan
  ↓
Success toast: "Recurring investment updated!"
```

### Flow 3: Pause/Resume
```
Dashboard → Recurring Tab
  ↓
Click pause/play button
  ↓
API call → Update status
  ↓
refreshData() → Update context
  ↓
Dashboard reflects new status
  ↓
Success toast: "Recurring investment paused/resumed"
```

---

## API Endpoints Needed

### Already Exists:
✅ `saveRecurringInvestmentSettings()` in `investmentService.ts`

### May Need to Add:
- `updateRecurringInvestmentStatus()` - For pause/resume
- `getRecurringInvestmentSettings()` - To fetch current settings for edit

---

## UI/UX Considerations

### Modal Design:
- Title: "Set Up Recurring Investment" or "Edit Recurring Investment"
- Three sections: Frequency, Investment Days, Amount
- Footer: Cancel + Primary action button
- Loading state on save
- Error handling with toast notifications

### Empty State:
- Icon: Calendar or Repeat icon
- Headline: "Automate Your Investment Strategy"
- Description: "Set up recurring investments to build wealth consistently"
- CTA Button: "Set Up Recurring Investment"

### Setup Required State:
- Yellow badge: "Setup Required"
- Add CTA: "Complete Setup" button next to Edit

---

## Testing Checklist

After implementation:
- [ ] User with `recurringInvestment: false` sees empty state
- [ ] Clicking "Set Up" button opens modal
- [ ] Modal calculates correct preset amounts
- [ ] Frequency changes update investment days
- [ ] Custom amount input works correctly
- [ ] Saving creates recurring investment successfully
- [ ] `refreshData()` updates dashboard immediately
- [ ] Success toast displays
- [ ] Edit button opens modal with pre-filled data
- [ ] Editing saves and updates correctly
- [ ] Pause/Resume toggle works
- [ ] Console logs show proper data flow
- [ ] No need to manually refresh page

---

## Code Structure

```
frontend/src/
├── utils/
│   └── recurringInvestmentHelpers.ts (NEW - shared logic)
├── components/
│   └── modals/
│       └── SetupRecurringModal.tsx (NEW - modal component)
├── pages/
│   ├── onboarding/
│   │   └── RecurringInvestment.tsx (MODIFY - use shared utils)
│   └── dashboard/
│       └── RecurringPage.tsx (MODIFY - add modal integration)
└── services/
    └── investmentService.ts (CHECK - verify endpoints exist)
```

---

## Next Steps

Would you like me to:
1. **Create the shared utilities file** with extracted logic?
2. **Build the SetupRecurringModal component**?
3. **Integrate the modal into RecurringPage**?
4. **All of the above in sequence**?

Let me know which approach you prefer (Modal vs Navigation), and I'll implement it!
