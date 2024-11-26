import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, defaultConfig } from '../types/config';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
  saveConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    
    // Atualiza o favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = config.favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Atualiza o título
    document.title = config.title;
  }, [config]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      colors: {
        ...prev.colors,
        ...(newConfig.colors || {})
      },
      customTexts: {
        ...prev.customTexts,
        ...(newConfig.customTexts || {})
      }
    }));
  };

  const saveConfig = () => {
    localStorage.setItem('appConfig', JSON.stringify(config));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('appConfig');
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
