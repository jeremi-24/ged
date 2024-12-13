import React, { useState, useEffect, useCallback } from 'react';
import { firestore } from '@/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { DocumentData } from '@/types/types';
import { getAuth } from 'firebase/auth';

export const useSearch = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [allDocuments, setAllDocuments] = useState<DocumentData[]>([]);
  const [results, setResults] = useState<DocumentData[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Fonction pour récupérer tous les documents avec cache
  const fetchAllDocuments = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("Aucun utilisateur connecté.");
        return; // Sortir de la fonction si l'utilisateur n'est pas connecté
      }

      // Vérifier si les documents sont dans le cache local
      const cachedDocuments = localStorage.getItem(`documents_${user.uid}`);
      if (cachedDocuments) {
        console.log("Documents récupérés depuis le cache local.");
        setAllDocuments(JSON.parse(cachedDocuments)); // Utiliser le cache
        return;
      }

      const documentsRef = collection(firestore, 'users', user.uid, 'documents'); // Accéder à la sous-collection "documents"
      const querySnapshot = await getDocs(documentsRef);

      const documents: DocumentData[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData; // Type des données
        return {
          id: doc.id,
          name: data.name,
          classification: data.classification,
          createdAt: data.createdAt,
          text: data.text,
          size: data.size,
          type: data.type,
          url: data.url,
          isArchived: data.isArchived,
        };
      });

      setAllDocuments(documents); // Stocke tous les documents dans l'état
      localStorage.setItem(`documents_${user.uid}`, JSON.stringify(documents)); // Mettre en cache dans le localStorage
      console.log("Tous les documents récupérés et mis en cache :", documents);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  // Utilise useEffect pour récupérer les documents une seule fois lors du premier chargement
  useEffect(() => {
    fetchAllDocuments();
  }, []);

  // Fonction pour rechercher des documents
  const filterDocuments = useCallback((text: string) => {
    return allDocuments.filter(doc => doc.text.includes(text));
  }, [allDocuments]); // Dépend de allDocuments

  // Utilise useEffect pour filtrer les résultats chaque fois que le texte de recherche change
  useEffect(() => {
    if (!searchText) {
      setResults(allDocuments); // Si aucune recherche, montrez tous les documents
    } else {
      const filteredResults = filterDocuments(searchText);
      setResults(filteredResults);

      // Enregistrer la recherche dans Firestore
      enregistrerHistoriqueRecherche(searchText);
    }
  }, [searchText, allDocuments, filterDocuments]);

  // Fonction pour enregistrer l'historique des recherches dans Firestore
  const enregistrerHistoriqueRecherche = async (searchText: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("Aucun utilisateur connecté.");
      return;
    }

    try {
      const historiqueRecherchesRef = collection(firestore, 'users', user.uid, 'historiqueRecherches');
      await addDoc(historiqueRecherchesRef, {
        searchText,
        userId: user.uid,
        timestamp: new Date(),
      });
      console.log("Recherche enregistrée !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la recherche :", error);
    }
  };

  // Fonction pour démarrer la reconnaissance vocale
  const startVoiceSearch = (callback: (text: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Votre navigateur ne prend pas en charge la recherche vocale.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'fr-FR'; // Définir la langue à français

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = event.results[0][0].transcript;

      // Enlever le point si le texte se termine par un point
      transcript = transcript.replace(/\.+$/, ''); // Remplace les points finaux par une chaîne vide
      setSearchText(transcript); // Met à jour le texte de recherche sans le point final
      callback(transcript); // Appelle le callback avec le texte transcrit
    };

    recognitionInstance.onerror = (event: SpeechRecognitionError) => {
      console.error("Erreur de reconnaissance vocale :", event.error);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  return {
    searchText,
    setSearchText,
    results, // Résultats filtrés
    startVoiceSearch,
  };
};
