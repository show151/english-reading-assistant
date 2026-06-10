"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, LogOut, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  mobileNav?: React.ReactNode;
}

export function AppHeader({ mobileNav }: AppHeaderProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {mobileNav}
          <Link
            href="/passages"
            className="flex min-w-0 items-center gap-2 font-semibold"
          >
            <BookOpen className="h-5 w-5 shrink-0" />
            <span className="truncate text-sm sm:text-base">
              <span className="sm:hidden">Reading</span>
              <span className="hidden sm:inline">English Reading Assistant</span>
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "inline-flex px-2 sm:px-2.5"
              )}
            >
              <Settings className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">管理</span>
            </Link>
          )}
          <span className="hidden max-w-[120px] truncate text-sm text-muted-foreground md:inline lg:max-w-[180px]">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="px-2 sm:px-2.5"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
