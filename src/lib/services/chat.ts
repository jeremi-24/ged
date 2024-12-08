import { GoogleGenerativeAI } from '@google/generative-ai';

type ClassifyDocumentOptions = {
  apiKey: string; // Clé API de Google Generative AI
  model: string; // Nom du modèle Google Generative AI, par exemple "gemini-1.5-flash"
};

const Chat = async (text: string, options: ClassifyDocumentOptions): Promise<string> => {
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
    console.error('Erreur lors de la classification du document :', error.response?.data || error.message);
    throw new Error('Classification échouée');
  }
};

export default Chat;
