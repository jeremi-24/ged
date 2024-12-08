'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle } from '@/firebase/auth';
import { useAuth } from '@/components/contexts/authContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LogEntry } from '@/types/Logs';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';

// Schéma de validation avec Zod
const formSchema = z.object({
  email: z.string().email("Email invalide").nonempty("L'email est requis"),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères"),
});

// Typage pour le formulaire
type FormData = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      if (user.emailVerified) {
        

        router.push('/dashboard');

      } else {
        setError('Veuillez vérifier votre email avant de vous connecter.');
        signOut(auth); // Déconnexion des utilisateurs non vérifiés
      }
    }
  }, [user, router]);
   //enregistrer log ici
  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await loginWithEmail(data.email, data.password);
      const loggedUser = userCredential.user;
  
      // Enregistrement du log après la tentative de connexion
      const logEntry: LogEntry = {
        event: "tentative de connexion", // Événement pour tentative de connexion
        userId: loggedUser.uid, // ID de l'utilisateur
        createdAt: new Date(), // Date et heure de l'événement
        details: `Tentative de connexion avec l'email: ${data.email}`,
        documentId: '',
        device: `Depuis ${deviceDetails}  `,
      };
      await logEvent(logEntry,loggedUser.uid); // Enregistre le log
  
      if (loggedUser.emailVerified) {
        router.push("/dashboard");
  
        // Enregistrement d'un log après connexion réussie
        const successLog: LogEntry = {
          event: "Connexion de l'utilisateur", // Événement pour connexion réussie
          userId: loggedUser.uid, // ID de l'utilisateur
          createdAt: new Date(), // Date et heure de l'événement
          details: `Connexion réussie pour l'utilisateur: ${data.email}`,
          documentId: '',
          device: `Depuis ${deviceDetails}  `,
        };
        await logEvent(successLog,loggedUser.uid); // Enregistre le log de connexion réussie
      } else {
        setError("Veuillez vérifier votre email avant d'accéder au tableau de bord.");
        await signOut(auth); // Déconnexion de l'utilisateur non vérifié
  
        // Enregistrement d'un log pour email non vérifié
        const unverifiedLog: LogEntry = {
          event: "email_non_verifié", // Événement pour email non vérifié
          userId: loggedUser.uid, // ID de l'utilisateur
          createdAt: new Date(), // Date et heure de l'événement
          details: `Email non vérifié pour l'utilisateur: ${data.email}`,
          documentId: '',
          device: `Depuis ${deviceDetails}  `,
        };
        await logEvent(unverifiedLog,loggedUser.uid); // Enregistre le log de non vérification de l'email
      }
    } catch (err) {
      setError("Échec de la connexion. Veuillez vérifier vos identifiants.");
    
      // Enregistrement du log pour une erreur de connexion
      const errorLog: LogEntry = {
        event: "Echec de la connexion", // Événement pour échec de connexion
        userId: "", // Pas d'ID utilisateur disponible en cas d'échec
        createdAt: new Date(), // Date et heure de l'événement
        details: `Échec de connexion avec l'email: ${data.email}`,
        documentId: '',
        device: `Depuis ${deviceDetails}  `,
      };
      await logEvent(errorLog, ""); // Enregistre le log de l'erreur de connexion
    }
  };
  const deviceDetails = getDeviceInfo();

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await loginWithGoogle();
      const loggedUser = userCredential.user;
  
      // Enregistrement du log après la tentative de connexion via Google
      const logEntry: LogEntry = {
        event: "connexion_google_tentative", // Événement pour tentative de connexion via Google
        userId: loggedUser.uid, // ID de l'utilisateur
        createdAt: new Date(), // Date et heure de l'événement
        details: `Tentative de connexion via Google pour l'utilisateur: ${loggedUser.email}`,
        documentId: '',
        device: ''
      };
      await logEvent(logEntry,loggedUser.uid); // Enregistre le log
  
      // Redirection vers le tableau de bord après connexion réussie
      router.push("/dashboard");
  
      // Enregistrement d'un log après connexion réussie via Google
      const successLog: LogEntry = {
        event: "connexion_google_reussie", // Événement pour connexion réussie via Google
        userId: loggedUser.uid, // ID de l'utilisateur
        createdAt: new Date(), // Date et heure de l'événement
        details: `Connexion via Google réussie pour l'utilisateur: ${loggedUser.email}`,
        documentId: '',
        device: ''
      };
      await logEvent(successLog,loggedUser.uid); // Enregistre le log de la connexion réussie
    } catch (err: any) {
      setError("Échec de la connexion avec Google.");
  
      // Enregistrement du log pour échec de connexion via Google
      const errorLog: LogEntry = {
        event: "connexion_google_echec", // Événement pour échec de connexion via Google
        userId: "", // Pas d'ID utilisateur disponible en cas d'échec
        createdAt: new Date(), // Date et heure de l'événement
        details: `Échec de connexion via Google. Erreur: ${err.message}`,
        documentId: '',
        device: ''
      };
      await logEvent(errorLog,""); // Enregistre le log de l'erreur de connexion
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Animation 3D à gauche */}
        <div className="w-1/2 flex items-center justify-center bg-cover bg-center">
          <iframe
            src="https://lottie.host/embed/380be387-a6b5-49db-a2e4-7e7723bf74a1/8XEMIarsRk.json"
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Animation GED IA"
          ></iframe>
        </div>

        {/* Formulaire à droite */}
        <div className="w-1/2 p-8">
          <Card className='bg-transparent border-none shadow-none  '>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-black">Connexion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    required
                    className="bg-transparent text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    {...register('password')}
                    required
                    className="bg-transparent text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-700">
                  Connexion
                </Button>
                <div className="text-center text-sm text-gray-500">
                  Vous n&apos;avez pas de compte ? <a href="/inscription" className="text-blue-600 hover:underline">Inscrivez-vous</a>
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
                    <path fill="#EA4335" d="M24 9.5c3.28 0 6.27 1.25 8.47 3.28l6.24-6.24C34.13 3.43 29.29 1 24 1 14.4 1 6.21 6.53 2.39 14.24l7.25 5.63C11.43 14.1 17.2 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.61 24.63c0-1.45-.13-2.85-.38-4.2H24v8.16h12.74c-.55 2.99-2.23 5.52-4.8 7.23l7.25 5.63C43.99 37.73 46.61 31.65 46.61 24.63z" />
                    <path fill="#FBBC05" d="M10.25 28.8c-1.22-3.68-1.22-7.68 0-11.36l-7.25-5.63C-.63 17.54-.63 31.73 2.99 40.75l7.26-5.62z" />
                    <path fill="#34A853" d="M24 46c5.29 0 10.13-1.83 13.91-4.97l-7.25-5.63C28.74 37.57 26.49 38.5 24 38.5c-6.8 0-12.57-4.6-14.36-10.86l-7.26 5.62C6.21 41.47 14.4 46 24 46z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  Connexion avec Google
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
