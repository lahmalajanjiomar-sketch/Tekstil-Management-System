
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useContext } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Warehouse,
  LogOut,
  IdCard,
  List,
  History,
} from "lucide-react"
import {
  KhsayemTekstilLogo
} from "@/components/logo"
import { AuthContext, UserRole } from "@/context/auth-context"
import { Button } from "./ui/button";
import { useI18n } from "@/context/i18n-context";
import type { TranslationKey } from "@/lib/locales";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const auth = useContext(AuthContext);
  const { t, lang } = useI18n();

  const allMenuItems = [
    { href: "/", label: t('sidebar_home'), icon: Home, roles: ['genel_mudur', 'muhasebeci', 'satis_elemani'] },
    { href: "/orders", label: t('sidebar_orders'), icon: ShoppingCart, roles: ['genel_mudur', 'satis_elemani', 'muhasebeci'] },
    { href: "/products", label: t('sidebar_products'), icon: Package, roles: ['genel_mudur', 'satis_elemani', 'muhasebeci', 'depo_muduru'] },
    { href: "/customers", label: t('sidebar_customers'), icon: Users, roles: ['genel_mudur', 'satis_elemani', 'muhasebeci'] },
    { href: "/depot/list", label: t('sidebar_stock_list'), icon: List, roles: ['genel_mudur', 'depo_muduru', 'muhasebeci'] },
    { href: "/depot", label: t('sidebar_depot_management'), icon: Warehouse, roles: ['genel_mudur', 'depo_muduru'] },
  ]

  if (!auth) {
    return null;
  }
  const { role, user, logout } = auth;

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="mb-4">{t('auth_required_message')}</p>
            <Link href="/login">
                <Button>{t('go_to_login_button')}</Button>
            </Link>
        </div>
    );
  }

  const menuItems = allMenuItems.filter(item => item.roles.includes(role as UserRole));
  const sidebarSide = lang === 'ar' ? 'right' : 'left';
  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side={sidebarSide}>
        <SidebarHeader>
          <KhsayemTekstilLogo fallbackText="KT" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             {role === 'genel_mudur' && (
                <>
                  <SidebarMenuItem>
                      <Link href="/personnel">
                          <SidebarMenuButton tooltip={t('sidebar_personnel')} isActive={pathname.startsWith('/personnel')}>
                              <IdCard />
                              <span>{t('sidebar_personnel')}</span>
                          </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/history">
                        <SidebarMenuButton tooltip={t('history_title')} isActive={pathname.startsWith('/history')}>
                            <History />
                            <span>{t('history_title')}</span>
                        </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
             )}
            <SidebarMenuItem>
                <Link href="/settings">
                    <SidebarMenuButton tooltip={t('sidebar_settings')} isActive={pathname.startsWith('/settings')}>
                        <Settings />
                        <span>{t('sidebar_settings')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar_logout')} onClick={logout}>
                    <LogOut />
                    <span>{t('sidebar_logout')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <span className="text-lg font-medium font-headline text-primary">Khsayem Tekstil</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 text-end">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">({t(`role_${user.role}` as TranslationKey)})</span>
               </div>
               <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
