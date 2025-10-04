'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FIELD_TYPES } from '@/lib/sqlGenerator';
import _ from 'lodash';

const SYSTEM_FIELD_NAMES = [
  'id',
  'created_at',
  'updated_at',
  'created_by',
  'owned_by',
];

type Field = {
  name: string;
  type: string;
  unique?: boolean;
  target?: string;
  relation?: string;
  inverseName?: string;
};

export default function ModelBuilder({
  availableModels = [],
  initialName = '',
  initialFields = [],
  mode = 'create', // "create" or "edit"
}: {
  availableModels?: string[];
  initialName?: string;
  initialFields?: any[];
  mode?: 'create' | 'edit';
}) {
  const [collectionName, setCollectionName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // 🔑 Reset state if props change (important when switching models)
  useEffect(() => {
    setCollectionName(initialName);
    setFields(initialFields);
  }, [initialName, initialFields]);

  function updateField(i: number, patch: Partial<Field>) {
    setFields((prev) => {
      const copy = _.cloneDeep(prev); // deep clone ensures no shared refs
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }

  function addField() {
    setFields([...fields, { name: '', type: 'text' }]);
  }

  function removeField(i: number) {
    setFields(fields.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    setStatus('saving...');
    try {
      let url = '/api/model-def';
      let method: 'POST' | 'PATCH' = 'POST';

      if (mode === 'edit') {
        url = `/api/model-def/${_.snakeCase(collectionName)}`;
        method = 'PATCH';
      }

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: _.snakeCase(collectionName), fields }),
      });

      if (!resp.ok) throw new Error('Failed to save');
      setStatus('saved!');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  }

  // async function handleSubmit() {
  //   setStatus('saving...');
  //   try {
  //     const resp = await fetch('/api/model-def', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name: _.snakeCase(collectionName), fields }),
  //     });
  //     if (!resp.ok) throw new Error('Failed to save');
  //     setStatus('saved!');
  //   } catch (err: any) {
  //     console.error(err);
  //     setStatus('error');
  //   }
  // }
  // console.log('fields', fields);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          New Model
        </Typography>

        {/* Model Name */}
        <TextField
          label="Model Name"
          fullWidth
          margin="dense"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />

        {/* Fields Table Header */}
        <Box
          sx={{
            display: 'grid',
            // gridTemplateColumns: '1fr 140px 70px 90px 160px 140px',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            fontWeight: 'bold',
            mt: 2,
            mb: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>Field Name</Typography>
          <Typography>Type</Typography>
          <Typography sx={{ textAlign: 'center' }}>Unique</Typography>
          <Typography>Relation Type</Typography>
          <Typography>Target Model</Typography>
          <Typography>Target Field Name</Typography>
          <Typography />
        </Box>

        {/* Field Rows */}
        {fields.map((f, i) => (
          <Box
            key={i}
            sx={{
              display: _.includes(SYSTEM_FIELD_NAMES, f.name) ? 'none' : 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
              alignItems: 'center',
              mb: 1,
            }}
          >
            {/* Field Name */}
            <TextField
              value={f.name}
              onChange={(e) => updateField(i, { name: e.target.value })}
              size="small"
            />

            {/* Type */}
            <Select
              value={f.type}
              onChange={(e) => updateField(i, { type: e.target.value })}
              size="small"
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>

            {/* Unique */}
            <Checkbox
              checked={f.unique || false}
              onChange={(e) => updateField(i, { unique: e.target.checked })}
              size="small"
            />

            {/* Relation Type (only for relation) */}
            <Select
              value={f.relation || ''}
              onChange={(e) => updateField(i, { relation: e.target.value })}
              size="small"
              disabled={f.type !== 'relation'}
              displayEmpty
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="one-to-one">One to One</MenuItem>
              <MenuItem value="one-to-many">One to Many</MenuItem>
              <MenuItem value="many-to-one">Many to One</MenuItem>
              <MenuItem value="many-to-many">Many to Many</MenuItem>
            </Select>
            {/* Target Model (only for relation) */}
            <Select
              value={f.target || ''}
              onChange={(e) => updateField(i, { target: e.target.value })}
              size="small"
              disabled={f.type !== 'relation'}
              displayEmpty
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableModels.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
            {/* Inverse Field Name (for target model) */}
            <TextField
              placeholder="Inverse field name"
              value={f.inverseName || ''}
              onChange={(e) => updateField(i, { inverseName: e.target.value })}
              size="small"
              disabled={f.type !== 'relation'}
            />

            {/* Delete Button */}
            <IconButton
              color="error"
              onClick={() => removeField(i)}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {/* Add Field */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addField}
            size="small"
          >
            Add Field
          </Button>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleSubmit}>
            Save Model
          </Button>
          {status && <Typography variant="body2">{status}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
