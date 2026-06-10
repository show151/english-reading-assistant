import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllPassages } from "@/lib/passages";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Passage, PassageStatus } from "@/lib/types";

const STATUS_LABELS: Record<PassageStatus, string> = {
  draft: "下書き",
  published: "公開",
  archived: "非公開",
};

const STATUS_VARIANT: Record<PassageStatus, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
};

export default async function AdminPage() {
  let passages: Passage[] = [];
  try {
    passages = await getAllPassages();
  } catch {
    return (
      <Card>
        <CardHeader>
          <CardTitle>セットアップが必要です</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            .env.example の環境変数を設定し、supabase/migrations/001_initial.sql を実行してください。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">教材管理</h1>
        <Link
          href="/admin/passages/new"
          className={cn(buttonVariants(), "inline-flex w-full justify-center sm:w-auto")}
        >
          <Plus className="mr-2 h-4 w-4" />
          新規登録
        </Link>
      </div>

      {passages.length === 0 ? (
        <p className="text-muted-foreground">教材がありません。</p>
      ) : (
        <div className="space-y-3">
          {passages.map((p) => (
            <Link key={p.id} href={`/admin/passages/${p.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.level} · {p.genre}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]}>
                    {STATUS_LABELS[p.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
