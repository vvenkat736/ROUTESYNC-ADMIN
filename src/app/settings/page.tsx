
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useLanguage } from "@/hooks/use-language";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar className="border-r" side="left" collapsible="offcanvas">
          <SidebarNav />
        </Sidebar>
        <div className="flex-1">
          <Header />
          <main className="p-4 lg:p-6">
             <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-semibold">{t('settings')}</h1>
            </div>
            <p className="text-muted-foreground mt-2">
                This is a placeholder page for settings.
            </p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
