// src/App.tsx
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "sonner";
import { OnboardingProvider } from "@/context/OnboardingContext";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <OnboardingProvider>
        <AppRoutes />
      </OnboardingProvider>
    </>
  );
}

export default App;
