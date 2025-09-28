// components/ModelBuilder.tsx
"use client";
import { useState } from "react";

type Field = any;

export default function ModelBuilder() {
  const [collectionName, setCollectionName] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "id", type: "integer", primary: true, autoIncrement: true },
  ]);
  const [applyImmediately, setApplyImmediately] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  function updateField(i: number, patch: Partial<Field>) {
    const c = [...fields];
    c[i] = { ...c[i], ...patch };
    setFields(c);
  }

  function addField() {
    setFields([...fields, { name: "", type: "text" }]);
  }

  async function handleSubmit() {
    setStatus("saving...");
    try {
      const resp = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName, fields, apply: applyImmediately }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Error");
      setStatus("Success");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-xl font-bold mb-2">Create Model</h2>

      <div className="mb-2">
        <label className="block text-sm">Collection name</label>
        <input className="border p-2 w-full" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
      </div>

      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input placeholder="column name" value={f.name} onChange={(e) => updateField(i, { name: e.target.value })} className="border p-1" />
            <select value={f.type} onChange={(e) => updateField(i, { type: e.target.value })} className="border p-1">
              <option value="text">text</option>
              <option value="richtext">richtext</option>
              <option value="email">email</option>
              <option value="password">password</option>
              <option value="integer">integer</option>
              <option value="bigint">bigint</option>
              <option value="decimal">decimal</option>
              <option value="float">float</option>
              <option value="boolean">boolean</option>
              <option value="json">json</option>
              <option value="enum">enum</option>
              <option value="relation">relation</option>
            </select>

            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={f.required || false} onChange={(e) => updateField(i, { required: e.target.checked })} /> required
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={f.unique || false} onChange={(e) => updateField(i, { unique: e.target.checked })} /> unique
            </label>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button onClick={addField} className="px-3 py-2 bg-gray-200">Add Column</button>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={applyImmediately} onChange={(e) => setApplyImmediately(e.target.checked)} /> Create table immediately
        </label>
        <button onClick={handleSubmit} className="px-3 py-2 bg-blue-600 text-white">Save Model</button>
      </div>

      {status && <div className="mt-3 text-sm">{status}</div>}
    </div>
  );
}
