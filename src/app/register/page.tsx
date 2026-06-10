import { BookOpen } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">新規登録</CardTitle>
            <CardDescription>
              アカウントを作成して学習を始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </AuthSessionProvider>
  );
}
