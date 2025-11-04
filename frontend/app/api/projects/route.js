/**
 * API ROUTE: /api/projects
 * Maneja operaciones CRUD de proyectos
 */

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/models/Project"

// GET - Obtener todos los proyectos
export async function GET(request) {
  try {
    await connectDB()

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const projects = await Project.find({ userId }).sort({ position: 1, createdAt: -1 }).lean()

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, coverImage } = body

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const project = await Project.create({
      name,
      description,
      coverImage,
      userId,
      details: [],
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating project:", error)
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 })
  }
}
