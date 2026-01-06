import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: groups, error } = await supabase
    .from("groups")
    .select("id,name,join_code,created_by,created_at");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }

  return NextResponse.json({ groups: groups ?? [] }, { status: 200 });
}
