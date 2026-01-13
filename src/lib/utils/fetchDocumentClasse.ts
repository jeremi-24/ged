

import { firestore } from '@/firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export const fetchDocumentClasse = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("Aucun utilisateur connecté.");
    return {}; 
  }

  const documentsRef = collection(firestore, 'users', user.uid, 'documents');
  const querySnapshot = await getDocs(documentsRef);

  const classificationCounts: { [key: string]: number } = {}; 

  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    const classification = data.classification;

    if (!classificationCounts[classification]) {
      classificationCounts[classification] = 0;
    }
    classificationCounts[classification]++; 
  });

  return classificationCounts; 
};
