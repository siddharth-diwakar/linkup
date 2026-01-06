import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureProfileRow(userId: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { error };
  }

  if (data) {
    return { error: null };
  }

  const { error: insertError } = await admin
    .from("profiles")
    .insert({ id: userId, display_name: "" });

  return { error: insertError ?? null };
}
