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

const TYPE_PRIORITY: Record<AnnotationType, number> = {
  phrase: 4,
  structure: 3,
  grammar: 2,
  word: 1,
};

interface LocalAnnotation extends Annotation {
  localStart: number;
  localEnd: number;
}

interface IndexableAnnotation {
  targetText: string;
  startIndex?: number;
  endIndex?: number;
}

/** 本文中の targetText 出現位置をすべて返す */
function findAllOccurrences(content: string, target: string): number[] {
  if (!target) return [];
  const positions: number[] = [];
  let pos = 0;
  while (pos < content.length) {
    const idx = content.indexOf(target, pos);
    if (idx === -1) break;
    positions.push(idx);
    pos = idx + 1;
  }
  return positions;
}

/** AIのインデックスを targetText 検索で補正 */
export function resolveAnnotationIndices(
  content: string,
  annotations: IndexableAnnotation[]
): Array<{ start_index: number; end_index: number }> {
  const claimed: Array<[number, number]> = [];

  return annotations.map((ann) => {
    const target = ann.targetText;
    if (!target) {
      return {
        start_index: ann.startIndex ?? 0,
        end_index: ann.endIndex ?? 0,
      };
    }

    let candidates = findAllOccurrences(content, target);

    if (candidates.length === 0) {
      const lowerContent = content.toLowerCase();
      const lowerTarget = target.toLowerCase();
      candidates = findAllOccurrences(lowerContent, lowerTarget);
    }

    if (candidates.length === 0) {
      const start = ann.startIndex ?? 0;
      return { start_index: start, end_index: start + target.length };
    }

    let best = candidates[0];
    if (candidates.length > 1 && ann.startIndex !== undefined) {
      best = candidates.reduce((a, b) =>
        Math.abs(a - ann.startIndex!) <= Math.abs(b - ann.startIndex!) ? a : b
      );
    }

    // 既に使われた範囲と重なる場合は別候補を試す
    for (const candidate of candidates) {
      const end = candidate + target.length;
      const overlaps = claimed.some(
        ([s, e]) => candidate < e && end > s
      );
      if (!overlaps) {
        best = candidate;
        break;
      }
    }

    const end = best + target.length;
    claimed.push([best, end]);
    return { start_index: best, end_index: end };
  });
}

/** 段落テキストが本文のどこから始まるかを検索で求める */
export function computeParagraphOffsets(
  fullContent: string,
  paragraphTexts: string[]
): number[] {
  const offsets: number[] = [];
  let searchFrom = 0;

  for (let i = 0; i < paragraphTexts.length; i++) {
    const para = paragraphTexts[i];
    const idx = fullContent.indexOf(para, searchFrom);

    if (idx >= 0) {
      offsets.push(idx);
      searchFrom = idx + para.length;
      continue;
    }

    // フォールバック: 前段落の直後 + 区切り改行分
    if (i === 0) {
      offsets.push(0);
      searchFrom = para.length;
    } else {
      const prev = offsets[i - 1] + paragraphTexts[i - 1].length;
      offsets.push(prev);
      searchFrom = prev + para.length;
    }
  }

  return offsets;
}

/** 段落内に属する注釈をローカル座標に変換 */
function getParagraphAnnotations(
  paragraphText: string,
  paragraphOffset: number,
  annotations: Annotation[]
): LocalAnnotation[] {
  const paraStart = paragraphOffset;
  const paraEnd = paragraphOffset + paragraphText.length;
  const resolved: LocalAnnotation[] = [];

  for (const ann of annotations) {
    let localStart = -1;
    let localEnd = -1;

    // 1. 保存済みインデックスが段落内で target_text と一致するか
    if (ann.end_index > paraStart && ann.start_index < paraEnd) {
      const start = Math.max(ann.start_index, paraStart) - paraStart;
      const end = Math.min(ann.end_index, paraEnd) - paraStart;
      const slice = paragraphText.slice(start, end);
      if (slice === ann.target_text) {
        localStart = start;
        localEnd = end;
      }
    }

    // 2. 段落内を target_text で検索（複数候補はグローバル index に近い方）
    if (localStart < 0) {
      const candidates = findAllOccurrences(paragraphText, ann.target_text);
      if (candidates.length === 1) {
        localStart = candidates[0];
        localEnd = localStart + ann.target_text.length;
      } else if (candidates.length > 1) {
        const preferredLocal = ann.start_index - paraStart;
        const best = candidates.reduce((a, b) =>
          Math.abs(a - preferredLocal) <= Math.abs(b - preferredLocal) ? a : b
        );
        localStart = best;
        localEnd = best + ann.target_text.length;
      }
    }

    if (localStart >= 0 && localEnd > localStart) {
      resolved.push({ ...ann, localStart, localEnd });
    }
  }

  // 長いフレーズを優先し、重複を除去
  return resolved
    .sort((a, b) => {
      if (a.localStart !== b.localStart) return a.localStart - b.localStart;
      const lenA = a.localEnd - a.localStart;
      const lenB = b.localEnd - b.localStart;
      if (lenA !== lenB) return lenB - lenA;
      return TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type];
    })
    .filter((ann, i, arr) => {
      for (let j = 0; j < i; j++) {
        const prev = arr[j];
        if (ann.localStart < prev.localEnd && ann.localEnd > prev.localStart) {
          return false;
        }
      }
      return true;
    });
}

export function buildAnnotatedSegments(
  paragraphText: string,
  paragraphOffset: number,
  annotations: Annotation[]
): TextSegment[] {
  const relevant = getParagraphAnnotations(
    paragraphText,
    paragraphOffset,
    annotations
  );

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const ann of relevant) {
    if (ann.localStart < cursor) continue;

    if (ann.localStart > cursor) {
      segments.push({ text: paragraphText.slice(cursor, ann.localStart) });
    }

    segments.push({
      text: paragraphText.slice(ann.localStart, ann.localEnd),
      annotation: ann,
    });
    cursor = ann.localEnd;
  }

  if (cursor < paragraphText.length) {
    segments.push({ text: paragraphText.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ text: paragraphText }];
}

/** @deprecated computeParagraphOffsets を使用 */
export function getParagraphOffset(
  paragraphs: string[],
  paragraphIndex: number
): number {
  return computeParagraphOffsets(paragraphs.join("\n\n"), paragraphs)[
    paragraphIndex
  ] ?? 0;
}
