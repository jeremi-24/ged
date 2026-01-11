'use client';

import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Card } from "@/components/ui/card";
import { Contenu } from "./contenu";
import DocumentChart from "@/components/ux/DocumentChart";
import DropdownMenuplus from "@/components/ui/DropdownMenu";
import { FilePlus2, Search, Settings, TrashIcon } from "lucide-react";
import { useState, useCallback } from "react"; // Ajout de useCallback
import { DocumentData } from "@/types/types";
import { StorageCard } from "@/components/ux/StorageCard";
import { RecentActivity } from "@/components/ux/RecentActivity";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);

  // CORRECTION : Utilisation de useCallback pour éviter de recréer la fonction à chaque rendu
  const handleDataLoaded = useCallback((docs: DocumentData[]) => {
    setDocuments(docs);
    const size = docs.reduce((acc, doc) => acc + (doc.size || 0), 0);
    setStorageUsed(size);
  }, []); 

  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;

  const items = [
    { icon: <FilePlus2 size={16} />, name: "Nouveau document", href: "/documents/nouveau_document" },
    { icon: <Search size={16} />, name: "Nouvelle recherche", href: "/recherche" },
    { icon: <Settings size={16} />, name: "Réglage", href: "/account" },
    {
      icon: <TrashIcon size={16} />,
      name: "Supprimer",
      customStyle: "!text-red-500 hover:bg-red-500/10",
    },
  ];

  return (
    <ContentLayout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/">Accueil</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Dashboard</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2">Bienvenue sur votre espace</h2>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <div className="flex items-center gap-2 bg-card p-2 rounded-xl border shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-hover-open"
                      onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                      checked={settings.isHoverOpen}
                      className="scale-75"
                    />
                    <Label htmlFor="is-hover-open" className="text-xs">Survol</Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>Ouvrir la barre latérale au survol</p></TooltipContent>
              </Tooltip>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <DropdownMenuplus items={items} />
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-6">
        {/* On passe la fonction stable ici */}
        <Contenu onDataLoaded={handleDataLoaded} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="premium-card bg-card/50 backdrop-blur p-6">
              <DocumentChart docs={documents} />
            </Card>
            <RecentActivity documents={documents} />
          </div>

          <div className="space-y-6">
            <StorageCard used={storageUsed} total={5 * 1024 * 1024 * 1024} />
            
            <Card className="premium-card bg-primary text-primary-foreground p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 italic">Besoin d&apos;aide ?</h3>
                <p className="text-sm text-white/80 mb-4">Consultez notre guide interactif pour maîtriser YunoDoc.</p>
                <Button variant="secondary" size="sm" className="rounded-full font-bold bg-white text-primary">Démarrer le guide</Button>
              </div>
            </Card>

            <Card className="premium-card bg-card/50 backdrop-blur p-6">
              <h3 className="font-bold mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 rounded-2xl" asChild>
                  <Link href="/documents/nouveau_document">
                    <FilePlus2 className="w-5 h-5 text-primary" />
                    <span className="text-xs">Nouveau</span>
                  </Link>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 rounded-2xl" asChild>
                  <Link href="/recherche">
                    <Search className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">Rechercher</span>
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}