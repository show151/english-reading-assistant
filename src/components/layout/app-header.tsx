"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, LogOut, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/passages" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" />
          English Reading Assistant
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              <Settings className="mr-1 h-4 w-4" />
              管理
            </Link>
          )}
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-1 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
