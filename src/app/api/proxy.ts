
export default async function handler(req: { query: { filename?: any; url?: any; }; headers: { authorization: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; send: { (arg0: Buffer): void; new(): any; };
}; setHeader: (arg0: string, arg1: string | null) => void; }) {
    
    console.log('Received request:', req.query); 

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL manquante' });
    }

    try {
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                
                'Authorization': `Bearer ${req.headers.authorization}`
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erreur de récupération du fichier' });
        }

        const fileBlob = await response.blob();
        const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());

        res.setHeader('Content-Type', response.headers.get('content-type'));
        res.setHeader('Content-Disposition', `attachment; filename="${req.query.filename}"`);

        res.status(200).send(fileBuffer);
    } catch (error) {
        console.error('Erreur :', error);
        res.status(500).json({ error: 'Échec de la récupération du fichier' });
    }
}
