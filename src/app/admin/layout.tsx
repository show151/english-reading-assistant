import { AppHeader } from "@/components/layout/app-header";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">{children}</main>
    </AuthSessionProvider>
  );
}
