'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail, loginWithGoogle } from '@/firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { signOut } from 'firebase/auth';
import { auth, firestore } from '@/firebase/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LogEntry } from '@/types/Logs';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';
import { collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email("Email invalide").nonempty("L'email est requis"),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères"),
});

type FormData = {
  email: string;
  password: string;
};

const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const handleRegister = async (data: FormData) => {
    try {
      
      await registerWithEmail(data.email, data.password);

      const user = auth.currentUser; 

      const isFirstUser = await checkIfFirstUser();
  
      if (user) {
            
      const userDoc = {
        email: data.email,
        createdAt: new Date(),
        password : data.password,
        role: isFirstUser ? 'admin' : 'user',
      };

      await setDoc(doc(firestore, "users", user.uid), userDoc);

        const logEntry: LogEntry = {
          event: "inscription utilisateur", 
          userId: user.uid, 
          createdAt: new Date(), 
          details: `Utilisateur inscrit avec l'email: ${data.email}`,
          documentId: '',
          device: `Depuis ${deviceDetails}`, 
        };
        await logEvent(logEntry,user.uid); 
  
        setIsDialogOpen(true); 
        await signOut(auth); 
      }
    } catch (err) {
      setError("L'inscription a échoué. Veuillez réessayer."); 
    }
  };
  
  const checkIfFirstUser = async () => {
    const usersSnapshot = await getDocs(collection(firestore, "users"));
    return usersSnapshot.empty; 
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();

      const user = auth.currentUser;
      if (user) {
        const logEntry: LogEntry = {
          event: "Connexion google", 
          userId: user.uid, 
          createdAt: new Date(), 
          details: `Utilisateur connecté avec Google: ${user.email} . ${deviceDetails}`,
          documentId: '',
          device:  `Depuis ${deviceDetails}  `,
        };
        await logEvent(logEntry,user.uid); 
      }
  
      router.push("/dashboard");
    } catch (err) {
      setError("Échec de la connexion avec Google.");
    }
  };
  const deviceDetails = getDeviceInfo();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
  <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
    {}
    <div className="w-1/2 flex items-center justify-center bg-cover bg-center">
      <iframe
        src="https://lottie.host/embed/552efea2-8a40-4db0-a7d8-847b9ffb9e9c/e3kQNLewxP.json"
        className="w-full h-full"
        style={{ border: 'none' }}
        title="Animation GED IA"
      ></iframe>
    </div>

    {}
    <div className="w-1/2 p-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-black">Inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
                required
                className="bg-transparent text-black border border-gray-300 focus:ring-2 focus:ring-green-500"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              <Input
                type="password"
                placeholder="Mot de passe"
                {...register('password')}
                required
                className="bg-transparent text-black border border-gray-300 focus:ring-2 focus:ring-green-500"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700">
              S&apos;inscrire
            </Button>
            <div className="text-center text-sm text-gray-500">
              Vous avez déjà un compte ? <a href="/connexion" className="text-blue-600 hover:underline">Connectez-vous</a>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">OU</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.28 0 6.27 1.25 8.47 3.28l6.24-6.24C34.13 3.43 29.29 1 24 1 14.4 1 6.21 6.53 2.39 14.24l7.25 5.63C11.43 14.1 17.2 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.61 24.63c0-1.45-.13-2.85-.38-4.2H24v8.16h12.74c-.55 2.99-2.23 5.52-4.8 7.23l7.25 5.63C43.99 37.73 46.61 31.65 46.61 24.63z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.25 28.8c-1.22-3.68-1.22-7.68 0-11.36l-7.25-5.63C-.63 17.54-.63 31.73 2.99 40.75l7.26-5.62z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c5.29 0 10.13-1.83 13.91-4.97l-7.25-5.63C28.74 37.57 26.49 38.5 24 38.5c-6.8 0-12.57-4.6-14.36-10.86l-7.26 5.62C6.21 41.47 14.4 46 24 46z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Inscription avec Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>

  {}
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="sm:max-w-[425px] bg-white text-black">
      <DialogHeader>
        <DialogTitle className="text-center text-black">Merci pour votre inscription !</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center space-y-4">
        <p className="text-center text-black">
          Veuillez confirmer votre email avant de vous connecter. Nous avons envoyé un lien de vérification.
        </p>
        <Button onClick={() => router.push('/connexion')} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          Aller à la connexion
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</div>

  );
};

export default RegisterPage;
