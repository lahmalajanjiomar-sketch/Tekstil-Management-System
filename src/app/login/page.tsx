
"use client"

import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { KhsayemTekstilLogo } from '@/components/logo';
import { useI18n, Language } from '@/context/i18n-context';
import { useToast } from '@/hooks/use-toast';
import type { TranslationKey } from '@/lib/locales';

export default function LoginPage() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const auth = useContext(AuthContext);
    const { t, setLang, lang } = useI18n();
    const { toast } = useToast();

    const handleLogin = () => {
        if (selectedUserId && password && auth) {
            const success = auth.login(selectedUserId, password);
            if (!success) {
                toast({
                    variant: "destructive",
                    title: t('login_error_title'),
                    description: t('login_error_desc'),
                });
            }
        }
    };
    
    if (!auth) return null; // or a loading spinner
    const { users } = auth;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader className="items-center text-center">
                        <KhsayemTekstilLogo fallbackText="KT" />
                        <CardTitle>{t('login_title')}</CardTitle>
                        <CardDescription>Entegre Sipariş, Stok ve Depo Yönetim Uygulaması</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user">{t('login_personnel')}</Label>
                            <Select onValueChange={(value) => setSelectedUserId(value)}>
                                <SelectTrigger id="user">
                                    <SelectValue placeholder={t('login_personnel_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name} ({t(`role_${user.role}` as TranslationKey)})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="password">{t('login_password')}</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                         </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleLogin} disabled={!selectedUserId || !password}>
                            {t('login_button')}
                        </Button>
                    </CardFooter>
                </Card>
                 <div className="mt-4">
                    <Select value={lang} onValueChange={(value) => setLang(value as Language)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('settings_language_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="tr">Türkçe</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
