import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiAnalysisResult } from "./types";

const ANALYSIS_PROMPT = `You are an English teaching assistant for Japanese learners.
Analyze the following English passage and return ONLY valid JSON (no markdown, no code fences).

Requirements:
1. "translation": natural Japanese translation of the entire passage
2. "summary": passage summary in Japanese (within 200 characters)
3. "paragraphs": array matching each paragraph (split by blank lines), each with:
   - "translation": Japanese translation of that paragraph
   - "summary": paragraph summary in Japanese (within 100 characters)
4. "annotations": extract important items for learners:
   - difficult words (type: "word")
   - idioms/phrases (type: "phrase")
   - grammar points (type: "grammar")
   - sentence structures (type: "structure")
   For each annotation:
   - "targetText": exact text from the passage
   - "meaning": Japanese meaning/explanation
   - "partOfSpeech": English part of speech (for words) or grammar label
   - "type": "word" | "phrase" | "grammar" | "structure"
   - "startIndex": character start index in the FULL passage (0-based)
   - "endIndex": character end index in the FULL passage (exclusive)
   - "example": optional example sentence in English

Return JSON in this exact shape:
{
  "translation": "...",
  "summary": "...",
  "paragraphs": [{ "translation": "...", "summary": "..." }],
  "annotations": [{
    "targetText": "...",
    "meaning": "...",
    "partOfSpeech": "...",
    "type": "word",
    "startIndex": 0,
    "endIndex": 5
  }]
}

PASSAGE:
`;

export async function analyzePassage(content: string): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(ANALYSIS_PROMPT + content);
  const text = result.response.text();

  const parsed = JSON.parse(text) as AiAnalysisResult;

  if (!parsed.translation || !Array.isArray(parsed.paragraphs) || !Array.isArray(parsed.annotations)) {
    throw new Error("Invalid AI response format.");
  }

  return parsed;
}

export function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
