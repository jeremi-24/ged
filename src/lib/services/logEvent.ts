import { firestore } from '@/firebase/config'; 
import { collection, addDoc } from 'firebase/firestore';
import { LogEntry } from '@/types/Logs'; 

export const logEvent = async (logEntry: LogEntry, userId: string) => {
  try {
    
    const logsRef = collection(firestore, 'users', userId, 'logs');
    await addDoc(logsRef, logEntry); 

  } catch (error) {
    console.error("Erreur lors de l'enregistrement du log :", error);
  }
};
