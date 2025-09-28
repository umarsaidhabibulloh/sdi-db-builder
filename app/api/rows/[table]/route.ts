// app/api/rows/[table]/route.ts
import { NextResponse } from "next/server";
import { query, ensureMetadataTable } from "@/lib/db";
import { validateIdentifier, escapeIdent } from "@/lib/validators";

export async function GET(req: Request, { params }: { params: { table: string } }) {
  await ensureMetadataTable();
  const table = params.table;
  validateIdentifier(table);
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 100);
  const offset = Number(url.searchParams.get("offset") || 0);

  const res = await query(`SELECT * FROM ${escapeIdent(table)} LIMIT $1 OFFSET $2`, [limit, offset]);
  return NextResponse.json(res.rows);
}

export async function POST(req: Request, { params }: { params: { table: string } }) {
  const table = params.table;
  validateIdentifier(table);
  const body = await req.json();
  const cols = Object.keys(body);
  if (!cols.length) return NextResponse.json({ error: "No data provided" }, { status: 400 });
  cols.forEach(validateIdentifier);
  const colList = cols.map(escapeIdent).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const values = cols.map(c => (body as any)[c]);

  const res = await query(`INSERT INTO ${escapeIdent(table)} (${colList}) VALUES (${placeholders}) RETURNING *`, values);
  return NextResponse.json(res.rows[0]);
}

export async function PUT(req: Request, { params }: { params: { table: string } }) {
  const table = params.table;
  validateIdentifier(table);
  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const cols = Object.keys(rest);
  if (!cols.length) return NextResponse.json({ error: "No data to update" }, { status: 400 });
  cols.forEach(validateIdentifier);
  const set = cols.map((c, i) => `${escapeIdent(c)} = $${i + 1}`).join(", ");
  const values = cols.map(c => (rest as any)[c]);
  values.push(id);
  const res = await query(`UPDATE ${escapeIdent(table)} SET ${set} WHERE id = $${values.length} RETURNING *`, values);
  return NextResponse.json(res.rows[0]);
}

export async function DELETE(req: Request, { params }: { params: { table: string } }) {
  const table = params.table;
  validateIdentifier(table);
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await query(`DELETE FROM ${escapeIdent(table)} WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
