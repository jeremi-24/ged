// src/lib/fetchDocuments.ts

import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; // Assurez-vous que le chemin est correct
import { DocumentData } from "@/types/types"; // Importer le type DocumentData si nécessaire
import { getAuth } from "firebase/auth";

export const fetchDocuments = async (): Promise<DocumentData[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Aucun utilisateur connecté.");
    }

    // Récupérer la sous-collection "documents" pour l'utilisateur spécifié
    const querySnapshot = await getDocs(collection(firestore, "users", user.uid, "documents"));

    // Retourner les documents sous forme d'un tableau d'objets
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<DocumentData, 'id'>, // Exclure l'id de la forme de DocumentData
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw new Error("Impossible de récupérer les documents.");
  }
};
