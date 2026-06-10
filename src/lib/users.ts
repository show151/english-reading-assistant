import bcrypt from "bcryptjs";
import { createAdminClient } from "./supabase/admin";
import type { User, UserRole } from "./types";

const SALT_ROUNDS = 12;

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

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data;
}

export async function verifyUser(
  email: string,
  password: string
): Promise<User | null> {
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!user?.password_hash) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return user;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<User> {
  const email = input.email.toLowerCase().trim();
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    throw new Error("このメールアドレスは既に登録されています。");
  }

  const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const role = resolveRole(email);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      name: input.name?.trim() || null,
      password_hash,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
