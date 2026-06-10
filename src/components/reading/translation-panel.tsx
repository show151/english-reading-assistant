"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Paragraph, PassageWithDetails } from "@/lib/types";

interface TranslationPanelProps {
  passage: PassageWithDetails;
  showFullTranslation: boolean;
}

export function TranslationPanel({ passage, showFullTranslation }: TranslationPanelProps) {
  const paragraphs: Paragraph[] =
    passage.paragraphs.length > 0
      ? passage.paragraphs
      : passage.content.split(/\n\s*\n/).map((content, i) => ({
          id: `temp-${i}`,
          passage_id: passage.id,
          paragraph_order: i,
          content,
          translation: null,
          summary: null,
        }));

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {showFullTranslation && passage.translation && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">全文和訳</h3>
            <p className="text-sm leading-relaxed">{passage.translation}</p>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">段落和訳</h3>
          <Accordion multiple className="w-full">
            {paragraphs.map((p, index) => (
              <AccordionItem key={p.id} value={`p-${index}`}>
                <AccordionTrigger className="text-sm">
                  段落 {index + 1}
                </AccordionTrigger>
                <AccordionContent>
                  {p.translation ? (
                    <p className="text-sm leading-relaxed">{p.translation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">和訳なし</p>
                  )}
                  {p.summary && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      要約: {p.summary}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {passage.summary && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">全体要約</h3>
            <p className="text-sm leading-relaxed">{passage.summary}</p>
          </section>
        )}
      </div>
    </ScrollArea>
  );
}
