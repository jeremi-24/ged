
import { firestore } from '../../firebase/config'; 
import { doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 

const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user ? user.uid : null; 
};

export const deleteDocument = async (documentId: string) => {
  const userId = getCurrentUserId(); 

  if (!userId) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  try {
    
    await deleteDoc(doc(firestore, 'users', userId, 'documents', documentId));
    
    console.log(`Document avec ID ${documentId} supprimé de l'utilisateur ${userId}.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du document :", error);
    
  }
};

export const deleteDocuments = async (documentIds: string[]) => {
  const userId = getCurrentUserId(); 

  if (!userId) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  try {
    const deletePromises = documentIds.map(documentId =>
      deleteDoc(doc(firestore, 'users', userId, 'documents', documentId))
    );
    await Promise.all(deletePromises);
    console.log(`Documents supprimés pour l'utilisateur ${userId} : ${documentIds.join(', ')}`);
  } catch (error) {
    console.error("Erreur lors de la suppression des documents :", error);
  }
};
