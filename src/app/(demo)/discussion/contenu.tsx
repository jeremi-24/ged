'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Chat from '@/lib/services/chat';
import { Card, CardContent } from '@/components/ui/card';
import UserInfoDialog from '@/components/ux/UserInfoDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, FileText, Maximize2, Minimize2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Contenu = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const documentText = searchParams.get('text') || '';
  const documentUrl = searchParams.get('texte') || '';
  const documentName = searchParams.get('name') || 'Document';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Bonjour ! Je suis prêt à vous aider à analyser le document "${documentName}". Que souhaitez-vous savoir ?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const userMsgText = newMessage.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setLoading(true);

    try {
      const prompt = `Contexte du document : ${documentText}\n\nQuestion de l'utilisateur : ${userMsgText}\n\nRépondez de manière précise en vous basant uniquement sur le document fourni si possible.`;

      const botResponse = await Chat(prompt, {
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
        model: 'gemini-3-flash-preview',
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, j'ai rencontré une difficulté technique pour analyser votre demande. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const isPdf = documentUrl.toLowerCase().includes('.pdf') || documentUrl.includes('application/pdf');

  return (
    <div className="space-y-6 mt-6">
      <UserInfoDialog />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
        {}
        <motion.div
          className={cn(
            "transition-all duration-500 ease-in-out",
            isPreviewExpanded ? "w-full lg:w-2/3" : "w-full lg:w-5/12"
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[200px]">{documentName}</h3>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider h-4">Aperçu</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              >
                {isPreviewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative">
              {documentUrl ? (
                isPdf ? (
                  <iframe
                    src={`${documentUrl}#toolbar=0`}
                    className="w-full h-full border-none"
                    title="Document Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 relative min-h-[300px]">
                    <Image
                      src={documentUrl}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                  <FileText className="w-16 h-16 opacity-20" />
                  <p className="text-sm font-medium">Aperçu non disponible</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {}
        <motion.div
          className={cn(
            "flex-1 flex flex-col transition-all duration-500",
            isPreviewExpanded ? "lg:w-1/3" : "lg:w-7/12"
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="flex-1 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant Intelligence Artificielle</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Connecté</span>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      message.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm",
                      message.sender === 'user' ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600" : "bg-blue-500 text-white"
                    )}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      message.sender === 'user'
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-none border border-zinc-100 dark:border-zinc-700"
                        : "bg-blue-500 text-white rounded-tl-none font-medium"
                    )}>
                      {message.text}
                      <div className={cn(
                        "text-[10px] mt-2 opacity-50 font-bold",
                        message.sender === 'user' ? "text-right" : "text-left"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-700 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="relative flex items-center gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Posez une question sur le document..."
                  className="rounded-2xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 h-12 pr-12 focus-visible:ring-blue-500 shadow-inner"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 text-white rounded-xl bg-blue-600 hover:bg-blue-700 shadow shadow-blue-500/20"
                  disabled={!newMessage.trim() || loading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[10px] text-center text-zinc-400 mt-2 font-medium">
                L&apos;IA peut faire des erreurs, vérifiez les informations importantes.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contenu;
