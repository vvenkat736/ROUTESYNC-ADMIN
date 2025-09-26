"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageToggle } from "./LanguageToggle"
import { AlertsPopover } from "./AlertsPopover"
import { useLanguage } from "@/hooks/use-language"

export function Header() {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-semibold font-headline tracking-tight text-primary">
        {t('app_name_admin')}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <AlertsPopover />
      </div>
    </header>
  )
}
