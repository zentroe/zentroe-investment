import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveIdentityInfo } from "@/services/onboardingService";
import { toast } from "sonner";

export default function MorePersonalInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    socialSecurityNumber: "",
    dateOfBirth: ""
  });
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData, updateStatus } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.socialSecurityNumber) {
      setFormData(prev => ({
        ...prev,
        socialSecurityNumber: data.socialSecurityNumber || ""
      }));
    }
    if (data.dateOfBirth) {
      // Convert date to YYYY-MM-DD format for input
      const date = new Date(data.dateOfBirth);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: formattedDate
      }));
    }
  }, [data.socialSecurityNumber, data.dateOfBirth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format SSN with dashes
    if (name === 'socialSecurityNumber') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateAge = (dateOfBirth: string): boolean => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate())) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.socialSecurityNumber.trim() || !formData.dateOfBirth) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate SSN format (basic check)
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnPattern.test(formData.socialSecurityNumber)) {
      toast.error("Please enter a valid Social Security Number (XXX-XX-XXXX)");
      return;
    }

    // Validate age
    if (!validateAge(formData.dateOfBirth)) {
      toast.error("You must be at least 18 years old to register");
      return;
    }

    setLoading(true);

    try {
      await saveIdentityInfo(formData.socialSecurityNumber, formData.dateOfBirth);

      // Update local context data for immediate UI feedback
      updateLocalData({
        socialSecurityNumber: formData.socialSecurityNumber,
        dateOfBirth: formData.dateOfBirth
      });

      // Update onboarding status to 'basicInfo' since personal details are complete
      await updateStatus("basicInfo");

      toast.success("Identity information saved.");
      navigate("/invest/intro");
    } catch (error) {
      console.error("Error saving identity information:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Identity Information | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2 leading-snug">
          Final identity verification
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          We need this information to verify your identity and comply with federal regulations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Social Security Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Security Number *
            </label>
            <Input
              type="text"
              name="socialSecurityNumber"
              value={formData.socialSecurityNumber}
              onChange={handleInputChange}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className="w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your SSN is encrypted and stored securely
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              You must be at least 18 years old to invest
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Security Notice
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your personal information is protected with bank-level encryption and is only used for identity verification and regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="text-white text-sm bg-primary hover:bg-[#8c391e] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Personal Information"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}
