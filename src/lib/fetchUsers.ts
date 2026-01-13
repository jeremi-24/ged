

import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; 

export const fetchUserCount = async (): Promise<number> => {
  try {
    
    const querySnapshot = await getDocs(collection(firestore, "users"));

    return querySnapshot.size;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", error);
    throw new Error("Impossible de récupérer le nombre d'utilisateurs.");
  }
};
