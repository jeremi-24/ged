
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; 
import { LogEntry } from "@/types/Logs"; 

export const fetchLogs = async (userId: string): Promise<LogEntry[]> => {
  try {
    
    const logsCollection = collection(firestore, `users/${userId}/logs`);

    const logSnapshots = await getDocs(logsCollection);

    const logs: LogEntry[] = logSnapshots.docs.map(doc => ({
      documentId: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Date ? doc.data().createdAt : doc.data().createdAt.toDate(), 
    })) as LogEntry[];

    return logs;
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return []; 
  }
};
