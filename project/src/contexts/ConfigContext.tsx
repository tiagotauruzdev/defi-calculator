import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, defaultConfig } from '../types/config';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<boolean>;
  resetConfig: () => void;
  saveConfig: () => Promise<boolean>;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

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
    if (!currentUsername) {
      console.error('Usuário não autenticado');
      return false;
    }

    try {
      console.log('Salvando configurações no Supabase:', configToSave);
      
      const updates = Object.entries(configToSave).map(([key, value]) => ({
        key,
        value: key === 'colors' || key === 'customTexts' ? value : JSON.stringify(value),
        updated_by: currentUsername
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

  const login = async (username: string, password: string) => {
    try {
      console.log('Tentando login com username:', username);
      
      // Busca o admin pelo username
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('username, password_hash')
        .eq('username', username)
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

      // Verifica a senha
      const isValidPassword = await bcrypt.compare(password, adminData.password_hash);
      
      console.log('Senha válida?', isValidPassword);
      
      if (!isValidPassword) {
        console.error('Senha inválida');
        return false;
      }

      // Faz login no Supabase Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });

      if (signInError) {
        // Se o usuário não existe, cria um novo
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: username,
            password: password
          });

          if (signUpError) {
            console.error('Erro ao criar usuário no Supabase:', signUpError);
            return false;
          }
        } else {
          console.error('Erro ao fazer login no Supabase:', signInError);
          return false;
        }
      }

      // Atualiza o estado
      setIsAdmin(true);
      setCurrentUsername(username);

      // Atualiza último login
      const { error: updateError } = await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('username', username);

      if (updateError) {
        console.error('Erro ao atualizar último login:', updateError);
      }

      console.log('Login bem sucedido!');
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      setIsAdmin(false);
      setCurrentUsername(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
