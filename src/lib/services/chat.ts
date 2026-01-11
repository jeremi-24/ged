import { GoogleGenerativeAI } from '@google/generative-ai';

type ClassifyDocumentOptions = {
  apiKey: string; // Clé API de Google Generative AI
  model: string; // Nom du modèle Google Generative AI, par exemple "gemini-1.5-flash"
};

const Chat = async (text: string, options: ClassifyDocumentOptions): Promise<string> => {
  if (!options.apiKey || options.apiKey === 'your_gemini_api_key') {
    throw new Error('Clé API Gemini manquante. Vérifiez votre fichier .env.');
  }

  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({ model: options.model });

  const generationConfig = {
    temperature: 0.15, // Réduire la température pour des réponses plus directes
    topP: 0.95,
    topK: 64,

    maxOutputTokens: 1000000, // Limitez le nombre de tokens pour obtenir une réponse concise
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({

    generationConfig,
    history: [],
  });

  try {
    // Modifier l'instruction pour demander une réponse concise
    const instruction = `${text}`;


    const result = await chatSession.sendMessage(instruction);
    return result.response.text().trim();
  } catch (error: any) {
    if (error.message?.includes('API key not valid')) {
      console.error('Erreur : Clé API Gemini invalide.');
      throw new Error('Clé API Gemini invalide.');
    }
    console.error('Erreur lors de la session de chat IA :', error.response?.data || error.message);
    throw new Error('L\'IA n\'a pas pu répondre.');
  }
};

export default Chat;
