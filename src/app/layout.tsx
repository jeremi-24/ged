import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/contexts/authContext";
import { LanguageProvider } from "@/components/providers/language-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "Yunodoc",
  description:
    "Une plateforme moderne qui utilise l'intelligence artificielle pour organiser et rechercher vos documents efficacement.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: "/",
    title: "YunoDoc",
    description:
      "Une plateforme moderne qui utilise l'intelligence artificielle pour organiser et rechercher vos documents efficacement.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "",
    description:
      ""
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
