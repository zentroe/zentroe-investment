import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveAddressInfo } from "@/services/onboardingService";
import { toast } from "sonner";

export default function OtherPersonalInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });
  const [confirmPhone, setConfirmPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.address) {
      setFormData({
        street: data.address.street || "",
        street2: data.address.street2 || "",
        city: data.address.city || "",
        state: data.address.state || "",
        zipCode: data.address.zipCode || "",
        country: data.address.country || "United States"
      });
    }
    if (data.phone) {
      setConfirmPhone(data.phone);
    }
  }, [data.address, data.phone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.street.trim() || !formData.city.trim() || !formData.state || !formData.zipCode.trim()) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setLoading(true);

    try {
      await saveAddressInfo({
        street: formData.street.trim(),
        street2: formData.street2.trim(),
        city: formData.city.trim(),
        state: formData.state,
        zipCode: formData.zipCode.trim(),
        country: formData.country
      });

      // Update local context data for immediate UI feedback
      updateLocalData({
        address: {
          street: formData.street.trim(),
          street2: formData.street2.trim(),
          city: formData.city.trim(),
          state: formData.state,
          zipCode: formData.zipCode.trim(),
          country: formData.country
        }
      });

      toast.success("Address information saved.");
      navigate("/onboarding/more-personal-info");
    } catch (error) {
      console.error("Error saving address information:", error);
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
        <title>Address Information | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2 leading-snug">
          Tell us about your address
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          We need your address for compliance and verification purposes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Confirmation (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Confirmed)
            </label>
            <Input
              type="tel"
              value={confirmPhone}
              readOnly
              className="w-full bg-gray-50 text-gray-600"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <Input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className="w-full"
              required
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <Input
              type="text"
              name="street2"
              value={formData.street2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc."
              className="w-full"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Your city"
              className="w-full"
              required
            />
          </div>

          {/* State and Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State or Province"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <Input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="12345"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="text-white text-sm bg-primary hover:bg-[#8c391e] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}
