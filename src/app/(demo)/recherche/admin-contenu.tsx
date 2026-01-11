'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from '@/types/types';
import { useSearch } from '@/lib/services/Searchall';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import './style.css';
import { LogEntry } from '@/types/Logs';
import { DialogTitle } from '@/components/ui/dialog';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';
import { getAuth } from 'firebase/auth';
import UserInfoDialog from '@/components/ux/UserInfoDialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, SlidersHorizontal, ArrowRight } from "lucide-react";

export default function AdminContent() {
  const { searchText, setSearchText, results, startVoiceSearch } = useSearch();
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const [classificationFilter, setClassificationFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('');
  const { toast } = useToast();
  const [groupOption, setGroupOption] = useState<string>('');

  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Masque le panneau après 5 secondes
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    // Nettoyage du timer lors de la déconstruction du composant
    return () => clearTimeout(timer);
  }, []);

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
      console.error('Erreur de reconnaissance vocale:', event.error);

      toast({
        title: "Erreur",
        description: `Erreur de reconnaissance vocale: ${event.error}`, // Utilisation correcte de la variable event.error
        variant: "destructive",
      });
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

      toast({
        title: "Erreur",
        description: `Erreur lors du téléchargement du fichier: ${error}`, // Utilisation correcte de la variable event.error
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="rounded-lg border-none mt-3 shadow-sm">
      <div className="p-0">
        <UserInfoDialog />
        <ResizablePanelGroup direction="horizontal" className="w-full rounded-lg border border-border">
          <ResizablePanel defaultSize={70} minSize={60} className="p-5">

            <div className="flex flex-col items-center space-y-4 w-full px-4">
              <div className="w-full max-w-2xl relative group">
                <input
                  id='search'
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Recherchez des documents par nom ou contenu (Administration)..."
                  className="w-full p-4 pl-6 pr-32 border border-input rounded-2xl shadow-sm search-input-pro bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
                />
                <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                  <button
                    onClick={handleVoiceSearch}
                    className="btn-professional btn-ghost-pro text-primary hover:bg-accent"
                  >
                    Vocal
                  </button>
                </div>
              </div>
            </div>


            <div className="overflow-auto min-h-[300px] max-h-[500px]">
              {Object.keys(groupedResults).map((group) => (
                <div key={group}>
                  <h3 className="text-lg font-bold text-foreground">{group}</h3>
                  <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 p-4">
                    {groupedResults[group].map((doc) => (
                      <li key={doc.id} className="relative card-pro group/card animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Vérification si doc.url existe avant de construire le lien */}
                        {doc.url ? (
                          <div className="h-full flex flex-col">
                            <Link href={`/discussion?id=${doc.url}&text=${encodeURIComponent(doc.text)}&texte=${encodeURIComponent(doc.url)}`} className="block">
                              <div className="p-3 bg-muted/50">
                                <div className="aspect-[4/3] w-full relative overflow-hidden rounded-xl border border-border bg-background">
                                  <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.url)}&embedded=true`}
                                    width="100%"
                                    height="100%"
                                    className="w-full h-full grayscale-[0.5] group-hover/card:grayscale-0 transition-all duration-500"
                                  />
                                </div>
                              </div>
                            </Link>

                            <div className='p-5 space-y-2 flex-grow'>
                              <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover/card:text-primary transition-colors uppercase tracking-tight">{doc.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="badge-pro bg-primary/10 text-primary uppercase">
                                  {doc.classification}
                                </span>
                                <span className={`badge-pro ${doc.isArchived ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                                  {doc.isArchived ? 'Archivé' : 'Actif'}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">{formatDate(doc.createdAt)}</p>
                            </div>

                            <div className="p-4 pt-0 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
                              <Link href={`/discussion?id=${doc.url}&text=${encodeURIComponent(doc.text)}&texte=${encodeURIComponent(doc.url)}`} className="flex-1">
                                <button className="w-full btn-professional btn-outline-pro">
                                  Ouvrir
                                </button>
                              </Link>
                              <button
                                onClick={() => downloadFile(doc.url, doc.name)}
                                className="flex-1 btn-professional btn-primary-pro"
                              >
                                Télécharger
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-muted-foreground text-sm italic">Le document n&apos;est pas disponible.</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {filteredResults.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <p className="text-muted-foreground">Aucun résultat trouvé.</p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent hover:bg-primary/20 transition-colors" />
          <ResizablePanel defaultSize={30} minSize={20} className="p-5 bg-muted/50">
            <div className="p-3 space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Filtres Avancés</h2>
              </div>

              <div className="space-y-6">
                {/* Classification */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</label>
                  <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                    <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border shadow-sm font-medium">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="none">Toutes les catégories</SelectItem>
                      {uniqueClassifications.map((c) => (
                        <SelectItem key={c} value={c} className="rounded-lg capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Période</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 rounded-xl justify-start text-left font-medium bg-background border-border shadow-sm",
                          !dateFilter && "text-muted-foreground"
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trier par</label>
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
                            ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-muted-foreground/50"
                        )}
                      >
                        {opt.label}
                        {(opt.id === 'none' ? sortOption === '' : sortOption === opt.id) && <ArrowRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grouping */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Grouper par</label>
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
                            ? "bg-primary text-primary-foreground border-transparent shadow-md transform scale-105"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
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
                className="w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-[10px] font-bold uppercase tracking-widest"
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
    </div>

  );
}
