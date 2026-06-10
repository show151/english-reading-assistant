import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/users";

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容が不正です。" },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "登録に失敗しました。";
    const status = message.includes("既に登録") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
