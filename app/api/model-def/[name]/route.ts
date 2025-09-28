import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { name: string } }) {
  try {
    const res = await query("SELECT definition FROM db_models WHERE name = $1", [params.name]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    return NextResponse.json(res.rows[0].definition);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
