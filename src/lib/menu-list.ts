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
          label: "dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "sidebar.content",
      menus: [
        {
          href: "",
          label: "sidebar.documents",
          icon: SquarePen,
          submenus: [
            {
              href: "/documents",
              label: "sidebar.my_documents"
            },
            {
              href: "/documents/nouveau_document",
              label: "sidebar.new_document"
            }
          ]
        },
        {
          href: "/recherche",
          label: "sidebar.search",
          icon: Search,
        },
        {
          href: "/logs",
          label: "sidebar.reports",
          icon: Flag
        }
      ]
    },
    {
      groupLabel: "sidebar.settings",
      menus: [
        {
          href: "/Utilisateurs",
          label: "sidebar.users",
          icon: Bell
        },
        {
          href: "/account",
          label: "sidebar.account",
          icon: Settings
        }
      ]
    },
    {
      groupLabel: "sidebar.ai_tools",
      menus: [
        {
          href: "/discussion",
          label: "sidebar.discussion",
          icon: MessageSquareMore
        }
      ]
    }
  ];
}
