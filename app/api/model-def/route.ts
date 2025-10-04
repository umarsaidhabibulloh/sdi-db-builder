import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { SYSTEM_FIELDS, generateCreateModelSQL } from '@/lib/sqlGenerator';
import _ from 'lodash';

// GET → list all models
export async function GET() {
  try {
    const res = await query(
      'SELECT name FROM db_models ORDER BY created_at DESC',
    );
    return NextResponse.json(res.rows || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load models' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, fields } = body;

    if (!name || !fields) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Ensure order: id first → user fields → rest system fields
    const finalFields = [SYSTEM_FIELDS.id, ...fields, ...SYSTEM_FIELDS.rest];

    // get all existing models for context
    const allModels = await query('SELECT name, definition FROM db_models');
    const transformedModels = _.map(allModels?.rows || [], (r) => {
      return { collectionName: r.name };
    });

    // generate SQL statements
    const sqlStatements = generateCreateModelSQL(
      { collectionName: name, fields: finalFields },
      [
        ...transformedModels,
        { collectionName: 'User' },
        { collectionName: 'UserGroup' },
        { collectionName: 'Role' },
      ],
    );

    // run SQL
    for (const sql of sqlStatements) {
      if (sql && sql.trim() !== '') {
        await query(sql);
      }
    }

    // Save definition for new model
    await query(
      `INSERT INTO db_models (name, definition, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (name) DO UPDATE SET definition = EXCLUDED.definition, updated_at = NOW()`,
      [name, { apply: true, fields: finalFields, collectionName: name }],
    );

    // ✅ Update target models for relations
    for (const f of fields) {
      if (f.type === 'relation' && f.target) {
        const target = f.target;

        // load target model definition
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

        // inverse relation type
        let inverseRel = f.relation;
        if (f.relation === 'many-to-one') inverseRel = 'one-to-many';
        else if (f.relation === 'one-to-many') inverseRel = 'many-to-one';
        // one-to-one and many-to-many stay as is

        // inverse field name (custom or default)
        const inverseFieldName = f.inverseName || name.toLowerCase() + 's';

        // check if already exists
        const idx = (targetDef.fields || []).findIndex(
          (tf: any) => tf.type === 'relation' && tf.target === name,
        );

        console.log('f: ', f);

        if (idx >= 0) {
          // ✅ update existing inverse relation
          targetDef.fields[idx] = {
            ...targetDef.fields[idx],
            name: inverseFieldName,
            relation: inverseRel,
            inverseName: f.name,
          };
        } else {
          // ✅ insert new inverse relation
          targetDef.fields.push({
            name: inverseFieldName,
            type: 'relation',
            target: name,
            relation: inverseRel,
            inverseName: f.name,
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
      { error: 'Failed to create model' },
      { status: 500 },
    );
  }
}
