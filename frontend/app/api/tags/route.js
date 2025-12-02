// app/api/tags/route.js
import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

/**
 * GET /api/tags
 * Lista todas las etiquetas
 */
export async function GET() {
  try {
    const db = await getDB();

    const tags = await db
      .collection("tags") // misma colección que ves en Compass
      .find({})
      .sort({ created_At: -1 })
      .toArray();

    // const normalized = tags.map((tag) => ({
    //   id: tag._id.toString(),
    //   _id: tag._id.toString(),
    //   name: tag.name,
    //   color: tag.color,
    //   // mapeamos respetando tus campos actuales
    //   created_at: tag.created_At || tag.created_at || null,
    //   updated_at: tag.updated_at || tag.updated_At || null,
    // }));

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("[ERROR] GET /api/tags:", error);
    return NextResponse.json(
      { error: "Error al obtener etiquetas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Crea una nueva etiqueta
 */
export async function POST(request) {
  try {
    const db = await getDB();
    const { name, color } = await request.json();

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

    // evitar duplicados
    const existing = await db.collection("tags").findOne({
      name: name.trim(),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una etiqueta con ese nombre" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await db.collection("tags").insertOne({
      name: name.trim(),
      color,
      created_At: now, // usamos el mismo nombre que ya tienes en la BD
      updated_at: now,
    });

    const createdTag = {
      id: result.insertedId.toString(),

      _id: result.insertedId.toString(),
      name: name.trim(),
      color,
      created_At: now,
      updated_at: now,
    };

    return NextResponse.json(createdTag, { status: 201 });
  } catch (error) {
    console.error("[ERROR] POST /api/tagsssssss:", error);
    return NextResponse.json(
      { error: "Error al crear etiqueta" },
      { status: 500 }
    );
  }
}
