

import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; 
import { DocumentData } from "@/types/types"; 
import { getAuth } from "firebase/auth";

export const fetchDocuments = async (): Promise<DocumentData[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Aucun utilisateur connecté.");
    }

    const querySnapshot = await getDocs(collection(firestore, "users", user.uid, "documents"));

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<DocumentData, 'id'>, 
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw new Error("Impossible de récupérer les documents.");
  }
};
