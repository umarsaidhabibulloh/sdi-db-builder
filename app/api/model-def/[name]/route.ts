import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { name: string } },
) {
  try {
    const res = await query(
      'SELECT definition FROM db_models WHERE name = $1',
      [params.name],
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0].definition);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { name: string } },
) {
  try {
    const body = await req.json();
    const { fields } = body;
    const modelName = params.name;

    if (!fields) {
      return NextResponse.json(
        { error: 'No fields provided' },
        { status: 400 },
      );
    }

    // Load old definition
    const oldRes = await query(
      `SELECT definition FROM db_models WHERE name = $1`,
      [modelName],
    );
    const oldDef = oldRes.rows.length > 0 ? oldRes.rows[0].definition : null;
    const oldFields: any[] = oldDef?.fields || [];

    // Save new definition
    await query(
      `UPDATE db_models
       SET definition = $1, updated_at = NOW()
       WHERE name = $2`,
      [{ apply: true, fields, collectionName: modelName }, modelName],
    );

    // Compare relations
    const oldRels = oldFields.filter((f) => f.type === 'relation');
    const newRels = fields.filter((f: any) => f.type === 'relation');

    // Drop obsolete join tables
    for (const rel of oldRels) {
      const stillExists = newRels.some(
        (f: any) => f.target === rel.target && f.name === rel.name,
      );
      if (
        !stillExists &&
        rel.target &&
        !['User', 'UserGroup', 'Role'].includes(rel.target)
      ) {
        const joinTable = `${modelName}_${rel.name}_${rel.target}`;
        await query(`DROP TABLE IF EXISTS ${joinTable} CASCADE`);
      }
    }

    // Create new join tables
    for (const rel of newRels) {
      if (rel.target && !['User', 'UserGroup', 'Role'].includes(rel.target)) {
        const joinTable = `${modelName}_${rel.name}_${rel.target}`;
        await query(
          `CREATE TABLE IF NOT EXISTS "${joinTable}" (
            "${modelName}_id" VARCHAR(255),
            "${rel.target}_id" VARCHAR(255),
            PRIMARY KEY ("${modelName}_id", "${rel.target}_id")
          )`,
        );
      }
    }

    // Update inverse relations
    for (const rel of newRels) {
      // console.log('rel: ', rel);
      if (rel.target) {
        const target = rel.target;
        const targetRes = await query(
          `SELECT definition FROM db_models WHERE name = $1`,
          [target],
        );
        let targetDef: any = {
          apply: true,
          fields: [],
          collectionName: target,
        };
        if (targetRes.rows.length > 0 && targetRes.rows[0].definition) {
          targetDef = targetRes.rows[0].definition;
        }

        let inverseRel = rel.relation;
        if (rel.relation === 'many-to-one') inverseRel = 'one-to-many';
        else if (rel.relation === 'one-to-many') inverseRel = 'many-to-one';

        const inverseFieldName =
          rel.inverseName || modelName.toLowerCase() + 's';

        const idx = (targetDef.fields || []).findIndex(
          (tf: any) => tf.type === 'relation' && tf.target === modelName,
        );

        if (idx >= 0) {
          targetDef.fields[idx] = {
            ...targetDef.fields[idx],
            name: inverseFieldName,
            relation: inverseRel,
            inverseName: rel.name,
          };
        } else {
          targetDef.fields.push({
            name: inverseFieldName,
            type: 'relation',
            target: modelName,
            relation: inverseRel,
            inverseName: rel.name,
          });
        }

        await query(
          `UPDATE db_models SET definition = $1, updated_at = NOW() WHERE name = $2`,
          [targetDef, target],
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { name: string } },
) {
  try {
    const modelName = params.name;

    // Drop main table
    await query(`DROP TABLE IF EXISTS "${modelName}" CASCADE`);

    // Drop join tables involving this model
    const res = await query('SELECT name, definition FROM db_models');
    for (const row of res.rows) {
      if (!row.definition) continue;
      const def = row.definition;
      for (const f of def.fields || []) {
        if (f.type === 'relation' && f.target === modelName) {
          const joinTable = `${row.name}_${f.name}_${modelName}`;
          await query(`DROP TABLE IF EXISTS ${joinTable} CASCADE`);
        }
      }
    }

    // Remove from db_models
    await query(`DELETE FROM db_models WHERE name = $1`, [modelName]);

    // Remove inverse fields from other models
    for (const row of res.rows) {
      if (!row.definition) continue;
      let def = row.definition;
      const newFields = (def.fields || []).filter(
        (f: any) => !(f.type === 'relation' && f.target === modelName),
      );
      if (newFields.length !== def.fields.length) {
        def.fields = newFields;
        await query(
          `UPDATE db_models SET definition = $1, updated_at = NOW() WHERE name = $2`,
          [def, row.name],
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 },
    );
  }
}
