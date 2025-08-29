// import { useOnboarding } from '@/context/OnboardingContext';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

// export const useOnboardingStep = () => {
//   const { saveStepData } = useOnboarding();
//   const navigate = useNavigate();

//   const completeStep = async (
//     data: Record<string, any>,
//     stepId: string,
//     nextRoute: string,
//     successMessage?: string
//   ) => {
//     try {
//       await saveStepData(stepId, data);
//       navigate(nextRoute);
//       if (successMessage) {
//         toast.success(successMessage);
//       }
//     } catch (error) {
//       toast.error("Failed to save progress. Please try again.");
//       console.error("Step completion error:", error);
//     }
//   };

//   return { completeStep };
// };
