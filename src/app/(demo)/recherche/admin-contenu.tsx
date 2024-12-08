'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from '@/types/types';
import { useSearch } from '@/lib/services/Searchall';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Search, Mic, Share2, Trash2, Download, X, Sparkle } from "lucide-react";
import './style.css';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { DialogTitle } from '@/components/ui/dialog';
import { LogEntry } from '@/types/Logs';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';
import { getAuth } from 'firebase/auth';
import UserInfoDialog from '@/components/ux/UserInfoDialog';

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
    
  return (
    <div className="rounded-lg border-none mt-3 shadow-sm">
    <div className="p-0">
    <UserInfoDialog/>
      <ResizablePanelGroup direction="horizontal" className="w-full rounded-lg border">
        <ResizablePanel defaultSize={85} className="p-5">
         
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-xl rounded-lg relative">
              <input
                id='search'
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Recherchez des documents..."
                className="w-full p-3 pl-12 pr-12 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 -left-2 flex items-center">
                <Image
                  src="/star.png"
                  alt="Description de l'image"
                  width={60}
                  height={60}
                  className="" 
                />
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
              <div className="group relative p-2 rounded-full">
  <div onClick={handleVoiceSearch} className="flex items-center">
    <Mic  className="hover:text-green-600 text-gray-400 mr-1" /> {/* Icône Mic */}
    {showTooltip && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2 p-2 bg-blue-500 text-white text-sm rounded shadow-lg animate-fadeInOut">
          Cliquez ici pour commencer !
        </div>
      )}
   
  </div>
  <div className="bg-zinc-800 p-2 rounded-md group-hover:flex hidden absolute top-1/2 -translate-y-1/2 -left-2 -translate-x-full">
    <span className="text-zinc-400 whitespace-nowrap">Cliquer pour une recherche vocale</span>
    <div className="bg-inherit rotate-45 p-1 absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2"></div>
  </div>
</div>

              </div>
            </div>
          </div>
  
          
          <div className="overflow-auto min-h-[300px] max-h-[500px]">
            {Object.keys(groupedResults).map((group) => (
              <div key={group}>
                <h3 className="text-lg font-bold">{group}</h3>
                <ul className="grid grid-cols-1 gap-y-10 gap-x-5 md:grid-cols-2 p-5 lg:grid-cols-3">
                  {groupedResults[group].map((doc) => (
                   <li key={doc.id} className="relative border border-gray-200 rounded-xl card hover:shadow-md transition duration-150">
                   {/* Vérification si doc.url existe avant de construire le lien */}
                   {doc.url ? (
                     <Link href={`/discussion?id=${doc.url}&text=${encodeURIComponent(doc.text)}&texte=${encodeURIComponent(doc.url)}`}>
                       <div className="flex-grow p-2">
                         <iframe
                           src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.url)}&embedded=true`}
                           width="100%"
                           height="100%"
                           className="border rounded-xl"
                           style={{ minHeight: '200px' }}
                         />
                       </div>
                     </Link>
                   ) : (
                     <div className="flex-grow p-2">
                       <p className="text-gray-500">Le document n&apos;est pas disponible.</p>
                     </div>
                   )}
               
                   <div className='mb-3 ml-3'>
                     <h3 className="text-lg font-semibold text-green-600">{doc.name}</h3>
                     <p className="text-gray-600">{doc.classification}</p>
                     <p className={`text-gray-600 ${doc.isArchived ? 'text-green-600' : 'text-red-600'}`}>
                       {doc.isArchived !== undefined 
                         ? (doc.isArchived ? 'archivé' : 'non archivé') 
                         : 'Non spécifié'}
                     </p>
                     <p className="text-gray-500 text-sm">{new Date(doc.createdAt).toLocaleDateString()}</p>
                   </div>
               
                   {/* Cercle avec icône de téléchargement */}
                   {doc.url && (
                      <div className="relative ">
                      {/* Bouton en haut */}
                      <Link href={`/discussion?id=${doc.url}&text=${encodeURIComponent(doc.text)}&texte=${encodeURIComponent(doc.url)}`}>
                      <button 
                       
                        className="absolute bottom-2 right-2 bg-green-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition duration-150"
                      >
                        <Sparkle className="w-5 h-5" />
                      </button></Link>
                
                      {/* Bouton plus bas et plus petit */}
                      <button 
                        onClick={() => downloadFile(doc.url, doc.name)}
                        className="absolute bottom-12 right-2 bg-green-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition duration-150"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                   )}
                 </li>
               ))}
                </ul>
              </div>
            ))}
            {filteredResults.length === 0 && (
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Aucun résultat trouvé.</p>
              </div>
            )}
          </div>
        </ResizablePanel>
  
        <ResizableHandle />
        <ResizablePanel defaultSize={15} className="p-5">
          <h2 className="text-xl font-semibold">Aperçu</h2>
  
          {/* Options de filtre */}
          <div className="w-full max-w-2xl space-y-4 mt-6">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Options de filtre</h2>
  
            {/* Filtre de classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrer par classification :</label>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {uniqueClassifications.map((classification) => (
                  <option key={classification} value={classification}>
                    {classification}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Filtre de date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrer par date :</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              />
            </div>
  
            {/* Options de tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Trier par :</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              >
                <option value="">Aucun tri</option>
                <option value="name">Nom</option>
                <option value="date">Date</option>
              </select>
            </div>
  
            {/* Options de groupement */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Grouper par :</label>
              <select
                value={groupOption}
                onChange={(e) => setGroupOption(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              >
                <option value="">Aucun groupement</option>
                <option value="classification">Classification</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
  
  );
}
