import { firestore } from '@/firebase/config'; // Assurez-vous d'importer Firestore
import { collection, addDoc } from 'firebase/firestore';
import { LogEntry } from '@/types/Logs'; // Importez votre interface LogEntry

// Fonction pour enregistrer un log pour un utilisateur spécifique
export const logEvent = async (logEntry: LogEntry, userId: string) => {
  try {
    // Référence à la sous-collection "logs" d'un utilisateur
    const logsRef = collection(firestore, 'users', userId, 'logs');
    await addDoc(logsRef, logEntry); // Ajoute le log dans la sous-collection
    console.log("Log enregistré :", logEntry);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du log :", error);
  }
};
