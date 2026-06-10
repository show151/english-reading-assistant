import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">English Reading Assistant</CardTitle>
          <CardDescription>
            英文を読みながら、分からない部分だけ確認できる読解支援アプリ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/passages" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Googleでログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
