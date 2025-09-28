
"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BusList } from "./BusList";
import { PanelRight } from "lucide-react";
import type { Bus } from "@/lib/data";

interface BusListSidebarProps {
  buses: Bus[];
}

export function BusListSidebar({ buses }: BusListSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="shadow-lg"
        >
          <PanelRight className="mr-2 h-4 w-4" />
          Show Bus List
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0 sr-only">
            <SheetTitle>Bus List</SheetTitle>
        </SheetHeader>
        <BusList buses={buses} />
      </SheetContent>
    </Sheet>
  );
}
