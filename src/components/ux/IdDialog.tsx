'use client';
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore } from '@/firebase/config'; 
import { doc, setDoc } from 'firebase/firestore'; 
import { ClipLoader } from 'react-spinners'; 
import { onAuthStateChanged } from 'firebase/auth'; 

import IdUpload from './IdUpload';
import OrcFillForm from './OrcFillForm';
import UserInfoPush from './UserInfoPush';

interface IdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSteps: () => void;
}

const IdDialog = ({ isOpen, onClose, onStartSteps }: IdDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); 
  const [imageUrl, setImageUrl] = useState<string>(''); 
  const [userFormData, setUserFormData] = useState({ numero: '' }); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [user, setUser] = useState<any>(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); 
    });

    return () => unsubscribe();
  }, []);

  const handleFileDrop = useCallback((file: File) => {
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setImageUrl(fileUrl); 
  }, []);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!uploadedFile) {
        alert("Veuillez télécharger une photo de votre carte d'identité.");
        return;
      }
      setCurrentStep(currentStep + 1); 
    } else if (currentStep === 2) {
      setCurrentStep(currentStep + 1); 
    } else if (currentStep === 3) {
      
      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          numero: userFormData.numero,
          createdAt: new Date(),
        }, { merge: true });

        setIsSubmitting(false);
        onClose(); 
      } catch (err) {
        setIsSubmitting(false);
        setError('Une erreur est survenue lors de l\'envoi des données.');
      }
    } else {
      onClose(); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="max-w-2xl mx-auto rounded-lg shadow-xl p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-semibold text-zinc-300">Complétez votre profil</DialogTitle>
            <DialogDescription className="text-lg text-gray-600 mt-2">
              Suivez ces étapes pour compléter votre profil.
            </DialogDescription>
          </DialogHeader>

          {}
          <div className="relative w-full h-[400px]"> {}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{
                  x: { type: 'spring', stiffness: 200, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute w-full h-full flex justify-center items-center"
              >
                {currentStep === 1 && <IdUpload onDrop={handleFileDrop} />}
                {currentStep === 2 && <OrcFillForm imageUrl={imageUrl} onUserFormDataChange={setUserFormData} />}
                {currentStep === 3 && <UserInfoPush userFormData={userFormData} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <DialogFooter>
            <div className="space-x-4 flex justify-between w-full">
              <DialogClose asChild>
                <button className="text-gray-500">Annuler</button>
              </DialogClose>
              <button
                onClick={handleNextStep}
                disabled={isSubmitting}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isSubmitting ? <ClipLoader size={20} color="#ffffff" /> : currentStep === 3 ? 'Finaliser' : 'Suivant'}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default IdDialog;
