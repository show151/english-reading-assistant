"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PassageSidebarContent } from "./passage-sidebar-content";
import type { Passage, StudyHistory } from "@/lib/types";

interface MobilePassageDrawerProps {
  passages: Passage[];
  history?: Array<StudyHistory & { passage: Passage }>;
}

export function MobilePassageDrawer({ passages, history = [] }: MobilePassageDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted xl:hidden"
        aria-label="教材一覧を開く"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>教材・進捗</SheetTitle>
        </SheetHeader>
        <PassageSidebarContent passages={passages} history={history} />
      </SheetContent>
    </Sheet>
  );
}
