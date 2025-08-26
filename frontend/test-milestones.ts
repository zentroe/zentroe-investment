#!/usr/bin/env ts-node

// Test script for onboarding milestone system
import { calculateProgress, ONBOARDING_MILESTONES } from './src/utils/onboardingMilestones';

console.log('🧪 Testing Onboarding Milestone System\n');

// Test Case 1: Brand new user
console.log('📋 Test Case 1: Brand new user');
const newUser = { email: 'test@example.com' };
const newUserProgress = calculateProgress(newUser);
console.log('Progress:', newUserProgress);
console.log(`Next milestone: ${newUserProgress.nextMilestone?.name}\n`);

// Test Case 2: User who completed account setup
console.log('📋 Test Case 2: User with account setup complete');
const accountSetupUser = {
  email: 'test@example.com',
  password: 'hashedpassword123'
};
const accountProgress = calculateProgress(accountSetupUser);
console.log('Progress:', accountProgress);
console.log(`Current milestone: ${accountProgress.currentMilestone?.name}\n`);

// Test Case 3: User in middle of investment profile
console.log('📋 Test Case 3: User in investment profile phase');
const profileUser = {
  email: 'test@example.com',
  password: 'hashedpassword123',
  hasSeenIntro: true,
  investmentPriority: 'growth',
  investmentGoal: 'diversification'
};
const profileProgress = calculateProgress(profileUser);
console.log('Progress:', profileProgress);
console.log(`Current phase: ${profileProgress.phase}`);
console.log(`Progress percentage: ${profileProgress.progressPercentage}%\n`);

// Test Case 4: Nearly completed user
console.log('📋 Test Case 4: Nearly completed user');
const nearCompleteUser = {
  email: 'test@example.com',
  password: 'hashedpassword123',
  hasSeenIntro: true,
  investmentPriority: 'growth',
  investmentGoal: 'diversification',
  annualIncome: '100000-200000',
  annualInvestmentAmount: '10000-25000',
  referralSource: 'google',
  recommendedPortfolio: { allocation: 'moderate' },
  hasSeenPersonalIntro: true,
  accountType: 'general',
  firstName: 'John',
  lastName: 'Doe',
  hasSeenInvestIntro: true,
  initialInvestmentAmount: 5000,
  recurringInvestment: { enabled: true }
};
const nearCompleteProgress = calculateProgress(nearCompleteUser);
console.log('Progress:', nearCompleteProgress);
console.log(`Progress percentage: ${nearCompleteProgress.progressPercentage}%\n`);

// Show all milestones
console.log('📋 All Onboarding Milestones:');
ONBOARDING_MILESTONES.forEach((milestone, index) => {
  console.log(`${index + 1}. ${milestone.name} (${milestone.id}) - Step ${milestone.step}`);
  console.log(`   Route: ${milestone.route}`);
  console.log(`   Required: ${milestone.requiredFields.join(', ')}\n`);
});

console.log('✅ Milestone system test completed!');
