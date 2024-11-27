import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Settings, X, Home, Palette, Type, ChevronLeft, ChevronRight, Save, Wallet, Copy, Lock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AdminPanel() {
  const { t } = useTranslation();
  const { config, updateConfig, resetConfig, saveConfig, isAdmin, login, logout } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'general' | 'colors' | 'texts' | 'wallet' | 'website'>('general');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!isAdmin) {
      setEmail('');
      setPassword('');
      setError('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (key: keyof typeof config.colors, value: string) => {
    updateConfig({
      colors: { ...config.colors, [key]: value }
    });
  };

  const handleTextChange = (key: string, value: string) => {
    updateConfig({
      customTexts: { ...config.customTexts, [key]: value }
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    updateConfig({ [key]: value });
  };

  const menuItems = [
    { id: 'general', label: t('admin.menus.general'), icon: Home },
    { id: 'colors', label: t('admin.menus.colors'), icon: Palette },
    { id: 'texts', label: t('admin.menus.texts'), icon: Type },
    { id: 'wallet', label: t('admin.menus.wallet'), icon: Wallet },
    { id: 'website', label: t('admin.menus.website'), icon: Globe }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Admin Panel"
      >
        <Lock className="w-6 h-6" />
      </button>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`bg-gray-900 text-white flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {!isCollapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-800 rounded-lg"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
          
          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as typeof activeMenu)}
                className={`w-full flex items-center px-4 py-3 ${
                  activeMenu === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } transition-colors`}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => saveConfig()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-5 h-5" />
              {!isCollapsed && <span className="ml-2">{t('admin.save')}</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Lock className="w-5 h-5" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
              {!isCollapsed && <span className="ml-2">Close</span>}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 flex-1 overflow-y-auto">
          <div className="p-6 max-w-2xl mx-auto">
            {activeMenu === 'general' && (
              <div className="space-y-8">
                {/* General Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('admin.generalSection')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      App Title
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Favicon
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Footer Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('admin.footerSection')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.privacyPolicy')}
                    </label>
                    <input
                      type="url"
                      value={config.footerLinks[0]?.url || ''}
                      onChange={(e) => {
                        const newLinks = [...config.footerLinks];
                        newLinks[0] = { ...newLinks[0], url: e.target.value };
                        updateConfig({ footerLinks: newLinks });
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.termsOfService')}
                    </label>
                    <input
                      type="url"
                      value={config.footerLinks[1]?.url || ''}
                      onChange={(e) => {
                        const newLinks = [...config.footerLinks];
                        newLinks[1] = { ...newLinks[1], url: e.target.value };
                        updateConfig({ footerLinks: newLinks });
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={resetConfig}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>

                {/* Website Configuration */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {t('admin.websiteConfig')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.websiteUrl')}
                      </label>
                      <input
                        type="text"
                        value={config.websiteUrl || ''}
                        onChange={(e) => handleConfigChange('websiteUrl', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.websiteText')}
                      </label>
                      <input
                        type="text"
                        value={config.websiteText || ''}
                        onChange={(e) => handleConfigChange('websiteText', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'colors' && (
              <div className="space-y-6">
                {Object.entries(config.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof typeof config.colors, e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof typeof config.colors, e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'texts' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.footerText')}
                  </label>
                  <input
                    type="text"
                    value={config.footerText}
                    onChange={(e) => updateConfig({ footerText: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.buyMeACoffeeText')}
                  </label>
                  <input
                    type="text"
                    value={config.buyMeACoffeeText}
                    onChange={(e) => updateConfig({ buyMeACoffeeText: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder={t('footer.buyMeACoffee')}
                  />
                </div>
              </div>
            )}

            {activeMenu === 'wallet' && (
              <div className="space-y-6">
                {/* Wallet 1 */}
                <div className="space-y-6 border-b pb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    Carteira 1
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rede da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet1Network}
                      onChange={(e) => updateConfig({ wallet1Network: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      placeholder="SOL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet1Address}
                      onChange={(e) => updateConfig({ wallet1Address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter wallet address"
                    />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Customização de Cores
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor de Fundo
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet1Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Background: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Background: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor do Texto
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet1Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Text: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Text: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor da Borda
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet1Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Border: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet1Border: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet 2 */}
                <div className="space-y-6 border-b pb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    Carteira 2
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rede da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet2Network}
                      onChange={(e) => updateConfig({ wallet2Network: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      placeholder="ETH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet2Address}
                      onChange={(e) => updateConfig({ wallet2Address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter wallet address"
                    />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Customização de Cores
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor de Fundo
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet2Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Background: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Background: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor do Texto
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet2Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Text: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Text: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor da Borda
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet2Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Border: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet2Border: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet 3 */}
                <div className="space-y-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                    Carteira 3
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rede da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet3Network}
                      onChange={(e) => updateConfig({ wallet3Network: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      placeholder="BTC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço da Carteira
                    </label>
                    <input
                      type="text"
                      value={config.wallet3Address}
                      onChange={(e) => updateConfig({ wallet3Address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter wallet address"
                    />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Customização de Cores
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor de Fundo
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet3Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Background: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Background}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Background: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor do Texto
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet3Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Text: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Text}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Text: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cor da Borda
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.colors.wallet3Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Border: e.target.value }
                            })}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Border}
                            onChange={(e) => updateConfig({
                              colors: { ...config.colors, wallet3Border: e.target.value }
                            })}
                            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'website' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {t('admin.websiteConfig')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.websiteUrl')}
                      </label>
                      <input
                        type="text"
                        value={config.websiteUrl || ''}
                        onChange={(e) => handleConfigChange('websiteUrl', e.target.value)}
                        placeholder="https://salarioemcripto.com.br"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.websiteText')}
                      </label>
                      <input
                        type="text"
                        value={config.websiteText || ''}
                        onChange={(e) => handleConfigChange('websiteText', e.target.value)}
                        placeholder="Salário em Cripto"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.websiteTextColor')}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={config.colors?.websiteText || '#4F46E5'}
                          onChange={(e) => handleColorChange('websiteText', e.target.value)}
                          className="h-8 w-16 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.colors?.websiteText || '#4F46E5'}
                          onChange={(e) => handleColorChange('websiteText', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
