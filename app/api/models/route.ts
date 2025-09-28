// app/api/models/route.ts
import { NextResponse } from "next/server";
import { query, ensureMetadataTable } from "@/lib/db";
import { z } from "zod";
import { generateCreateModelSQL } from "@/lib/sqlGenerator";

const createModelSchema = z.object({
  collectionName: z.string(),
  fields: z.array(z.any()),
  apply: z.boolean().optional(),
});

export async function GET() {
  await ensureMetadataTable();
  const res = await query(`SELECT name, definition FROM db_models ORDER BY created_at DESC`);
  return NextResponse.json(res.rows);
}

export async function POST(req: Request) {
  await ensureMetadataTable();
  const body = await req.json();
  const parsed = createModelSchema.parse(body);
  const name = parsed.collectionName;

  await query(`INSERT INTO db_models (name, definition) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET definition = EXCLUDED.definition, created_at = NOW()`, [name, parsed]);

  if (parsed.apply) {
    const allRes = await query(`SELECT definition FROM db_models`);
    const allModels = allRes.rows.map((r: any) => r.definition);
    const { createTableSQL, extraSQL } = generateCreateModelSQL(parsed, allModels);

    try {
      await query("BEGIN");
      await query(createTableSQL);
      for (const s of extraSQL) await query(s);
      await query("COMMIT");
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
  }

  return NextResponse.json({ success: true });
}
