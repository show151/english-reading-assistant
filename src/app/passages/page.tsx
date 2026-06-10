import Link from "next/link";
import { getPublishedPassages } from "@/lib/passages";
import type { Passage } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PassagesPage() {
  let passages: Passage[] = [];
  let error = false;

  try {
    passages = await getPublishedPassages();
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>セットアップが必要です</CardTitle>
            <CardDescription>
              Supabaseの環境変数を設定し、マイグレーションを実行してください。
              .env.example を参照してください。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">教材一覧</h1>
      {passages.length === 0 ? (
        <p className="text-muted-foreground">公開中の教材はありません。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passages.map((p) => (
            <Link key={p.id} href={`/passages/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <CardDescription className="flex gap-2">
                    {p.level && <Badge variant="outline">{p.level}</Badge>}
                    {p.genre && <Badge variant="secondary">{p.genre}</Badge>}
                  </CardDescription>
                </CardHeader>
                {p.summary && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {p.summary}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
