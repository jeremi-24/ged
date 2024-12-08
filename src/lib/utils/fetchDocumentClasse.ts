// @/utils/fetchDocumentsCount.ts

import { firestore } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
// Ajustez le chemin selon votre structure de projet

export const fetchDocumentClasse = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("Aucun utilisateur connecté.");
    return {}; // Retourner un objet vide si l'utilisateur n'est pas connecté
  }

  const documentsRef = collection(firestore, 'users', user.uid, 'documents');
  const querySnapshot = await getDocs(documentsRef);

  const classificationCounts: { [key: string]: number } = {}; // Objet pour stocker les comptes par classification

  // Itérer sur chaque document pour compter les classifications
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    const classification = data.classification;

    // Initialiser le compteur pour cette classification si elle n'existe pas
    if (!classificationCounts[classification]) {
      classificationCounts[classification] = 0;
    }
    classificationCounts[classification]++; // Incrémenter le compteur pour cette classification
  });

  return classificationCounts; // Retourner les comptes par classification
};
