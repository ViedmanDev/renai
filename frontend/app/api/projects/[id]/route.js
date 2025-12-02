/**
 * API ROUTE: /api/projects/[id]
 * Maneja operaciones de un proyecto específico
 */

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/models/Project"

// GET - Obtener proyecto específico
export async function GET(request, { params }) {
  try {
    await connectDB()

    const project = await Project.findById(params.id).populate("tags").lean()

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[v0] Error fetching project:", error)
    return NextResponse.json({ error: "Error al obtener proyecto" }, { status: 500 })
  }
}

// PUT - Actualizar proyecto
export async function PUT(request, { params }) {
  try {
    await connectDB()

    const body = await request.json()

    const project = await Project.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true })

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[v0] Error updating project:", error)
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 })
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const project = await Project.findByIdAndDelete(params.id)

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Proyecto eliminado exitosamente" })
  } catch (error) {
    console.error("[v0] Error deleting project:", error)
    return NextResponse.json({ error: "Error al eliminar proyecto" }, { status: 500 })
  }
}
