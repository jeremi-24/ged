'use client';
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { onAuthStateChanged } from "firebase/auth";
import { fetchDocumentAges } from "@/lib/services/DocumentAgeDocument"; // Assurez-vous que le chemin est correct
import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import UserInfoDialog from "@/components/ux/UserInfoDialog";

export default function Contenu2() {
  const [documentAges, setDocumentAges] = useState<{
    documentId: string;
    createdAt: Date;
    ageInYears: string; // Changer ici pour correspondre à la chaîne formatée
    isArchived: boolean; // Indicateur d'archivage
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // L'utilisateur est connecté, récupérez son ID
        const userId = user.uid; // Récupérer l'ID de l'utilisateur

        try {
          const ages = await fetchDocumentAges(userId); // Récupérer les âges des documents
          setDocumentAges(ages); // Mettre à jour l'état avec les âges des documents
        } catch (error) {
          console.error("Erreur lors de la récupération des âges des documents :", error);
        }
      } else {
        // L'utilisateur n'est pas connecté
        console.log("Aucun utilisateur connecté");
      }
      setLoading(false);
    });

    // Nettoyer l'abonnement à l'état d'authentification
    return () => unsubscribe();
  }, []);

  return (
    <Card className="rounded-lg border-none mt-6">
      <CardContent className="p-6">
      <UserInfoDialog/>
        <div className="flex justify-center items-center min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
          <div className="flex flex-col relative">
            <div className="absolute -bottom-8 right-0">
              <div>
                <h2>Âges des Documents</h2>
                <ul>
                  {documentAges.map(doc => (
                    <li key={doc.documentId}>
                      Document ID: {doc.documentId}, Créé le: {doc.createdAt.toDateString()}, Âge: {doc.ageInYears}, Archivé: {doc.isArchived ? 'Oui' : 'Non'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
