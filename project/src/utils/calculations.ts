export const calculateImpermanentLoss = (initialBalance: number, currentBalance: number): number => {
  if (initialBalance === 0 || currentBalance === 0) return 0;
  const priceRatio = currentBalance / initialBalance;
  const sqrtPrice = Math.sqrt(priceRatio);
  const il = 2 * sqrtPrice / (1 + priceRatio) - 1;
  return Math.abs(il * initialBalance);
};

export const calculateEstimatedApr = (dailyYield: number): number => {
  return dailyYield * 365;
};

export const calculateProjectedYield = (currentBalance: number, dailyYield: number, days: number): number => {
  return (currentBalance * dailyYield * days) / 100;
};

export const calculatePendingYield = (currentBalance: number, dailyYield: number): number => {
  return (currentBalance * dailyYield) / 100;
};