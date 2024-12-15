import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { users } from "../../../../db/schema";
import { organisations } from "../../../../db/schema";
import { sql } from "drizzle-orm";
export async function POST(request: Request) {
  try {
    const {
      firebase_uid,
      organisations_id,
      first_name,
      last_name,
      address,
      countryCode,
      phone,
      email,
      role,
      location,
      photo_url,
    } = await request.json();

    // Vérification des données avant de tenter .trim()
    if (
      !firebase_uid || !first_name || !last_name || !email || !role ||
      typeof firebase_uid !== 'string' ||
      typeof first_name !== 'string' ||
      typeof last_name !== 'string' ||
      typeof email !== 'string' ||
      typeof role !== 'string'
    ) {
      return NextResponse.json({ error: "Required fields: firebase_uid, first_name, last_name, email, role" }, { status: 400 });
    }

    // Validation des données d'entrée après la vérification des types
    if (!firebase_uid.trim() || !first_name.trim() || !last_name.trim() || !email.trim() || !role.trim()) {
      return NextResponse.json({ error: "Required fields: firebase_uid, first_name, last_name, email, role" }, { status: 400 });
    }

    // Vérification que l'organisation existe
    const organisation = await db
      .select()
      .from(organisations)
      .where(sql`${organisations.id} = ${organisations_id}`)  // Utilisation de la syntaxe correcte pour la comparaison
      .limit(1);

    if (!organisation.length) {
      return NextResponse.json({ error: "Organisation not found" }, { status: 400 });
    }

    // Insertion de l'utilisateur dans la base de données
    const result = await db.insert(users).values({
      firebase_uid,
      organisations_id,
      first_name,
      last_name,
      address,
      countryCode,
      phone,
      email,
      role,
    
      location: location || null,
      photo_url: photo_url || null,
    }).returning(); // Récupère l'objet inséré (si supporté par Drizzle)

    if (result && result.length > 0) {
      return NextResponse.json({
        message: "User created successfully",
        user: result[0],
      }, { status: 201 });
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
