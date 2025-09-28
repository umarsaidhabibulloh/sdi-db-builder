// types/model.ts
export type BaseField = {
  name: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
};

export type ScalarField = BaseField & (
  | { type: "text" | "richtext" | "email" | "password" | "uid" }
  | { type: "integer" | "bigint" | "decimal" | "float"; primary?: boolean; autoIncrement?: boolean }
  | { type: "date" | "datetime" | "time" | "timestamp" }
  | { type: "boolean" }
  | { type: "enum"; options: string[] }
  | { type: "json" }
);

export type RelationField = BaseField & {
  type: "relation";
  relation: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  target: string;
  foreignKey?: string;
  joinTable?: string;
  onDelete?: "CASCADE" | "RESTRICT" | "SET NULL";
};

export type Field = ScalarField | RelationField;

export type ModelDef = {
  collectionName: string;
  fields: Field[];
};
