"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Box, Container, Typography, IconButton, Button, Avatar } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import AppsIcon from "@mui/icons-material/Apps"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import { useProjects } from "@/contexts/ProjectContext"
import DetailTypeSelector from "@/components/DetailTypeSelector"
import SubOptionsModal from "@/components/SubOptionsModal"

export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { currentProject, selectedDetails, setSelectedDetails, reorderDetails } = useProjects()
  const [openSubOptions, setOpenSubOptions] = useState(false)
  const [currentDetailType, setCurrentDetailType] = useState(null)

  const handleDetailToggle = (detailType) => {
    const exists = selectedDetails.find((d) => d.id === detailType.id)
    if (exists) {
      setSelectedDetails(selectedDetails.filter((d) => d.id !== detailType.id))
    } else {
      setSelectedDetails([...selectedDetails, detailType])
    }
  }

  const handleOpenSubOptions = (detailType) => {
    setCurrentDetailType(detailType)
    setOpenSubOptions(true)
  }

  const handleConfirmSubOption = (detailWithOption) => {
    const exists = selectedDetails.find((d) => d.id === detailWithOption.id)
    if (!exists) {
      setSelectedDetails([...selectedDetails, detailWithOption])
    }
    setOpenSubOptions(false)
    setCurrentDetailType(null)
  }

  const handleSaveAndContinue = () => {
    if (selectedDetails.length > 0) {
      router.push(`/project/${params.id}/canvas`)
    }
  }

  const handleReorderDetails = (sourceIndex, destinationIndex) => {
    reorderDetails(sourceIndex, destinationIndex)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.push("/")}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton>
            <AppsIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body1">{currentProject?.name || "Proyecto 1 Ejemplo Ejemplo"}</Typography>
          <Avatar sx={{ bgcolor: "#5e35b1" }}>J</Avatar>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            p: 4,
            minHeight: 500,
          }}
        >
          {/* Project Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <Typography variant="h6">{currentProject?.name || "Proyecto demo"}</Typography>
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          <DetailTypeSelector
            selectedDetails={selectedDetails}
            onDetailToggle={handleDetailToggle}
            onOpenSubOptions={handleOpenSubOptions}
            onReorderDetails={handleReorderDetails}
          />

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSaveAndContinue}
              disabled={selectedDetails.length === 0}
              sx={{
                bgcolor: "#7c4dff",
                textTransform: "none",
                px: 6,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#6a3de8",
                },
              }}
            >
              Guardar y continuar
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Sub Options Modal */}
      <SubOptionsModal
        open={openSubOptions}
        onClose={() => setOpenSubOptions(false)}
        detailType={currentDetailType}
        onConfirm={handleConfirmSubOption}
      />
    </Box>
  )
}
