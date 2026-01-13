

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";

interface DocumentPreviewDialogProps {
  previewUrl: string;  
  metadata: {
    name: string;
    type: string;
    size: number;
    classification: string;
    createdAt: Date;
    url: string;
  };
  open: boolean; 
  onClose: () => void; 
}

const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({ previewUrl, metadata, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aperçu du document</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                <Image src={previewUrl} alt="Aperçu du document" layout="responsive" width={500} height={500} />
              </div>
              <div className="w-full md:w-1/2 p-4">
                <h3>Métadonnées</h3>
                <p><strong>Nom :</strong> {metadata.name}</p>
                <p><strong>Type :</strong> {metadata.type}</p>
                <p><strong>Taille :</strong> {(metadata.size / 1024).toFixed(2)} Ko</p>
                <p><strong>Classification :</strong> {metadata.classification}</p>
                <p><strong>Date de création :</strong> {metadata.createdAt.toLocaleString()}</p>
                <p><strong>URL :</strong> <a href={metadata.url} target="_blank" rel="noopener noreferrer">{metadata.url}</a></p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
