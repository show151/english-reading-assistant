"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Passage, StudyHistory } from "@/lib/types";

interface PassageSidebarProps {
  passages: Passage[];
  history?: Array<StudyHistory & { passage: Passage }>;
}

export function PassageSidebar({ passages, history = [] }: PassageSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/20 lg:block">
      <div className="p-4">
        <h2 className="mb-3 text-sm font-semibold">教材一覧</h2>
        <ScrollArea className="h-[40vh]">
          <ul className="space-y-1">
            {passages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/passages/${p.id}`}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    pathname === `/passages/${p.id}` && "bg-accent font-medium"
                  )}
                >
                  {p.title}
                  {p.level && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {p.level}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>

        {history.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-semibold">学習進捗</h2>
            <ScrollArea className="h-[25vh]">
              <ul className="space-y-1">
                {history.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/passages/${h.passage_id}`}
                      className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {h.passage?.title ?? "教材"}
                      <span className="mt-0.5 block text-[10px]">
                        最終: {new Date(h.last_opened_at).toLocaleDateString("ja-JP")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </>
        )}
      </div>
    </aside>
  );
}
