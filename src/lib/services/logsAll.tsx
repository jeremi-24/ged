// src/services/logService.ts
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; // Assurez-vous que le chemin est correct
import { LogEntry } from "@/types/Logs"; // Importer l'interface LogEntry
import { getAuth } from "firebase/auth";

export const fetchAllLogs = async (): Promise<Record<string, LogEntry[]>> => {
  try {
    const auth = getAuth(); // Récupération de l'instance d'authentification Firebase
    const users = await getDocs(collection(firestore, 'users')); // Récupérer tous les utilisateurs

    const allLogs: Record<string, LogEntry[]> = {}; // Objet pour stocker les logs groupés par userId

    for (const userDoc of users.docs) {
      const userId = userDoc.id; // L'ID de l'utilisateur actuel
      const logsCollection = collection(firestore, `users/${userId}/logs`); // Référence à la sous-collection de logs
      const logSnapshots = await getDocs(logsCollection); // Récupérer les logs de l'utilisateur

      // Mapper les données de Firestore à l'interface LogEntry
      const logs: LogEntry[] = logSnapshots.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Date 
          ? doc.data().createdAt 
          : doc.data().createdAt.toDate(), // Vérifiez le type
      })) as LogEntry[];

      allLogs[userId] = logs; // Ajouter les logs à l'objet avec l'ID de l'utilisateur comme clé
    }

    return allLogs; // Retourner l'objet contenant tous les logs groupés
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return {}; // Retourner un objet vide en cas d'erreur
  }
};
