import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { organisations } from "../../../../db/schema";

// Fonction pour créer une nouvelle organisation
export async function POST(request: Request) {
  try {
    // Récupérer les données du corps de la requête
    const { name, country } = await request.json();

    // Validation des données d'entrée
    if (!name.trim() || !country.trim()) {
      return NextResponse.json({ error: "Name and country are required" }, { status: 400 });
    }

    // Insertion de la nouvelle organisation dans la base de données
    const result = await db.insert(organisations).values({
      name,
      country,
      statut: true,  // Valeur par défaut pour le statut (actif)
    }).returning();  // Récupère l'objet inséré (si supporté par Drizzle)

    // Vérification si l'insertion a retourné des résultats valides
    if (result && result.length > 0) {
      return NextResponse.json({
        message: "Organisation created successfully",
        organisation: result[0],  // Récupère la première organisation insérée
      }, { status: 201 });
    }

    // Si l'insertion a échoué ou retourne un résultat inattendu
    return NextResponse.json({ error: "Failed to create organisation" }, { status: 500 });

  } catch (error) {
    console.error("Error creating organisation:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
