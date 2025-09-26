
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
  Settings,
  CircleUser,
  Bot,
  MapPin
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const BusLogo = () => (
    <span className="text-3xl">🚍</span>
  );

export function SidebarNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const menuItems = [
    { href: "/", icon: <LayoutDashboard />, label: 'dashboard' },
    { href: "/map", icon: <Map />, label: 'live_map' },
    { href: "/analytics", icon: <BarChart2 />, label: 'analytics' },
    { href: "/route-optimizer", icon: <Bot />, label: 'route_optimizer' },
    { href: "/route-generator", icon: <Bot />, label: 'route_generator' },
    { href: "/alerts", icon: <Bell />, label: 'alerts' },
    { href: "/stop-import", icon: <MapPin />, label: 'stop_import' },
  ];

  const footerMenuItems = [
    { href: "/settings", icon: <Settings />, label: 'settings' },
    { href: "/profile", icon: <CircleUser />, label: 'profile' },
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
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href && item.href !== '/' || (pathname.startsWith(item.href) && item.href !== '/')}
              >
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
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
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
