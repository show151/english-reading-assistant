import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStudyHistory, upsertStudyHistory } from "@/lib/passages";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await getStudyHistory(session.user.id);
    return NextResponse.json(history);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { passageId } = await request.json();
    if (!passageId) {
      return NextResponse.json({ error: "passageId is required" }, { status: 400 });
    }

    const history = await upsertStudyHistory(session.user.id, passageId);
    return NextResponse.json(history);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update history" }, { status: 500 });
  }
}
