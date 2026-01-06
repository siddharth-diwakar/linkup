import { NextResponse } from "next/server";

import { parseIcsToBusyBlocks } from "@/lib/calendar/parse-ics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CALENDAR_BUCKET = "calendars";

export async function POST() {
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authData.claims.sub;
  const { data: upload, error: uploadError } = await supabase
    .from("calendar_uploads")
    .select("storage_path")
    .eq("user_id", userId)
    .maybeSingle();

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to load calendar metadata" },
      { status: 500 },
    );
  }

  if (!upload?.storage_path) {
    return NextResponse.json(
      { error: "No calendar on file" },
      { status: 404 },
    );
  }

  const admin = createAdminClient();
  const { data: fileData, error: downloadError } = await admin.storage
    .from(CALENDAR_BUCKET)
    .download(upload.storage_path);

  if (downloadError || !fileData) {
    return NextResponse.json(
      { error: "Failed to download calendar" },
      { status: 500 },
    );
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const icsText = buffer.toString("utf-8");
  const blocks = parseIcsToBusyBlocks(icsText);

  const { error: deleteError } = await supabase
    .from("weekday_busy_blocks")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to replace busy blocks" },
      { status: 500 },
    );
  }

  if (blocks.length > 0) {
    const payload = blocks.map((block) => ({ ...block, user_id: userId }));
    const { error: insertError } = await supabase
      .from("weekday_busy_blocks")
      .insert(payload);

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to store busy blocks" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { parsed: true, blocks: blocks.length },
    { status: 200 },
  );
}
