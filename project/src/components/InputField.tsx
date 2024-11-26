import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatCurrency';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  exchangeRate?: number;
}

export function InputField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  suffix, 
  exchangeRate 
}: InputFieldProps) {
  const { i18n } = useTranslation();
  const showBRL = i18n.language === 'pt-BR' && suffix === '$' && exchangeRate;
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (/^[0-9]*[,.]?[0-9]*$/.test(newValue) || newValue === '') {
      setInputValue(newValue);
      
      if (newValue !== '') {
        const numberValue = parseFloat(newValue.replace(',', '.'));
        if (!isNaN(numberValue)) {
          onChange(numberValue);
        }
      } else {
        onChange(0);
      }
    }
  };

  const brlValue = showBRL ? value * (exchangeRate || 1) : null;

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {label}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 text-sm sm:text-base border rounded-l-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              {suffix && (
                <span className="inline-flex items-center px-3 py-2 text-sm sm:text-base border border-l-0 rounded-r-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 text-gray-500 dark:text-gray-300">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {brlValue && (
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(brlValue, 'BRL', 'pt-BR')}
        </div>
      )}
    </div>
  );
}