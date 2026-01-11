"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Locale = "fr" | "en";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const translations = {
    fr: {
        "preferences.title": "Préférences d'affichage",
        "preferences.description": "Personnalisez votre expérience d'utilisation.",
        "preferences.language": "Langue de l'interface",
        "preferences.language_desc": "Choisissez la langue dans laquelle vous souhaitez afficher l'application.",
        "account.settings": "Paramètres du Compte",
        "account.description": "Gérez vos informations personnelles et vos préférences de sécurité.",
        "account.personal_details": "Détails Personnels",
        "account.status": "Compte & Statut",
        "account.security": "Sécurité",
        "account.current_password": "Mot de passe actuel",
        "account.new_password": "Nouveau mot de passe",
        "account.update": "Mettre à jour",
        "sidebar.dashboard": "Dashboard",
        "sidebar.content": "Contenu",
        "sidebar.documents": "Documents",
        "sidebar.my_documents": "Mes Documents",
        "sidebar.new_document": "Nouveau document",
        "sidebar.search": "Recherche",
        "sidebar.reports": "Rapports",
        "sidebar.settings": "Réglages",
        "sidebar.users": "Utilisateurs",
        "sidebar.account": "Compte",
        "sidebar.ai_tools": "Outils IA",
        "sidebar.discussion": "Discussion",
        "sidebar.logout": "Se déconnecter",
        "breadcrumb.home": "Accueil",
        "breadcrumb.dashboard": "Dashboard",
        "breadcrumb.account": "Compte",
        "common.first_name": "Prénom",
        "common.last_name": "Nom",
        "common.phone": "Téléphone",
        "common.role": "Rôle",
        "common.verified": "Vérifié",
        "common.created_at": "Créé le",
    },
    en: {
        "preferences.title": "Display Preferences",
        "preferences.description": "Customize your user experience.",
        "preferences.language": "Interface Language",
        "preferences.language_desc": "Choose the language in which you want to display the application.",
        "account.settings": "Account Settings",
        "account.description": "Manage your personal information and security preferences.",
        "account.personal_details": "Personal Details",
        "account.status": "Account & Status",
        "account.security": "Security",
        "account.current_password": "Current Password",
        "account.new_password": "New Password",
        "account.update": "Update",
        "sidebar.dashboard": "Dashboard",
        "sidebar.content": "Content",
        "sidebar.documents": "Documents",
        "sidebar.my_documents": "My Documents",
        "sidebar.new_document": "New Document",
        "sidebar.search": "Search",
        "sidebar.reports": "Reports",
        "sidebar.settings": "Settings",
        "sidebar.users": "Users",
        "sidebar.account": "Account",
        "sidebar.ai_tools": "AI Tools",
        "sidebar.discussion": "Discussion",
        "sidebar.logout": "Logout",
        "breadcrumb.home": "Home",
        "breadcrumb.dashboard": "Dashboard",
        "breadcrumb.account": "Account",
        "common.first_name": "First Name",
        "common.last_name": "Last Name",
        "common.phone": "Phone",
        "common.role": "Role",
        "common.verified": "Verified",
        "common.created_at": "Created on",
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("fr");

    useEffect(() => {
        const savedLocale = localStorage.getItem("language") as Locale;
        if (savedLocale && (savedLocale === "en" || savedLocale === "fr")) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("language", newLocale);
    };

    const t = (key: string) => {
        return translations[locale][key as keyof typeof translations["fr"]] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
