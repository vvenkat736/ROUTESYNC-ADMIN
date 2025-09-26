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
  BarChart2,
  Bell,
  FileUp,
  Settings,
  CircleUser,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const BusLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  );

const MapBusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.2 6.22c.2.4.21.89.02 1.32l-1.45 3.4c-.11.25-.33.42-.59.46H5.82c-.26-.04-.48-.21-.59-.46L3.78 7.54c-.19-.43-.18-.92.02-1.32.2-.4.58-.64 1-.64h12.4c.42 0 .8.24 1 .64z" />
        <path d="M3 11h18" />
        <path d="M12 11v3.5" />
        <path d="M10.5 14.5h3" />
        <path d="M12 19a4 4 0 0 1-4-4" />
        <path d="M16 15a4 4 0 0 0-4-4" />
    </svg>
);

export function SidebarNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const menuItems = [
    { href: "/", icon: <LayoutDashboard />, label: 'dashboard' },
    { href: "#", icon: <MapBusIcon />, label: 'live_map' },
    { href: "#", icon: <BarChart2 />, label: 'analytics' },
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
