// app/api/models/[name]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET → fetch all rows
export async function GET(req: Request, { params }: { params: { name: string } }) {
  try {
    const res = await query(`SELECT * FROM "${params.name}" ORDER BY "id" ASC LIMIT 100`);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST → insert new row
export async function POST(req: Request, { params }: { params: { name: string } }) {
  try {
    const body = await req.json();
    const keys = Object.keys(body);
    const values = Object.values(body);

    const colNames = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "${params.name}" (${colNames}) VALUES (${placeholders}) RETURNING *`;

    const res = await query(sql, values);
    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT → update a row by id
export async function PUT(req: Request, { params }: { params: { name: string } }) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    const sql = `UPDATE "${params.name}" SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`;

    const res = await query(sql, [...values, id]);
    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE → delete row by id
export async function DELETE(req: Request, { params }: { params: { name: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await query(`DELETE FROM "${params.name}" WHERE "id" = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
