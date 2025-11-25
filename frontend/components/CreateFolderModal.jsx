"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Green
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#6b7280', // Gray
];

const ICONS = ['📁', '📂', '🗂️', '📚', '💼', '🎨', '🏢', '🏠', '💻', '📊', '🎯', '⭐'];

export default function CreateFolderModal({ 
  open, 
  onClose, 
  onSave, 
  folder = null,
  parentFolder = null 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!folder;

  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
      setDescription(folder.description || '');
      setIcon(folder.icon || '📁');
      setColor(folder.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setIcon('📁');
      setColor('#6366f1');
    }
    setError('');
  }, [folder, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        parentId: parentFolder?._id || folder?.parentId || null,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar carpeta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? '✏️ Editar Carpeta' : '📁 Nueva Carpeta'}
        {parentFolder && (
          <Typography variant="caption" display="block" color="text.secondary">
            Dentro de: {parentFolder.name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Nombre */}
        <TextField
          fullWidth
          label="Nombre de la carpeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Proyectos Personales"
          autoFocus
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {/* Descripción */}
        <TextField
          fullWidth
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Proyectos de desarrollo personal"
          multiline
          rows={2}
          disabled={loading}
          sx={{ mb: 3 }}
        />

        {/* Icono */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Icono
          </Typography>
          <Grid container spacing={1}>
            {ICONS.map((emoji) => (
              <Grid item key={emoji}>
                <IconButton
                  onClick={() => setIcon(emoji)}
                  sx={{
                    fontSize: '1.5rem',
                    border: icon === emoji ? '2px solid #6366f1' : '1px solid #e0e0e0',
                    borderRadius: 1,
                    bgcolor: icon === emoji ? '#f3f4f6' : 'transparent',
                  }}
                >
                  {emoji}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Color */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Color
          </Typography>
          <Grid container spacing={1}>
            {COLORS.map((c) => (
              <Grid item key={c}>
                <IconButton
                  onClick={() => setColor(c)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: c,
                    border: color === c ? '3px solid #000' : 'none',
                    '&:hover': {
                      bgcolor: c,
                      opacity: 0.8,
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !name.trim()}
          sx={{
            bgcolor: '#2c2c2c',
            '&:hover': { bgcolor: '#1a1a1a' },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Guardando...
            </>
          ) : (
            isEditing ? 'Actualizar' : 'Crear Carpeta'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}