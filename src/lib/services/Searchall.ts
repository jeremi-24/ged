import React, { useState, useEffect, useCallback } from 'react';
import { firestore } from '@/firebase/config';
import { collection, getDocs, query, where, documentId, addDoc } from 'firebase/firestore';
import { DocumentData } from '@/types/types';
import { getAuth } from 'firebase/auth';

export const useSearch = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [allDocuments, setAllDocuments] = useState<DocumentData[]>([]);
  const [results, setResults] = useState<DocumentData[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const fetchAllDocuments = async () => {
    try {
      const usersCollectionRef = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollectionRef);

      const allDocs: DocumentData[] = [];

      for (const userDoc of userSnapshot.docs) {
        const documentsRef = collection(userDoc.ref, 'documents');
        const docSnapshot = await getDocs(documentsRef);

        const userDocuments = docSnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: data.name,
            classification: data.classification,
            createdAt: data.createdAt,
            text: data.text,
            size: data.size,
            type: data.type,
            url: data.url,
            userId: userDoc.id,
            isArchived: data.isArchived
          };
        });

        allDocs.push(...userDocuments);
      }

      setAllDocuments(allDocs);
      console.log("Tous les documents récupérés :", allDocs);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  const filterDocuments = useCallback((text: string): DocumentData[] => {
    const regex = new RegExp(text, 'i');
    return allDocuments.filter(doc => doc.text && regex.test(doc.text));
  }, [allDocuments]);

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setResults(allDocuments);
    } else {
      const filteredResults = filterDocuments(searchText);
      setResults(filteredResults);
    }

  }, [searchText, allDocuments, filterDocuments]);

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

  const startVoiceSearch = (callback: (text: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Votre navigateur ne prend pas en charge la recherche vocale.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'fr-FR';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript);
      callback(transcript);
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
    results,
    startVoiceSearch,
  };
};
