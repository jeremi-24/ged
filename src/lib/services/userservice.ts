import { firestore } from "@/firebase/config"; // Assurez-vous que c'est la bonne importation
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (userId: string) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const role = userDoc.data().role; // Assurez-vous que le champ 'role' existe
      return role;
    } else {
      throw new Error("Utilisateur non trouvé");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    throw error; // Propagation de l'erreur
  }
};
