import { ReactNode } from "react";
import { LoginNavbar } from "../../components/layout/Navbar";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4">
      <LoginNavbar />
      <main>{children}</main>
    </div>
  );
}
