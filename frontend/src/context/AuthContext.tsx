import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, logout as logoutService } from "@/services/auth";
import { toast } from "sonner";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  onboardingStatus?: string;
  onboardingStep?: number;
  isEmailVerified: boolean;
  walletBalance: number;
  paymentReferenceId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Inactivity timeout configuration (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear user anyway
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        // User not authenticated or session expired
        console.log("User not authenticated:", error.response?.status);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimers = () => {
      // Clear existing timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);

      // Show warning before auto-logout
      warningTimer = setTimeout(() => {
        toast.warning("You will be logged out in 2 minutes due to inactivity", {
          duration: 5000,
        });
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Auto-logout after inactivity
      inactivityTimer = setTimeout(async () => {
        toast.info("You have been logged out due to inactivity");
        await logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Reset timer on any user activity
    events.forEach(event => {
      window.addEventListener(event, resetTimers);
    });

    // Start the initial timer
    resetTimers();

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
