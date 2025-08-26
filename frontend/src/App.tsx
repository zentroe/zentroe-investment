// src/App.tsx
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <AppRoutes />
    </>
  );
}

export default App;
