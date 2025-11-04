/**
 * API ROUTE: /api/tags
 * Maneja operaciones CRUD de etiquetas
 */

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Tag from "@/models/Tag"

// GET - Obtener todas las etiquetas
export async function GET(request) {
  try {
    await connectDB()

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const tags = await Tag.find({
      $or: [{ userId }, { isGlobal: true }],
    }).lean()

    return NextResponse.json(tags)
  } catch (error) {
    console.error("[v0] Error fetching tags:", error)
    return NextResponse.json({ error: "Error al obtener etiquetas" }, { status: 500 })
  }
}

// POST - Crear nueva etiqueta
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, color, category } = body

    // TODO: Obtener userId del token de autenticación
    const userId = "507f1f77bcf86cd799439011" // Ejemplo temporal

    const tag = await Tag.create({
      name,
      color,
      category,
      userId,
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating tag:", error)
    return NextResponse.json({ error: "Error al crear etiqueta" }, { status: 500 })
  }
}
