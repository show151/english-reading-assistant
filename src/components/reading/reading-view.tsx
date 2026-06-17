"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnotatedText } from "./annotated-text";
import { TranslationPanel } from "./translation-panel";
import { AnnotationsList } from "./annotations-list";
import { MobileReadingPanel } from "./mobile-reading-panel";
import { computeParagraphOffsets } from "@/lib/annotations";
import type { PassageWithDetails } from "@/lib/types";

interface ReadingViewProps {
  passage: PassageWithDetails;
}

type MobilePanel = "closed" | "translation" | "annotations";

export function ReadingView({ passage }: ReadingViewProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("closed");

  const paragraphTexts =
    passage.paragraphs.length > 0
      ? passage.paragraphs.map((p) => p.content)
      : passage.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const paragraphOffsets = computeParagraphOffsets(
    passage.content,
    paragraphTexts
  );

  const mobilePanelOpen = mobilePanel !== "closed";

  useEffect(() => {
    fetch("/api/study-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passageId: passage.id }),
    }).catch(console.error);
  }, [passage.id]);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
      {/* 中央: 英文本文 */}
      <article
        className={`space-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 ${
          mobilePanelOpen ? "pb-52" : "pb-24"
        } xl:pb-6`}
      >
        <header>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {passage.title}
          </h1>
        </header>

        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-2 text-xs text-muted-foreground xl:hidden">
          下線の単語・フレーズをタップすると意味が表示されます
        </div>

        {paragraphTexts.map((text, index) => (
          <p
            key={index}
            className="text-base leading-[1.85] sm:text-lg sm:leading-relaxed"
          >
            <AnnotatedText
              text={text}
              annotations={passage.annotations}
              paragraphOffset={paragraphOffsets[index] ?? 0}
            />
          </p>
        ))}
      </article>

      {/* PC: 右サイドバー（和訳・注釈） */}
      <aside className="hidden border-l bg-muted/10 xl:block">
        <div className="sticky top-0 flex h-[calc(100dvh-3.5rem)] flex-col">
          <Tabs defaultValue="translation" className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto shrink-0 grid-cols-2">
              <TabsTrigger value="translation">和訳・要約</TabsTrigger>
              <TabsTrigger value="annotations">
                注釈 ({passage.annotations.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="translation" className="min-h-0 flex-1 overflow-hidden">
              <div className="px-4 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  {showTranslation ? (
                    <EyeOff className="mr-1 h-4 w-4" />
                  ) : (
                    <Eye className="mr-1 h-4 w-4" />
                  )}
                  {showTranslation ? "全文和訳を隠す" : "全文和訳を表示"}
                </Button>
              </div>
              <TranslationPanel
                passage={passage}
                showFullTranslation={showTranslation}
              />
            </TabsContent>
            <TabsContent value="annotations" className="min-h-0 flex-1 overflow-hidden">
              <AnnotationsList annotations={passage.annotations} />
            </TabsContent>
          </Tabs>
        </div>
      </aside>

      {/* スマホ: 下部パネル */}
      <MobileReadingPanel
        passage={passage}
        panel={mobilePanel}
        showFullTranslation={showTranslation}
        onPanelChange={setMobilePanel}
        onToggleFullTranslation={() => setShowTranslation(!showTranslation)}
      />
    </div>
  );
}
