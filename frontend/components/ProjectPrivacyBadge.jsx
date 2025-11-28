"use client";

import { Chip } from "@mui/material";

export default function ProjectPrivacyBadge({ visibility = 'private', size = 'medium' }) {
  const config = {
    private: {
      label: '🔒 Privado',
      color: '#f44336',
    },
    team: {
      label: '👥 Equipo',
      color: '#ff9800',
    },
    public: {
      label: '🌐 Público',
      color: '#4caf50',
    },
  };

  const current = config[visibility] || config.private;

  return (
    <Chip
      label={current.label}  // ✅ Solo label con emoji
      size={size}
      sx={{
        bgcolor: current.color,
        color: 'white',
        fontWeight: 'bold',
      }}
    />
  );
}