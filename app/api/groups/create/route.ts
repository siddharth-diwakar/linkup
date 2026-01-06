import { NextResponse } from "next/server";

import { generateJoinCode } from "@/lib/groups/join-code";
import { ensureProfileRow } from "@/lib/profiles/ensure-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_CREATE_ATTEMPTS = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 },
    );
  }

  const userId = authData.claims.sub;
  const { error: profileError } = await ensureProfileRow(userId);

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to prepare profile" },
      { status: 500 },
    );
  }

  const admin = createAdminClient();
  let createdGroup = null;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const joinCode = generateJoinCode().toUpperCase();
    const { data, error } = await admin
      .from("groups")
      .insert({ name, join_code: joinCode, created_by: userId })
      .select("id,name,join_code,created_by,created_at")
      .single();

    if (!error && data) {
      createdGroup = data;
      break;
    }

    if (error?.code === "23505") {
      lastError = error;
      continue;
    }

    lastError = error;
    break;
  }

  if (!createdGroup) {
    return NextResponse.json(
      {
        error: "Failed to create group",
        details: lastError?.message ?? null,
      },
      { status: 500 },
    );
  }

  const { error: memberError } = await admin
    .from("group_members")
    .insert({ group_id: createdGroup.id, user_id: userId });

  if (memberError) {
    return NextResponse.json(
      {
        error: "Failed to add group member",
        details: memberError.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ group: createdGroup }, { status: 201 });
}
