"use client";

import { useEffect, useState } from "react";

export default function ModelDetailPage({ params }: { params: { name: string } }) {
    const [rows, setRows] = useState<any[]>([]);
    const [fields, setFields] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRow, setNewRow] = useState<any>({});
    const [editRow, setEditRow] = useState<any | null>(null);

    const apiUrl = `/api/models/${params.name}`;

    // Load definition + data
    async function loadData() {
        setLoading(true);

        // Fetch rows
        const res = await fetch(apiUrl);
        const data = await res.json();
        setRows(data);

        // Fetch model definition from db_models
        const defRes = await fetch(`/api/model-def/${params.name}`);
        const defData = await defRes.json();
        if (defData?.fields) {
            // Exclude "id" (auto-generated)
            setFields(defData.fields.map((f: any) => f.name).filter((n: string) => n !== "id"));
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    // Handle create
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(newRow),
        });
        setNewRow({});
        loadData();
    }

    // Handle update
    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        await fetch(apiUrl, {
            method: "PUT",
            body: JSON.stringify(editRow),
        });
        setEditRow(null);
        loadData();
    }

    // Handle delete
    async function handleDelete(id: number) {
        await fetch(`${apiUrl}?id=${id}`, { method: "DELETE" });
        loadData();
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Table: {params.name}</h2>

            {/* Table */}
            {loading ? (
                <p>Loading...</p>
            ) : rows.length === 0 ? (
                <p>No rows found.</p>
            ) : (
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                {Object.keys(rows[0]).map((col) => (
                                    <th key={col} className="px-3 py-2 text-left border-b border-gray-300">
                                        {col}
                                    </th>
                                ))}
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {Object.values(row).map((val, i) => (
                                        <td key={i} className="px-3 py-2 border-b border-gray-200">
                                            {val !== null ? String(val) : <span className="text-gray-400">NULL</span>}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 border-b border-gray-200 space-x-2">
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() => setEditRow(row)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline"
                                            onClick={() => handleDelete(row.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create new row */}
            <div className="mb-6">
                <h3 className="font-semibold mb-2">➕ Create Row</h3>
                <form onSubmit={handleCreate} className="space-y-2">
                    {fields.map((col) => (
                        <input
                            key={col}
                            type="text"
                            placeholder={col}
                            value={newRow[col] || ""}
                            onChange={(e) => setNewRow({ ...newRow, [col]: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                        />
                    ))}
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
                        Create
                    </button>
                </form>
            </div>

            {/* Edit row */}
            {editRow && (
                <div>
                    <h3 className="font-semibold mb-2">✏️ Edit Row (ID {editRow.id})</h3>
                    <form onSubmit={handleUpdate} className="space-y-2">
                        {Object.keys(editRow)
                            .filter((k) => k !== "id")
                            .map((col) => (
                                <input
                                    key={col}
                                    type="text"
                                    placeholder={col}
                                    value={editRow[col] || ""}
                                    onChange={(e) => setEditRow({ ...editRow, [col]: e.target.value })}
                                    className="border px-2 py-1 w-full rounded"
                                />
                            ))}
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditRow(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded ml-2"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
