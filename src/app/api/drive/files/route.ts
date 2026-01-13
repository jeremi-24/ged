import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token manquant' }, { status: 400 });
  }

  try {
    
    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType!="application/vnd.google-apps.folder"&fields=files(id,name,mimeType,webContentLink,webViewLink)', {
      headers: {
        Authorization: `Bearer ${accessToken}`, 
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'appel à l\'API Google Drive');
    }

    const data = await response.json();

    return NextResponse.json(data.files);
  } catch (error) {
    console.error('Erreur lors du chargement des fichiers :', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des fichiers' }, { status: 500 });
  }
}
