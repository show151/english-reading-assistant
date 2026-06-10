import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPassageById,
  updateAnnotations,
  updateParagraphs,
  updatePassage,
} from "@/lib/passages";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const passage = await getPassageById(id);
    if (!passage) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      passage.status !== "published" &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(passage);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch passage" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { passage, paragraphs, annotations } = body;

    if (passage) {
      await updatePassage(id, passage);
    }
    if (paragraphs) {
      await updateParagraphs(paragraphs);
    }
    if (annotations) {
      await updateAnnotations(id, annotations);
    }

    const updated = await getPassageById(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update passage" }, { status: 500 });
  }
}
