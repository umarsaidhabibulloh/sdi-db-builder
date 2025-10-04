// lib/sqlGenerator.ts
import { validateIdentifier, escapeIdent } from './validators';
import { ModelDef } from '../types/model';

const TYPE_MAP: Record<string, string> = {
  text: 'VARCHAR(255)',
  email: 'VARCHAR(255)',
  password: 'VARCHAR(255)',
  uid: 'VARCHAR(255)',
  richtext: 'TEXT',
  integer: 'INT',
  bigint: 'BIGINT',
  decimal: 'DECIMAL(18,4)',
  float: 'REAL',
  date: 'DATE',
  datetime: 'TIMESTAMP',
  time: 'TIME',
  timestamp: 'TIMESTAMP',
  boolean: 'BOOLEAN',
  json: 'JSONB',
};

export const FIELD_TYPES = [...Object.keys(TYPE_MAP), 'relation'];

export const SYSTEM_FIELDS = {
  id: { name: 'id', type: 'uid', primary: true },
  rest: [
    { name: 'created_at', type: 'timestamp' },
    { name: 'updated_at', type: 'timestamp' },
    {
      name: 'created_by',
      type: 'relation',
      target: 'User',
      relation: 'many-to-one',
    },
    {
      name: 'owned_by',
      type: 'relation',
      target: 'UserGroup',
      relation: 'many-to-one',
    },
  ],
};

function sqlizeDefault(def: any) {
  if (def === 'now') return 'CURRENT_TIMESTAMP';
  if (typeof def === 'number') return String(def);
  return `'${String(def).replace(/'/g, "''")}'`;
}

export function generateCreateModelSQL(
  model: ModelDef,
  allModels: ModelDef[],
): string[] {
  validateIdentifier(model.collectionName);
  const colSqls: string[] = [];
  const extraSQL: string[] = [];

  for (const f of model.fields) {
    if (f.type === 'relation' && f.target) {
      const target = f.target;

      // ✅ If relation targets system tables, inline FK
      if (['User', 'UserGroup', 'Role'].includes(target)) {
        const fkCol = `${f.name}_id`;
        colSqls.push(
          `${escapeIdent(fkCol)} VARCHAR(255) REFERENCES ${escapeIdent(target)}(id)`,
        );
      } else {
        // ✅ Otherwise → join table
        const joinTable = `${model.collectionName}_${f.name}_${target}`;
        extraSQL.push(
          `CREATE TABLE IF NOT EXISTS ${escapeIdent(joinTable)} (
            ${escapeIdent(model.collectionName + '_id')} VARCHAR(255),
            ${escapeIdent(target + '_id')} VARCHAR(255),
            PRIMARY KEY (${escapeIdent(model.collectionName + '_id')}, ${escapeIdent(target + '_id')})
          )`,
        );
      }
    } else {
      let col = `${escapeIdent(f.name)} ${TYPE_MAP[f.type] || f.type}`;
      if ((f as any).primary) col += ' PRIMARY KEY';
      if ((f as any).unique) col += ' UNIQUE';
      if ((f as any).autoIncrement) col += ' GENERATED ALWAYS AS IDENTITY';
      if ((f as any).default !== undefined)
        col += ` DEFAULT ${sqlizeDefault((f as any).default)}`;
      colSqls.push(col);
    }
  }

  const mainSQL = `CREATE TABLE IF NOT EXISTS ${escapeIdent(model.collectionName)} (\n  ${colSqls.join(',\n  ')}\n)`;

  return [mainSQL, ...extraSQL];
}
