import React from 'react';
import { 
  calculateImpermanentLoss,
  calculateEstimatedApr,
  calculateProjectedYield,
  calculatePendingYield
} from '../utils/calculations';
import { CalculatorProps } from '../types';

export function Calculator({ inputs, setResults }: CalculatorProps) {
  React.useEffect(() => {
    if (!inputs.initialBalance) return;

    const balanceForCalc = inputs.currentBalance || inputs.initialBalance;
    const il = inputs.currentBalance ? calculateImpermanentLoss(inputs.initialBalance, inputs.currentBalance) : 0;
    const estimatedApr = calculateEstimatedApr(inputs.dailyYield);
    const projectedYield = calculateProjectedYield(balanceForCalc, inputs.dailyYield, inputs.simulationDays);
    const pendingYield = calculatePendingYield(balanceForCalc, inputs.dailyYield);
    const adjustedYield = projectedYield - il;

    setResults({
      impermanentLoss: il,
      adjustedYield,
      pendingYield,
      projectedYield,
      estimatedApr,
    });
  }, [inputs, setResults]);

  return null;
}