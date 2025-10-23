"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { translations, TranslationKey } from '@/lib/locales';

export type Language = 'tr' | 'en' | 'ar';

interface I18nContextType {
  t: (key: TranslationKey, vars?: { [key: string]: string | number }) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('app_lang') as Language;
    if (storedLang && ['en', 'tr', 'ar'].includes(storedLang)) {
      setLang(storedLang);
    }
  }, []);
  
  const handleSetLang = useCallback((newLang: Language) => {
      localStorage.setItem('app_lang', newLang);
      setLang(newLang);
  }, []);
  
  const t = useCallback((key: TranslationKey, vars?: { [key: string]: string | number }): string => {
    let text = translations[key]?.[lang] || translations[key]?.['en'] || key;
    if (vars) {
        Object.keys(vars).forEach(varKey => {
            const regex = new RegExp(`{{${varKey}}}`, 'g');
            text = text.replace(regex, String(vars[varKey]));
        })
    }
    return text;
  }, [lang]);
  
  const value = { t, lang, setLang: handleSetLang };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // This fallback is for safety, especially during initial renders where context might not be ready.
    return {
        t: (key: string) => key,
        lang: 'en' as Language,
        setLang: () => {},
    };
  }
  return context;
};
