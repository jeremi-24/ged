import * as React from "react";
import { useForm, Controller } from "react-hook-form";

import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { auth, firestore } from '@/firebase/config';
import { collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { storage } from "@/firebase/config";
import { Icons } from "@/components/icons copy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+221", name: "Sénégal", flag: "🇸🇳" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+212", name: "Maroc", flag: "🇲🇦" },
  { code: "+213", name: "Algérie", flag: "🇩🇿" },
  { code: "+216", name: "Tunisie", flag: "🇹🇳" },
  { code: "+237", name: "Cameroun", flag: "🇨🇲" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "+242", name: "Congo", flag: "🇨🇬" },
  { code: "+243", name: "RDC", flag: "🇨🇩" },
  
];

interface MultiStepFormProps {
  className?: string;
  firebase_uid: string | null;
  email: string;
  country: string;
  organisations_id: number | null;

}

export function MultiStepForm({
  className,
  firebase_uid,
  email,
  country,
  organisations_id,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm(

  );

  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const userData = {
        firebase_uid: firebase_uid || '',
        organisations_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: email || '',
        address: data.address || '',
        countryCode: data.countryCode || '',
        phone: data.phone || '',
        role: data.role,
        location: country || '',
        photo_url: data.photo_url || '',
      };

      const response = await fetch("/api/users/createUser/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const user = auth.currentUser; 

        if (user) {

          const userDoc = {
            email: email,
            createdAt: new Date(),
            nom: data.first_name || '',
            prenom: data.last_name || '',
            role: data.role,
          };

          await setDoc(doc(firestore, "users", user.uid), userDoc);
        }
        console.log("Utilisateur créé avec succès:", responseData.user);
        router.push('/connexion');
      } else {
        console.error("Erreur lors de la création de l'utilisateur:", responseData.error);
      }
    } catch (error) {
      console.error("Erreur de soumission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    const storageRef = ref(storage, `profile_pictures/${file.name}`); 
    const uploadTask = uploadBytesResumable(storageRef, file); 

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          
        },
        (error) => {
          reject(error); 
        },
        () => {
          
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => {
              resolve(url); 
            })
            .catch((error) => {
              reject(error); 
            });
        }
      );
    });
  };

  return (
    <div className={cn("grid gap-6 px-4 py-6", className)}>
      {}
      <div className="flex mb-4 justify-center">
        <div className="flex items-center space-x-1 ml-1">
          <StepIndicator step={1} currentStep={currentStep} />
          <div className="w-12 h-[2px] bg-gray-300 relative top-[2px]" />
          <StepIndicator step={2} currentStep={currentStep} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 && <Etape1 control={control} errors={errors} />}
        {currentStep === 2 && <Etape2 control={control} errors={errors} setValue={setValue} handleFileUpload={handleFileUpload} />}

        <div className="flex justify-between mt-4">
          {}
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto sm:hidden flex items-center justify-center"
            >
              <ChevronLeftIcon className="h-6 w-6 text-blue-600" />
            </button>
          )}

          {}
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={handlePrevStep}
              className="hidden sm:flex w-full sm:w-auto"
            >
              Précédent
            </Button>
          )}

          {}
          <button
            type={currentStep === 2 ? "submit" : "button"}
            onClick={handleNextStep}
            className="w-full sm:w-auto sm:hidden flex items-center justify-center"
          >
            <ChevronRightIcon className="h-6 w-6 text-blue-600" />
          </button>

          {}
          <Button
            type="button"
            onClick={currentStep === 2 ? handleSubmit(onSubmit) : handleNextStep}
            disabled={isLoading}
            className={`hidden sm:flex w-full sm:w-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Icons.spinner className="animate-spin mr-2 h-4 w-4" />
                Chargement...
              </div>
            ) : (
              <>
                {currentStep === 2 ? "Soumettre" : "Suivant"}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

        </div>
      </form>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
}

function StepIndicator({ step, currentStep }: StepIndicatorProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-8 h-8 rounded-full border-2 transition-all ${currentStep >= step
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-500 border-gray-300"
          } flex items-center justify-center`}
      >
        <span className="font-semibold">{step}</span>
      </div>
    </div>
  );
}

interface Etape1Props {
  control: any;
  errors: any;
}

export function Etape1({ control, errors }: Etape1Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Prénom</Label>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "Le prénom est requis" }}
            render={({ field }) => (
              <Input
                {...field}
                id="first_name"
                placeholder="Votre prénom"
                type="text"
                value={field.value || ''}
              />
            )}
          />
          {errors.first_name && <span className="text-red-500 text-xs">{errors.first_name.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Nom</Label>
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Le nom est requis" }}
            render={({ field }) => (
              <Input
                {...field}
                id="last_name"
                placeholder="Votre nom"
                type="text"
                value={field.value || ''}
              />
            )}
          />
          {errors.last_name && <span className="text-red-500 text-xs">{errors.last_name.message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Controller
          name="address"
          control={control}
          rules={{ required: "L'adresse est requise" }}
          render={({ field }) => (
            <Input
              {...field}
              id="address"
              placeholder="Votre adresse"
              type="text"
              value={field.value || ''}
            />
          )}
        />
        {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <div className="flex gap-2">
          <Controller
            name="countryCode"
            control={control}
            defaultValue="+228"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex-1">
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "Le numéro de téléphone est requis",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Numéro de téléphone invalide",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  placeholder="Ex: 90000000"
                  type="tel"
                  value={field.value || ''}
                />
              )}
            />
          </div>
        </div>
        {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
      </div>
    </div>
  );
}

interface Etape2Props {
  control: any;
  errors: any;
  handleFileUpload: (file: File) => Promise<string>;
  setValue: (name: string, value: any) => void;
}

export function Etape2({ control, errors, handleFileUpload, setValue }: Etape2Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Controller
            name="role"
            control={control}
            defaultValue="none"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choisissez votre rôle</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profilePicture">Photo de profil</Label>
          <div className="grid w-full items-center gap-1.5">
            <Controller
              name="profilePicture"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Input
                  {...field}
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const photoUrl = await handleFileUpload(file);
                        setValue("photo_url", photoUrl);
                        onChange(e.target.value);
                      } catch (error) {
                        console.error("Erreur lors du téléchargement de la photo", error);
                      }
                    }
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
