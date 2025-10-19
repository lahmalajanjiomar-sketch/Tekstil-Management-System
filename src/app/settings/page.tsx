
"use client"

import { useContext } from "react"
import { useTheme } from "next-themes"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AuthContext, Language } from "@/context/auth-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/context/i18n-context"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

const themes = [
    { name: "theme-default", label: "varsayılan_tema", colors: ["#2d6a88", "#e3f2f9"] },
    { name: "theme-earth", label: "toprak_teması", colors: ["#995e4d", "#f2e9e4"] },
    { name: "theme-corporate", label: "kurumsal_tema", colors: ["#4a6dca", "#e0e7ff"] },
    { name: "theme-ocean", label: "okyanus_teması", colors: ["#3b82f6", "#dbeafe"] },
    { name: "theme-forest", label: "orman_teması", colors: ["#228b22", "#e8f5e9"] },
    { name: "theme-purple", label: "mor_tema", colors: ["#8b5cf6", "#ede9fe"] }
]


export default function SettingsPage() {
    const auth = useContext(AuthContext);
    const { t } = useI18n();
    const { setTheme: setNextTheme, theme: nextTheme } = useTheme();

    if (!auth || !auth.user) return null;
    const { user, role, appTheme, setAppTheme, updateUserPreferences } = auth;

    const handleLanguageChange = (value: string) => {
        if (user) {
            updateUserPreferences(user.id, { language: value as Language });
        }
    };
    
    const handleThemeChange = (value: string) => {
        setAppTheme(value);
    }

    return (
        <AppLayout>
            <PageHeader title={t('settings_title')} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('settings_appearance_title')}</CardTitle>
                            <CardDescription>{t('settings_appearance_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label>{t('görünüm_modu_label')}</Label>
                                <div className="flex gap-2">
                                    <Button 
                                        variant={nextTheme === 'light' ? 'default' : 'outline'}
                                        onClick={() => setNextTheme('light')}
                                    >
                                        <Sun className="me-2"/>
                                        {t('açık_mod_label')}
                                    </Button>
                                    <Button 
                                        variant={nextTheme === 'dark' ? 'default' : 'outline'}
                                        onClick={() => setNextTheme('dark')}
                                    >
                                        <Moon className="me-2"/>
                                        {t('koyu_mod_label')}
                                    </Button>
                                </div>
                            </div>

                             {role === 'genel_mudur' && (
                                 <div className="grid gap-2">
                                    <Label htmlFor="theme">{t('app_theme_label')}</Label>
                                    <Select value={appTheme} onValueChange={handleThemeChange}>
                                        <SelectTrigger id="theme">
                                            <SelectValue placeholder={t('app_theme_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {themes.map(theme => (
                                                <SelectItem key={theme.name} value={theme.name}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-1">
                                                            {theme.colors.map(color => (
                                                                <div key={color} className="w-4 h-4 rounded-full border-2 border-white" style={{backgroundColor: color}}></div>
                                                            ))}
                                                        </div>
                                                        <span>{t(theme.label as any)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">{t('app_theme_desc')}</p>
                                </div>
                             )}
                            <div className="grid gap-2">
                                <Label htmlFor="language">{t('settings_language')}</Label>
                                <Select value={user.language} onValueChange={handleLanguageChange}>
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder={t('settings_language_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tr">Türkçe</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ar">العربية</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
