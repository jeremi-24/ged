"use client"

import { useCallback, useEffect, useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { auth, firestore, storage } from "@/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, onAuthStateChanged, updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LucideUser, LucideMail, LucideTag, LucidePhone, Camera, Lock, Shield, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';


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
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadUserData = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Échec de la récupération des données : ${(error as Error).message}`,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [loadUserData]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `avatars/${auth.currentUser?.uid}`);
      setLoading(true);
      try {
        await uploadBytes(storageRef, file);
        const avatarURL = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser!, { photoURL: avatarURL });
        await updateDoc(doc(firestore, 'users', auth.currentUser!.uid), { photoURL: avatarURL });
        setUser((prev) => prev ? { ...prev, photoURL: avatarURL } : prev);
        toast({
          title: "Succès",
          description: "Photo de profil mise à jour.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Échec de la mise à jour de la photo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      await updateDoc(doc(firestore, 'users', user!.uid), { password: newPassword });
      toast({ title: "Succès", description: "Mot de passe mis à jour." });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
          Paramètres du Compte
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Gérez vos informations personnelles et vos préférences de sécurité.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl ring-4 ring-blue-500/10">
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={128} height={128} className="object-cover h-full w-full" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <LucideUser className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300 backdrop-blur-[2px]">
                  <Camera className="w-8 h-8" />
                  <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                </label>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 rounded-full">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic">
                    {user?.prenom} {user?.nom}
                  </h3>
                  <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none rounded-full px-4">
                    {user?.role || 'Utilisateur'}
                  </Badge>
                </div>
                <p className="text-zinc-500 flex items-center justify-center sm:justify-start gap-2">
                  <LucideMail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator className="bg-zinc-100 dark:bg-zinc-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 font-bold">
                  <LucideUser className="w-5 h-5 text-blue-500" />
                  Détails Personnels
                </div>
                <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Prénom</span>
                    <span className="text-sm font-semibold">{user?.prenom || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Nom</span>
                    <span className="text-sm font-semibold">{user?.nom || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Téléphone</span>
                    <span className="text-sm font-semibold">{user?.numero || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 font-bold">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Compte & Statut
                </div>
                <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Rôle</span>
                    <Badge variant="outline" className="rounded-full shadow-none">{user?.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Vérifié</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500 italic">Créé le</span>
                    <span className="text-sm font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 font-bold mb-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Sécurité
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mot de passe actuel</Label>
                  <Input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nouveau mot de passe</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-blue-500"
                  />
                </div>
                <Button
                  className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-bold py-6"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Mettre à jour"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-blue-500 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-8 relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold italic">Authentification</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Votre compte est protégé par une authentification sécurisée et un cryptage des données de pointe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contenu;
