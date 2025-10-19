
"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { translations, TranslationKey } from '@/lib/locales';

export type Language = 'tr' | 'en' | 'ar';

interface I18nContextType {
  t: (key: TranslationKey, vars?: { [key: string]: string | number }) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const [lang, setLang] = useState<Language>('en'); // Default to English

  useEffect(() => {
    if (auth?.user?.language) {
      setLang(auth.user.language);
    } else {
        const storedLang = typeof window !== 'undefined' ? localStorage.getItem('app_lang') as Language : null;
        if (storedLang && ['en', 'tr', 'ar'].includes(storedLang)) {
            setLang(storedLang);
        }
    }
  }, [auth?.user]);

  const handleSetLang = useCallback((newLang: Language) => {
    if (auth?.user) {
        auth.updateUserPreferences(auth.user.id, { language: newLang });
    } else {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_lang', newLang);
        }
        setLang(newLang);
    }
  }, [auth]);
  
  const t = (key: TranslationKey, vars?: { [key: string]: string | number }): string => {
    let text = translations[key]?.[lang] || translations[key]?.['en'] || key;
    if (vars) {
        Object.keys(vars).forEach(varKey => {
            const regex = new RegExp(`{{${varKey}}}`, 'g');
            text = text.replace(regex, String(vars[varKey]));
        })
    }
    return text;
  };
  
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
    // This can happen on first render if AuthProvider isn't providing the context yet.
    // Return a dummy implementation until the real one is available.
    return {
        t: (key: string) => key,
        lang: 'en' as Language,
        setLang: () => {},
    };
  }
  return context;
};
