import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { organisations } from "../../../../db/schema";

export async function POST(request: Request) {
  try {
    
    const { name, country } = await request.json();

    if (!name.trim() || !country.trim()) {
      return NextResponse.json({ error: "Name and country are required" }, { status: 400 });
    }

    const result = await db.insert(organisations).values({
      name,
      country,
      statut: true,  
    }).returning();  

    if (result && result.length > 0) {
      return NextResponse.json({
        message: "Organisation created successfully",
        organisation: result[0],  
      }, { status: 201 });
    }

    return NextResponse.json({ error: "Failed to create organisation" }, { status: 500 });

  } catch (error) {
    console.error("Error creating organisation:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
