"use client"

import { useCallback, useEffect, useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { auth, firestore, storage } from "@/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, onAuthStateChanged, updatePassword } from "firebase/auth"; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LucideUser, LucideMail, LucideTag, LucidePhone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; // Importing useToast hook
import { ToastAction } from "@/components/ui/toast"; // Importing ToastAction component

// Définir l'interface utilisateur pour typer l'état de l'utilisateur
interface User {
  photoURL?: string;
  prenom?: string;
  nom?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
  numero?: string;
}

const Contenu = () => {
  const { toast } = useToast(); // Initialize toast
  const [user, setUser] = useState<User | null>(null);  
  const [avatar, setAvatar] = useState<File | null>(null);  
  const [loading, setLoading] = useState(false);  
  const [currentPassword, setCurrentPassword] = useState('');  
  const [newPassword, setNewPassword] = useState('');  
  const [darkMode, setDarkMode] = useState<boolean>(false);  

  const loadUserData = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData); 
      }
    } catch (error) {
      console.error(`Erreur : ${(error as Error).message}`);
      toast({
        title: "Erreur",
        description: `Échec de la récupération des données utilisateur : ${(error as Error).message}`,
        variant: "destructive",
        action: (
          <ToastAction altText="succes icone" className='border-none'>
            <Image 
              src="/cancel.png" 
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
    }
    setLoading(false);
  }, [toast]); // Dépendance firestore (si c'est un objet qui peut changer)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid); // Appeler la fonction mémorisée
      } else {
        setUser(null);
      }
    });
  
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  
    return () => unsubscribe();
  }, [loadUserData]); // Ajout de loadUserData comme dépendance
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2 Mo
  
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        toast({
          title: "Erreur",
          description: "Le fichier doit être au format JPG, PNG ou GIF, et de moins de 2 Mo.",
          variant: "destructive",
        });
        return;
      }
  
      if (!auth.currentUser) {
        toast({
          title: "Erreur",
          description: "Aucun utilisateur n'est authentifié.",
          variant: "destructive",
        });
        return;
      }
  
      setAvatar(file);
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      setLoading(true);
  
      try {
        await uploadBytes(storageRef, file);
        const avatarURL = await getDownloadURL(storageRef);
  
        // Mise à jour dans Firebase Auth
        await updateProfile(auth.currentUser, { photoURL: avatarURL });
  
        // Mise à jour dans Firestore
        await updateDoc(doc(firestore, 'users', auth.currentUser.uid), { photoURL: avatarURL });
  
        setUser((prevUser) => (prevUser ? { ...prevUser, photoURL: avatarURL } : prevUser));
  
        toast({
          title: "Succès",
          description: "Avatar mis à jour avec succès.",
          variant: "default",
          action: (
            <ToastAction altText="succes icone" className='border-none'>  <Image 
            src="/check.png" 
            alt="Animation de succès"
            width={30} // Ajuste la taille en pixels
            height={30} // Ajuste la taille en pixels
            style={{
              border: 'none',
            }}
          /></ToastAction>
          ),
        });
      } catch (error) {
        console.error(`Erreur lors du téléchargement de l'avatar : ${(error as Error).message}`);
        toast({
          title: "Erreur",
          description: `Échec de la mise à jour de l'avatar : ${(error as Error).message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Erreur",
        description: 'Tous les champs doivent être remplis.',
        variant: "destructive",
        action: (
          <ToastAction altText="succes icone" className='border-none'>  <Image 
          src="/cancel.png" 
          alt="Animation de erreur"
          width={30} // Ajuste la taille en pixels
          height={30} // Ajuste la taille en pixels
          style={{
            border: 'none',
          }}
        /></ToastAction>
        ),
      });
      return;
    }

    try {
      setLoading(true);
      if (!auth.currentUser) {
        toast({
          title: "Erreur",
          description: 'Utilisateur non authentifié.',
          variant: "destructive",
          action: (
            <ToastAction altText="succes icone" className='border-none'>  <Image 
            src="/cancel.png" 
            alt="Animation de succès"
            width={30} // Ajuste la taille en pixels
            height={30} // Ajuste la taille en pixels
            style={{
              border: 'none',
            }}
          /></ToastAction>
          ),
        });
        return;
      }

      const user = auth.currentUser;
      const userCredential = EmailAuthProvider.credential(user.email!, currentPassword);
      
      // Réauthentification de l'utilisateur
      await reauthenticateWithCredential(user, userCredential);
      
      // Mise à jour du mot de passe dans Firebase Auth
      await updatePassword(user, newPassword);
      
      // Mise à jour du champ `password` dans Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { password: newPassword });

      toast({
        title: "Succès",
        description: "Mot de passe modifié avec succès.",
        action: (
          <ToastAction altText="succes icone" className='border-none'>  <Image 
          src="/check.png" 
          alt="Animation de succès"
          width={30} // Ajuste la taille en pixels
          height={30} // Ajuste la taille en pixels
          style={{
            border: 'none',
          }}
        /></ToastAction>
        ),
      });
    } catch (error) {
      console.error(`Erreur de modification du mot de passe : ${(error as Error).message}`);
      toast({
        title: "Erreur",
        description: `Échec de la modification du mot de passe : ${(error as Error).message}`,
        variant: "destructive",
        action: (
          <ToastAction altText="succes icone" className='border-none'>  <Image 
          src="/cancel.png" 
          alt="Animation de succès"
          width={30} // Ajuste la taille en pixels
          height={30} // Ajuste la taille en pixels
          style={{
            border: 'none',
          }}
        /></ToastAction>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));  
  };

  return (
    <Card className="rounded-lg border-none mt-6">
      <CardContent className="p-6 min-h-[400px]">
        <div className="grid grid-cols-3 gap-6">
          <div className="h-72 flex flex-col items-center p-8 rounded-lg ">
            <div className="mb-4">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Avatar" width={100} height={100} className="rounded-full" />
              ) : (
                <LucideUser className="w-24 h-24 text-gray-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-2 p-2 w-56 text-sm border rounded"
            />
          
          </div>
          

          <div className="h-72 flex flex-col p-4 rounded-lg ">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <LucideUser className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Prénom:</span>
                <span>{user?.prenom || 'Non renseigné'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <LucideUser className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Nom:</span>
                <span>{user?.nom || 'Non renseigné'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <LucideTag className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Rôle:</span>
                <span>{user?.role || 'Non renseigné'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <LucideMail className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Email:</span>
                <span>{user?.email || 'Non renseigné'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <LucidePhone className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Numéro:</span>
                <span>{user?.numero || 'Non renseigné'}</span>
              </div>
            </div>
          </div>

          <div className="h-72 flex flex-col p-4 rounded-lg ">
            <h3 className="text-xl font-semibold mb-4">Mot de passe</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handlePasswordChange}
                className="mt-4 p-2 bg-blue-500 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default Contenu;
