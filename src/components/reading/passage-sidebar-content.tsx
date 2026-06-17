"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Passage, StudyHistory } from "@/lib/types";

interface PassageSidebarContentProps {
  passages: Passage[];
  history?: Array<StudyHistory & { passage: Passage }>;
  onNavigate?: () => void;
}

export function PassageSidebarContent({
  passages,
  history = [],
  onNavigate,
}: PassageSidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-3 text-sm font-semibold">教材一覧</h2>
      <ScrollArea className="min-h-0 flex-1 lg:max-h-[40vh]">
        <ul className="space-y-1 pr-2">
          {passages.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              公開中の教材はありません
            </li>
          ) : (
            passages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/passages/${p.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    pathname === `/passages/${p.id}` && "bg-accent font-medium"
                  )}
                >
                  <span className="line-clamp-2">{p.title}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>

      {history.length > 0 && (
        <>
          <h2 className="mb-3 mt-6 text-sm font-semibold">学習進捗</h2>
          <ScrollArea className="min-h-0 flex-1 lg:max-h-[25vh]">
            <ul className="space-y-1 pr-2">
              {history.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/passages/${h.passage_id}`}
                    onClick={onNavigate}
                    className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <span className="line-clamp-2">
                      {h.passage?.title ?? "教材"}
                    </span>
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
  );
}
