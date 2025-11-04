/**
 * MODELO: Template
 * Esquema de plantillas reutilizables en MongoDB
 */

import mongoose from "mongoose"

const TemplateSchema = new mongoose.Schema(
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
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

TemplateSchema.index({ userId: 1 })
TemplateSchema.index({ isPublic: 1 })
TemplateSchema.index({ usageCount: -1 })

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema)
