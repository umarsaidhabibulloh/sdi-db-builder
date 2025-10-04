import { NextResponse } from "next/server";
import { ensureTablesExist } from "@/lib/ensureTables";

export async function GET() {
  try {
    await ensureTablesExist();
    return NextResponse.json({ message: "✅ Tables checked/created" });
  } catch (err: any) {
    console.error("❌ Error ensuring tables:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
