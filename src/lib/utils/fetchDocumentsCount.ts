// @/utils/fetchDocumentsCount.ts

import { firestore } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
 // Ajustez le chemin selon votre structure de projet

export const fetchDocumentCounts = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("Aucun utilisateur connecté.");
    return { totalDocuments: 0, archivedDocuments: 0 }; // Retourner zéro si l'utilisateur n'est pas connecté
  }

  const documentsRef = collection(firestore, 'users', user.uid, 'documents');
  const querySnapshot = await getDocs(documentsRef);

  const totalDocuments = querySnapshot.docs.length; // Nombre total de documents
  const archivedDocuments = querySnapshot.docs.filter(doc => {
    const data = doc.data();
    return data.isArchived === true; // Filtrer les documents archivés
  }).length; // Compter les documents archivés

  return { totalDocuments, archivedDocuments }; // Retourner les comptes
};
