"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import MainLayout from "@/components/MainLayout";

type FieldDef = {
    name: string;
    type?: string;
    unique?: boolean;
    primary?: boolean;
    autoIncrement?: boolean;
};

export default function ModelDetailPage({ params }: { params: { name: string } }) {
    const [rows, setRows] = useState<any[]>([]);
    const [fields, setFields] = useState<FieldDef[]>([]);
    const [loading, setLoading] = useState(true);

    // New Row Dialog State
    const [openAdd, setOpenAdd] = useState(false);
    const [newRow, setNewRow] = useState<any>({});

    const apiUrl = `/api/models/${params.name}`;

    async function loadData() {
        setLoading(true);

        // Fetch rows
        const res = await fetch(apiUrl);
        const data = await res.json();
        setRows(data);

        // Fetch model definition (columns)
        const defRes = await fetch(`/api/model-def/${params.name}`);
        const def = await defRes.json();

        const normalizedFields: FieldDef[] = (def.fields || []).map((f: any) =>
            typeof f === "string" ? { name: f } : f
        );
        setFields(normalizedFields);

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [params.name]);

    // Handle adding new row
    async function handleAddRow() {
        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRow),
            });

            if (!res.ok) {
                throw new Error(`Failed to add row: ${res.statusText}`);
            }

            // Reset and refresh
            setNewRow({});
            setOpenAdd(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert("Error adding row");
        }
    }

    return (
        <Box>
            <Box sx={{ px: 3, py:0 }}>
                <Typography variant="h4" gutterBottom>
                    Model: {params.name}
                </Typography>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={3}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {fields.map((field) => (
                                                <TableCell key={field.name}>{field.name}</TableCell>
                                            ))}
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, idx) => (
                                            <TableRow key={idx}>
                                                {fields.map((field) => (
                                                    <TableCell key={field.name}>
                                                        {String(row[field.name] ?? "")}
                                                    </TableCell>
                                                ))}
                                                <TableCell>
                                                    <Button size="small" variant="outlined">
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{ ml: 1 }}
                                                        onClick={() => console.log("Delete", row)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Divider sx={{ my: 2 }} />

                                <Button
                                    variant="contained"
                                    onClick={() => setOpenAdd(true)}
                                >
                                    Add Row
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Add Row Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Row</DialogTitle>
                <DialogContent>
                    {fields
                        .filter((f) => !f.autoIncrement && !f.primary) // skip id/autoincrement fields
                        .map((field) => (
                            <TextField
                                key={field.name}
                                margin="dense"
                                fullWidth
                                label={field.name}
                                value={newRow[field.name] ?? ""}
                                onChange={(e) =>
                                    setNewRow({ ...newRow, [field.name]: e.target.value })
                                }
                            />
                        ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddRow}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
