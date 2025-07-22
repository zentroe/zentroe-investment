// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import EmailSetup from "@/pages/onboarding/EmailSetup";
import PasswordSetup from "@/pages/onboarding/PasswordSetup";
import Login from "@/pages/auth/Login";
import Success from "@/pages/onboarding/Success";
import AccountType from "@/pages/onboarding/AccountType";
import Intro from "@/pages/onboarding/Intro";
import MostImportant from "@/pages/onboarding/MostImportant";
import PrimaryGoal from "@/pages/onboarding/PrimaryGoal";
import AnnualIncome from "@/pages/onboarding/AnnualIncome";
import AmountChoice from "@/pages/onboarding/AmountChoice";
import HowDidYouHear from "@/pages/onboarding/HowDidYouHear";
import GeneratingRecommend from "@/pages/onboarding/GeneratingRecommend";
import InvestmentRecommend from "@/pages/onboarding/InvestmentRecommend";
import PersonalDetailsIntro from "@/pages/onboarding/PersonalDetailsIntro";
import SelectAccType from "@/pages/onboarding/SelectAccType";
import LegalName from "@/pages/onboarding/LegalName";
import FinishUpAndInvest from "@/pages/onboarding/FinishUpAndInvest";
import InvestmentAmount from "@/pages/onboarding/InvestmentAmount";
import RecurringInvestment from "@/pages/onboarding/RecurringInvestment";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import PortfolioPage from "@/pages/dashboard/PortfolioPage";
import EarningsPage from "@/pages/dashboard/EarningsPage";
import RecurringPage from "@/pages/dashboard/RecurringPage";
import ReferralsPage from "@/pages/dashboard/ReferralsPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import LandingPage from "@/pages/landing/LandingPage";
import RealEstatePage from "@/pages/real-estate/RealEstatePage";
import AgriculturePage from "@/pages/agriculture/AgriculturePage";
import PrivateCreditPage from "@/pages/private-credit/PrivateCreditPage";
import VenturePage from "@/pages/venture/VenturePage";
import AboutPage from "@/pages/about/AboutPage";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/real-estate" element={<RealEstatePage />} />
      <Route path="/agriculture" element={<AgriculturePage />} />
      <Route path="/private-credit" element={<PrivateCreditPage />} />
      <Route path="/venture" element={<VenturePage />} />

      <Route path="/about" element={<AboutPage />} />

      <Route path="/onboarding/email" element={<EmailSetup />} />

      <Route path="/onboarding/password" element={<PasswordSetup />} />
      <Route path="/onboarding/success" element={<Success />} />
      <Route path="/onboarding/account-type" element={<AccountType />} />
      <Route path="/onboarding/intro" element={<Intro />} />
      <Route path="/onboarding/most-important" element={<MostImportant />} />
      <Route path="/onboarding/motivation" element={<PrimaryGoal />} />
      <Route path="/onboarding/income" element={<AnnualIncome />} />
      <Route path="/onboarding/satisfied-amount" element={<AmountChoice />} />
      <Route path="/onboarding/hdyh" element={<HowDidYouHear />} />
      <Route path="/onboarding/processing" element={<GeneratingRecommend />} />
      <Route path="/onboarding/investment-recommendation" element={<InvestmentRecommend />} />
      <Route path="/onboarding/personal-intro" element={<PersonalDetailsIntro />} />
      <Route path="/onboarding/select-account-form" element={<SelectAccType />} />
      <Route path="/onboarding/personal-info" element={<LegalName />} />

      <Route path="/invest/intro" element={<FinishUpAndInvest />} />
      <Route path="/invest/payment-amount" element={<InvestmentAmount />} />
      <Route path="/invest/auto-invest" element={<RecurringInvestment />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="recurring" element={<RecurringPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>


      <Route path="/auth/login" element={<Login />} />
    </Routes>
  );
}
