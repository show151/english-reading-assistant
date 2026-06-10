import { createAdminClient } from "./supabase/admin";
import type { User, UserRole } from "./types";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRole(email: string): UserRole {
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase()) ? "admin" : "learner";
}

export async function upsertUser(input: {
  email: string;
  name?: string | null;
}): Promise<User> {
  const supabase = createAdminClient();
  const role = resolveRole(input.email);

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({ name: input.name ?? existing.name })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: input.email,
      name: input.name ?? null,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  return data;
}
