
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config"; 
import { LogEntry } from "@/types/Logs"; 
import { getAuth } from "firebase/auth";

export const fetchAllLogs = async (): Promise<Record<string, LogEntry[]>> => {
  try {
    const auth = getAuth(); 
    const users = await getDocs(collection(firestore, 'users')); 

    const allLogs: Record<string, LogEntry[]> = {}; 

    for (const userDoc of users.docs) {
      const userId = userDoc.id; 
      const logsCollection = collection(firestore, `users/${userId}/logs`); 
      const logSnapshots = await getDocs(logsCollection); 

      const logs: LogEntry[] = logSnapshots.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Date 
          ? doc.data().createdAt 
          : doc.data().createdAt.toDate(), 
      })) as LogEntry[];

      allLogs[userId] = logs; 
    }

    return allLogs; 
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return {}; 
  }
};
