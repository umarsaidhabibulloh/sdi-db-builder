// lib/validators.ts
export const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateIdentifier(name: string) {
  if (!name || typeof name !== "string") throw new Error("Invalid identifier");
  if (!IDENTIFIER_REGEX.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return name;
}

export function escapeIdent(name: string) {
  validateIdentifier(name);
  return `"${name}"`;
}

export const ALLOWED_FIELD_TYPES = new Set([
  "text","richtext","email","password","uid",
  "integer","bigint","decimal","float",
  "date","datetime","time","timestamp",
  "boolean","enum","json","media","relation"
]);
