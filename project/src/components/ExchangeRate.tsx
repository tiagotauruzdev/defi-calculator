import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';

export function ExchangeRate() {
  const { t } = useTranslation();
  const [rate, setRate] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setRate(data.rates.BRL);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!rate) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex items-center">
      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {t('currency.usdToBrl', { rate: rate.toFixed(2) })}
      </span>
    </div>
  );
}