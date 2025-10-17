# Admin User Management & Activity Generator - Complete Guide

## Overview
This feature allows administrators to comprehensively manage users and generate realistic activity history for demo purposes. The system creates real database records across all relevant collections, not just activity logs.

## Features Implemented

### 1. **Complete User Editing**
Admin can edit ALL user fields including:
- **Personal Info**: Name, email, phone, DOB, SSN, citizenship
- **Address**: Full address details
- **Investment Profile**: Income, experience, goals, risk tolerance
- **Account Settings**: Balance, role, status, notifications
- **KYC & Compliance**: Status, verification dates, notes
- **Referral System**: Code, stats, tier, earnings

### 2. **Realistic Activity Generation**
Generates 1-5 years of realistic user activity with configurable year selection.

### 3. **Real Database Records**
The activity generator creates REAL records in these collections:
- ✅ **Deposits** → `Deposit` collection
- ✅ **Investments** → `UserInvestment` collection  
- ✅ **Returns/Profits** → `DailyProfit` collection
- ✅ **Withdrawals** → `Withdrawal` collection
- ✅ **Referrals** → `Referral` collection
- ✅ **Activity History** → `ActivityHistory` collection

### 4. **Activity Management**
- View complete activity history with filters
- Edit individual activities
- Create new manual activities
- Delete specific activities
- Bulk delete all generated activities

---

## Backend Implementation

### Models

#### ActivityHistory Model
Location: `server/src/models/ActivityHistory.ts`

Tracks all user activities with 10 types:
- `deposit`, `withdrawal`, `investment`, `return`, `dividend`
- `referral`, `kyc_update`, `login`, `portfolio_change`, `bonus`

Key fields:
```typescript
{
  userId: ObjectId,
  activityType: string,
  date: Date,
  amount: number,
  description: string,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  transactionId: string,
  isGenerated: boolean,  // Marks auto-generated activities
  generatedAt: Date,
  // Type-specific fields...
}
```

### Services

#### Activity Generator Service
Location: `server/src/services/activityGenerator.ts`

**What It Does:**
Generates realistic multi-year user activity history with REAL database records.

**Records Created Per Year (Approximate):**
- **10 Deposits**: $500 - $10,000 each via bank/crypto/card
- **4 Investments**: $1,000 - $8,000 in real investment plans
- **12 Monthly Returns**: Based on actual investment performance
- **3 Withdrawals**: $500 - $5,000 profit withdrawals
- **2 Referrals**: $50 - $200 bonus each
- **50 Logins**: Distributed throughout the year
- **1 KYC Milestone**: Approved 7 days after start
- **2 Portfolio Changes**: Rebalancing events

**Database Records Created:**

1. **Deposits** (Deposit Collection)
   ```typescript
   {
     userId, amount, paymentMethod,
     status: 'approved',
     processedAt: <randomDate>,
     adminNotes: 'Auto-generated demo data'
   }
   ```

2. **Investments** (UserInvestment Collection)
   ```typescript
   {
     user, investmentPlan, amount,
     status: 'active',
     startDate, endDate,
     dailyProfitRate: <calculated from plan>,
     totalProfitsEarned: 0
   }
   ```

3. **Daily Profits** (DailyProfit Collection)
   ```typescript
   {
     userInvestment, user, date,
     profitAmount: <calculated>,
     dailyRate, investmentAmount,
     status: 'paid'
   }
   ```

4. **Withdrawals** (Withdrawal Collection)
   ```typescript
   {
     user, userInvestment, amount,
     type: 'profits_only',
     status: 'completed',
     paymentMethod: 'bank_transfer',
     principalAmount: 0,
     profitAmount: <amount>
   }
   ```

5. **Referrals** (Referral Collection)
   ```typescript
   {
     referrer: <userId>,
     referralCode,
     status: 'rewarded',
     pointsEarned, qualifyingInvestment,
     signupDate, qualificationDate, rewardDate
   }
   ```

6. **Activity History** (ActivityHistory Collection)
   - All activities logged with `isGenerated: true` flag

**User Updates:**
Updates user document with calculated totals:
```typescript
{
  walletBalance: <calculated net balance>,
  totalInvested: <sum of investments>,
  totalDeposited: <sum of deposits>,
  totalWithdrawn: <sum of withdrawals>,
  'referralStats.totalEarnings': <sum of referral bonuses>,
  'referralStats.totalReferrals': <count>
}
```

### Controllers

#### Admin User Controller
Location: `server/src/controllers/adminUserController.ts`

**Endpoints:**

1. **GET /api/admin/users/:userId**
   - Get complete user details

2. **PUT /api/admin/users/:userId**
   - Update all user fields
   - Supports partial updates

3. **POST /api/admin/users/:userId/generate-activity**
   - Generate realistic activity history
   - Body: `{ years: 1-5 }`
   - Creates real DB records

4. **GET /api/admin/users/:userId/activity**
   - Get user's activity history
   - Supports filtering and pagination

5. **POST /api/admin/users/:userId/activity**
   - Create new manual activity
   - Creates corresponding DB records

6. **PUT /api/admin/activity/:activityId**
   - Update existing activity

7. **DELETE /api/admin/activity/:activityId**
   - Delete specific activity

8. **DELETE /api/admin/users/:userId/generated-activities**
   - Bulk delete all auto-generated activities

### Routes
Location: `server/src/routes/adminUserRoutes.ts`

All routes protected with `adminAuth` middleware.

---

## Frontend Implementation

### Components

#### 1. EditUserModal
Location: `frontend/src/components/admin/EditUserModal.tsx`

**6 Tab Interface:**
- **Personal**: Name, email, phone, DOB, SSN, citizenship
- **Address**: Street, city, state, ZIP, country  
- **Investment**: Income, amounts, experience, goals, risk
- **Account**: Balance, role, status, notifications
- **KYC**: Status, dates, verification notes
- **Referral**: Code, stats, tier, earnings

#### 2. GenerateActivityModal  
Location: `frontend/src/components/admin/GenerateActivityModal.tsx`

**Features:**
- Select 1-5 years of history
- Visual preview of what will be generated
- Success summary with:
  - Total deposits, investments, returns, withdrawals
  - Referral count and login count
  - Net balance calculation

#### 3. UserActivityHistory
Location: `frontend/src/components/admin/UserActivityHistory.tsx`

**Features:**
- Activity type filtering (deposits, investments, etc.)
- Pagination (20 per page)
- Color-coded activity types with icons
- Edit/Delete individual activities
- Bulk delete generated activities
- Status badges and transaction IDs
- Generated activity highlighting

#### 4. EditActivityModal
Location: `frontend/src/components/admin/EditActivityModal.tsx`

**Editable Fields:**
- Activity type, date, description, amount
- Status, transaction ID
- Type-specific fields (payment method, investment plan, etc.)

#### 5. CreateActivityModal
Location: `frontend/src/components/admin/CreateActivityModal.tsx`

**Manual Activity Creation:**
- All activity types supported
- Dynamic form fields based on type
- Validation and error handling

### Services

#### Admin User Service
Location: `frontend/src/services/adminUserService.ts`

**API Integration:**
```typescript
- getAdminUserDetails(userId)
- updateAdminUserDetails(userId, data)
- generateUserActivity(userId, years)
- getUserActivity(userId, filters?)
- createActivity(userId, activityData)
- updateActivity(activityId, updates)
- deleteActivity(activityId)
- deleteGeneratedActivities(userId)
```

### Integration

#### AdminUsers Page
Location: `frontend/src/pages/admin/AdminUsers.tsx`

**New Action Buttons:**
- **Edit** (Purple): Opens EditUserModal
- **Generate** (Green): Opens GenerateActivityModal
- **History** (Indigo): Opens UserActivityHistory
- **View** (Blue): Existing detail view
- **Activate/Deactivate** (Red/Green): Toggle status

---

## Usage Guide

### Generating Demo Accounts

**Step 1: Select a User**
Navigate to Admin > Users and find the user you want to enhance.

**Step 2: Generate Activity**
Click the "Generate" button next to the user.

**Step 3: Choose Duration**
Select how many years of history (1-5 years):
- **1 Year**: ~10 deposits, 4 investments, 12 returns
- **3 Years**: ~30 deposits, 12 investments, 36 returns
- **5 Years**: ~50 deposits, 20 investments, 60 returns

**Step 4: Review Summary**
After generation, see:
- Total activities created
- Financial summary (deposits, investments, returns, withdrawals)
- Net balance
- Database records created

**Step 5: View & Edit History**
Click "History" to view all activities:
- Filter by type
- Edit specific transactions
- Add manual activities
- Delete if needed

### Editing User Details

**Click "Edit"** on any user to modify:
1. Personal information
2. Financial profile
3. Account settings
4. KYC status
5. Referral configuration

All changes save to the database immediately.

### Managing Activities

**View History:**
- Click "History" button
- Filter by activity type
- See all transactions chronologically

**Edit Activity:**
- Click edit icon on any activity
- Modify amount, date, status, or description
- Save changes

**Create Manual Activity:**
- Click "Add Activity" button
- Select type and fill in details
- Creates real DB record + activity log

**Delete Activities:**
- Individual: Click delete icon
- Bulk: "Delete All Generated" removes all auto-generated

---

## Database Impact

### What Gets Created

When you generate 3 years of activity for a user:

**Deposit Collection**: ~30 records
**UserInvestment Collection**: ~12 records
**DailyProfit Collection**: ~36 records (one per month per investment)
**Withdrawal Collection**: ~9 records  
**Referral Collection**: ~6 records
**ActivityHistory Collection**: ~200+ records (includes logins, KYC, etc.)

**Total**: ~300+ database records per user for 3 years

### Data Integrity

✅ All foreign keys reference correct collections
✅ Amounts calculate correctly (net balance accurate)
✅ Dates are chronologically distributed
✅ Transaction IDs are unique
✅ Status fields match real-world values
✅ User totals auto-update

---

## Benefits for Demo

### Realistic Accounts
- Multi-year investment history
- Consistent activity patterns
- Real transaction records
- Proper financial calculations

### Employer Presentation
- Show mature, active accounts
- Demonstrate full system functionality
- Prove data integrity across collections
- Display comprehensive reporting

### Editable Demo Data
- Adjust amounts for better visuals
- Modify dates for specific scenarios
- Create custom activities for demos
- Remove/regenerate as needed

---

## Technical Notes

### Performance
- Bulk inserts for efficiency
- Indexed fields for fast queries
- Pagination for large activity lists
- Optimized date calculations

### Safety
- `isGenerated` flag tracks auto-created records
- Bulk delete only removes generated activities
- Manual activities preserved
- Admin authentication required for all operations

### Extensibility
- Easy to add new activity types
- Configurable generation patterns
- Customizable date ranges
- Flexible filtering options

---

## Troubleshooting

### "No active investment plans available"
**Solution**: Create at least one active InvestmentPlan before generating activities.

### Generated activities not showing
**Solution**: Check the `isGenerated` flag in the database and verify filters.

### User balance incorrect after generation
**Solution**: Regenerate activities - the generator recalculates based on deposits, investments, and withdrawals.

### Cannot delete generated activities
**Solution**: Ensure you're using the "Delete All Generated" button, not individual delete for bulk operations.

---

## Future Enhancements

Potential additions:
- Export activity history to CSV/PDF
- Clone user profiles with activity
- Batch generate for multiple users
- Custom activity templates
- More granular date control
- Visual activity timeline
- Advanced analytics dashboard

---

## Summary

This comprehensive admin user management system provides:
✅ Full user profile editing (all fields)
✅ Realistic multi-year activity generation
✅ Real database records (not just logs)
✅ Complete activity history management
✅ Individual & bulk activity operations
✅ Perfect for creating demo accounts
✅ Production-ready data integrity

**Ready to use for employer demonstrations with realistic, mature user accounts!**
