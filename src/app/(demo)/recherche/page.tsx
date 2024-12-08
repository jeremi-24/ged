'use client'
import Link from "next/link";

import PlaceholderContent from "@/components/demo/placeholder-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Contenu from "./contenu";
import { getUserRole } from "@/lib/services/userservice";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import AdminContent from "./admin-contenu";

export default function CategoriesPage() {

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); // État pour stocker l'utilisateur authentifié

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Utilisateur authentifié:", currentUser); // Afficher les détails de l'utilisateur
        setUser(currentUser); // Mettez à jour l'utilisateur authentifié
        
        try {
          const role = await getUserRole(currentUser.uid); // Récupérez le rôle de l'utilisateur
          console.log("Rôle de l'utilisateur:", role); // Afficher le rôle dans la console
          setIsAdmin(role === "admin"); // Vérifiez si l'utilisateur est admin
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle:", error); // Afficher les erreurs
        }
      } else {
        console.log("Aucun utilisateur connecté."); // Alerte si aucun utilisateur n'est connecté
        setUser(null); // Aucun utilisateur connecté
      }
      setLoading(false); // Arrêtez le chargement une fois que l'état est déterminé
    });

    // Nettoyage de l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, []);
  return (
    <ContentLayout title="Recherche">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recherche</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {loading ? (
        <p>Chargement...</p> // Affiche un message de chargement si le rôle est en train d'être récupéré
      ) : isAdmin ? (
        <AdminContent /> // Affiche le contenu admin si l'utilisateur est admin
      ) : (
        <Contenu /> // Sinon, affiche le contenu normal
      )}
    </ContentLayout>
  );
}
