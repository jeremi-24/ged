import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { DocumentData } from "@/types/types";
import { Timestamp } from "firebase/firestore";

interface DocumentWithDueDate extends DocumentData {
  documentId: string;
  isArchived: boolean;
}

// Règles d'archivage basées sur la classification des documents (en années)
const archiveRules: { [classification: string]: number } = {
  "Facture": 5,
  "Contrat": 1,
  "Rapport": 3,
  "Reçu": 2,
  // Ajoutez les autres classifications et règles ici
};

// Fonction pour récupérer les documents dont l'échéance d'archivage est dans 1 mois
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

        // Obtenir la règle d'archivage selon la classification
        const archiveThreshold = archiveRules[documentData.classification] || 5;

        // Calculer la date d'échéance d'archivage
        const archiveDueDate = new Date(createdAtDate);
        archiveDueDate.setFullYear(archiveDueDate.getFullYear() + archiveThreshold);

        // Vérifier si l'échéance est dans exactement 1 mois
        if (
          archiveDueDate.getFullYear() === oneMonthFromNow.getFullYear() &&
          archiveDueDate.getMonth() === oneMonthFromNow.getMonth() &&
          archiveDueDate.getDate() === currentDate.getDate()
        ) {
          // Ajouter le document et ses détails dans le tableau de résultats
          documentsToArchive.push({
            ...documentData,  // Inclure tous les champs du document original
            documentId: docSnapshot.id,
            isArchived: documentData.isArchived || false,  // État d'archivage actuel
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
