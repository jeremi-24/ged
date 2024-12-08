import React, { useState } from 'react';
import { deleteDocument } from '../manageDocuments';
import { DocumentData } from '@/types/types';
import { ButtonAnimation } from '@/components/snippet/button-animation';
import Image from "next/image";
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { logEvent } from '../logEvent';

import { LogEntry } from '@/types/Logs';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';
import { useToast } from "@/hooks/use-toast"; // Importing useToast hook
import { ToastAction } from "@/components/ui/toast"; // Importing ToastAction component
import { auth } from '@/firebase/config'; // Assurez-vous que l'authentification Firebase est configurée

interface DeleteDocumentsProps {
  selectedDocument: DocumentData | null;
  selectedIds: string; // Garder ici comme une chaîne
  setSelectedIds: (id: string) => void;
  refreshDocuments: () => void;
}

const DeleteDocuments: React.FC<DeleteDocumentsProps> = ({
  refreshDocuments,
  selectedDocument,
  selectedIds,
  setSelectedIds,
}) => {
  const [open, setOpen] = useState(false); // État pour contrôler l'ouverture du dialogue
  const { toast } = useToast(); // Initialize toast
  const handleDeleteSelected = async () => {
    try {
      if (selectedDocument) {
        await deleteDocument(selectedDocument.id); // Suppression d'un document unique

        // Récupérer l'ID de l'utilisateur actuellement connecté
        const userId = auth.currentUser?.uid || 'unknown'; // Utiliser l'ID de l'utilisateur ou 'unknown' si l'utilisateur n'est pas connecté

        // Enregistrement du log après la suppression réussie
        const logEntry: LogEntry = {
          event: "document_deleted",
          documentId: selectedDocument.id,
          createdAt: new Date(),
          details: `Document ${selectedDocument.name} a été supprimé. ${deviceDetails}`,
          userId, // Ajout du userId ici
          device: `Depuis l'appareil. ${deviceDetails}`,
        };
        await logEvent(logEntry, userId); // Enregistre le log avec le userId

        setSelectedIds(''); // Réinitialise la sélection après la suppression
        refreshDocuments(); // Appelle la fonction pour rafraîchir les documents après la suppression
      }
      toast({
        title: "Succès",
        description: "Document supprimé avec succès.",
        action: (
          <ToastAction altText="succès icone" className='border-none'>
            <Image 
              src="/check.png" 
              alt="Animation de succès"
              width={30} // Ajuste la taille en pixels
              height={30} // Ajuste la taille en pixels
              style={{
                border: 'none',
              }}
            />
          </ToastAction>
        ),
      });

    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      // Vous pourriez afficher un message d'erreur à l'utilisateur ici
    } finally {
      setOpen(false); // Ferme le dialogue après la suppression
    }
  };

  const deviceDetails = getDeviceInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonAnimation
          variant="expandIcon"
          Icon={Trash2} // Icône de la corbeille
          iconPlacement="right" // Position de l'icône
          size="sm" // Taille du bouton
          disabled={!selectedIds && !selectedDocument} 
          className='rounded-xl w-[180px] bg-red-600 text-white hover:bg-red-700' // Désactiver si aucun document sélectionné
        >
          Supprimer 
        </ButtonAnimation>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
        <DialogContent className="fixed top-1/2 left-1/2 w-96 p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2">
          <DialogTitle>Confirmation de Suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <button className="rounded-md px-4 py-2 bg-transparent">Annuler</button>
            </DialogClose>
            <button 
              className="ml-2 rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700" 
              onClick={handleDeleteSelected}
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DeleteDocuments;
