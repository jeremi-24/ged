// src/services/logService.ts
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; // Assurez-vous que le chemin est correct
import { LogEntry } from "@/types/Logs"; // Importer l'interface LogEntry

export const fetchLogs = async (userId: string): Promise<LogEntry[]> => {
  try {
    // Référence à la sous-collection de logs de l'utilisateur
    const logsCollection = collection(firestore, `users/${userId}/logs`);
    
    // Récupérer tous les documents de la collection
    const logSnapshots = await getDocs(logsCollection);

    // Mapper les données de Firestore à l'interface LogEntry
    const logs: LogEntry[] = logSnapshots.docs.map(doc => ({
      documentId: doc.id, // Ajouter l'ID du document Firestore
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Date ? doc.data().createdAt : doc.data().createdAt.toDate(), // Vérifiez le type
    })) as LogEntry[];

    return logs;
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};
