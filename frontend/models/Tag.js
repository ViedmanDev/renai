/**
 * MODELO: Tag
 * Esquema de etiquetas/banderas en MongoDB
 */

import mongoose from "mongoose"

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: "#9E9E9E",
    },
    category: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

TagSchema.index({ userId: 1 })
TagSchema.index({ category: 1 })
TagSchema.index({ isGlobal: 1 })

export default mongoose.models.Tag || mongoose.model("Tag", TagSchema)
