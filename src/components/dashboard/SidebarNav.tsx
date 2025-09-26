"use client"

import * as React from "react"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Map,
  BarChart2,
  Bell,
  FileUp,
  Settings,
  CircleUser,
  Bot
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const BusLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  );

export function SidebarNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const menuItems = [
    { href: "/", icon: <LayoutDashboard />, label: 'dashboard' },
    { href: "/map", icon: <Map />, label: 'live_map' },
    { href: "/analytics", icon: <BarChart2 />, label: 'analytics' },
    { href: "/route-optimizer", icon: <Bot />, label: 'route_optimizer' },
    { href: "#", icon: <Bell />, label: 'alerts' },
    { href: "#", icon: <FileUp />, label: 'route_import' },
  ];

  const footerMenuItems = [
    { href: "#", icon: <Settings />, label: 'settings' },
    { href: "#", icon: <CircleUser />, label: 'profile' },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BusLogo />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold font-headline tracking-tight text-primary">
              {t('app_name')}
            </h2>
            <p className="text-xs text-muted-foreground">{t('admin_panel')}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{t(item.label as any)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          {footerMenuItems.map(item => (
             <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{t(item.label as any)}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
