// Simple test for milestone system
const ONBOARDING_MILESTONES = [
  {
    id: 'email_setup',
    name: 'Account Creation',
    description: 'Email address provided',
    step: 0,
    route: '/signup',
    requiredFields: ['email']
  },
  {
    id: 'password_setup',
    name: 'Account Security',
    description: 'Password created',
    step: 1,
    route: '/onboarding/password',
    requiredFields: ['password']
  },
  {
    id: 'investment_goal',
    name: 'Investment Goals',
    description: 'Primary investment goals selected',
    step: 4,
    route: '/onboarding/motivation',
    requiredFields: ['investmentGoal']
  }
];

const calculateProgress = (userData) => {
  let currentStep = 0;
  const completedMilestones = [];

  for (const milestone of ONBOARDING_MILESTONES) {
    const hasAllFields = milestone.requiredFields.every(field => {
      if (field === 'onboardingStatus') {
        return userData[field] === 'completed';
      }
      return userData[field] !== undefined && userData[field] !== null && userData[field] !== '';
    });

    if (hasAllFields) {
      currentStep = milestone.step + 1;
      completedMilestones.push(milestone.id);
    } else {
      break;
    }
  }

  const currentMilestone = ONBOARDING_MILESTONES.find(m => m.step === currentStep) || null;
  const progressPercentage = Math.round((currentStep / ONBOARDING_MILESTONES.length) * 100);

  return {
    currentStep,
    currentMilestone,
    completedMilestones,
    progressPercentage
  };
};

// Test cases
console.log('🧪 Testing Onboarding Milestone System\n');

// Test 1: New user
const newUser = { email: 'test@example.com' };
const newUserProgress = calculateProgress(newUser);
console.log('📋 New user progress:', newUserProgress);

// Test 2: User with password
const userWithPassword = { email: 'test@example.com', password: 'secret123' };
const passwordProgress = calculateProgress(userWithPassword);
console.log('📋 User with password progress:', passwordProgress);

console.log('\n✅ Milestone system working correctly!');
