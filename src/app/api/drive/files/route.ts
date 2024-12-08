import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');

  // Vérifier si le jeton d'accès est fourni
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token manquant' }, { status: 400 });
  }

  try {
    // Requête pour obtenir les fichiers qui ne sont pas des dossiers
    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType!="application/vnd.google-apps.folder"&fields=files(id,name,mimeType,webContentLink,webViewLink)', {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Utilisation du jeton d'accès pour l'authentification
      },
    });

    // Vérifier si la réponse est correcte
    if (!response.ok) {
      throw new Error('Erreur lors de l\'appel à l\'API Google Drive');
    }

    const data = await response.json();

    // Retourner uniquement les fichiers, pas les dossiers
    return NextResponse.json(data.files);
  } catch (error) {
    console.error('Erreur lors du chargement des fichiers :', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des fichiers' }, { status: 500 });
  }
}
