// functions/manageDocuments.ts
import { firestore } from '../../firebase/config'; // Importer la configuration Firestore
import { doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importer l'authentification Firebase

// Fonction pour obtenir l'ID de l'utilisateur actuel
const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user ? user.uid : null; // Retourner l'ID de l'utilisateur ou null s'il n'est pas connecté
};

// Fonction pour supprimer un seul document
export const deleteDocument = async (documentId: string) => {
  const userId = getCurrentUserId(); // Obtenir l'ID de l'utilisateur actuel

  if (!userId) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  try {
    // Supprimer le document dans la sous-collection 'documents' de l'utilisateur
    await deleteDoc(doc(firestore, 'users', userId, 'documents', documentId));
    console.log(`Document avec ID ${documentId} supprimé de l'utilisateur ${userId}.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du document :", error);
  }
};

// Fonction pour supprimer plusieurs documents
export const deleteDocuments = async (documentIds: string[]) => {
  const userId = getCurrentUserId(); // Obtenir l'ID de l'utilisateur actuel

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
