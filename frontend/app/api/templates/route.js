/**
 * API ROUTE: /api/templates
 * Maneja operaciones CRUD de plantillas
 */

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Template from "@/models/Template"

// GET - Obtener todas las plantillas
export async function GET(request) {
  try {
    await connectDB()

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const templates = await Template.find({
      $or: [{ userId }, { isPublic: true }],
    })
      .sort({ usageCount: -1, createdAt: -1 })
      .lean()

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[v0] Error fetching templates:", error)
    return NextResponse.json({ error: "Error al obtener plantillas" }, { status: 500 })
  }
}

// POST - Crear nueva plantilla
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, config, isPublic } = body

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const template = await Template.create({
      name,
      description,
      config,
      isPublic,
      userId,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating template:", error)
    return NextResponse.json({ error: "Error al crear plantilla" }, { status: 500 })
  }
}
