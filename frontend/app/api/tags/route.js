/**
 * API ROUTE: /api/tags/[id]
 * Maneja operaciones de actualización y eliminación de etiquetas específicas
 *
 * Colección MongoDB: banderas
 * Endpoints:
 * - PUT /api/tags/[id] - Actualizar etiqueta
 * - DELETE /api/tags/[id] - Eliminar etiqueta
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * PUT /api/tags/[id]
 * Actualiza una etiqueta existente
 */
export async function PUT(request, { params }) {
  try {
    const db = await getDB();
    const { id } = params;
    const body = await request.json();
    const { name, color } = body;

    // Validar ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de etiqueta inválido" },
        { status: 400 }
      );
    }

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la etiqueta es requerido" },
        { status: 400 }
      );
    }

    if (!color) {
      return NextResponse.json(
        { error: "El color de la etiqueta es requerido" },
        { status: 400 }
      );
    }

    // Verificar si existe otra etiqueta con el mismo nombre (excluyendo la actual)
    const existingTag = await db.collection("banderas").findOne({
      name: name.trim(),
      _id: { $ne: new ObjectId(id) },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Ya existe otra etiqueta con ese nombre" },
        { status: 400 }
      );
    }

    // Actualizar etiqueta
    const result = await db.collection("banderas").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name.trim(),
          color: color,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: "Etiqueta no encontrada" },
        { status: 404 }
      );
    }

    // Normalizar respuesta
    const updatedTag = {
      id: result.value._id.toString(),
      _id: result.value._id.toString(),
      name: result.value.name,
      color: result.value.color,
      created_at: result.value.created_at,
      updated_at: result.value.updated_at,
    };

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("[ERROR] Error updating tag:", error);
    return NextResponse.json(
      { error: "Error al actualizar etiqueta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tags/[id]
 * Elimina una etiqueta
 */
export async function DELETE(request, { params }) {
  try {
    const db = await getDB();
    const { id } = params;

    // Validar ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de etiqueta inválido" },
        { status: 400 }
      );
    }

    // Opcional: Verificar si la etiqueta está siendo usada
    // Descomenta si quieres evitar eliminar etiquetas en uso
    /*
    const projectsUsingTag = await db.collection('projects').countDocuments({
      'details.tags': id
    });
    
    if (projectsUsingTag > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar. La etiqueta está siendo usada en ${projectsUsingTag} proyecto(s)` 
        },
        { status: 400 }
      );
    }
    */

    // Eliminar etiqueta
    const result = await db.collection("banderas").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Etiqueta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Etiqueta eliminada correctamente",
      deletedId: id,
    });
  } catch (error) {
    console.error("[ERROR] Error deleting tag:", error);
    return NextResponse.json(
      { error: "Error al eliminar etiqueta" },
      { status: 500 }
    );
  }
}
