import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const joinCode =
    typeof body?.join_code === "string" ? body.join_code.trim() : "";

  if (!joinCode) {
    return NextResponse.json(
      { error: "Join code is required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: group, error: groupError } = await admin
    .from("groups")
    .select("id,name,join_code,created_by,created_at")
    .eq("join_code", joinCode.toUpperCase())
    .maybeSingle();

  if (groupError) {
    return NextResponse.json(
      { error: "Failed to validate join code" },
      { status: 500 },
    );
  }

  if (!group) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
  }

  const userId = authData.claims.sub;
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: userId });

  if (memberError && memberError.code !== "23505") {
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 },
    );
  }

  return NextResponse.json({ group }, { status: 200 });
}
