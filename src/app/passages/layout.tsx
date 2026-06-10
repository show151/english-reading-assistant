import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { PassageSidebar } from "@/components/reading/passage-sidebar";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { getPublishedPassages, getStudyHistory } from "@/lib/passages";
import type { Passage, StudyHistory } from "@/lib/types";

export default async function PassagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let passages: Passage[] = [];
  let history: Array<StudyHistory & { passage: Passage }> = [];

  try {
    passages = await getPublishedPassages();
    if (session?.user?.id) {
      history = await getStudyHistory(session.user.id);
    }
  } catch {
    // DB未設定時はサイドバーを空で表示
  }

  return (
    <AuthSessionProvider>
      <AppHeader />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <PassageSidebar passages={passages} history={history} />
        <main className="flex-1">{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
