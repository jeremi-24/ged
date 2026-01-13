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
  const [user, setUser] = useState<any>(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Utilisateur authentifié:", currentUser); 
        setUser(currentUser); 
        
        try {
          const role = await getUserRole(currentUser.uid); 
          console.log("Rôle de l'utilisateur:", role); 
          setIsAdmin(role === "admin"); 
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle:", error); 
        }
      } else {
        console.log("Aucun utilisateur connecté."); 
        setUser(null); 
      }
      setLoading(false); 
    });

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
        <p>Chargement...</p> 
      ) : isAdmin ? (
        <AdminContent /> 
      ) : (
        <Contenu /> 
      )}
    </ContentLayout>
  );
}
