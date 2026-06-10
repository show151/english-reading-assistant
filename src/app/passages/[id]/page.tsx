import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ReadingView } from "@/components/reading/reading-view";
import { getPassageById } from "@/lib/passages";

type PageProps = { params: Promise<{ id: string }> };

export default async function PassageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  let passage;
  try {
    passage = await getPassageById(id);
  } catch {
    notFound();
  }

  if (!passage) notFound();

  if (passage.status !== "published" && session?.user?.role !== "admin") {
    notFound();
  }

  return <ReadingView passage={passage} />;
}
