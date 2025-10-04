'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ModelBuilder from '@/components/ModelBuilder';

type FieldDef = {
  name: string;
  type: string;
  unique?: boolean;
  primary?: boolean;
  autoIncrement?: boolean;
  target?: string;
  relation?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  inverseName?: string;
};

export default function BuilderPage() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  // dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  async function loadModels() {
    setModelLoading(true);
    const res = await fetch('/api/model-def');
    const data = await res.json();
    setModels(data.map((m: any) => m.name));
    setModelLoading(false);
  }

  async function loadModelDef(name: string) {
    setLoading(true);
    const defRes = await fetch(`/api/model-def/${name}`);
    const def = await defRes.json();
    const normalizedFields: FieldDef[] = (def.fields || []).map((f: any) =>
      typeof f === 'string' ? { name: f, type: 'text' } : f,
    );
    setFields(normalizedFields);
    setLoading(false);
  }

  async function handleDeleteModel() {
    if (!selectedModel) return;
    if (
      !confirm(
        `Are you sure you want to delete model "${selectedModel}"?\nThis will drop its table and join tables.`,
      )
    )
      return;
    await fetch(`/api/model-def/${selectedModel}`, { method: 'DELETE' });
    setSelectedModel(null);
    loadModels();
  }

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar with models */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
        }}
      >
        <Box sx={{ p: 1 }}>
          <Button
            size="small"
            variant="contained"
            fullWidth
            onClick={() => setOpenAdd(true)}
          >
            + New Model
          </Button>
        </Box>

        <Typography variant="subtitle1" sx={{ p: 1 }}>
          Models
        </Typography>
        <List>
          {modelLoading ? (
            <CircularProgress />
          ) : (
            models.map((name) => (
              <ListItemButton
                key={name}
                selected={selectedModel === name}
                onClick={() => {
                  setSelectedModel(name);
                  loadModelDef(name);
                }}
              >
                <ListItemText primary={name} />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        {selectedModel ? (
          loading ? (
            <CircularProgress />
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenEdit(true)}
                  disabled={!selectedModel}
                >
                  Edit Model
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteModel}
                  disabled={!selectedModel}
                >
                  Delete Model
                </Button>
              </Box>

              <Typography variant="h6" gutterBottom>
                Definition of {selectedModel}
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Primary</TableCell>
                        <TableCell>Unique</TableCell>
                        <TableCell>AutoInc</TableCell>
                        <TableCell>Target</TableCell>
                        <TableCell>Relation</TableCell>
                        <TableCell>Inverse Name</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((f) => (
                        <TableRow key={f.name}>
                          <TableCell>{f.name}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell>{f.primary ? '✔' : ''}</TableCell>
                          <TableCell>{f.unique ? '✔' : ''}</TableCell>
                          <TableCell>{f.autoIncrement ? '✔' : ''}</TableCell>
                          <TableCell>
                            {f.type === 'relation' ? f.target : '-'}
                          </TableCell>
                          <TableCell>
                            {f.type === 'relation' ? f.relation : '-'}
                          </TableCell>
                          <TableCell>
                            {f.type === 'relation' ? f.inverseName || '-' : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )
        ) : (
          <Typography variant="body1">
            Select a model from the sidebar
          </Typography>
        )}
      </Box>

      {/* Dialog for creating new model */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { width: '90vw', height: '90vh', maxWidth: 'none' },
        }}
      >
        <DialogTitle>Create New Model</DialogTitle>
        <DialogContent dividers>
          <ModelBuilder availableModels={models} mode="create" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing model */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { width: '90vw', height: '90vh', maxWidth: 'none' },
        }}
      >
        <DialogTitle>Edit Model</DialogTitle>
        <DialogContent dividers>
          <ModelBuilder
            availableModels={models}
            initialName={selectedModel || ''}
            initialFields={fields}
            mode="edit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
