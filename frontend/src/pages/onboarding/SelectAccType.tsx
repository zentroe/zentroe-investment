import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle } from "lucide-react";
import { saveAccountSubType } from "@/services/onboardingService";
import { getCurrentUser } from "@/services/auth";
import { toast } from "sonner";

export default function SelectAccType() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"individual" | "other" | "">("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  const options = [
    { id: "individual", label: "Individual account" },
    { id: "other", label: "Other account type" },
  ];

  // Fetch user data to check account type and validate navigation
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser();
        setUserData(response.user);

        // Fallback if user skipped previous step
        if (!response.user?.accountType) {
          navigate("/onboarding/account-type");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleContinue = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      await saveAccountSubType(selected);
      toast.success("Account type saved.");
      navigate("/onboarding/personal-info");
    } catch (error) {
      console.error("Error saving account subtype:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <OnboardingLayout>
        <div className="mt-24 px-4 max-w-xl mx-auto flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  // Dynamic label
  const accountTypeLabel = userData?.accountType === "retirement"
    ? "retirement"
    : "general";

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Select Account Type | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-8 leading-snug">
          What type of {accountTypeLabel} account would you like to open?
        </h1>

        <div className="border divide-y rounded-md overflow-hidden">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id as "individual" | "other")}
              className={`w-full cursor-pointer px-4 py-8 flex items-center justify-between text-left hover:bg-gray-50 transition ${selected === option.id ? "bg-gray-50" : ""
                }`}
            >
              <span className="text-darkPrimary">{option.label}</span>
              {selected === option.id ? (
                <CheckCircle className="text-primary" size={20} />
              ) : (
                <Circle className="text-gray-400" size={20} />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            disabled={!selected || loading}
            onClick={handleContinue}
            className="text-white text-sm bg-primary hover:bg-[#8c391e] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
