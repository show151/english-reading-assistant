"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ANNOTATION_COLORS, ANNOTATION_LABELS } from "@/lib/annotations";
import type { Annotation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnnotationPopupProps {
  annotation: Annotation;
  children: React.ReactNode;
}

export function AnnotationPopup({ annotation, children }: AnnotationPopupProps) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn(
          "inline rounded-sm border-0 bg-transparent p-0 px-0.5 transition-colors",
          ANNOTATION_COLORS[annotation.type]
        )}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{annotation.target_text}</span>
            <Badge variant="secondary">{ANNOTATION_LABELS[annotation.type]}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">意味</p>
            <p className="text-sm">{annotation.meaning}</p>
          </div>
          {annotation.part_of_speech && (
            <div>
              <p className="text-xs text-muted-foreground">品詞 / 分類</p>
              <p className="text-sm">{annotation.part_of_speech}</p>
            </div>
          )}
          {annotation.example && (
            <div>
              <p className="text-xs text-muted-foreground">例文</p>
              <p className="text-sm italic">{annotation.example}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
