import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiAnalysisResult } from "./types";

const ANALYSIS_PROMPT = `You are an English teaching assistant for Japanese learners who are not confident in English.

Analyze the following English passage and return ONLY valid JSON (no markdown, no code fences).

Requirements:

1. "translation"
   - Translate the entire passage into natural and easy-to-understand Japanese.
   - Prioritize comprehension over literal translation.
   - Use simple Japanese that a Japanese high school student can understand.

2. "summary"
   - Summarize the entire passage in Japanese.
   - Maximum 200 characters.
   - Use simple vocabulary.

3. "paragraphs"
   - Array matching each paragraph (split by blank lines).
   - For each paragraph:
     - "translation": easy-to-understand Japanese translation.
     - "summary": Japanese summary within 100 characters.

4. "annotations"
   Extract important items that help learners understand the passage.

   Include:
   - difficult words (type: "word")
   - useful phrases and idioms (type: "phrase")
   - grammar points (type: "grammar")
   - sentence structures (type: "structure")

   Focus on:
   - vocabulary that may be difficult for Japanese learners
   - phrasal verbs
   - idioms
   - relative clauses
   - passive voice
   - infinitives
   - gerunds
   - participles
   - comparison expressions
   - conditional sentences
   - complex sentence structures

   For each annotation:
   - "targetText": exact text from the passage
   - "meaning": simple Japanese explanation
   - "partOfSpeech": English part of speech (for words) or grammar label
   - "type": "word" | "phrase" | "grammar" | "structure"
   - "startIndex": character start index in the FULL passage (0-based)
   - "endIndex": character end index in the FULL passage (exclusive)
   - "example": simple English example sentence (optional)

5. "readingGuide"
   Add a learner-friendly explanation section:
   - "mainIdea": one-sentence explanation of what the passage is about
   - "importantPoints": array of up to 5 key points in Japanese
   - "difficultSentenceExplanation": array explaining difficult sentences in simple Japanese

Rules:
- Return ONLY valid JSON.
- Escape all quotes properly.
- Preserve paragraph order.
- Do not omit any paragraph.
- Do not invent information not present in the passage.
- All startIndex/endIndex values must refer to positions in the FULL original passage.
- Explanations should be written for learners who often struggle with English grammar and vocabulary.
- Use clear and simple Japanese.

Return JSON in this exact shape:

{
  "translation": "...",
  "summary": "...",
  "paragraphs": [
    {
      "translation": "...",
      "summary": "..."
    }
  ],
  "annotations": [
    {
      "targetText": "...",
      "meaning": "...",
      "partOfSpeech": "...",
      "type": "word",
      "startIndex": 0,
      "endIndex": 5,
      "example": "..."
    }
  ],
  "readingGuide": {
    "mainIdea": "...",
    "importantPoints": ["..."],
    "difficultSentenceExplanation": [
      {
        "sentence": "...",
        "explanation": "..."
      }
    ]
  }
}

PASSAGE:
`;

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
] as const;

const MAX_RETRIES_PER_MODEL = 5;
const RETRY_BASE_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const models = preferred
    ? [preferred, ...FALLBACK_MODELS]
    : [...FALLBACK_MODELS];
  return [...new Set(models)];
}

function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /503|429|500|502|504|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|try again/i.test(
    message
  );
}

function toUserFriendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/503|high demand|UNAVAILABLE|overloaded/i.test(message)) {
    return "AIサービスが混雑しています。しばらく待ってから「解析開始」を再度お試しください。";
  }
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(message)) {
    return "APIの利用上限に達しました。しばらく待ってから再度お試しください。";
  }
  if (/401|403|API key/i.test(message)) {
    return "GEMINI_API_KEY の設定を確認してください。";
  }

  return message || "AI解析に失敗しました。";
}

function parseAnalysisResult(text: string): AiAnalysisResult {
  const parsed = JSON.parse(text) as AiAnalysisResult;

  if (
    !parsed.translation ||
    !Array.isArray(parsed.paragraphs) ||
    !Array.isArray(parsed.annotations)
  ) {
    throw new Error("Invalid AI response format.");
  }

  return parsed;
}

async function generateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: string
): Promise<AiAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
    try {
      const result = await model.generateContent(ANALYSIS_PROMPT + content);
      return parseAnalysisResult(result.response.text());
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === MAX_RETRIES_PER_MODEL - 1) {
        throw error;
      }

      const delay = RETRY_BASE_DELAY_MS * 2 ** attempt;
      console.warn(
        `[Gemini] ${modelName} attempt ${attempt + 1} failed, retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

export async function analyzePassage(content: string): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = getModelCandidates();
  const errors: string[] = [];

  for (const modelName of models) {
    try {
      console.info(`[Gemini] Trying model: ${modelName}`);
      return await generateWithModel(genAI, modelName, content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${modelName}: ${msg}`);
      console.warn(`[Gemini] Model ${modelName} failed:`, msg);

      if (!isRetryableError(error)) {
        throw new Error(toUserFriendlyError(error));
      }
    }
  }

  throw new Error(toUserFriendlyError(errors.at(-1)));
}

export function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
