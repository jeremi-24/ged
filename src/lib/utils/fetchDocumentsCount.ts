

import { firestore } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export const fetchDocumentCounts = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("Aucun utilisateur connecté.");
    return { totalDocuments: 0, archivedDocuments: 0 }; 
  }

  const documentsRef = collection(firestore, 'users', user.uid, 'documents');
  const querySnapshot = await getDocs(documentsRef);

  const totalDocuments = querySnapshot.docs.length; 
  const archivedDocuments = querySnapshot.docs.filter(doc => {
    const data = doc.data();
    return data.isArchived === true; 
  }).length; 

  return { totalDocuments, archivedDocuments }; 
};
