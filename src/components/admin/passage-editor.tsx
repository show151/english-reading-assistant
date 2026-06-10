"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANNOTATION_LABELS } from "@/lib/annotations";
import type { Annotation, PassageStatus, PassageWithDetails } from "@/lib/types";

const STATUS_LABELS: Record<PassageStatus, string> = {
  draft: "下書き",
  published: "公開",
  archived: "非公開",
};

interface PassageEditorProps {
  initialPassage: PassageWithDetails;
}

export function PassageEditor({ initialPassage }: PassageEditorProps) {
  const router = useRouter();
  const [passage, setPassage] = useState(initialPassage);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/passages/${passage.id}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }
      const updated = await res.json();
      setPassage(updated);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "AI解析に失敗しました。");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/passages/${passage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: {
            title: passage.title,
            translation: passage.translation,
            summary: passage.summary,
            status: passage.status,
            level: passage.level,
            genre: passage.genre,
          },
          paragraphs: passage.paragraphs.map((p) => ({
            id: p.id,
            translation: p.translation,
            summary: p.summary,
          })),
          annotations: passage.annotations.map((a) => ({
            id: a.id,
            target_text: a.target_text,
            meaning: a.meaning,
            part_of_speech: a.part_of_speech,
            type: a.type,
            start_index: a.start_index,
            end_index: a.end_index,
            example: a.example,
          })),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setPassage(updated);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  function updateAnnotation<K extends keyof Annotation>(
    index: number,
    field: K,
    value: Annotation[K]
  ) {
    setPassage((prev) => {
      const annotations = [...prev.annotations];
      annotations[index] = { ...annotations[index], [field]: value };
      return { ...prev, annotations };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{passage.title}</h1>
          <Badge className="mt-1">{STATUS_LABELS[passage.status]}</Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={analyzing} variant="secondary">
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            解析開始
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>タイトル</Label>
            <Input
              value={passage.title}
              onChange={(e) => setPassage({ ...passage, title: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>公開設定</Label>
              <Select
                value={passage.status}
                onValueChange={(v) =>
                  v && setPassage({ ...passage, status: v as PassageStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="published">公開</SelectItem>
                  <SelectItem value="archived">非公開</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>レベル</Label>
              <Input
                value={passage.level ?? ""}
                onChange={(e) => setPassage({ ...passage, level: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ジャンル</Label>
              <Input
                value={passage.genre ?? ""}
                onChange={(e) => setPassage({ ...passage, genre: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="translation">
        <TabsList>
          <TabsTrigger value="translation">和訳・要約</TabsTrigger>
          <TabsTrigger value="annotations">注釈 ({passage.annotations.length})</TabsTrigger>
          <TabsTrigger value="content">原文</TabsTrigger>
        </TabsList>

        <TabsContent value="translation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>全文和訳</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={passage.translation ?? ""}
                onChange={(e) =>
                  setPassage({ ...passage, translation: e.target.value })
                }
                rows={6}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>全体要約</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={passage.summary ?? ""}
                onChange={(e) => setPassage({ ...passage, summary: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>
          {passage.paragraphs.map((p, index) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base">段落 {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{p.content}</p>
                <div className="space-y-2">
                  <Label>和訳</Label>
                  <Textarea
                    value={p.translation ?? ""}
                    onChange={(e) => {
                      const paragraphs = [...passage.paragraphs];
                      paragraphs[index] = { ...p, translation: e.target.value };
                      setPassage({ ...passage, paragraphs });
                    }}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>要約</Label>
                  <Textarea
                    value={p.summary ?? ""}
                    onChange={(e) => {
                      const paragraphs = [...passage.paragraphs];
                      paragraphs[index] = { ...p, summary: e.target.value };
                      setPassage({ ...passage, paragraphs });
                    }}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="annotations" className="space-y-4">
          {passage.annotations.length === 0 ? (
            <p className="text-muted-foreground">
              注釈がありません。「解析開始」を実行してください。
            </p>
          ) : (
            passage.annotations.map((ann, index) => (
              <Card key={ann.id}>
                <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>対象テキスト</Label>
                    <Input
                      value={ann.target_text}
                      onChange={(e) =>
                        updateAnnotation(index, "target_text", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>種別</Label>
                    <Select
                      value={ann.type}
                      onValueChange={(v) =>
                        updateAnnotation(index, "type", v as Annotation["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ANNOTATION_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>意味</Label>
                    <Textarea
                      value={ann.meaning}
                      onChange={(e) => updateAnnotation(index, "meaning", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>品詞</Label>
                    <Input
                      value={ann.part_of_speech ?? ""}
                      onChange={(e) =>
                        updateAnnotation(index, "part_of_speech", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>例文</Label>
                    <Input
                      value={ann.example ?? ""}
                      onChange={(e) => updateAnnotation(index, "example", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="pt-6">
              <pre className="whitespace-pre-wrap text-sm">{passage.content}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
