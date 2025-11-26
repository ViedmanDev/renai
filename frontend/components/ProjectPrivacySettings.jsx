"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  Typography,
  Box,
  Button,
  Radio,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import { useProjects } from "@/contexts/ProjectContext";

export default function ProjectPrivacySettings({ open, onClose, project, onUpdate }) {
  const [visibility, setVisibility] = useState(project?.visibility || 'private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateProject, currentProject } = useProjects();

  useEffect(() => {
    if (project?.visibility) {
      setVisibility(project.visibility);
    }
  }, [project]);

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const projectToUpdate = project || currentProject;
      
      if (!projectToUpdate) {
        throw new Error("No hay proyecto seleccionado");
      }

      const projectId = projectToUpdate.id || projectToUpdate._id;
      
      if (!projectId) {
        throw new Error("ID de proyecto no disponible");
      }

      console.log('📝 Actualizando visibilidad:', { projectId, visibility });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar en el ProjectContext
      updateProject(projectId, { visibility });
      
      // Notificar al componente padre
      if (onUpdate) {
        onUpdate({ ...projectToUpdate, visibility });
      }
      
      console.log('✅ Visibilidad actualizada a:', visibility);
      onClose();
    } catch (err) {
      console.error("Error al actualizar visibilidad:", err);
      setError(err.message || "Error al actualizar visibilidad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🔒 Configuración de Privacidad
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth>
          <FormLabel sx={{ mb: 2, fontWeight: 'bold' }}>
            ¿Quién puede ver este proyecto?
          </FormLabel>
          
          <RadioGroup value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            
            {/* Opción: Privado */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                border: visibility === 'private' ? '2px solid #f44336' : '1px solid #ddd',
                borderRadius: 2, 
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => setVisibility('private')}
            >
              <LockIcon sx={{ mr: 2, color: '#f44336', fontSize: 40 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🔒 Privado
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solo tú puedes ver este proyecto
                </Typography>
              </Box>
              <Radio value="private" checked={visibility === 'private'} />
            </Box>

            {/* Opción: Equipo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                border: visibility === 'team' ? '2px solid #ff9800' : '1px solid #ddd',
                borderRadius: 2, 
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => setVisibility('team')}
            >
              <GroupIcon sx={{ mr: 2, color: '#ff9800', fontSize: 40 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  👥 Equipo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solo usuarios invitados pueden ver
                </Typography>
              </Box>
              <Radio value="team" checked={visibility === 'team'} />
            </Box>

            {/* Opción: Público */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                border: visibility === 'public' ? '2px solid #4caf50' : '1px solid #ddd',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => setVisibility('public')}
            >
              <PublicIcon sx={{ mr: 2, color: '#4caf50', fontSize: 40 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🌐 Público
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cualquiera con el enlace puede ver
                </Typography>
              </Box>
              <Radio value="public" checked={visibility === 'public'} />
            </Box>

          </RadioGroup>

          {/* Info adicional */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Nota:</strong> Cambiar la visibilidad afecta quién puede ver tu proyecto. 
              Los permisos de edición se configuran por separado.
            </Typography>
          </Box>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || visibility === project?.visibility}
          sx={{
            bgcolor: '#2c2c2c',
            '&:hover': { bgcolor: '#1a1a1a' },
            '&:disabled': { bgcolor: '#ccc' }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}