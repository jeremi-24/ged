'use client';

import { ButtonAnimation } from "@/components/snippet/button-animation";
import { Eye, Link, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/ux/FileUpload";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose, DialogPortal, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { storage, firestore } from "@/firebase/config";
import { uploadBytesResumable, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { CheckCircle } from 'lucide-react';
import { addDoc, collection } from "firebase/firestore"; 
import classifyDocument from "@/lib/services/classifyDocument";
import pdfToImages from "@/lib/services/pdfToImages"; 
import OCRImages from "@/lib/services/OCRImages"; 
import './style.css';
import Tesseract from "tesseract.js";
import { LogEntry } from "@/types/Logs";
import { logEvent } from "@/lib/services/logEvent";
import { getDeviceInfo } from "@/lib/utils/deviceInfo";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FileSelector from "@/components/ux/FileStart";
import UserInfoDialog from "@/components/ux/UserInfoDialog";

// Étape 1: Interface pour DocumentData
interface DocumentData {
  id: string;
  name: string;
  classification: string;
  text: string;
  createdAt: Date;
  url: string;
  type: string;
  size: number;
  isArchived: boolean,
}

export default function Contenu() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  
  // Étape 2: État pour stocker les données des documents
  const [documentDataList, setDocumentDataList] = useState<DocumentData[]>([]);
  const [loadingFinished, setLoadingFinished] = useState(false); // État pour savoir si le chargement est terminé

  const handleDrop = async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    setShowVideoPopup(true);
    setDialogOpen(false);
    setLoadingFinished(false);
    setDocumentDataList([]);
    
  
    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          await handlePdfUpload(file);
        } else {
          await handleImageUpload(file);
        }
      }
      
      setLoadingFinished(true); // Indique que le chargement est terminé
      setDialogTitle("Succès");
      setDialogDescription("Tous les documents ont été chargés et classés avec succès !");
      setDialogOpen(true); // Affiche le message de succès global après tous les téléversements
      
    } catch (error) {
      setDialogTitle("Échec");
      setDialogDescription("Échec de l'upload de l'un des documents.");
      setDialogOpen(true);
    } finally {
      setUploading(false);
      setShowVideoPopup(false);
    }
  };
  

  const handlePdfUpload = async (file: File) => {
    const pdfUrl = URL.createObjectURL(file);
    const imageUrls = await pdfToImages(pdfUrl, {
      onStart: (progress) => setProgress((progress.current / progress.total) * 100),
      onProgress: (progress) => setProgress((progress.current / progress.total) * 100),
    });

    const textsObj: Record<string, string> = await OCRImages(imageUrls, {
      onStart: (progress) => setProgress((progress.current / progress.total) * 100),
      onProgress: (progress) => setProgress((progress.current / progress.total) * 100),
    });

    const texts: string[] = Object.values(textsObj);
    let classification;

    try {
      classification = await classifyDocument(texts.join('\n'), {
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
        model: 'gemini-1.5-pro-002',
      });
    } catch (error) {
      
      return;
    }

    const storageRef = ref(storage, `documents/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    const auth = getAuth(); // Initialiser l'authentification

// Vérifiez l'état de l'utilisateur connecté
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.error("Aucun utilisateur connecté.");
        return; // Sortir de la fonction si aucun utilisateur n'est connecté
    }

    const userId = user.uid; // Récupération de l'ID de l'utilisateur connecté

    // Ajout des métadonnées et mise à jour de l'état documentDataList
    // Ajouter le document dans la sous-collection "documents" de l'utilisateur
    const docRef = await addDoc(collection(firestore, "users", userId, "documents"), {
        name: file.name,
        classification,
        text: texts.join('\n'),
        createdAt: new Date(),
        url: downloadURL,
        type: file.type,
        size: file.size,
        isArchived: false,
    });

    // Mise à jour de l'état pour afficher le document
    setDocumentDataList(prev => [
        ...prev,
        {
            id: docRef.id,
            name: file.name,
            classification,
            text: texts.join('\n'),
            createdAt: new Date(),
            url: downloadURL,
            type: file.type,
            size: file.size,
            isArchived: false,
        },
    ]);

    // Récupération des détails de l'appareil
    const deviceDetails = getDeviceInfo();

    // Enregistrement du log après le succès de l'upload
    const logEntry: LogEntry = {
        event: "document_uploaded",
        documentId: docRef.id,
        createdAt: new Date(),
        details: `Document ${file.name} a été téléchargé avec succès.`,
        userId: userId, // Ajout de l'ID de l'utilisateur ici
        device: `Depuis l'appareil : ${deviceDetails}`,
    };

    // Enregistrement du log dans la sous-collection "logs" de l'utilisateur
    await logEvent(logEntry, userId);
});


  
  };

  const handleImageUpload = async (file: File) => {
    const storageRef = ref(storage, `documents/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercentage);
      },
      (error) => {
        
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const { data: { text } } = await Tesseract.recognize(downloadURL, "eng");

        const classification = await classifyDocument(text, {
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
          model: 'gemini-1.5-flash',
        });

        // Ajout des métadonnées et mise à jour de l'état documentDataList
        const docRef = await addDoc(collection(firestore, "documents"), {
          name: file.name,
          classification,
          text,
          createdAt: new Date(),
          url: downloadURL,
          type: file.type,
          size: file.size,
        });

        setDocumentDataList(prev => [
          ...prev,
          {
            id: docRef.id,
            name: file.name,
            classification,
            text,
            createdAt: new Date(),
            url: downloadURL,
            type: file.type,
            size: file.size,
            isArchived: false,
          },
        ]);

       
      }
    );
  };
  const [isFileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null); // Remplissez cela avec votre logique d'authentification

  const handleOpenFileSelector = () => {
    setFileSelectorOpen(true);
  };

  const handleCloseFileSelector = () => {
    setFileSelectorOpen(false);
  };

  return (
    <div className="rounded-lg border-none mt-6">
      <div className="p-6"> <UserInfoDialog/>  <FileSelector onDrop={handleDrop} />
        <div className="flex justify-center items-center min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="flex-shrink-0 p-4">
      
      </div>
          <div className="flex flex-col relative">
            <FileUpload onDrop={handleDrop} />
            {uploading && (
              <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center w-full">
                <Dialog open={showVideoPopup} onOpenChange={(open) => setShowVideoPopup(open)}>
  <DialogContent className="w-full max-w-3xl">
    <DialogHeader>
      <DialogTitle>Vidéo de Progression</DialogTitle>
      <DialogDescription>
        <p>Voici la vidéo pendant le téléchargement du fichier.</p>
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-center">
      <div  className="w-full max-w-[500px]">
       <iframe width="560" height="315" src="https://www.youtube.com/embed/Qg43xcshtmA?si=V2v1SGqQhwZDL4IF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </div>
    </div>
    <DialogFooter>
      <DialogClose>
        <button className="p-2 bg-red-500 text-white rounded">
          Fermer
        </button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>

                <Progress value={progress} className="flex-grow " /> {/* Barre de progression */}
                <Sparkles className="pulse  ml-2 w-8 h-8 "/> {/* Animation à la fin de la barre de progression */}
              </div>
              
              <p className="mt-2 text-center w-full"> {/* Texte en bas */}
                L&apos;IA classe votre document ... {Math.round(progress)}%
              </p>
            </div>
            
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="flex flex-col items-center text-center">
      <CheckCircle className="h-12 w-12 text-green-500 mb-4 bounce" aria-hidden="true" />
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription className="text-2xl">{dialogDescription}
         
        </DialogDescription>
      </DialogContent>
    </Dialog>

            {/* Affichage des données des documents uniquement après le chargement terminé */}
            {loadingFinished && documentDataList.length > 0 && (
  <div className="mt-4">
    <h2>Documents enregistrés</h2>
    <br />
    {documentDataList.map(doc => (
      <div key={doc.id} className="mb-4 p-4 border rounded">
        <p><strong>Nom :</strong> {doc.name}</p>
        <p><strong>Catégorie :</strong> {doc.classification}</p>
        <p><strong>Taille :</strong> {doc.size} octets</p>
        <p><strong>Type :</strong> {doc.type}</p>
        <p><strong>Date de Création :</strong> {doc.createdAt.toString()}</p>

        {/* Conteneur flex pour les boutons */}
        <div className="flex justify-between items-center mt-5">
          <ButtonAnimation
            url={doc.url}
            variant="expandIcon"
            Icon={Link}
            iconPlacement="right"
          >
            Télécharger
          </ButtonAnimation>

          {/* Nouveau bouton pour ouvrir le dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <ButtonAnimation
                variant="expandIcon"
                Icon={Eye}
                iconPlacement="right"
                className="glow-on-hover"
              >
                Voir le texte
              </ButtonAnimation>
            </DialogTrigger>

            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Texte du Document</DialogTitle>
                  <DialogDescription>
                    <div className="max-h-[60vh] overflow-y-auto">
                       {doc.text} </div>
                 
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <button className="p-2 bg-red-500 text-white rounded">
                      Fermer
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
    ))}
  </div>
)}


          </div>
        </div>
      </div>
    </div>
  );
}
