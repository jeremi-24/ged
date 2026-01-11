'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from '@/types/types';
import { useSearch } from '@/lib/services/Search';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import './style.css';
import { LogEntry } from '@/types/Logs';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';
import { getAuth } from 'firebase/auth';
import UserInfoDialog from '@/components/ux/UserInfoDialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, SlidersHorizontal, ArrowRight } from "lucide-react";

export default function Contenu() {
  const { toast } = useToast();
  const { searchText, setSearchText, results, startVoiceSearch } = useSearch();
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const [classificationFilter, setClassificationFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('');
  const [groupOption, setGroupOption] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const filteredResults = results.filter(doc => {
    const matchesClassification = classificationFilter ? doc.classification === classificationFilter : true;

    let docDate: Date | null = null;
    if (doc.createdAt instanceof Timestamp) {
      docDate = doc.createdAt.toDate();
    } else if (doc.createdAt instanceof Date) {
      docDate = doc.createdAt;
    }

    const docDateString = docDate ? docDate.toISOString().substring(0, 10) : null;
    const matchesDate = dateFilter ? docDateString === dateFilter : true;

    return matchesClassification && matchesDate;
  });

  const handleVoiceSearch = () => {
    // Vérifie si la reconnaissance vocale est supportée
    if (!('webkitSpeechRecognition' in window)) {
      alert('Votre navigateur ne prend pas en charge la recherche vocale.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR'; // Définir la langue

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript; // Récupère le texte reconnu
      setSearchText(transcript); // Met à jour le texte de recherche
    };

    recognition.onerror = (event: any) => {

      toast({
        title: "Erreur",
        description: `Erreur de reconnaissance vocale: ${event.error}`, // Utilisation correcte de la variable event.error
        variant: "destructive",
      });// Log d'erreur
    };

    recognition.start(); // Démarre la reconnaissance vocale
  };



  const uniqueClassifications = Array.from(new Set(results.map(doc => doc.classification)));

  // Tri des résultats
  let sortedResults = [...filteredResults];
  if (sortOption === 'name') {
    sortedResults.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'date') {
    sortedResults.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Groupement des résultats
  const groupedResults = groupOption ? sortedResults.reduce((groups, doc) => {
    const groupKey = groupOption === 'classification'
      ? doc.classification
      : (() => {
        let date;
        if (doc.createdAt instanceof Timestamp) {
          date = doc.createdAt.toDate();
        } else if (typeof doc.createdAt === 'string') {
          date = new Date(doc.createdAt);
        } else {
          return null;
        }
        return isNaN(date.getTime()) ? null : date.toISOString().substring(0, 10);
      })();

    if (groupKey) {
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    }
    return groups;
  }, {} as Record<string, DocumentData[]>) : { 'Tous': sortedResults };

  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogDescription, setDialogDescription] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = fileName; // Utiliser le nom du document ici
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob); // Libérer l'URL blob

      const deviceDetails = getDeviceInfo();
      const auth = getAuth();
      const user = auth.currentUser; // Obtenez l'utilisateur connecté

      // Enregistrement du log après le succès du téléchargement
      const logEntry: LogEntry = {
        event: "téléchargement_de_document",
        documentId: fileName, // Utiliser fileName ou un ID unique si disponible
        createdAt: new Date(),
        details: `Le document ${fileName} a été téléchargé avec succès`,
        userId: user ? user.uid : "Utilisateur non connecté", // Ajouter l'ID utilisateur ici si disponible
        device: `Depuis ${deviceDetails}`,
      };

      if (user) {
        await logEvent(logEntry, user.uid); // Appel à logEvent avec user.uid
      } else {
        console.error("Erreur : utilisateur non connecté");
      }


      setDialogTitle("");
      setDialogDescription(`Le document ${fileName} a été téléchargé avec succès.`);
      setDialogOpen(true);
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier :", error);
    }
  };



  const [isListening, setIsListening] = useState(false);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      if (date && typeof date === 'object' && 'seconds' in date) {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const getFileIcon = (type: string) => {
    const isImage = type.includes('image');
    const isPDF = type.includes('pdf');
    return (
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-black/5 dark:border-white/5",
        isPDF ? "bg-orange-500/10 text-orange-500" :
          isImage ? "bg-blue-500/10 text-blue-500" :
            "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
      )}>
        {isPDF ? <span className="text-xl font-bold">PDF</span> :
          isImage ? <span className="text-xl font-bold">IMG</span> :
            <span className="text-xl font-bold">DOC</span>}
      </div>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const c = classification?.toLowerCase() || "";
    const config: Record<string, { label: string, color: string }> = {
      'facture': { label: 'Facture', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50' },
      'contrat': { label: 'Contrat', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50' },
      'identite': { label: 'Identité', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' },
    };
    const matched = Object.entries(config).find(([key]) => c.includes(key));
    if (matched) return <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-none border", matched[1].color)}>{matched[1].label}</Badge>;
    return <Badge variant="outline" className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight text-zinc-500 border-zinc-200/50 dark:border-zinc-800/50 shadow-none">{classification || "Inconnu"}</Badge>;
  };

  return (
    <div className="mt-6 h-[calc(100vh-120px)] flex flex-col bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
      <UserInfoDialog />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={75} minSize={60} className="flex flex-col">
          {/* Header Search Area */}
          <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100">Recherche Intelligente</h1>
                <p className="text-zinc-500 font-medium">Localisez instantanément vos documents auto-classés.</p>
              </div>

              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <div className="w-full max-w-2xl relative group">
                  <input
                    id='search'
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Recherchez des documents par nom ou contenu..."
                    className="w-full p-4 pl-6 pr-32 border border-slate-200 rounded-2xl shadow-sm search-input-pro bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                    <button
                      onClick={handleVoiceSearch}
                      className="btn-professional btn-ghost-pro text-blue-600 hover:bg-blue-50"
                    >
                      Vocal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-auto p-8">
            <AnimatePresence mode="wait">
              {Object.keys(groupedResults).length > 0 && filteredResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  {Object.entries(groupedResults).map(([group, docs]) => (
                    <div key={group} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                          {group} ({docs.length})
                        </h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                      </div>

                      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 p-4">
                        {docs.map((doc) => (
                          <li key={doc.id} className="relative card-pro group/card animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Link href={`/discussion?id=${doc.url}&text=${encodeURIComponent(doc.text)}&texte=${encodeURIComponent(doc.url)}&name=${encodeURIComponent(doc.name)}`} className="block h-full">
                              <div className="p-3 bg-slate-50/50">
                                <div className="aspect-[4/3] w-full relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.url)}&embedded=true`}
                                    width="100%"
                                    height="100%"
                                    className="w-full h-full grayscale-[0.5] group-hover/card:grayscale-0 transition-all duration-500"
                                  />
                                </div>
                              </div>
                              <div className='p-5 space-y-2'>
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover/card:text-blue-600 transition-colors uppercase tracking-tight">{doc.name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="badge-pro bg-blue-50 text-blue-600 uppercase">
                                    {doc.classification}
                                  </span>
                                  <span className={`badge-pro ${doc.isArchived ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {doc.isArchived ? 'Archivé' : 'Actif'}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </Link>

                            <button
                              onClick={() => downloadFile(doc.url, doc.name)}
                              className="absolute bottom-4 right-4 btn-professional btn-primary-pro opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0"
                            >
                              Télécharger
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 text-zinc-400">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <span className="text-3xl font-bold opacity-20">?</span>
                  </div>
                  <p className="font-bold italic text-sm">Aucun résultat trouvé dans la bibliothèque</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-transparent hover:bg-blue-500/20 transition-colors" />

        <ResizablePanel defaultSize={25} minSize={20} className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Filtres Avancés</h2>
            </div>

            <div className="space-y-6">
              {/* Classification */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Classification</label>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm font-medium">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="none">Toutes les catégories</SelectItem>
                    {uniqueClassifications.map((c) => (
                      <SelectItem key={c} value={c} className="rounded-lg capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Période</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 rounded-xl justify-start text-left font-medium bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm",
                        !dateFilter && "text-zinc-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {dateFilter ? format(new Date(dateFilter), "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter ? new Date(dateFilter) : undefined}
                      onSelect={(date) => setDateFilter(date ? date.toISOString().substring(0, 10) : "")}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sorting */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Trier par</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'none', label: 'Défaut' },
                    { id: 'name', label: 'Nom du fichier' },
                    { id: 'date', label: 'Date d\'ajout' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortOption(opt.id === 'none' ? '' : opt.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                        (opt.id === 'none' ? sortOption === '' : sortOption === opt.id)
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-sm"
                          : "bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      {opt.label}
                      {(opt.id === 'none' ? sortOption === '' : sortOption === opt.id) && <ArrowRight className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping */}
              <div className="space-y-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Grouper par</label>
                <div className="flex gap-2">
                  {[
                    { id: '', label: 'Aucun' },
                    { id: 'classification', label: 'Catégorie' },
                    { id: 'date', label: 'Date' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGroupOption(opt.id)}
                      className={cn(
                        "flex-1 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border",
                        groupOption === opt.id
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-md transform scale-105"
                          : "bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/5 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => {
                setClassificationFilter('');
                setDateFilter('');
                setSortOption('');
                setGroupOption('');
                setSearchText('');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
