import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { DocumentData } from "@/types/types";
import { Timestamp } from "firebase/firestore";

interface DocumentWithDueDate extends DocumentData {
  documentId: string;
  isArchived: boolean;
}

const archiveRules: { [classification: string]: number } = {
  "Facture": 5,
  "Contrat": 1,
  "Rapport": 3,
  "Reçu": 2,
  
};

export const fetchDocumentsWithOneMonthTillArchival = async (userId: string): Promise<{ documents: DocumentWithDueDate[]; total: number }> => {
  const documentsToArchive: DocumentWithDueDate[] = [];
  const currentDate = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

  try {
    const documentsCollection = collection(firestore, `users/${userId}/documents`);
    const documentSnapshots = await getDocs(documentsCollection);

    for (const docSnapshot of documentSnapshots.docs) {
      const documentData = docSnapshot.data() as DocumentData;

      if (documentData.createdAt && documentData.classification) {
        const createdAtDate = documentData.createdAt instanceof Timestamp
          ? documentData.createdAt.toDate()
          : new Date(documentData.createdAt);

        const archiveThreshold = archiveRules[documentData.classification] || 5;

        const archiveDueDate = new Date(createdAtDate);
        archiveDueDate.setFullYear(archiveDueDate.getFullYear() + archiveThreshold);

        if (
          archiveDueDate.getFullYear() === oneMonthFromNow.getFullYear() &&
          archiveDueDate.getMonth() === oneMonthFromNow.getMonth() &&
          archiveDueDate.getDate() === currentDate.getDate()
        ) {
          
          documentsToArchive.push({
            ...documentData,  
            documentId: docSnapshot.id,
            isArchived: documentData.isArchived || false,  
          });
        }
      }
    }

    console.log("Documents éligibles pour archivage dans 1 mois :", documentsToArchive);
    return { documents: documentsToArchive, total: documentsToArchive.length };
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return { documents: [], total: 0 };
  }
};
