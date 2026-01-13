import { GoogleGenerativeAI } from '@google/generative-ai';

type ClassifyDocumentOptions = {
  apiKey: string; 
  model: string; 
};

const Chat = async (text: string, options: ClassifyDocumentOptions): Promise<string> => {
  if (!options.apiKey || options.apiKey === 'your_gemini_api_key') {
    throw new Error('Clé API Gemini manquante. Vérifiez votre fichier .env.');
  }

  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({ model: options.model });

  const generationConfig = {
    temperature: 0.15, 
    topP: 0.95,
    topK: 64,

    maxOutputTokens: 1000000, 
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({

    generationConfig,
    history: [],
  });

  try {
    
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
