import { notFound } from "next/navigation";
import { PassageEditor } from "@/components/admin/passage-editor";
import { getPassageById } from "@/lib/passages";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminPassagePage({ params }: PageProps) {
  const { id } = await params;

  let passage;
  try {
    passage = await getPassageById(id);
  } catch {
    notFound();
  }

  if (!passage) notFound();

  return <PassageEditor initialPassage={passage} />;
}
