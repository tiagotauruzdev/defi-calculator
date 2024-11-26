import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <div className="fixed top-4 right-16 flex gap-2">
      <button
        onClick={() => toggleLanguage('en')}
        className={`p-2 rounded-lg transition-all ${
          i18n.language === 'en'
            ? 'ring-2 ring-blue-500 shadow-md'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to English"
      >
        <img
          src="https://flagcdn.com/w40/us.png"
          width="32"
          height="24"
          alt="USA"
          className="w-6 h-4 object-cover rounded"
        />
      </button>
      <button
        onClick={() => toggleLanguage('pt-BR')}
        className={`p-2 rounded-lg transition-all ${
          i18n.language === 'pt-BR'
            ? 'ring-2 ring-blue-500 shadow-md'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Mudar para Português"
      >
        <img
          src="https://flagcdn.com/w40/br.png"
          width="32"
          height="24"
          alt="Brasil"
          className="w-6 h-4 object-cover rounded"
        />
      </button>
    </div>
  );
}