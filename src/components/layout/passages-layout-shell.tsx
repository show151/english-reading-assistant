"use client";

import { AppHeader } from "@/components/layout/app-header";
import { MobilePassageDrawer } from "@/components/reading/mobile-passage-drawer";
import { PassageSidebar } from "@/components/reading/passage-sidebar";
import type { Passage, StudyHistory } from "@/lib/types";

interface PassagesLayoutShellProps {
  passages: Passage[];
  history: Array<StudyHistory & { passage: Passage }>;
  children: React.ReactNode;
}

export function PassagesLayoutShell({
  passages,
  history,
  children,
}: PassagesLayoutShellProps) {
  return (
    <>
      <AppHeader mobileNav={<MobilePassageDrawer passages={passages} history={history} />} />
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <PassageSidebar passages={passages} history={history} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
