
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config"; 
import { DocumentData } from "@/types/types"; 
import { Timestamp } from "firebase/firestore"; 

interface DocumentAge {
  documentId: string;
  createdAt: Date;
  ageInYears: string; 
  isArchived: boolean; 
}

const archiveRules: { [classification: string]: number } = {
  "Facture": 5,
  "Contrat": 1,
  "Rapport": 3,
  "Reçu": 2,
  
};

export const fetchDocumentAges = async (userId: string): Promise<DocumentAge[]> => {
  const documentAges: DocumentAge[] = [];

  try {
    const documentsCollection = collection(firestore, `users/${userId}/documents`);
    const documentSnapshots = await getDocs(documentsCollection);

    for (const docSnapshot of documentSnapshots.docs) {
      const documentData = docSnapshot.data() as DocumentData;

      if (documentData.createdAt && documentData.classification) {
        const createdAtDate = documentData.createdAt instanceof Timestamp
          ? documentData.createdAt.toDate()
          : new Date(documentData.createdAt);

        const ageInYears = calculateDocumentAge(createdAtDate);

        const archiveThreshold = archiveRules[documentData.classification] || 5; 

        const isArchived = checkIfArchived(createdAtDate, archiveThreshold);

        if (documentData.isArchived !== isArchived) {
          
          const documentRef = doc(firestore, `users/${userId}/documents`, docSnapshot.id);
          await updateDoc(documentRef, { isArchived });
          console.log(`Document ${docSnapshot.id} mis à jour : isArchived = ${isArchived}`);
        }

        documentAges.push({
          documentId: docSnapshot.id,
          createdAt: createdAtDate,
          ageInYears,
          isArchived,
        });
      }
    }

    console.log("Âges des documents et statut d'archivage :", documentAges);
    return documentAges;
  } catch (error) {
    console.error("Erreur lors de la récupération des dates des documents :", error);
    return [];
  }
};

const calculateDocumentAge = (createdAt: Date): string => {
  const currentDate = new Date();
  let years = currentDate.getFullYear() - createdAt.getFullYear();
  let months = currentDate.getMonth() - createdAt.getMonth();
  let days = currentDate.getDate() - createdAt.getDate();

  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    days += previousMonth.getDate();
  }

  const ageString = `${years > 0 ? `${years} an(s)` : ""}${months > 0 ? ` ${months} mois` : ""}${days > 0 ? ` ${days} jour(s)` : ""}`.trim();
  return ageString || "moins d'un jour";
};

const checkIfArchived = (createdAt: Date, thresholdYears: number): boolean => {
  const currentDate = new Date();
  const archiveDate = new Date(createdAt);
  archiveDate.setFullYear(archiveDate.getFullYear() + thresholdYears);

  return currentDate >= archiveDate;
};
