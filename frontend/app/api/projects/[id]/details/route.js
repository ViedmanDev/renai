/**
 * API ROUTE: /api/projects/[id]/details
 * Maneja operaciones de detalles de un proyecto
 */

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/models/Project"

// GET - Obtener detalles de un proyecto
export async function GET(request, { params }) {
  try {
    await connectDB()

    const project = await Project.findById(params.id).select("details").lean()

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(project.details || [])
  } catch (error) {
    console.error("[v0] Error fetching details:", error)
    return NextResponse.json({ error: "Error al obtener detalles" }, { status: 500 })
  }
}

// POST - Crear nuevo detalle
export async function POST(request, { params }) {
  try {
    await connectDB()

    const body = await request.json()
    const { detailTypeId, name, value, subType, config } = body

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    // Obtener posición máxima actual
    const maxPosition = project.details.length > 0 ? Math.max(...project.details.map((d) => d.position || 0)) : 0

    const newDetail = {
      detailTypeId,
      name,
      value,
      subType,
      config,
      position: maxPosition + 1,
    }

    project.details.push(newDetail)
    await project.save()

    return NextResponse.json(newDetail, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating detail:", error)
    return NextResponse.json({ error: "Error al crear detalle" }, { status: 500 })
  }
}
