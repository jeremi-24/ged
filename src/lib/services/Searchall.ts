import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/config';
import { collection, getDocs, query, where, documentId, addDoc } from 'firebase/firestore';
import { DocumentData } from '@/types/types';
import { getAuth } from 'firebase/auth';

export const useSearch = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [allDocuments, setAllDocuments] = useState<DocumentData[]>([]);
  const [results, setResults] = useState<DocumentData[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Fonction pour récupérer tous les documents de tous les utilisateurs
  const fetchAllDocuments = async () => {
    try {
      const usersCollectionRef = collection(firestore, 'users'); // Accède à la collection 'users'
      const userSnapshot = await getDocs(usersCollectionRef);

      const allDocs: DocumentData[] = [];
      
      // Parcourt chaque utilisateur et récupère ses documents
      for (const userDoc of userSnapshot.docs) {
        const documentsRef = collection(userDoc.ref, 'documents'); // Accède à la sous-collection 'documents' de chaque utilisateur
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
            isArchived : data.isArchived // Ajoute l'ID utilisateur pour référence
          };
        });
        
        allDocs.push(...userDocuments); // Ajoute les documents de cet utilisateur à la liste totale
      }

      setAllDocuments(allDocs); // Stocke tous les documents dans l'état
      console.log("Tous les documents récupérés :", allDocs);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  };

  // Utilise useEffect pour récupérer les documents une seule fois lors du premier chargement
  useEffect(() => {
    fetchAllDocuments();
  }, []);

  // Utilise useEffect pour filtrer les résultats chaque fois que le texte de recherche change
  useEffect(() => {
    if (!searchText) {
      setResults(allDocuments); // Si aucune recherche, montrez tous les documents
    } else {
      const filteredResults = filterDocuments(searchText);
      setResults(filteredResults);
    }
  }, [searchText, allDocuments]);

  // Fonction pour rechercher des documents
  const filterDocuments = (text: string): DocumentData[] => {
    const regex = new RegExp(text, 'i'); // 'i' pour une recherche insensible à la casse
    return allDocuments.filter(doc => doc.text && regex.test(doc.text));
  };
  
      
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
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript); // Met à jour le texte de recherche
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
