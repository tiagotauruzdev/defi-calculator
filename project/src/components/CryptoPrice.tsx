import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Bitcoin, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CryptoPriceProps {
  exchangeRate: number;
}

interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: React.ElementType;
}

export function CryptoPrice({ exchangeRate }: CryptoPriceProps) {
  const { i18n } = useTranslation();
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const cryptoList: CryptoData[] = [
          {
            name: 'Bitcoin',
            symbol: 'BTC',
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change,
            icon: Bitcoin
          },
          {
            name: 'Ethereum',
            symbol: 'ETH',
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change,
            icon: Coins
          },
          {
            name: 'Solana',
            symbol: 'SOL',
            price: data.solana.usd,
            change24h: data.solana.usd_24h_change,
            icon: Coins
          }
        ];

        setCryptos(cryptoList);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cryptos.map((crypto) => (
        <div key={crypto.symbol} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <crypto.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {crypto.name}
              </h3>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(crypto.price, 'USD')}
              </div>
              {i18n.language === 'pt-BR' && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(crypto.price * exchangeRate, 'BRL')}
                </div>
              )}
            </div>
          </div>
          <div className={`flex items-center ${crypto.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {crypto.change24h >= 0 ? (
              <TrendingUp className="w-5 h-5 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-1" />
            )}
            <span className="font-medium">
              {crypto.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
