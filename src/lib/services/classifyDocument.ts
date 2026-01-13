import { GoogleGenerativeAI } from '@google/generative-ai';

type ClassifyDocumentOptions = {
  apiKey: string; 
  model: string; 
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const classifyDocument = async (text: string, options: ClassifyDocumentOptions, imageData?: string): Promise<{ classification: string, full_text: string, metadata: any }> => {
  if (!options.apiKey || options.apiKey === 'your_gemini_api_key') {
    throw new Error('La clé API Gemini est manquante. Veuillez configurer NEXT_PUBLIC_GEMINI_API_KEY dans votre fichier .env.');
  }

  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({
    model: options.model,
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    }
  });

  try {
    await delay(1000);

    const prompt = `Analysez ce document. Si c'est une image ou un PDF, identifiez le contenu visuel. 
Extraire le texte complet avec une précision maximale (OCR de haute qualité).
Classez le document.
Si c'est une facture ou un reçu, extrayez les métadonnées (Marchand, Date, Total, Devise).

Répondez STRICTEMENT au format JSON suivant :
{
  "classification": "Le type de document (ex: Facture, Contrat, etc.)",
  "full_text": "Le texte intégral extrait du document",
  "metadata": {
    "merchant": "Nom de l'entreprise si applicable",
    "date": "Date du document si applicable",
    "total": "Montant total si applicable",
    "currency": "Devise si applicable"
  }
}

Texte extrait initial (peut être incomplet) : ${text}`;

    let result;
    if (imageData) {
      
      const base64Data = imageData.split(',')[1] || imageData;
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/png"
          }
        }
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('Erreur Gemini :', error);
    
    return {
      classification: "Inconnu",
      full_text: text,
      metadata: {}
    };
  }
};

export default classifyDocument;
