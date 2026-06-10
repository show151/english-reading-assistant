import type { Annotation, AnnotationType, TextSegment } from "./types";

export const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  word: "border-b-2 border-blue-500 text-blue-700 hover:bg-blue-50 cursor-pointer",
  phrase: "border-b-2 border-green-500 text-green-700 hover:bg-green-50 cursor-pointer",
  grammar: "border-b-2 border-red-500 text-red-700 hover:bg-red-50 cursor-pointer",
  structure: "border-b-2 border-purple-500 text-purple-700 hover:bg-purple-50 cursor-pointer",
};

export const ANNOTATION_LABELS: Record<AnnotationType, string> = {
  word: "単語",
  phrase: "フレーズ",
  grammar: "文法",
  structure: "構文",
};

export function buildAnnotatedSegments(
  text: string,
  annotations: Annotation[],
  offset: number
): TextSegment[] {
  const relevant = annotations
    .filter((a) => a.end_index > offset && a.start_index < offset + text.length)
    .map((a) => ({
      ...a,
      localStart: Math.max(0, a.start_index - offset),
      localEnd: Math.min(text.length, a.end_index - offset),
    }))
    .sort((a, b) => a.localStart - b.localStart);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const ann of relevant) {
    if (ann.localStart < cursor) continue;
    if (ann.localStart > cursor) {
      segments.push({ text: text.slice(cursor, ann.localStart) });
    }
    segments.push({
      text: text.slice(ann.localStart, ann.localEnd),
      annotation: ann,
    });
    cursor = ann.localEnd;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

export function getParagraphOffset(
  paragraphs: string[],
  paragraphIndex: number
): number {
  let offset = 0;
  for (let i = 0; i < paragraphIndex; i++) {
    offset += paragraphs[i].length;
    offset += 2; // \n\n separator
  }
  return offset;
}
