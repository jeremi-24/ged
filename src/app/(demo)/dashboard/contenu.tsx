'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Book, Trash2, TriangleAlert, Users } from "lucide-react"; // Assurez-vous d'avoir lucide-react installé.
import { fetchDocumentCounts } from '@/lib/utils/fetchDocumentsCount'; // Importez la fonction utilitaire
import { fetchDocumentsWithOneMonthTillArchival } from '@/lib/services/Documentecheance';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import UserInfoDialog from '@/components/ux/UserInfoDialog';
import { fetchUserCount } from '@/lib/fetchUsers';
import { useRouter } from 'next/navigation';

export function Contenu() {
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [archivedDocuments, setArchivedDocuments] = useState(0);
    const [pendingDocuments, setPendingDocuments] = useState(0); // État pour les documents en attente
    const [activeUsers, setActiveUsers] = useState(0); // État pour les utilisateurs actifs
    const router = useRouter(); 


    useEffect(() => {
        const getDocumentCounts = async () => {
            const counts = await fetchDocumentCounts(); // Appel à la fonction d'utilitaire
            setTotalDocuments(counts.totalDocuments); // Mettre à jour le total des documents
            setArchivedDocuments(counts.archivedDocuments); // Mettre à jour le total des documents archivés
            // Vous pouvez ajuster ces valeurs selon vos besoins ou en récupérant d'autres données
            setPendingDocuments(15); // Remplacez par la logique pour obtenir le nombre réel
              // Récupérer le nombre d'utilisateurs actifs
            const userCount = await fetchUserCount();
            setActiveUsers(userCount);
        };

        getDocumentCounts(); // Appeler la fonction pour récupérer les comptes lors du chargement du composant
    }, []);
    
    const [totalDocumentArch, setTotalDocumentArch] = useState(0);

  
    useEffect(() => {
        const auth = getAuth();
    
        // Écoute des changements d'état de l'utilisateur
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Récupération des documents quand l'utilisateur est authentifié
              const { total } = await fetchDocumentsWithOneMonthTillArchival(user.uid);
              setTotalDocumentArch(total);
            } catch (error) {
              console.error("Erreur lors de la récupération des documents :", error);
            }
          } else {
            setTotalDocuments(0); // Réinitialise si l'utilisateur est déconnecté
          }
        });
    
        // Nettoyage de l'écoute à la fin du cycle de vie du composant
        return () => unsubscribe();
      }, []);
      const handleTotalDocumentsClick = () => {
        window.location.href = '/recherche'; // Redirige vers /recherche avec un rechargement de la page
    };
    return (
        <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-0 flex">
            <UserInfoDialog/>
                <div className="flex justify-center items-center w-full">
                    {/* Panneau de gauche contenant 4 cartes */}
                    <div className="flex flex-1 flex-wrap gap-4 overflow-y-auto max-h-[400px]"> {/* Utilisez overflow-y-auto et une hauteur maximale */}
                        <div className="flex-1 min-w-[250px]">
                            <Card
                             onClick={handleTotalDocumentsClick}
                             className="h-32 flex justify-between items-center p-4 transform transition-transform duration-300 hover:scale-90">
                                <div className="flex flex-col">
                                    <p className="text-4xl font-bold">{totalDocuments}</p>
                                    <h2 className="text-lg font-semibold">Total Documents</h2>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                                    <Book size={24} className="text-blue-500" />
                                </div>
                            </Card>
                        </div>
                        <div className="flex-1 min-w-[250px]">
                            <Card className="h-32 flex justify-between items-center p-4 transform transition-transform duration-300 hover:scale-90">
                                <div className="flex flex-col">
                                    <p className="text-4xl font-bold">{archivedDocuments}</p>
                                    <h2 className="text-lg font-semibold">Documents Archivés</h2>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                                    <Trash2 size={24} className="text-green-500" />
                                </div>
                            </Card>
                        </div>
                        <div className="flex-1 min-w-[250px]">
                            <Card className="h-32 flex justify-between items-center p-4 transform transition-transform duration-300 hover:scale-90">
                                <div className="flex flex-col">
                                    <p className="text-4xl font-bold">{totalDocumentArch}</p>
                                    <h2 className="text-lg font-semibold">Archivage (1mois)</h2>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                                    <TriangleAlert size={24} className="text-red-500" />
                                </div>
                            </Card>
                        </div>
                        <div className="flex-1 min-w-[250px]">
                            <Card className="h-32 flex justify-between items-center p-4 transform transition-transform duration-300 hover:scale-90">
                                <div className="flex flex-col">
                                    <p className="text-4xl font-bold">{activeUsers}</p>
                                    <h2 className="text-lg font-semibold">Utilisateurs Actifs</h2>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                                    <Users size={24} className="text-indigo-500" />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
