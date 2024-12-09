import { GoogleGenerativeAI } from '@google/generative-ai';

type ClassifyDocumentOptions = {
  apiKey: string; // Clé API de Google Generative AI
  model: string; // Nom du modèle Google Generative AI, par exemple "gemini-1.5-flash"
};

// Fonction pour créer un délai en millisecondes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const classifyDocument = async (text: string, options: ClassifyDocumentOptions): Promise<string> => {
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({ model: options.model });

  const generationConfig = {
    temperature: 0.3, // Réduire la température pour des réponses plus directes
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192, // Limitez le nombre de tokens pour obtenir une réponse concise
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  try {
    // Introduire un délai avant l'envoi de chaque requête (1 seconde)
    await delay(1000); // délai de 1 seconde entre les requêtes

    const instruction = `Pour le texte suivant : "${text}", identifiez strictement le type de document parmi les catégories suivantes : 
- Facture
- Reçu
- Contrat
- Bon de commande
- Devis
- Rapport
- Relevé bancaire
- Attestation
- Lettre de motivation
- CV
- Document d'identité
- Acte de naissance
- Certificat médical
- Rapport d'audit
- Procès-verbal
- Document légal
- Polices d'assurance
- Fiche de paie
- Courrier administratif
- Document de propriété
- Plan d'affaires
- Proposition
- Accord de confidentialité
- Document technique
- Spécifications
- Bulletin de salaire
- Dossier médical
- Ordre de mission
- État financier.

Répondez uniquement par le type de document, sans faire de phrase. Par exemple, pour un contrat, répondez uniquement : "Contrat".
`;

    // Envoi du message de classification
    const result = await chatSession.sendMessage(instruction);

    // Retourner le type de document après traitement
    return result.response.text().trim();
  } catch (error: any) {
    // Gestion des erreurs spécifiques
    if (error.response) {
      // Erreur liée à la réponse de l'API
      console.error('Erreur API :', error.response.data || error.message);
      throw new Error('Le modèle Google Generative AI n\'a pas pu traiter la demande. Veuillez réessayer plus tard.');
    } else if (error.request) {
      // Erreur liée à la requête (ex: problème réseau)
      console.error('Erreur réseau :', error.request);
      throw new Error('Problème de connexion au service. Vérifiez votre connexion Internet et réessayez.');
    } else {
      // Autres types d'erreurs
      console.error('Erreur inconnue :', error.message);
      throw new Error('Une erreur inconnue est survenue lors de la classification du document.');
    }
  }
};

export default classifyDocument;
