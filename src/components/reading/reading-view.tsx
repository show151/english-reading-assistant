"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnnotatedText } from "./annotated-text";
import { TranslationPanel } from "./translation-panel";
import { AnnotationsList } from "./annotations-list";
import { getParagraphOffset } from "@/lib/annotations";
import type { PassageWithDetails } from "@/lib/types";

interface ReadingViewProps {
  passage: PassageWithDetails;
}

export function ReadingView({ passage }: ReadingViewProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  const paragraphTexts =
    passage.paragraphs.length > 0
      ? passage.paragraphs.map((p) => p.content)
      : passage.content.split(/\n\s*\n/).filter(Boolean);

  useEffect(() => {
    fetch("/api/study-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passageId: passage.id }),
    }).catch(console.error);
  }, [passage.id]);

  const mainContent = (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{passage.title}</h1>
        <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
          {passage.level && <span>レベル: {passage.level}</span>}
          {passage.genre && <span>ジャンル: {passage.genre}</span>}
        </div>
      </header>

      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
          {showTranslation ? "和訳を隠す" : "和訳を表示"}
        </Button>
        <Sheet>
          <SheetTrigger
            className="inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
          >
            注釈一覧
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>注釈一覧</SheetTitle>
            </SheetHeader>
            <AnnotationsList annotations={passage.annotations} />
          </SheetContent>
        </Sheet>
      </div>

      {paragraphTexts.map((text, index) => (
        <p key={index} className="text-lg leading-relaxed">
          <AnnotatedText
            text={text}
            annotations={passage.annotations}
            offset={getParagraphOffset(paragraphTexts, index)}
          />
        </p>
      ))}

      {showTranslation && (
        <div className="rounded-lg border bg-muted/30 p-4 lg:hidden">
          <TranslationPanel passage={passage} showFullTranslation />
        </div>
      )}
    </article>
  );

  const sidebar = (
    <aside className="hidden h-[calc(100vh-3.5rem)] border-l lg:block">
      <Tabs defaultValue="translation" className="flex h-full flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
          <TabsTrigger value="translation">和訳・要約</TabsTrigger>
          <TabsTrigger value="annotations">注釈一覧</TabsTrigger>
        </TabsList>
        <TabsContent value="translation" className="flex-1 overflow-hidden">
          <div className="px-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              {showTranslation ? "全文和訳を隠す" : "全文和訳を表示"}
            </Button>
          </div>
          <TranslationPanel passage={passage} showFullTranslation={showTranslation} />
        </TabsContent>
        <TabsContent value="annotations" className="flex-1 overflow-hidden">
          <AnnotationsList annotations={passage.annotations} />
        </TabsContent>
      </Tabs>
    </aside>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_320px]">
      <div className="p-6">{mainContent}</div>
      {sidebar}
    </div>
  );
}
