"use client"

import { Box, Typography, List, ListItemButton, ListItemText, Divider, Chip } from "@mui/material"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

export default function DetailFieldsSidebar({ details, onDetailClick, selectedDetailId, onReorderDetails }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorderDetails(result.source.index, result.destination.index)
  }

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "white",
        borderRight: "1px solid #e0e0e0",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Campos del proyecto
        </Typography>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="detail-fields-sidebar">
          {(provided, snapshot) => (
            <List sx={{ p: 0 }} ref={provided.innerRef} {...provided.droppableProps}>
              {details.map((detail, index) => (
                <Draggable key={detail.id + index} draggableId={detail.id + index} index={index}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        bgcolor: snapshot.isDragging ? "#e8eaf6" : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <ListItemButton
                        selected={selectedDetailId === detail.id}
                        onClick={() => onDetailClick(detail)}
                        sx={{
                          py: 2,
                          "&.Mui-selected": {
                            bgcolor: "#f3f0ff",
                            borderLeft: "3px solid #7c4dff",
                          },
                        }}
                      >
                        <Box {...provided.dragHandleProps} sx={{ display: "flex", mr: 1, cursor: "grab" }}>
                          <DragIndicatorIcon sx={{ color: "#9e9e9e", fontSize: 20 }} />
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2">
                                {detail.icon} {detail.name}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            detail.selectedSubOption && (
                              <Chip
                                label={detail.selectedSubOption}
                                size="small"
                                sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
                              />
                            )
                          }
                        />
                      </ListItemButton>
                      {index < details.length - 1 && <Divider />}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}
