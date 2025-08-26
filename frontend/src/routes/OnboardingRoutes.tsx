import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import OnboardingLayout from '@/components/OnboardingLayout';
import EmailSetup from '@/pages/onboarding/EmailSetup';
import PasswordSetup from '@/pages/onboarding/PasswordSetup';
import InvestmentProfile from '@/pages/onboarding/InvestmentProfile';
import PersonalInfo from '@/pages/onboarding/PersonalDetailsIntro';
import AccountSetup from '@/pages/onboarding/AccountType';
import Success from '@/pages/onboarding/Success';

// Route guard to check onboarding state
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { onboarding } = useOnboarding();

  if (!onboarding.email) {
    return <Navigate to="/onboarding/email" replace />;
  }

  return <>{children}</>;
};

export default function OnboardingRoutes() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/onboarding" element={<OnboardingLayout><Outlet /></OnboardingLayout>}>
          <Route index element={<Navigate to="email" replace />} />
          <Route path="email" element={<EmailSetup />} />

          <Route element={<OnboardingGuard><Outlet /></OnboardingGuard>}>
            <Route path="password" element={<PasswordSetup />} />
            <Route path="investment-profile" element={<InvestmentProfile />} />
            <Route path="personal-info" element={<PersonalInfo />} />
            <Route path="account-setup" element={<AccountSetup />} />
            <Route path="success" element={<Success />} />
          </Route>
        </Route>
      </Routes>
    </OnboardingProvider>
  );
}
