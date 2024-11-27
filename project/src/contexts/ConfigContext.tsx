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
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfigFromSupabase = async () => {
    try {
      console.log('Carregando configurações do Supabase...');
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('Configurações carregadas:', data);
        const configObject: Partial<AppConfig> = {};
        
        // Agrupa as configurações por chave principal
        const groupedData = data.reduce((acc, item) => {
          if (item.key.includes('.')) {
            const [section, key] = item.key.split('.');
            if (!acc[section]) acc[section] = {};
            try {
              acc[section][key] = JSON.parse(item.value);
            } catch (e) {
              acc[section][key] = item.value;
            }
          } else {
            try {
              acc[item.key] = JSON.parse(item.value);
            } catch (e) {
              acc[item.key] = item.value;
            }
          }
          return acc;
        }, {} as Record<string, any>);

        // Atualiza o estado com as configurações agrupadas
        setConfig(prev => ({
          ...prev,
          ...groupedData,
          colors: {
            ...prev.colors,
            ...(groupedData.colors || {})
          },
          customTexts: {
            ...prev.customTexts,
            ...(groupedData.customTexts || {})
          }
        }));
      } else {
        console.log('Nenhuma configuração encontrada, usando padrões');
      }
    } catch (error) {
      console.error('Erro ao processar configurações:', error);
    }
  };

  const saveToSupabase = async (configToSave: Partial<AppConfig>): Promise<boolean> => {
    try {
      console.log('Salvando configurações no Supabase:', configToSave);
      
      // Prepara as configurações para salvar
      const configsToSave: { key: string; value: string; updated_at: string }[] = [];

      // Processa as configurações
      for (const [key, value] of Object.entries(configToSave)) {
        if (typeof value === 'object' && value !== null) {
          for (const [subKey, subValue] of Object.entries(value)) {
            configsToSave.push({
              key: `${key}.${subKey}`,
              value: JSON.stringify(subValue),
              updated_at: new Date().toISOString()
            });
          }
        } else {
          configsToSave.push({
            key,
            value: JSON.stringify(value),
            updated_at: new Date().toISOString()
          });
        }
      }

      // Salva todas as configurações de uma vez
      const { error } = await supabase
        .from('configurations')
        .upsert(configsToSave);

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
      // Atualiza o estado local primeiro
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

      // Salva no Supabase
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
      
      // Verifica se o usuário é um admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (adminError) {
        console.error('Erro ao buscar admin:', adminError);
        return false;
      }

      if (!adminData) {
        console.error('Admin não encontrado');
        return false;
      }

      console.log('Admin encontrado:', adminData);

      // Atualiza último login
      const { error: updateError } = await supabase
        .from('admins')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', adminData.id);

      if (updateError) {
        console.error('Erro ao atualizar último login:', updateError);
      }

      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
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
        logout
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
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
