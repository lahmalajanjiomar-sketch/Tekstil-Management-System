
"use client";

import React, { useEffect, useContext } from 'react';
import { AuthProvider, AuthContext } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from './theme-provider';
import { useI18n } from '@/context/i18n-context';
import { FirebaseClientProvider } from '@/firebase';

function AppContent({ children }: { children: React.ReactNode }) {
    const { lang } = useI18n();
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.body.className = auth?.appTheme || '';
        }
    }, [lang, auth?.appTheme]);

    return <>{children}</>;
}

export function AppBody({ children }: { children: React.ReactNode }) {
    return (
      <FirebaseClientProvider>
        <AuthProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AppContent>
                    {children}
                </AppContent>
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
      </FirebaseClientProvider>
    );
}
