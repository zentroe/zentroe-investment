import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { Helmet } from "react-helmet-async";
import { signup } from "@/services/auth";
import { toast } from "sonner";


export default function PasswordSetup() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setOnboarding, onboarding } = useOnboarding();

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasMinLength && hasLetter && hasNumber;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await signup({ email: onboarding.email, password });
      toast.success("Account created successfully!");
      navigate("/onboarding/success");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("This email is already registered.");
        navigate("/onboarding/email");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <OnboardingLayout>
      <Helmet>
        <title>Set Password | Zentroe</title>
      </Helmet>
      <div className="max-w-lg mx-auto mt-14 space-y-12">
        <div>
          <h1 className="text-3xl font-sectra text-darkPrimary">Create a password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set a secure password to create your account and save your responses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="password" className="block text-sm mb-2 font-medium text-darkPrimary">
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className={`pr-10 ${!isValid && password.length > 0 ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-11 right-3 text-gray-500"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <ul className="text-sm space-y-1 text-darkPrimary">
            <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-800' : ''}`}>
              {hasMinLength ? (
                <CheckCircle className="text-green-800 w-4 h-4" />
              ) : (
                <Circle className="text-gray-400 w-4 h-4" />
              )}
              Minimum of 8 characters
            </li>
            <li className={`flex items-center gap-2 ${hasLetter ? 'text-green-800' : ''}`}>
              {hasLetter ? (
                <CheckCircle className="text-green-800 w-4 h-4" />
              ) : (
                <Circle className="text-gray-400 w-4 h-4" />
              )}
              At least one letter
            </li>
            <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-800' : ''}`}>
              {hasNumber ? (
                <CheckCircle className="text-green-800 w-4 h-4" />
              ) : (
                <Circle className="text-gray-400 w-4 h-4" />
              )}
              At least one number
            </li>
          </ul>


          <Button
            type="submit"
            disabled={!isValid || loading}
            variant="default"
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>

        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          By continuing you indicate you have reviewed and agree to the {" "}
          <a href="#" className="underline">Terms of Service</a> and {" "}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </OnboardingLayout>
  );
}
