import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { saveRecurringInvestmentSettings } from "@/services/investmentService";
import {
  frequencyOptions,
  investmentDaysMap,
  generatePresetAmounts,
  frequencyMapping,
} from "@/utils/recurringInvestmentHelpers";

interface SetupRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  annualInvestmentAmount?: string;
  existingRecurring?: {
    frequency: string;
    investmentDay: string;
    amount: number;
    isActive: boolean;
  };
}

const SetupRecurringModal: React.FC<SetupRecurringModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  annualInvestmentAmount = "$10,000 to $50,000",
  existingRecurring,
}) => {
  const [frequency, setFrequency] = useState("");
  const [investmentDay, setInvestmentDay] = useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is edit mode
  const isEditMode = !!existingRecurring;

  // Initialize form with existing data if editing
  useEffect(() => {
    if (existingRecurring) {
      setFrequency(existingRecurring.frequency);
      setInvestmentDay(existingRecurring.investmentDay);
      setAmount(existingRecurring.amount.toString());
      setCustomAmount(existingRecurring.amount.toString());
    } else {
      // Reset form for new setup
      setFrequency("");
      setInvestmentDay("");
      setAmount("");
      setCustomAmount("");
    }
    setError(null);
  }, [existingRecurring, isOpen]);

  const availableDays = frequency ? investmentDaysMap[frequency] || [] : [];
  const presetAmounts = frequency
    ? generatePresetAmounts(annualInvestmentAmount, frequency)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!frequency || !investmentDay || !amount) {
      setError("Please complete all fields");
      return;
    }

    const amountValue =
      amount === "custom" ? parseFloat(customAmount) : parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const backendFrequency = frequencyMapping[frequency] || "monthly";

      await saveRecurringInvestmentSettings({
        recurringInvestment: true,
        recurringFrequency: backendFrequency,
        recurringDay: investmentDay,
        recurringAmount: amountValue,
      });

      // Call onSuccess to refresh data
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Error saving recurring investment:", err);
      setError(err.response?.data?.message || "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Recurring Investment" : "Set Up Recurring Investment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How often would you like to invest?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setFrequency(option);
                    setInvestmentDay(""); // Reset day when frequency changes
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${frequency === option
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {frequency === option && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Selection */}
          {frequency && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which day?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setInvestmentDay(day)}
                    className={`p-4 rounded-lg border-2 transition-all ${investmentDay === day
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{day}</span>
                      {investmentDay === day && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Selection */}
          {frequency && investmentDay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much per investment?
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {presetAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount.toString())}
                    className={`p-4 rounded-lg border-2 transition-all ${amount === presetAmount.toString()
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        ${presetAmount.toLocaleString()}
                      </span>
                      {amount === presetAmount.toString() && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <button
                type="button"
                onClick={() => setAmount("custom")}
                className={`w-full p-4 rounded-lg border-2 transition-all mb-3 ${amount === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Custom Amount</span>
                  {amount === "custom" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>

              {amount === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0"
                      min="1"
                      step="1"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !frequency || !investmentDay || !amount}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : isEditMode ? "Update Settings" : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupRecurringModal;
