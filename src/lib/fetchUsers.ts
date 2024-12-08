// src/lib/fetchUsers.ts

import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; // Assurez-vous que le chemin est correct

export const fetchUserCount = async (): Promise<number> => {
  try {
    // Récupérer tous les documents de la collection "users"
    const querySnapshot = await getDocs(collection(firestore, "users"));
    
    // Retourner le nombre de documents dans la collection "users"
    return querySnapshot.size;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", error);
    throw new Error("Impossible de récupérer le nombre d'utilisateurs.");
  }
};
