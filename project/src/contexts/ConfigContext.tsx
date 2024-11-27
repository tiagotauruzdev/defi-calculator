import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, defaultConfig } from '../types/config';
import { supabase } from '../lib/supabase';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<boolean>;
  resetConfig: () => void;
  saveConfig: () => Promise<boolean>;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfigFromSupabase = async () => {
    try {
      console.log('Carregando configurações do Supabase...');
      const { data: configs, error } = await supabase
        .from('configurations')
        .select('key, value');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (!configs || configs.length === 0) {
        console.log('Nenhuma configuração encontrada');
        return;
      }

      const newConfig: Partial<AppConfig> = {};
      
      configs.forEach(({ key, value }) => {
        if (key === 'colors' || key === 'customTexts') {
          newConfig[key] = value;
        } else {
          newConfig[key] = JSON.parse(value);
        }
      });

      setConfig(prev => ({
        ...prev,
        ...newConfig
      }));

      console.log('Configurações carregadas com sucesso:', newConfig);
    } catch (error) {
      console.error('Erro ao processar configurações:', error);
    }
  };

  const saveToSupabase = async (configToSave: Partial<AppConfig>): Promise<boolean> => {
    try {
      console.log('Salvando configurações no Supabase:', configToSave);
      
      const updates = Object.entries(configToSave).map(([key, value]) => ({
        key,
        value: key === 'colors' || key === 'customTexts' ? value : JSON.stringify(value)
      }));

      const { error } = await supabase
        .from('configurations')
        .upsert(updates, { onConflict: 'key' });

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        return false;
      }

      console.log('Configurações salvas com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>): Promise<boolean> => {
    if (!isAdmin) {
      console.error('Apenas admins podem atualizar configurações');
      return false;
    }

    try {
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

      return await saveToSupabase(newConfig);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  };

  const saveConfig = async (): Promise<boolean> => {
    if (!isAdmin) {
      console.error('Apenas admins podem salvar configurações');
      return false;
    }

    return await saveToSupabase(config);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      // Verifica se o email é do administrador
      const isAdminUser = email === 'tiago.tauruz@gmail.com';
      setIsAdmin(isAdminUser);
      
      return isAdminUser;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    supabase.auth.signOut();
  };

  const resetConfig = () => {
    if (!isAdmin) return;
    setConfig(defaultConfig);
  };

  // Carrega as configurações iniciais
  useEffect(() => {
    const initializeConfig = async () => {
      await loadConfigFromSupabase();
      setIsLoading(false);
    };
    initializeConfig();
  }, []);

  // Inscreve para atualizações em tempo real
  useEffect(() => {
    const configSubscription = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'configurations'
        },
        (payload) => {
          console.log('Configuração alterada:', payload);
          loadConfigFromSupabase();
        }
      )
      .subscribe();

    return () => {
      configSubscription.unsubscribe();
    };
  }, []);

  // Atualiza o título e favicon quando as configurações mudam
  useEffect(() => {
    if (isLoading) return;

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = config.favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    document.title = config.title;
  }, [config, isLoading]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        isAdmin,
        login,
        logout,
        isLoading
      }}
    >
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
