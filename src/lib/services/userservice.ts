import { firestore } from "@/firebase/config"; 
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (userId: string) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const role = userDoc.data().role; 
      return role;
    } else {
      throw new Error("Utilisateur non trouvé");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    throw error; 
  }
};
