// pages/api/proxy.ts
export default async function handler(req: { query: { filename?: any; url?: any; }; headers: { authorization: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; send: { (arg0: Buffer): void; new(): any; };
}; setHeader: (arg0: string, arg1: string | null) => void; }) {
    // Enregistre la requête pour le débogage
    console.log('Received request:', req.query); 

    // Récupère l'URL de la requête
    const { url } = req.query;

    // Vérifie si l'URL est fournie
    if (!url) {
        return res.status(400).json({ error: 'URL manquante' });
    }

    try {
        // Fait une requête GET vers l'URL fournie
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Ajoute un en-tête d'autorisation si nécessaire
                'Authorization': `Bearer ${req.headers.authorization}`
            }
        });

        // Vérifie si la réponse est OK (statut 200)
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erreur de récupération du fichier' });
        }

        // Récupère le fichier sous forme de blob
        const fileBlob = await response.blob();
        const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());

        // Définit les en-têtes pour le type de contenu et le nom de fichier
        res.setHeader('Content-Type', response.headers.get('content-type'));
        res.setHeader('Content-Disposition', `attachment; filename="${req.query.filename}"`);
        
        // Envoie le fichier au client
        res.status(200).send(fileBuffer);
    } catch (error) {
        console.error('Erreur :', error);
        res.status(500).json({ error: 'Échec de la récupération du fichier' });
    }
}
