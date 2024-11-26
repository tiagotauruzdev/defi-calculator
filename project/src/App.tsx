import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator } from './components/Calculator';
import { InputField } from './components/InputField';
import { Summary } from './components/Summary';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { ExchangeRate } from './components/ExchangeRate';
import { CryptoPrice } from './components/CryptoPrice';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ConfigProvider } from './contexts/ConfigContext';
import { useConfig } from './contexts/ConfigContext';
import { Inputs, Results } from './types';
import { Wallet } from 'lucide-react';
import './i18n';

function AppContent() {
  const { t } = useTranslation();
  const { config } = useConfig();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [inputs, setInputs] = useState<Inputs>({
    initialBalance: 0,
    currentBalance: 0,
    dailyYield: 0,
    simulationDays: 0,
  });
  const [results, setResults] = useState<Results>({
    pendingYield: 0,
    projectedYield: 0,
    estimatedApr: 0,
    impermanentLoss: 0,
    adjustedYield: 0,
  });

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.BRL);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark' : ''}`} 
         style={{ backgroundColor: isDark ? config.colors.background : '#ffffff', color: isDark ? config.colors.text : '#000000' }}>
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      <LanguageToggle />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-8">
          <img src={config.logo} alt={config.title} className="h-8 w-auto mr-3" />
          <h1 className="text-3xl font-bold" style={{ color: config.colors.primary }}>{config.title}</h1>
        </div>

        <CryptoPrice exchangeRate={exchangeRate} />

        <div className={`rounded-2xl shadow-xl p-6 md:p-8 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: isDark ? config.colors.textSecondary : '#374151' }}>
                {t('poolDetails')}
              </h2>
              <InputField
                label={t('initialBalance')}
                value={inputs.initialBalance}
                onChange={(value) => setInputs({ ...inputs, initialBalance: value })}
                placeholder={t('initialBalance')}
                suffix="$"
                exchangeRate={exchangeRate}
              />
              <InputField
                label={t('currentBalance')}
                value={inputs.currentBalance}
                onChange={(value) => setInputs({ ...inputs, currentBalance: value })}
                placeholder={t('currentBalance')}
                suffix="$"
                exchangeRate={exchangeRate}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: isDark ? config.colors.textSecondary : '#374151' }}>
                {t('yieldSettings')}
              </h2>
              <InputField
                label={t('dailyYield')}
                value={inputs.dailyYield}
                onChange={(value) => setInputs({ ...inputs, dailyYield: value })}
                placeholder={t('dailyYield')}
                suffix="%"
              />
              <InputField
                label={t('simulationDays')}
                value={inputs.simulationDays}
                onChange={(value) => setInputs({ ...inputs, simulationDays: value })}
                placeholder={t('simulationDays')}
                suffix={t('metrics.days')}
              />
            </div>
          </div>

          <Calculator inputs={inputs} setResults={setResults} />
          <Summary 
            results={results} 
            simulationDays={inputs.simulationDays} 
            exchangeRate={exchangeRate}
          />
        </div>
      </div>
      <Footer />
      <AdminPanel />
      <ExchangeRate />
    </div>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;