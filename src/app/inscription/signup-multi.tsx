import * as React from "react";
import { useForm, Controller } from "react-hook-form";


import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { auth, firestore } from '@/firebase/config';
import { collection, addDoc, setDoc, doc, getDocs,updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { storage } from "@/firebase/config";
import { Icons } from "@/components/icons copy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
        const user = auth.currentUser; // Obtenez l'utilisateur actuellement authentifié

        if (user) {
          // Vérifier si l'utilisateur est le premier utilisateur
          
  
          // Création du document utilisateur dans Firestore
          const userDoc = {
            email: email,
            createdAt: new Date(),
            nom: data.first_name || '',
            prenom: data.last_name || '',
            role:data.role ,
          };
  
          // Ajoutez le document à la collection 'users' dans Firestore
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
    const storageRef = ref(storage, `profile_pictures/${file.name}`); // Référence pour le fichier
    const uploadTask = uploadBytesResumable(storageRef, file); // Crée une tâche d'upload

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optionnel : Vous pouvez ajouter une gestion du progrès ici
        },
        (error) => {
          reject(error); // Si une erreur se produit, on la rejette
        },
        () => {
          // Lorsque l'upload est terminé, on récupère l'URL du fichier
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => {
              resolve(url); // Retourne l'URL du fichier téléchargé
            })
            .catch((error) => {
              reject(error); // En cas d'erreur pour récupérer l'URL
            });
        }
      );
    });
  };

  return (
    <div className={cn("grid gap-6 px-4 py-6", className)}>
      {/* Indicateur d'étapes */}
      <div className="flex mb-4 justify-center">
        <div className="flex items-center space-x-1 ml-1">
          <StepIndicator step={1} currentStep={currentStep} />
          <div className="w-12 h-[2px] bg-gray-300 relative top-[2px]" />
          <StepIndicator step={2} currentStep={currentStep} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 && <Etape1 control={control} errors={errors} />}
        {currentStep === 2 && <Etape2 control={control} errors={errors}  setValue={setValue} handleFileUpload={handleFileUpload} />}

        <div className="flex justify-between mt-4">
          {/* Flèches sur mobile */}
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto sm:hidden flex items-center justify-center"
            >
              <ChevronLeftIcon className="h-6 w-6 text-blue-600" />
            </button>
          )}

          {/* Boutons sur desktop */}
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={handlePrevStep}
              className="hidden sm:flex w-full sm:w-auto"
            >
              Précédent
            </Button>
          )}

          {/* Flèches sur mobile */}
          <button
            type={currentStep === 2 ? "submit" : "button"}
            onClick={handleNextStep}
            className="w-full sm:w-auto sm:hidden flex items-center justify-center"
          >
            <ChevronRightIcon className="h-6 w-6 text-blue-600" />
          </button>

          {/* Boutons sur desktop */}
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
    <div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_name" className="text-black">Prénom</Label>
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
                className="text-black"
                value={field.value || ''}
              />
            )}
          />
          {errors.first_name && <span className="text-red-500">{errors.first_name.message}</span>}
        </div>

        <div>
          <Label htmlFor="last_name" className="text-black">Nom</Label>
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
                className="text-black"
                value={field.value || ''}
              />
            )}
          />
          {errors.last_name && <span className="text-red-500">{errors.last_name.message}</span>}
        </div>

        <div>
          <Label htmlFor="address" className="text-black">Adresse</Label>
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
                className="text-black"
                value={field.value || ''}
              />
            )}
          />
          {errors.address && <span className="text-red-500">{errors.address.message}</span>}
        </div>

        <div>
          <Label htmlFor="phone" className="text-black">Téléphone</Label>
          <div className="flex">
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <select {...field} id="countryCode" className="input w-[100px] mr-2">
                  <option value="+1">+1</option>
                  <option value="+33">+33</option>
                  <option value="+44">+44</option>
                  {/* Ajoute ici d'autres indicatifs de pays */}
                </select>
              )}
            />
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "Le numéro de téléphone est requis",
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: "Numéro de téléphone invalide",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  placeholder="Votre numéro de téléphone"
                  type="tel"
                  className="text-black"
                  value={field.value || ''}
                />
              )}
            />
          </div>
          {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
        </div>
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

export function Etape2({ control, errors , handleFileUpload, setValue}: Etape2Props) {
  return (
    <div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      

        <div>
          <Label htmlFor="role" className="text-black">Rôle</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <select {...field} id="role" className="input">
                <option value="none">Choisissez votre role</option>
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
                {/* Ajoute d'autres rôles si nécessaire */}
              </select>
            )}
          />
          {errors.role && <span className="text-red-500">{errors.role.message}</span>}
        </div>

        <div>
          <Label htmlFor="profilePicture" className="text-black">Photo de profil</Label>
          <Controller
            name="profilePicture"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="profilePicture"
                type="file"
                className="input w-full"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const photoUrl = await handleFileUpload(file); // Upload de la photo
                      setValue("photo_url", photoUrl); // Met à jour l'URL dans les valeurs du formulaire
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
  );
}
