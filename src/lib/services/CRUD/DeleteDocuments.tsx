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
import { useToast } from "@/hooks/use-toast"; 
import { ToastAction } from "@/components/ui/toast"; 
import { auth } from '@/firebase/config'; 

interface DeleteDocumentsProps {
  selectedDocument: DocumentData | null;
  selectedIds: string; 
  setSelectedIds: (id: string) => void;
  refreshDocuments: () => void;
}

const DeleteDocuments: React.FC<DeleteDocumentsProps> = ({
  refreshDocuments,
  selectedDocument,
  selectedIds,
  setSelectedIds,
}) => {
  const [open, setOpen] = useState(false); 
  const { toast } = useToast(); 
  const handleDeleteSelected = async () => {
    try {
      if (selectedDocument) {
        await deleteDocument(selectedDocument.id); 

        const userId = auth.currentUser?.uid || 'unknown'; 

        const logEntry: LogEntry = {
          event: "document_deleted",
          documentId: selectedDocument.id,
          createdAt: new Date(),
          details: `Document ${selectedDocument.name} a été supprimé. ${deviceDetails}`,
          userId, 
          device: `Depuis l'appareil. ${deviceDetails}`,
        };
        await logEvent(logEntry, userId); 

        setSelectedIds(''); 
        refreshDocuments(); 
      }
      toast({
        title: "Succès",
        description: "Document supprimé avec succès.",
        action: (
          <ToastAction altText="succès icone" className='border-none'>
            <Image 
              src="/check.png" 
              alt="Animation de succès"
              width={30} 
              height={30} 
              style={{
                border: 'none',
              }}
            />
          </ToastAction>
        ),
      });

    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      
    } finally {
      setOpen(false); 
    }
  };

  const deviceDetails = getDeviceInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonAnimation
          variant="expandIcon"
          Icon={Trash2} 
          iconPlacement="right" 
          size="sm" 
          disabled={!selectedIds && !selectedDocument} 
          className='rounded-xl w-[180px] bg-red-600 text-white hover:bg-red-700' 
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
