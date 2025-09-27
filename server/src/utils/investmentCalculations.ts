/**
 * Investment calculation utilities to ensure accuracy
 */

export interface InvestmentCalculation {
  totalReturnPercentage: number;
  duration: number;
  investmentAmount: number;
  dailyRatePercentage: number;
  dailyProfitAmount: number;
  totalProfitAmount: number;
  finalValue: number;
}

/**
 * Calculate accurate investment returns
 */
export const calculateInvestmentReturns = (
  totalReturnPercentage: number,
  duration: number,
  investmentAmount: number
): InvestmentCalculation => {
  // Calculate daily rate as percentage
  const dailyRatePercentage = totalReturnPercentage / duration;

  // Calculate daily profit amount
  const dailyProfitAmount = investmentAmount * (dailyRatePercentage / 100);

  // Calculate total profit over duration
  const totalProfitAmount = dailyProfitAmount * duration;

  // Calculate final value
  const finalValue = investmentAmount + totalProfitAmount;

  return {
    totalReturnPercentage,
    duration,
    investmentAmount,
    dailyRatePercentage,
    dailyProfitAmount,
    totalProfitAmount,
    finalValue
  };
};

/**
 * Validate investment calculation accuracy
 */
export const validateInvestmentCalculation = (calc: InvestmentCalculation): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check if daily rate * duration equals total return
  const calculatedTotalReturn = calc.dailyRatePercentage * calc.duration;
  const tolerance = 0.0001; // Small tolerance for floating point precision

  if (Math.abs(calculatedTotalReturn - calc.totalReturnPercentage) > tolerance) {
    issues.push(`Daily rate calculation error: ${calc.dailyRatePercentage}% × ${calc.duration} days = ${calculatedTotalReturn}%, expected ${calc.totalReturnPercentage}%`);
  }

  // Check if daily profit * duration equals total profit
  const calculatedTotalProfit = calc.dailyProfitAmount * calc.duration;
  if (Math.abs(calculatedTotalProfit - calc.totalProfitAmount) > 0.01) {
    issues.push(`Total profit calculation error: $${calc.dailyProfitAmount.toFixed(2)} × ${calc.duration} days = $${calculatedTotalProfit.toFixed(2)}, expected $${calc.totalProfitAmount.toFixed(2)}`);
  }

  // Check if final value is correct
  const calculatedFinalValue = calc.investmentAmount + calc.totalProfitAmount;
  if (Math.abs(calculatedFinalValue - calc.finalValue) > 0.01) {
    issues.push(`Final value calculation error: $${calc.investmentAmount} + $${calc.totalProfitAmount.toFixed(2)} = $${calculatedFinalValue.toFixed(2)}, expected $${calc.finalValue.toFixed(2)}`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Test calculation with example values
 */
export const testInvestmentCalculation = () => {
  console.log('🧮 Testing investment calculations...');

  // Test case: 8.2% return over 1 day with $1000 investment
  const test1 = calculateInvestmentReturns(8.2, 1, 1000);
  const validation1 = validateInvestmentCalculation(test1);

  console.log('Test 1 - 8.2% return over 1 day with $1000:', {
    calculation: test1,
    validation: validation1
  });

  // Test case: 100% return over 365 days with $1000 investment
  const test2 = calculateInvestmentReturns(100, 365, 1000);
  const validation2 = validateInvestmentCalculation(test2);

  console.log('Test 2 - 100% return over 365 days with $1000:', {
    calculation: {
      ...test2,
      dailyRatePercentage: Number(test2.dailyRatePercentage.toFixed(6)),
      dailyProfitAmount: Number(test2.dailyProfitAmount.toFixed(6))
    },
    validation: validation2
  });

  // Test case: 15% return over 30 days with $5000 investment
  const test3 = calculateInvestmentReturns(15, 30, 5000);
  const validation3 = validateInvestmentCalculation(test3);

  console.log('Test 3 - 15% return over 30 days with $5000:', {
    calculation: test3,
    validation: validation3
  });

  const allValid = validation1.isValid && validation2.isValid && validation3.isValid;
  console.log(`🎯 All calculations ${allValid ? '✅ PASSED' : '❌ FAILED'}`);

  return allValid;
};