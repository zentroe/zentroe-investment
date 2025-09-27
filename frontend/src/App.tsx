// src/App.tsx
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "sonner";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { UserProvider } from "@/context/UserContext";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <UserProvider>
        <OnboardingProvider>
          <AppRoutes />
        </OnboardingProvider>
      </UserProvider>
    </>
  );
}

export default App;
