import { createAdminClient } from "./supabase/admin";
import { splitIntoParagraphs } from "./gemini";
import type {
  AiAnalysisResult,
  Annotation,
  Paragraph,
  Passage,
  PassageStatus,
  PassageWithDetails,
  StudyHistory,
} from "./types";

export async function getPublishedPassages(): Promise<Passage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("passages")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllPassages(): Promise<Passage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("passages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPassageById(id: string): Promise<PassageWithDetails | null> {
  const supabase = createAdminClient();

  const { data: passage, error: passageError } = await supabase
    .from("passages")
    .select("*")
    .eq("id", id)
    .single();

  if (passageError) return null;

  const { data: paragraphs } = await supabase
    .from("paragraphs")
    .select("*")
    .eq("passage_id", id)
    .order("paragraph_order");

  const { data: annotations } = await supabase
    .from("annotations")
    .select("*")
    .eq("passage_id", id)
    .order("start_index");

  return {
    ...passage,
    paragraphs: paragraphs ?? [],
    annotations: annotations ?? [],
  };
}

export async function createPassage(input: {
  title: string;
  content: string;
  level?: string;
  genre?: string;
}): Promise<Passage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("passages")
    .insert({
      title: input.title,
      content: input.content,
      level: input.level ?? null,
      genre: input.genre ?? null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePassage(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    translation: string;
    summary: string;
    level: string;
    genre: string;
    status: PassageStatus;
  }>
): Promise<Passage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("passages")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveAnalysisResult(
  passageId: string,
  content: string,
  analysis: AiAnalysisResult
): Promise<PassageWithDetails> {
  const supabase = createAdminClient();
  const paragraphTexts = splitIntoParagraphs(content);

  await supabase.from("passages").update({
    translation: analysis.translation,
    summary: analysis.summary,
  }).eq("id", passageId);

  await supabase.from("paragraphs").delete().eq("passage_id", passageId);
  await supabase.from("annotations").delete().eq("passage_id", passageId);

  const paragraphRows = paragraphTexts.map((text, index) => ({
    passage_id: passageId,
    paragraph_order: index,
    content: text,
    translation: analysis.paragraphs[index]?.translation ?? null,
    summary: analysis.paragraphs[index]?.summary ?? null,
  }));

  if (paragraphRows.length > 0) {
    const { error } = await supabase.from("paragraphs").insert(paragraphRows);
    if (error) throw error;
  }

  const annotationRows = analysis.annotations.map((a) => ({
    passage_id: passageId,
    target_text: a.targetText,
    meaning: a.meaning,
    part_of_speech: a.partOfSpeech ?? null,
    type: a.type,
    start_index: a.startIndex,
    end_index: a.endIndex,
    example: a.example ?? null,
  }));

  if (annotationRows.length > 0) {
    const { error } = await supabase.from("annotations").insert(annotationRows);
    if (error) throw error;
  }

  const result = await getPassageById(passageId);
  if (!result) throw new Error("Failed to load passage after analysis.");
  return result;
}

export async function updateAnnotations(
  passageId: string,
  annotations: Omit<Annotation, "created_at" | "passage_id">[]
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("annotations").delete().eq("passage_id", passageId);

  if (annotations.length === 0) return;

  const rows = annotations.map((a) => ({
    passage_id: passageId,
    target_text: a.target_text,
    meaning: a.meaning,
    part_of_speech: a.part_of_speech,
    type: a.type,
    start_index: a.start_index,
    end_index: a.end_index,
    example: a.example,
  }));

  const { error } = await supabase.from("annotations").insert(rows);
  if (error) throw error;
}

export async function updateParagraphs(
  paragraphs: Array<Pick<Paragraph, "id" | "translation" | "summary">>
): Promise<void> {
  const supabase = createAdminClient();
  for (const p of paragraphs) {
    const { error } = await supabase
      .from("paragraphs")
      .update({ translation: p.translation, summary: p.summary })
      .eq("id", p.id);
    if (error) throw error;
  }
}

export async function upsertStudyHistory(
  userId: string,
  passageId: string
): Promise<StudyHistory> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("study_history")
    .upsert(
      {
        user_id: userId,
        passage_id: passageId,
        last_opened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,passage_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudyHistory(userId: string): Promise<
  Array<StudyHistory & { passage: Passage }>
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("study_history")
    .select("*, passage:passages(*)")
    .eq("user_id", userId)
    .order("last_opened_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Array<StudyHistory & { passage: Passage }>;
}
