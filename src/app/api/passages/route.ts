import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPassage, getAllPassages, getPublishedPassages } from "@/lib/passages";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const passages =
      session.user.role === "admin"
        ? await getAllPassages()
        : await getPublishedPassages();
    return NextResponse.json(passages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch passages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, content, level, genre } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const passage = await createPassage({ title, content, level, genre });
    return NextResponse.json(passage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create passage" }, { status: 500 });
  }
}
