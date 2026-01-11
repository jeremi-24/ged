"use client";

import Link from "next/link";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/firebase/auth";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { auth } from "@/firebase/config";
import { logEvent } from "@/lib/services/logEvent";
import { LogEntry } from "@/types/Logs";
import { getDeviceInfo } from "@/lib/utils/deviceInfo";
import { useLanguage } from "@/components/providers/language-provider";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  const { t } = useLanguage();


  const handleLogout = async () => {
    try {
      // Récupérer l'ID de l'utilisateur actuellement connecté avant la déconnexion
      const user = auth.currentUser;
      const userId = user ? user.uid : "utilisateur_inconnu"; // Gestion si l'utilisateur n'est pas trouvé

      // Enregistrement du log avant la déconnexion
      const logEntry: LogEntry = {
        event: "deconnexion_utilisateur", // Événement pour déconnexion
        userId: userId, // ID de l'utilisateur
        createdAt: new Date(), // Date et heure de l'événement
        details: `L'utilisateur ${user ? user.email : "inconnu"} s'est déconnecté.`,
        documentId: "",
        device: `Depuis ${deviceDetails}  `,
      };
      await logEvent(logEntry, userId); // Enregistrement du log

      // Procéder à la déconnexion
      await logout();

      // Rediriger l'utilisateur vers la page de connexion après déconnexion
      window.location.href = "/connexion";
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error);
      alert(error.message);

      // Enregistrement du log en cas d'erreur lors de la déconnexion
      const errorLog: LogEntry = {
        event: "deconnexion_echec", // Événement pour échec de déconnexion
        userId: auth.currentUser ? auth.currentUser.uid : "utilisateur_inconnu", // ID de l'utilisateur si disponible
        createdAt: new Date(), // Date et heure de l'événement
        details: `Échec de la déconnexion pour l'utilisateur : ${error.message}`,
        documentId: "",
        device: `Depuis ${deviceDetails}  `,
      };
      await logEvent(errorLog, ""); // Enregistrement du log pour l'erreur de déconnexion
    }
  };
  const deviceDetails = getDeviceInfo();

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {t(groupLabel)}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{t(groupLabel)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  !submenus || submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                (active === undefined &&
                                  pathname.startsWith(href)) ||
                                  active
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-10 mb-1"
                              asChild
                            >
                              <Link href={href}>
                                <span
                                  className={cn(isOpen === false ? "" : "mr-4")}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {t(label)}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {t(label)}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={
                          active === undefined
                            ? pathname.startsWith(href)
                            : active
                        }
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-center h-10 mt-5"
                  >
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap",
                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                      )}
                    >
                      {t('sidebar.logout')}
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">{t('sidebar.logout')}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
