import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Settings, X, Home, Palette, Type, ChevronLeft, ChevronRight, Save, Wallet, Copy, Lock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toast } from './Toast';

export function AdminPanel() {
  const { t } = useTranslation();
  const { config, updateConfig, resetConfig, saveConfig, isAdmin, login, logout } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'general' | 'colors' | 'texts' | 'wallet' | 'website'>('general');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSave = async () => {
    const success = await saveConfig();
    if (success) {
      showToast('Configurações salvas com sucesso!', 'success');
    } else {
      showToast('Erro ao salvar configurações. Tente novamente.', 'error');
    }
  };

  const handleConfigChange = async (key: string, value: string) => {
    const success = await updateConfig({ [key]: value });
    if (!success) {
      showToast('Erro ao atualizar configuração. Tente novamente.', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Usuário ou senha inválidos');
        showToast('Usuário ou senha inválidos', 'error');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      showToast('Erro ao fazer login. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    showToast('Você foi deslogado com sucesso!', 'success');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ [field]: reader.result as string });
        showToast('Arquivo carregado com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorKey: keyof typeof config.colors, value: string) => {
    updateConfig({
      colors: {
        ...config.colors,
        [colorKey]: value
      }
    });
    showToast('Cor atualizada com sucesso!', 'success');
  };

  const handleTextChange = (key: string, value: string) => {
    updateConfig({
      customTexts: { ...config.customTexts, [key]: value }
    });
    showToast('Texto atualizado com sucesso!', 'success');
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
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              onClick={handleSave}
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
                      onChange={(e) => handleConfigChange('title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => handleConfigChange('footerText', e.target.value)}
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
                    onChange={(e) => handleConfigChange('buyMeACoffeeText', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet1Network', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet1Address', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet1Background', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Background}
                            onChange={(e) => handleColorChange('wallet1Background', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet1Text', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Text}
                            onChange={(e) => handleColorChange('wallet1Text', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet1Border', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet1Border}
                            onChange={(e) => handleColorChange('wallet1Border', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet2Network', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet2Address', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet2Background', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Background}
                            onChange={(e) => handleColorChange('wallet2Background', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet2Text', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Text}
                            onChange={(e) => handleColorChange('wallet2Text', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet2Border', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet2Border}
                            onChange={(e) => handleColorChange('wallet2Border', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet3Network', e.target.value)}
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
                      onChange={(e) => handleConfigChange('wallet3Address', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet3Background', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Background}
                            onChange={(e) => handleColorChange('wallet3Background', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet3Text', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Text}
                            onChange={(e) => handleColorChange('wallet3Text', e.target.value)}
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
                            onChange={(e) => handleColorChange('wallet3Border', e.target.value)}
                            className="h-10 w-20"
                          />
                          <input
                            type="text"
                            value={config.colors.wallet3Border}
                            onChange={(e) => handleColorChange('wallet3Border', e.target.value)}
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
              <div className="space-y-8">
                {/* Website Customization */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Personalização do Website
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Personalize a aparência do seu website ajustando logos, cores e textos.
                  </p>
                  
                  {/* Logo Section */}
                  <div className="space-y-4 border-b pb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Logo e Favicon
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo do Website
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
                        Favicon do Website
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'favicon')}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Website URL and Text Section */}
                  <div className="space-y-4 border-b pb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      URL e Texto Principal
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL do Website
                      </label>
                      <input
                        type="text"
                        value={config.websiteUrl || ''}
                        onChange={(e) => handleConfigChange('websiteUrl', e.target.value)}
                        placeholder="https://salarioemcripto.com.br"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Texto do Website
                      </label>
                      <input
                        type="text"
                        value={config.websiteText || ''}
                        onChange={(e) => handleConfigChange('websiteText', e.target.value)}
                        placeholder="Salário em Cripto"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Cor do Texto:
                        </label>
                        <input
                          type="color"
                          value={config.colors?.websiteText || '#000000'}
                          onChange={(e) => handleColorChange('websiteText', e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.colors?.websiteText || '#000000'}
                          onChange={(e) => handleColorChange('websiteText', e.target.value)}
                          className="w-28 px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Rodapé do Website
                    </h4>
                    
                    {/* Footer Links */}
                    <div className="space-y-4 border-b pb-6">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Links do Rodapé
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Política de Privacidade
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
                          <div className="flex items-center space-x-2 mt-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                              Cor do Link:
                            </label>
                            <input
                              type="color"
                              value={config.colors?.privacyLink || '#4F46E5'}
                              onChange={(e) => handleColorChange('privacyLink', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.colors?.privacyLink || '#4F46E5'}
                              onChange={(e) => handleColorChange('privacyLink', e.target.value)}
                              className="w-28 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Termos de Serviço
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
                          <div className="flex items-center space-x-2 mt-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                              Cor do Link:
                            </label>
                            <input
                              type="color"
                              value={config.colors?.termsLink || '#4F46E5'}
                              onChange={(e) => handleColorChange('termsLink', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.colors?.termsLink || '#4F46E5'}
                              onChange={(e) => handleColorChange('termsLink', e.target.value)}
                              className="w-28 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Texts */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Textos do Rodapé
                      </h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Texto Principal do Rodapé
                        </label>
                        <input
                          type="text"
                          value={config.footerText}
                          onChange={(e) => updateConfig({ footerText: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Cor do Texto:
                          </label>
                          <input
                            type="color"
                            value={config.colors?.footerText || '#6B7280'}
                            onChange={(e) => handleColorChange('footerText', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.colors?.footerText || '#6B7280'}
                            onChange={(e) => handleColorChange('footerText', e.target.value)}
                            className="w-28 px-2 py-1 text-sm border rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Texto "Buy Me a Coffee"
                        </label>
                        <input
                          type="text"
                          value={config.buyMeACoffeeText}
                          onChange={(e) => updateConfig({ buyMeACoffeeText: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                          placeholder="Buy me a coffee ☕"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Cor do Texto:
                          </label>
                          <input
                            type="color"
                            value={config.colors?.buyMeACoffeeText || '#4F46E5'}
                            onChange={(e) => handleColorChange('buyMeACoffeeText', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.colors?.buyMeACoffeeText || '#4F46E5'}
                            onChange={(e) => handleColorChange('buyMeACoffeeText', e.target.value)}
                            className="w-28 px-2 py-1 text-sm border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
