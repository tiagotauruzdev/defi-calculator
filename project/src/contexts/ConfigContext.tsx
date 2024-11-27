import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, defaultConfig } from '../types/config';
import { supabase } from '../lib/supabase';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
  saveConfig: () => void;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Carregar configurações do Supabase
    loadConfigFromSupabase();
    
    // Inscrever para atualizações em tempo real
    const configSubscription = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'configurations'
        },
        () => {
          loadConfigFromSupabase();
        }
      )
      .subscribe();

    return () => {
      configSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = config.favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    document.title = config.title;
  }, [config]);

  const loadConfigFromSupabase = async () => {
    const { data, error } = await supabase
      .from('configurations')
      .select('*');

    if (error) {
      console.error('Error loading config:', error);
      return;
    }

    if (data) {
      const configObject: Partial<AppConfig> = {};
      data.forEach(item => {
        try {
          const value = JSON.parse(item.value);
          if (item.key.includes('.')) {
            const [section, key] = item.key.split('.');
            configObject[section] = {
              ...(configObject[section] || {}),
              [key]: value
            };
          } else {
            configObject[item.key] = value;
          }
        } catch (e) {
          configObject[item.key] = item.value;
        }
      });
      setConfig(prev => ({ ...prev, ...configObject }));
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    if (!isAdmin) {
      console.error('Only admins can update config');
      return;
    }

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

    // Salvar no Supabase
    for (const [key, value] of Object.entries(newConfig)) {
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          await supabase
            .from('configurations')
            .upsert({
              key: `${key}.${subKey}`,
              value: JSON.stringify(subValue),
              updated_at: new Date().toISOString()
            });
        }
      } else {
        await supabase
          .from('configurations')
          .upsert({
            key,
            value: JSON.stringify(value),
            updated_at: new Date().toISOString()
          });
      }
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return false;
    }

    // Em produção, use bcrypt ou similar para hash
    if (data.password_hash === password) {
      setIsAdmin(true);
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const saveConfig = async () => {
    if (!isAdmin) return;
    // Configuração já foi salva no updateConfig
  };

  const resetConfig = () => {
    if (!isAdmin) return;
    setConfig(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{
      config,
      updateConfig,
      resetConfig,
      saveConfig,
      isAdmin,
      login,
      logout
    }}>
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
