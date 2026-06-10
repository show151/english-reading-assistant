"use client";

import { buildAnnotatedSegments } from "@/lib/annotations";
import type { Annotation } from "@/lib/types";
import { AnnotationPopup } from "./annotation-popup";

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
  paragraphOffset: number;
}

export function AnnotatedText({
  text,
  annotations,
  paragraphOffset,
}: AnnotatedTextProps) {
  const segments = buildAnnotatedSegments(text, paragraphOffset, annotations);

  return (
    <>
      {segments.map((segment, index) =>
        segment.annotation ? (
          <AnnotationPopup key={index} annotation={segment.annotation}>
            {segment.text}
          </AnnotationPopup>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </>
  );
}
