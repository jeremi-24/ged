'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import * as z from 'zod';

import React from 'react';

import { MultiStepForm } from './signup-multi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerWithEmail } from '@/firebase/auth';
import { Icons } from '@/components/icons copy';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1); // Étape initiale du formulaire
  const [firebase_uid, setFirebaseUid] = React.useState<string | null>(null);
  const [organisations_id, setOrganisationsId] = React.useState<number | null>(null);
  const [country, setCountry] = React.useState<string>('');
  const [message, setMessage] = React.useState<string | null>(null);

  const getCountryByGeo = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`);
        const data = await response.json();
        return data.country || 'Unknown';
      } catch (error) {
        toast({
          title: "Erreur",
          description: `Erreur lors de la récupération de la géolocalisation: ${error}`,
          variant: "destructive",
        });
       
        return 'Unknown';
      }
    } else {
      toast({
        title: "Erreur",
        description: `Géolocalisation non supportée`,
        variant: "destructive",
      });
      
      return 'Unknown';
    }
  };

  const createOrganisation = async (name: string, country: string) => {
    try {
      const response = await fetch('/api/organisations/createOrganisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country }),
      });
      const data = await response.json();
      if (data.organisation) {
        setOrganisationsId(data.organisation.id);
        return data.organisation.id;
      } else {
        throw new Error('Erreur lors de la création de l\'organisation');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de l\'organisation`,
        variant: "destructive",
      });
      
      return null;
    }
  };

  const handleSubmit = async (data: UserFormValue) => {
    setLoading(true);
    setMessage(null);

    try {
      const userCredential = await registerWithEmail(data.email, data.password);
      setMessage('Un lien de confirmation a été envoyé à votre email.');
      setFirebaseUid(userCredential.user.uid);

      const userCountry = await getCountryByGeo();
      setCountry(userCountry);

      const organisationName = `Organisation ${userCredential.user.uid}`;
      const organisationId = await createOrganisation(organisationName, userCountry);

      if (organisationId) {
        setOrganisationsId(organisationId);
        setStep(2); // Passe à l'étape suivante
      }
    } catch (error) {
      setMessage('Une erreur est survenue, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
    {step === 1 && (
            <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez votre email  pour créer votre compte
            </p>
          </div>
          )}
   
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-2">
            
          <div className="relative overflow-hidden">
            <div
              className={`transition-transform duration-500 ease-in-out transform ${
                step === 1 ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email..."
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
                            placeholder="Enter your password..."
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div
              className={`transition-transform duration-500 ease-in-out transform ${
                step === 2 ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {step === 2 && (
                <MultiStepForm
                  firebase_uid={firebase_uid}
                  email={form.watch('email')}
                  country={country}
                  organisations_id={organisations_id}
                />
              )}
            </div>
          </div>

          {step === 1 && (
            <Button
              disabled={loading}
              className="ml-auto w-full"
              type="submit"
            >
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : 'S\'inscrire avec Email'}
            </Button>
          )}
        </form>
      </Form>
    </>
  );
}
