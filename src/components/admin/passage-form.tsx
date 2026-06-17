"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function PassageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>, targetStatus: "draft" | "published") {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/passages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, status: targetStatus }),
      });

      if (!res.ok) throw new Error("Failed to create");
      const passage = await res.json();
      router.push(`/admin/passages/${passage.id}`);
    } catch (error) {
      console.error(error);
      alert("教材の作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規教材登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">本文（段落は空行で区切る）</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              required
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-4">
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, "draft")} 
              disabled={loading || !title || !content} 
              variant="secondary"
            >
              {loading ? "保存中..." : "下書きとして保存"}
            </Button>
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, "published")} 
              disabled={loading || !title || !content}
            >
              {loading ? "保存中..." : "公開して保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
