import { ReactNode } from "react";
import Navbar from "../../components/layout/Navbar";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function OnboardingLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white px-4">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
