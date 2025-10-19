
"use client";

import React, { useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from './theme-provider';
import { I18nProvider, useI18n } from '@/context/i18n-context';

function ThemedContent({ children }: { children: React.ReactNode }) {
    const { lang } = useI18n();
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }
    }, [lang]);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
    )
}

export function AppBody({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <I18nProvider>
                <ThemedContent>
                    {children}
                </ThemedContent>
            </I18nProvider>
        </AuthProvider>
    );
}
