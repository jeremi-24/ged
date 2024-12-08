import {
  Flag,
  Bell,
  Settings,
  Search,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  MessageSquareMore
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contenu",
      menus: [
        {
          href: "",
          label: "Documents",
          icon: SquarePen,
          submenus: [
            {
              href: "/documents",
              label: "Mes Documents"
            },
            {
              href: "/documents/nouveau_document",
              label: "Nouveau document"
            }
          ]
        },
        {
          href: "/recherche",
          label: "Recherche",
          icon: Search,
        },
        {
          href: "/tags",
          label: "Rapports",
          icon: Flag
        }
      ]
    },
    {
      groupLabel: "Réglages",
      menus: [
        {
          href: "/Utilisateurs",
          label: "Utilisateurs",
          icon: Bell
        },
        {
          href: "/account",
          label: "Compte",
          icon: Settings
        }
      ]
    },
    {
      groupLabel: "Outils IA",
      menus: [
        {
          href: "/discussion",
          label: "Discussion",
          icon: MessageSquareMore // Vous pouvez choisir une autre icône si vous le souhaitez
        }
      ]
    }
  ];
}
