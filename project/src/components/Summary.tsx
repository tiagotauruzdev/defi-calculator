import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Calculator, Percent, CalendarClock } from 'lucide-react';
import { Results } from '../types';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatCurrency';

interface SummaryProps {
  results: Results;
  simulationDays: number;
  exchangeRate: number;
}

export function Summary({ results, simulationDays, exchangeRate }: SummaryProps) {
  const { t, i18n } = useTranslation();
  const showBRL = i18n.language === 'pt-BR';

  const formatValue = (value: number, isPercentage = false) => {
    if (isPercentage) return `${value.toFixed(2)}%`;
    
    const usdValue = formatCurrency(value, 'USD');
    if (!showBRL) return usdValue;

    const brlValue = formatCurrency(value * exchangeRate, 'BRL', 'pt-BR');
    return `${usdValue} (${brlValue})`;
  };

  const pendingYield = formatValue(results.pendingYield);
  const projectedYield = formatValue(results.projectedYield);
  const estimatedAPR = formatValue(results.estimatedApr, true);
  const monthlyAPR = formatValue(results.estimatedApr / 12, true);
  const impermanentLoss = formatValue(results.impermanentLoss, true);
  const adjustedYield = formatValue(results.adjustedYield);

  function MetricCard({ label, value, suffix, tooltip, className = '', icon: Icon }) {
    const formattedValue = typeof value === 'number' 
      ? `${value.toFixed(2)}${suffix || ''}`
      : value;

    return (
      <div className={`p-4 rounded-lg ${className}`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
            </div>
            {tooltip && (
              <div className="group relative">
                <button className="text-gray-400 hover:text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 text-sm text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-gray-300">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {formattedValue}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          label={t('metrics.pendingYield')}
          value={pendingYield}
          tooltip={t('tooltips.pendingYield')}
          className="bg-blue-50 dark:bg-blue-900/20"
          icon={Clock}
        />
        <MetricCard
          label={t('metrics.projectedYield')}
          value={projectedYield}
          tooltip={t('tooltips.projectedYield')}
          className="bg-green-50 dark:bg-green-900/20"
          icon={TrendingUp}
        />
        <MetricCard
          label={t('metrics.estimatedApr')}
          value={estimatedAPR}
          suffix="%"
          tooltip={t('tooltips.estimatedApr')}
          className="bg-purple-50 dark:bg-purple-900/20"
          icon={Percent}
        />
        <MetricCard
          label={t('metrics.monthlyApr')}
          value={monthlyAPR}
          suffix="%"
          tooltip={t('tooltips.monthlyApr')}
          className="bg-indigo-50 dark:bg-indigo-900/20"
          icon={CalendarClock}
        />
        <MetricCard
          label={t('metrics.impermanentLoss')}
          value={impermanentLoss}
          suffix="%"
          tooltip={t('tooltips.impermanentLoss')}
          className="bg-red-50 dark:bg-red-900/20"
          icon={TrendingDown}
        />
        <MetricCard
          label={t('metrics.adjustedYield')}
          value={adjustedYield}
          tooltip={t('tooltips.adjustedYield')}
          className="bg-yellow-50 dark:bg-yellow-900/20"
          icon={DollarSign}
        />
      </div>
    </div>
  );
}