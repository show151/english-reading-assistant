"use client";

import { PassageSidebarContent } from "./passage-sidebar-content";
import type { Passage, StudyHistory } from "@/lib/types";

interface PassageSidebarProps {
  passages: Passage[];
  history?: Array<StudyHistory & { passage: Passage }>;
}

export function PassageSidebar({ passages, history = [] }: PassageSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/20 xl:block xl:w-64">
      <PassageSidebarContent passages={passages} history={history} />
    </aside>
  );
}
