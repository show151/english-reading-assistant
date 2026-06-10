import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzePassage } from "@/lib/gemini";
import { getPassageById, saveAnalysisResult } from "@/lib/passages";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const passage = await getPassageById(id);
    if (!passage) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const analysis = await analyzePassage(passage.content);
    const result = await saveAnalysisResult(id, passage.content, analysis);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
