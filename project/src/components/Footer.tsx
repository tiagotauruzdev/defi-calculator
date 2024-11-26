import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../contexts/ConfigContext';
import { Coffee, Copy, Check } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const { config } = useConfig();
  const [copiedWallet, setCopiedWallet] = useState<number | null>(null);

  const handleCopyAddress = async (address: string, walletNumber: number) => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedWallet(walletNumber);
      setTimeout(() => setCopiedWallet(null), 2000);
    }
  };

  return (
    <footer className="p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Coffee className="w-5 h-5" />
            <span>{config.buyMeACoffeeText || t('footer.buyMeACoffee')}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {config.wallet1Network && config.wallet1Address && (
                <div className="flex flex-col sm:flex-row items-center gap-2 text-sm sm:text-base">
                  <span 
                    style={{
                      backgroundColor: config.colors?.wallet1Background || '#f3f4f6',
                      color: config.colors?.wallet1Text || '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${config.colors?.wallet1Border || 'transparent'}`
                    }}
                    className="font-semibold"
                  >
                    {config.wallet1Network}
                  </span>
                  <div className="flex items-center gap-2">
                    <code 
                      style={{
                        backgroundColor: config.colors?.wallet1Background || '#f3f4f6',
                        color: config.colors?.wallet1Text || '#374151',
                        border: `1px solid ${config.colors?.wallet1Border || 'transparent'}`
                      }}
                      className="px-3 py-1.5 rounded text-xs sm:text-sm break-all"
                    >
                      {config.wallet1Address}
                    </code>
                    <button
                      onClick={() => handleCopyAddress(config.wallet1Address, 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Copiar endereço"
                    >
                      {copiedWallet === 1 ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {config.wallet2Network && config.wallet2Address && (
                <div className="flex flex-col sm:flex-row items-center gap-2 text-sm sm:text-base">
                  <span 
                    style={{
                      backgroundColor: config.colors?.wallet2Background || '#f3f4f6',
                      color: config.colors?.wallet2Text || '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${config.colors?.wallet2Border || 'transparent'}`
                    }}
                    className="font-semibold"
                  >
                    {config.wallet2Network}
                  </span>
                  <div className="flex items-center gap-2">
                    <code 
                      style={{
                        backgroundColor: config.colors?.wallet2Background || '#f3f4f6',
                        color: config.colors?.wallet2Text || '#374151',
                        border: `1px solid ${config.colors?.wallet2Border || 'transparent'}`
                      }}
                      className="px-3 py-1.5 rounded text-xs sm:text-sm break-all"
                    >
                      {config.wallet2Address}
                    </code>
                    <button
                      onClick={() => handleCopyAddress(config.wallet2Address, 2)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Copiar endereço"
                    >
                      {copiedWallet === 2 ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {config.wallet3Network && config.wallet3Address && (
                <div className="flex flex-col sm:flex-row items-center gap-2 text-sm sm:text-base">
                  <span 
                    style={{
                      backgroundColor: config.colors?.wallet3Background || '#f3f4f6',
                      color: config.colors?.wallet3Text || '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${config.colors?.wallet3Border || 'transparent'}`
                    }}
                    className="font-semibold"
                  >
                    {config.wallet3Network}
                  </span>
                  <div className="flex items-center gap-2">
                    <code 
                      style={{
                        backgroundColor: config.colors?.wallet3Background || '#f3f4f6',
                        color: config.colors?.wallet3Text || '#374151',
                        border: `1px solid ${config.colors?.wallet3Border || 'transparent'}`
                      }}
                      className="px-3 py-1.5 rounded text-xs sm:text-sm break-all"
                    >
                      {config.wallet3Address}
                    </code>
                    <button
                      onClick={() => handleCopyAddress(config.wallet3Address, 3)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Copiar endereço"
                    >
                      {copiedWallet === 3 ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base">
          {config.footerText}
          {config.websiteUrl && config.websiteText && (
            <div className="mt-2">
              <a
                href={config.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: config.colors?.websiteText || '#4F46E5' }}
                className="hover:opacity-80 transition-opacity"
              >
                {config.websiteText}
              </a>
            </div>
          )}
        </div>
        {config.footerLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4 px-4">
            {config.footerLinks.map((link, index) => (
              <div key={index} className="flex items-center">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {link.text}
                </a>
                {index < config.footerLinks.length - 1 && (
                  <span className="text-gray-300 dark:text-gray-700 mx-4 hidden sm:block">|</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
