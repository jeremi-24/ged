import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"; // Assurez-vous d'importer le chemin correct de votre fichier Dialog
import { Cross2Icon } from "@radix-ui/react-icons";

const FileStart = ({ onDrop }: { onDrop: (files: any[]) => void }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const handleLogin = () => {
    window.location.href = '/api/auth/google'; // Lancer l'authentification Google
  };

  const handleFetchFiles = async () => {
    const accessToken = sessionStorage.getItem('googleAccessToken');

    if (!accessToken) {
      setError('Veuillez vous connecter pour voir vos fichiers.');
      return;
    }

    try {
      const response = await fetch(`/api/drive/files?accessToken=${accessToken}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des fichiers');
      const data = await response.json();
      setFiles(data);
      setError(null);
    } catch (error) {
      console.error('Erreur :', error);
      setError("Échec du chargement des fichiers");
    }
  };

  const handleSelectFile = (file: any) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter(f => f !== file));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
        setError("Veuillez sélectionner au moins un fichier à charger.");
        return;
    }

    try {
        const accessToken = sessionStorage.getItem('googleAccessToken');
        const downloadedFiles = await Promise.all(
            selectedFiles.map(async (file) => {
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) throw new Error('Erreur lors du téléchargement du fichier');
                const blob = await response.blob();
                return new File([blob], file.name, { type: file.mimeType }); 
            })
        );

        onDrop(downloadedFiles);
        setSelectedFiles([]);
    } catch (error) {
        console.error('Erreur :', error);
        setError("Échec du téléchargement des fichiers");
    }
};


  return (
    <div className="flex flex-row items-center">
      <Dialog>
        <DialogTrigger asChild>
          <div onClick={() => handleFetchFiles()} className="flex justify-center cursor-pointer items-center">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M17 6L31 6 45 30 31 30z"></path>
              <path fill="#1976D2" d="M9.875 42L16.938 30 45 30 38 42z"></path>
              <path fill="#4CAF50" d="M3 30.125L9.875 42 24 18 17 6z"></path>
            </svg>
          </div>
        </DialogTrigger>

        
          <div onClick={() => handleLogin()} className="flex justify-center cursor-pointer items-center">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
          </div>
       

        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Sélectionnez vos fichiers</DialogTitle>
            <div className="grid grid-cols-2 gap-2 mt-4 max-h-60 overflow-y-auto">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className={`flex items-center p-2 border rounded cursor-pointer ${selectedFiles.includes(file) ? 'bg-neutral-500' : ''}`} 
                  onClick={() => handleSelectFile(file)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.includes(file)} 
                    onChange={() => handleSelectFile(file)} 
                    className="mr-2"
                  />
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <DialogClose asChild>
              <button className="mt-4 bg-red-500 text-white p-2 rounded">
                Fermer
              </button>
            </DialogClose>
            <DialogClose asChild>
            <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded mr-2">
              Charger
            </button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default FileStart;
