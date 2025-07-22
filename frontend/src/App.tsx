// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (

    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <AppRoutes />
    </BrowserRouter>


  );
}

export default App;
