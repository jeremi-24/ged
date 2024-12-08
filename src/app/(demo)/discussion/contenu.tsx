'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Chat from '@/lib/services/chat';
import { Card, CardContent } from '@/components/ui/card';
import UserInfoDialog from '@/components/ux/UserInfoDialog';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Contenu = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const text = searchParams.get('text');
  const texte = searchParams.get('texte') || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialiser les messages si nécessaire
  }, [id, text]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage: Message = { id: messages.length + 1, text: newMessage, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setNewMessage('');
      setLoading(true);

      try {
        const botResponse = await Chat(` Document Text: ${text}\n${newMessage}`, {
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
          model: 'gemini-1.5-pro',
        });
        const apiMessage: Message = { id: messages.length + 2, text: botResponse, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, apiMessage]);
      } catch (error) {
        console.error('Erreur lors de la récupération de la réponse:', error);
        const errorMessage: Message = { id: messages.length + 2, text: 'Erreur lors de la récupération de la réponse.', sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Empêche le comportement par défaut (saut de ligne)
      handleSendMessage();
    }
  };

  return (
    <Card className="rounded-lg border-none mt-6">
      <CardContent className="p-6">
      <UserInfoDialog/>
        <div className="flex justify-center items-stretch min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
          <div className="flex w-full">
            {/* Bloc gauche pour l'aperçu du document */}
            <div className="w-1/2 p-4 flex flex-col max-w-[100%] mx-auto">
              <h2 className="text-xl mb-4">Aperçu du Document</h2>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(texte)}&embedded=true`}
                className="w-full h-[310px] border" // Réduit la hauteur de l'iframe
                title="Document Preview"
              />
            </div>

            {/* Bloc droit pour l'interface de chat */}
            <div className="w-1/2 p-4 flex flex-col max-w-[90%] mx-auto">
              <div className="flex-grow border rounded-md p-2 h-64 overflow-y-auto"> {/* Réduit la hauteur de la zone de chat */}
                {messages.map((message) => (
                  <div key={message.id} className={`my-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block p-2 rounded ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                      {message.text}
                    </span>
                  </div>
                ))}
                {loading && <div className="text-center text-gray-500">Chargement...</div>}
              </div>

              <div className="mt-4 flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown} // Ajout du gestionnaire d'événements
                  className="border rounded-l-md p-2 flex-grow"
                  placeholder="Tapez votre message ici..."
                  aria-label="Nouveau message"
                />
                <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded-r-md px-4" aria-label="Envoyer message">
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Contenu;
