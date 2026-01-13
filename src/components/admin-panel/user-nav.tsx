"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { auth, firestore } from "@/firebase/config"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export function UserNav() {
  const [user, setUser] = useState<{ displayName: string; email: string; photoURL: string | null; role?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        
        try {
          const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              displayName: `${userData.prenom || ""} ${userData.nom || ""}`.trim() || authUser.displayName || "Utilisateur",
              email: authUser.email || "Email non disponible",
              photoURL: userData.photoURL || authUser.photoURL,
              role: userData.role
            });
          } else {
            setUser({
              displayName: authUser.displayName || "Utilisateur",
              email: authUser.email || "Email non disponible",
              photoURL: authUser.photoURL
            });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser({
            displayName: authUser.displayName || "Utilisateur",
            email: authUser.email || "Email non disponible",
            photoURL: authUser.photoURL
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || "#"} alt="Avatar" />
                  <AvatarFallback className="bg-transparent">
                    {user ? user.displayName.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {user?.role && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-1">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Compte
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
