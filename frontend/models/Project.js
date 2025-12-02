/**
 * MODELO: Project
 * Esquema de proyectos en MongoDB con detalles embebidos
 */

import mongoose from "mongoose"

const DetailSchema = new mongoose.Schema(
  {
    detailTypeId: {
      type: String,
      required: true,
    },
    name: String,
    value: mongoose.Schema.Types.Mixed,
    subType: String,
    config: mongoose.Schema.Types.Mixed,
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: String,
    position: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: [DetailSchema],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Índices para mejorar performance
ProjectSchema.index({ userId: 1, createdAt: -1 })
ProjectSchema.index({ position: 1 })

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema)
