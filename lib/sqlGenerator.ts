// lib/sqlGenerator.ts
import { validateIdentifier, escapeIdent } from "./validators";
import { ModelDef } from "../types/model";

const TYPE_MAP: Record<string, string> = {
  text: "VARCHAR(255)",
  email: "VARCHAR(255)",
  password: "VARCHAR(255)",
  uid: "VARCHAR(255)",
  richtext: "TEXT",
  integer: "INT",
  bigint: "BIGINT",
  decimal: "DECIMAL(18,4)",
  float: "REAL",
  date: "DATE",
  datetime: "TIMESTAMP",
  time: "TIME",
  timestamp: "TIMESTAMP",
  boolean: "BOOLEAN",
  json: "JSONB",
};

function sqlizeDefault(def: any) {
  if (def === "now") return "CURRENT_TIMESTAMP";
  if (typeof def === "number") return String(def);
  return `'${String(def).replace(/'/g, "''")}'`;
}

export function generateCreateModelSQL(model: ModelDef, allModels: ModelDef[]) {
  validateIdentifier(model.collectionName);
  const colSqls: string[] = [];
  const extraSQL: string[] = [];

  for (const f of model.fields) {
    if (f.type === "relation") {
      const rel = f as any;
      const target = allModels.find(m => m.collectionName === rel.target);
      if (!target) throw new Error(`Target model ${rel.target} not found`);

      if (rel.relation === "many-to-one" || rel.relation === "one-to-one") {
        const fkName = rel.foreignKey || `${rel.target}_id`;
        validateIdentifier(fkName);
        let fkLine = `${escapeIdent(fkName)} INT REFERENCES ${escapeIdent(rel.target)}(id)`;
        if (rel.onDelete) fkLine += ` ON DELETE ${rel.onDelete}`;
        if (rel.relation === "one-to-one") fkLine += " UNIQUE";
        colSqls.push(fkLine);
      } else if (rel.relation === "many-to-many") {
        const joinName = rel.joinTable || `${model.collectionName}_${rel.target}`;
        validateIdentifier(joinName);
        const leftFk = `${model.collectionName}_id`;
        const rightFk = `${rel.target}_id`;
        validateIdentifier(leftFk);
        validateIdentifier(rightFk);

        const joinSQL = `CREATE TABLE IF NOT EXISTS ${escapeIdent(joinName)} (
  ${escapeIdent(leftFk)} INT NOT NULL REFERENCES ${escapeIdent(model.collectionName)}(id) ON DELETE CASCADE,
  ${escapeIdent(rightFk)} INT NOT NULL REFERENCES ${escapeIdent(rel.target)}(id) ON DELETE CASCADE,
  PRIMARY KEY (${escapeIdent(leftFk)}, ${escapeIdent(rightFk)})
);`;
        extraSQL.push(joinSQL);
      } else {
        // one-to-many - no column added here
      }
      continue;
    }

    if ((f as any).type === "enum") {
      const ef = f as any;
      if (!ef.options || !Array.isArray(ef.options) || ef.options.length === 0) throw new Error("Enum must have options");
      const vals = ef.options.map((v: string) => `'${v.replace(/'/g, "''")}'`).join(", ");
      const col = `${escapeIdent(f.name)} VARCHAR(255) CHECK (${escapeIdent(f.name)} IN (${vals}))`;
      const constraints: string[] = [];
      if ((f as any).required) constraints.push("NOT NULL");
      if ((f as any).unique) constraints.push("UNIQUE");
      if ((f as any).default) constraints.push("DEFAULT " + sqlizeDefault((f as any).default));
      colSqls.push([col, ...constraints].join(" "));
      continue;
    }

    const baseType = TYPE_MAP[(f as any).type];
    if (!baseType) throw new Error(`Unsupported type ${(f as any).type}`);
    let line = `${escapeIdent(f.name)} ${baseType}`;
    const constraints: string[] = [];
    if ((f as any).primary) constraints.push("PRIMARY KEY");
    if ((f as any).autoIncrement) {
      line = `${escapeIdent(f.name)} INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY`;
      colSqls.push(line);
      continue;
    }
    if ((f as any).unique) constraints.push("UNIQUE");
    if ((f as any).required) constraints.push("NOT NULL");
    if ((f as any).default) constraints.push("DEFAULT " + sqlizeDefault((f as any).default));
    colSqls.push([line, ...constraints].join(" "));
  }

  const hasId = model.fields.some(f => (f as any).name === "id");
  if (!hasId) {
    colSqls.unshift(`"id" INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY`);
  }

  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${escapeIdent(model.collectionName)} (\n  ${colSqls.join(",\n  ")}\n);`;

  return { createTableSQL, extraSQL };
}
