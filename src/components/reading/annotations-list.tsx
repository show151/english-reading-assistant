"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ANNOTATION_LABELS } from "@/lib/annotations";
import type { Annotation } from "@/lib/types";

interface AnnotationsListProps {
  annotations: Annotation[];
}

const TYPE_VARIANT: Record<Annotation["type"], "default" | "secondary" | "destructive" | "outline"> = {
  word: "default",
  phrase: "secondary",
  grammar: "destructive",
  structure: "outline",
};

export function AnnotationsList({ annotations }: AnnotationsListProps) {
  if (annotations.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">注釈はまだありません。</p>
    );
  }

  return (
    <ScrollArea className="h-full">
      <ul className="space-y-2 p-4">
        {annotations.map((ann) => (
          <li key={ann.id} className="rounded-md border p-3 text-sm">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-medium">{ann.target_text}</span>
              <Badge variant={TYPE_VARIANT[ann.type]}>
                {ANNOTATION_LABELS[ann.type]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{ann.meaning}</p>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
