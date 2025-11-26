"use client";
import { Chip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";

export default function ProjectPrivacyBadge({ visibility, size = "small" }) {
  const config = {
    private: {
      icon: <LockIcon fontSize={size} />,
      label: "Privado",
      color: "error",
    },
    team: {
      icon: <GroupIcon fontSize={size} />,
      label: "Equipo",
      color: "warning",
    },
    public: {
      icon: <PublicIcon fontSize={size} />,
      label: "Público",
      color: "success",
    },
  };

  const { icon, label, color } = config[visibility] || config.private;

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      variant="outlined"
    />
  );
}