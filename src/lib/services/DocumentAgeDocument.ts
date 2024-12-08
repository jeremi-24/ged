// src/services/documentService.ts
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config"; // Assurez-vous que le chemin est correct
import { DocumentData } from "@/types/types"; // Importer votre interface DocumentData
import { Timestamp } from "firebase/firestore"; // Importer le type Timestamp de Firestore

interface DocumentAge {
  documentId: string;
  createdAt: Date;
  ageInYears: string; // Âge sous forme de chaîne (détaillé en années, mois, jours)
  isArchived: boolean; // Indicateur d'archivage
}

// Règles d'archivage basées sur la classification des documents
const archiveRules: { [classification: string]: number } = {
  "Facture": 5,
  "Contrat": 1,
  "Rapport": 3,
  "Reçu": 2,
  // Ajoutez les autres classifications et règles ici
};

// Fonction pour récupérer les documents et calculer leur âge et statut d'archivage
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

        // Calculer l'âge détaillé du document
        const ageInYears = calculateDocumentAge(createdAtDate);

        // Obtenir la règle d'archivage selon la classification
        const archiveThreshold = archiveRules[documentData.classification] || 5; // Par défaut, 5 ans

        // Déterminer si le document doit être archivé
        const isArchived = checkIfArchived(createdAtDate, archiveThreshold);

        // Vérifier si l'état `isArchived` actuel dans Firestore est différent du nouvel état calculé
        if (documentData.isArchived !== isArchived) {
          // Mise à jour de `isArchived` dans Firestore
          const documentRef = doc(firestore, `users/${userId}/documents`, docSnapshot.id);
          await updateDoc(documentRef, { isArchived });
          console.log(`Document ${docSnapshot.id} mis à jour : isArchived = ${isArchived}`);
        }

        // Ajouter le document et ses détails dans le tableau de résultats
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

// Fonction pour calculer la durée exacte d'un document
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

// Fonction pour vérifier si le document doit être archivé en fonction de sa durée de rétention
const checkIfArchived = (createdAt: Date, thresholdYears: number): boolean => {
  const currentDate = new Date();
  const archiveDate = new Date(createdAt);
  archiveDate.setFullYear(archiveDate.getFullYear() + thresholdYears);

  return currentDate >= archiveDate;
};
