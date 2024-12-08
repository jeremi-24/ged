import { useState, useEffect } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import Image from 'next/image';
import IdDialog from './IdDialog';

const UserInfoDialog = () => {
  const [isDialogOpen, setDialogOpen] = useState(false); // Change initial state to false
  const [userData, setUserData] = useState<any>(null);
  const [isNameMissing, setIsNameMissing] = useState(false);
  const [isNumberIdMissing, setIsNumberIdMissing] = useState(false);

  const [isSecondDialogOpen, setSecondDialogOpen] = useState(false); // Control second dialog

  useEffect(() => {
    const checkUserInformation = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("Aucun utilisateur connecté.");
          return;
        }

        const userDocRef = doc(firestore, 'users', user.uid); 
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
          console.error("Aucun document trouvé pour cet utilisateur.");
          return;
        }

        const userData = userDocSnapshot.data();
        setUserData(userData);

        // Verifying missing fields
        const isNameMissing = !userData?.nom;
        const isNumberIdMissing = !userData?.numero;

        setIsNameMissing(isNameMissing);
        setIsNumberIdMissing(isNumberIdMissing);

        // Open dialog only if either field is missing
        if (isNameMissing || isNumberIdMissing) {
          setDialogOpen(true); // Open the dialog if user info is incomplete
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
      }
    };

    checkUserInformation();
  }, []); // This effect will run once when the component mounts

  // Handle saving identity card info and opening second dialog
  const handleSaveCard = () => {
    setSecondDialogOpen(true); // Open the second dialog
    setDialogOpen(false); // Close the first dialog
  };

  return (
    <>
      {/* First Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
          <DialogContent className="max-w-2xl mx-auto rounded-lg shadow-xl p-8">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                
                <iframe
        src="https://lottie.host/embed/1c28ef9b-ad11-44eb-b636-7d6843c25155/VE5LbOGDoC.json"
        className="w-48 h-48 object-cover rounded-md shadow-md"
        style={{ border: 'none' }}
        title="Animation GED IA"
        width={500}
        
        height={500}
      ></iframe>
                <div className="flex flex-col">
                  <DialogTitle className="text-3xl font-semibold text-zinc-300">Vérification de votre profil</DialogTitle>
                  <DialogDescription className="text-lg text-gray-600 mt-2">
                    Pour renforcer la sécurité de votre compte, veuillez compléter votre profil en ajoutant votre nom ou votre numéro de carte d&apos;identité.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row justify-between gap-6 mt-6">
              <button
                onClick={handleSaveCard}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                Enregistrer ma carte d&apos;identité
              </button>

              <button
                onClick={() => setDialogOpen(false)} // Close dialog if user clicks 'Later'
                className="px-6 py-3 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto"
              >
                Me rappeler plus tard
              </button>
            </DialogFooter>
            <DialogClose />
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Second Dialog (IdDialog) */}
      <IdDialog 
        isOpen={isSecondDialogOpen} 
        onClose={() => setSecondDialogOpen(false)} 
        onStartSteps={() => console.log("Starting steps...")}
      />
    </>
  );
};

export default UserInfoDialog;
