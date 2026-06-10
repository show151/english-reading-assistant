"use client";

import { BookMarked, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranslationPanel } from "./translation-panel";
import { AnnotationsList } from "./annotations-list";
import type { PassageWithDetails } from "@/lib/types";

type MobilePanel = "closed" | "translation" | "annotations";

interface MobileReadingPanelProps {
  passage: PassageWithDetails;
  panel: MobilePanel;
  showFullTranslation: boolean;
  onPanelChange: (panel: MobilePanel) => void;
  onToggleFullTranslation: () => void;
}

export function MobileReadingPanel({
  passage,
  panel,
  showFullTranslation,
  onPanelChange,
  onToggleFullTranslation,
}: MobileReadingPanelProps) {
  const isOpen = panel !== "closed";

  function toggle(next: "translation" | "annotations") {
    onPanelChange(panel === next ? "closed" : next);
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.08)] xl:hidden",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      {isOpen && (
        <div className="max-h-[45vh] overflow-y-auto border-b">
          {panel === "translation" && (
            <div>
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="text-sm font-medium">和訳・要約</span>
                <button
                  type="button"
                  onClick={onToggleFullTranslation}
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  {showFullTranslation ? "全文を隠す" : "全文を表示"}
                </button>
              </div>
              <TranslationPanel
                passage={passage}
                showFullTranslation={showFullTranslation}
              />
            </div>
          )}
          {panel === "annotations" && (
            <div>
              <div className="border-b px-4 py-2">
                <span className="text-sm font-medium">注釈一覧</span>
              </div>
              <AnnotationsList annotations={passage.annotations} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 p-2">
        <button
          type="button"
          onClick={() => toggle("translation")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            panel === "translation"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-foreground hover:bg-muted"
          )}
        >
          <Languages className="h-4 w-4" />
          和訳
        </button>
        <button
          type="button"
          onClick={() => toggle("annotations")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            panel === "annotations"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-foreground hover:bg-muted"
          )}
        >
          <BookMarked className="h-4 w-4" />
          注釈
          {passage.annotations.length > 0 && (
            <span className="rounded-full bg-background/20 px-1.5 text-xs">
              {passage.annotations.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
