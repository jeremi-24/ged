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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent } from "@/components/ui/card";
import {Contenu} from "./contenu";
import DocumentChart from "@/components/ux/DocumentChart";
import DropdownMenuplus from "@/components/ui/DropdownMenu";
import { FilePlus2, Search, UserCheck, Settings, TrashIcon } from "lucide-react";


export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;

   
  const items = [
    { icon: <FilePlus2 size={16} />, name: "Nouveau document", href: "/documents/nouveau_document" },
    { icon: <Search size={16} />, name: "Nouvelle recherche", href: "/recherche" },
   
    { icon: <Settings size={16} />, name: "Réglage", href: "/account" },
    {
      icon: <TrashIcon size={16} />,
      name: "Supprimer",
      customStyle:
        "!text-red-500 hover:bg-red-500/10 focus-visible:text-red-500 focus-visible:bg-red-500/10 focus-visible:border-red-500/10",
    },
  ];

  return (
    <ContentLayout title="Dashboard">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TooltipProvider>
        <Card className="rounded-lg border-none mt-4 h-[80vh]"> {/* Hauteur augmentée ici */}
          <CardContent className="p-0 flex h-full"> {/* Assurez-vous que le contenu prend toute la hauteur */}
            <div className="flex justify-center items-center w-full h-full">
              <ResizablePanelGroup
                direction="horizontal"
                className="w-full h-full rounded-lg border" // Utilisez h-full pour que le groupe prenne toute la hauteur
              >
                {/* Panneau de gauche avec les switches */}
                <ResizablePanel defaultSize={50} className="p-5 flex flex-col">
  <div className="flex flex-row flex-wrap gap-4 items-start"> {/* Alignement amélioré */}
    {/* Premier Switch */}
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2 mb-2"> {/* Ajustement de l'espace vertical */}
          <Switch
            id="is-hover-open"
            onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
            checked={settings.isHoverOpen}
          />
          <Label htmlFor="is-hover-open">Hover Open</Label>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>When hovering on the sidebar in mini state, it will open</p>
      </TooltipContent>
    </Tooltip>
    
    {/* Deuxième Switch */}
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2 mb-2"> {/* Ajustement de l'espace vertical */}
          <Switch
            id="disable-sidebar"
            onCheckedChange={(x) => setSettings({ disabled: x })}
            checked={settings.disabled}
          />
          <Label htmlFor="disable-sidebar">Disable Sidebar</Label>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Hide sidebar</p>
      </TooltipContent>
    </Tooltip>

    {/* DropdownMenuplus */}
    <div className="flex -mt-4"> {/* Centrage du menu déroulant */}
      <DropdownMenuplus items={items} />
    </div>
  </div>
  
  <Contenu />
</ResizablePanel>

                <ResizableHandle />
                
                {/* Panneau de droite */}
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup direction="vertical" className="h-full">
                    <ResizablePanel defaultSize={60} className="flex">
                    <DocumentChart/>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40}>
                      <div className="flex h-full items-center justify-center p-6">
                        {/* Contenu du panneau inférieur, vide pour l'instant */}
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </ContentLayout>
  );
}
