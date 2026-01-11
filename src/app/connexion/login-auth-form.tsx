'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithEmail, loginWithGoogle } from '@/firebase/auth';
import { Icons } from '@/components/icons copy';
import { toast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { LogEntry } from '@/types/Logs';
import { logEvent } from '@/lib/services/logEvent';
import { getDeviceInfo } from '@/lib/utils/deviceInfo';

const formSchema = z.object({
    email: z.string().email({ message: 'Entrez une adresse email valide' }),
    password: z.string().min(6, { message: 'Le mot de passe doit comporter au moins 6 caractères' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<UserFormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "jeremiekoue8@gmail.com",
            password: "jeremiekoue",
        },
    });

    const onSubmit = async (data: UserFormValue) => {
        setLoading(true);
        setError(null);
        const deviceDetails = getDeviceInfo();

        try {
            const userCredential = await loginWithEmail(data.email, data.password);
            const loggedUser = userCredential.user;

            // Log attempt
            const logEntry: LogEntry = {
                event: "tentative de connexion",
                userId: loggedUser.uid,
                createdAt: new Date(),
                details: `Tentative de connexion avec l'email: ${data.email}`,
                documentId: '',
                device: `Depuis ${deviceDetails}`,
            };
            await logEvent(logEntry, loggedUser.uid);

            if (loggedUser.emailVerified) {
                // Log success
                const successLog: LogEntry = {
                    event: "Connexion de l'utilisateur",
                    userId: loggedUser.uid,
                    createdAt: new Date(),
                    details: `Connexion réussie pour l'utilisateur: ${data.email}`,
                    documentId: '',
                    device: `Depuis ${deviceDetails}`,
                };
                await logEvent(successLog, loggedUser.uid);
                router.push("/dashboard");
            } else {
                setError("Veuillez vérifier votre email avant d&apos;accéder au tableau de bord.");
                await signOut(auth);

                // Log unverified
                const unverifiedLog: LogEntry = {
                    event: "email_non_verifié",
                    userId: loggedUser.uid,
                    createdAt: new Date(),
                    details: `Email non vérifié pour l'utilisateur: ${data.email}`,
                    documentId: '',
                    device: `Depuis ${deviceDetails}`,
                };
                await logEvent(unverifiedLog, loggedUser.uid);
                toast({
                    title: "Attention",
                    description: "Veuillez vérifier votre email avant de vous connecter.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            setError("Échec de la connexion. Veuillez vérifier vos identifiants.");

            // Log error
            const errorLog: LogEntry = {
                event: "Echec de la connexion",
                userId: "",
                createdAt: new Date(),
                details: `Échec de connexion avec l&apos;email: ${data.email}`,
                documentId: '',
                device: `Depuis ${deviceDetails}`,
            };
            await logEvent(errorLog, "");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const userCredential = await loginWithGoogle();
            const loggedUser = userCredential.user;

            // Log attempt
            const logEntry: LogEntry = {
                event: "connexion_google_tentative",
                userId: loggedUser.uid,
                createdAt: new Date(),
                details: `Tentative de connexion via Google pour l'utilisateur: ${loggedUser.email}`,
                documentId: '',
                device: ''
            };
            await logEvent(logEntry, loggedUser.uid);

            router.push("/dashboard");

            // Log success
            const successLog: LogEntry = {
                event: "connexion_google_reussie",
                userId: loggedUser.uid,
                createdAt: new Date(),
                details: `Connexion via Google réussie pour l'utilisateur: ${loggedUser.email}`,
                documentId: '',
                device: ''
            };
            await logEvent(successLog, loggedUser.uid);
        } catch (err: any) {
            toast({
                title: "Erreur",
                description: "Échec de la connexion avec Google.",
                variant: "destructive",
            });

            // Log error
            const errorLog: LogEntry = {
                event: "connexion_google_echec",
                userId: "",
                createdAt: new Date(),
                details: `Échec de connexion via Google. Erreur: ${err.message}`,
                documentId: '',
                device: ''
            };
            await logEvent(errorLog, "");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Connexion
                </h1>
                <p className="text-sm text-muted-foreground">
                    Entrez votre email pour vous connecter à votre compte
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Entrez votre email..."
                                        disabled={loading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Entrez votre mot de passe..."
                                        disabled={loading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button disabled={loading} className="ml-auto w-full" type="submit">
                        {loading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Se connecter avec Email'
                        )}
                    </Button>
                </form>
            </Form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ou continuer avec
                    </span>
                </div>
            </div>
            <Button
                variant="outline"
                type="button"
                disabled={loading}
                className="w-full"
                onClick={handleGoogleLogin}
            >
                {loading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}
                Google
            </Button>
        </>
    );
}
