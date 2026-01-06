import { NextResponse } from "next/server";

import { parseIcsToBusyBlocks } from "@/lib/calendar/parse-ics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CALENDAR_BUCKET = "calendars";
const CALENDAR_FILENAME = "calendar.ics";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Calendar file is required" },
      { status: 400 },
    );
  }

  if (!file.name.toLowerCase().endsWith(".ics")) {
    return NextResponse.json(
      { error: "Only .ics files are supported" },
      { status: 400 },
    );
  }

  const userId = authData.claims.sub;
  const buffer = Buffer.from(await file.arrayBuffer());
  const icsText = buffer.toString("utf-8");

  const blocks = parseIcsToBusyBlocks(icsText);
  const admin = createAdminClient();
  const storagePath = `${userId}/${CALENDAR_FILENAME}`;

  const { error: uploadError } = await admin.storage
    .from(CALENDAR_BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: "text/calendar",
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to upload calendar" },
      { status: 500 },
    );
  }

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

  const { error: uploadRowError } = await supabase
    .from("calendar_uploads")
    .upsert(
      {
        user_id: userId,
        storage_path: storagePath,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (uploadRowError) {
    return NextResponse.json(
      { error: "Failed to save calendar metadata" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { uploaded: true, blocks: blocks.length },
    { status: 200 },
  );
}
