import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as admin from 'firebase-admin'; // Assurez-vous que Firebase Admin SDK est configuré

// Définir des types pour la réponse et l'erreur
interface User {
  id: string;
  firebase_uid: string;
  email: string;
  // Ajoutez ici d'autres champs nécessaires
}

export async function POST(request: Request) {
  try {
    const { firebase_uid, token } = await request.json();

    // Vérification du token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.uid !== firebase_uid) {
      return NextResponse.json({ error: 'Unauthorized: Token mismatch' }, { status: 401 });
    }

    // Requête pour récupérer l'utilisateur dans Neon (Drizzle ORM)
    const user = await db.select().from(users).where(eq(users.firebase_uid, firebase_uid)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Si l'utilisateur est trouvé, retourner ses données
    return NextResponse.json({ user: user[0] }, { status: 200 });
  } catch (error: unknown) {
    // Gestion des erreurs avec typage explicite
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
