'use client';

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  Zap,
  Cloud,
  Bot,
  FolderSearch,
  Users,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:rotate-6 transition-transform">
              Y
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              YunoDoc
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</Link>
            <Link href="#security" className="hover:text-primary transition-colors">Sécurité</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/connexion" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Button asChild className="hidden sm:flex rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link href="/inscription">
                Commencer
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-4 font-medium text-center">
                <Link href="#features" onClick={toggleMenu} className="py-2 hover:text-primary">Fonctionnalités</Link>
                <Link href="#how-it-works" onClick={toggleMenu} className="py-2 hover:text-primary">Comment ça marche</Link>
                <Link href="#security" onClick={toggleMenu} className="py-2 hover:text-primary">Sécurité</Link>
                <hr className="border-muted" />
                <Link href="/connexion" onClick={toggleMenu} className="py-2">Se connecter</Link>
                <Button asChild className="w-full rounded-full">
                  <Link href="/inscription" onClick={toggleMenu}>Essai Gratuit</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
              <div className="absolute top-[-5%] left-[10%] md:left-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-5%] right-[10%] md:right-[20%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[100px]" />
            </div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-bold mb-6 md:mb-8 border border-primary/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Géré par l&apos;IA de pointe</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 max-w-4xl mx-auto leading-[1.1]"
            >
              Gérez vos documents avec une
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 italic"> intelligence supérieure</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
            >
              YunoDoc automatise le dépôt, la classification et la recherche de vos documents professionnels grâce à l&apos;IA. Gagnez du temps et restez organisé sans effort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16 md:mb-20 px-6"
            >
              <Button size="lg" className="h-14 px-8 md:px-10 rounded-2xl text-lg shadow-xl shadow-primary/30 w-full sm:w-auto" asChild>
                <Link href="/inscription">Essai Gratuit</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 md:px-10 rounded-2xl text-lg border-2 w-full sm:w-auto" asChild>
                <Link href="#features">Voir en action</Link>
              </Button>
            </motion.div>

            {/* PRODUCT IMAGE MOCKUP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative max-w-6xl mx-auto rounded-xl md:rounded-3xl border bg-card/50 backdrop-blur p-1 md:p-2 shadow-2xl overflow-hidden md:overflow-visible"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent -z-10 rounded-3xl blur-3xl opacity-50 hidden md:block" />
              <Image
                src="/yuno2.PNG"
                alt="Product Interface Mockup"
                width={1200}
                height={800}
                priority
                className="rounded-lg md:rounded-2xl border w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION (Keep original but ensure grid spacing) */}
        <section id="features" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 italic">Tout ce dont vous avez besoin</h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">Une suite complète d&apos;outils alimentés par l&apos;IA pour vos documents.</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                {
                  icon: <Bot className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
                  title: "Auto-Classification IA",
                  desc: "L'IA analyse le contenu de vos PDF et les range automatiquement dans les bons dossiers."
                },
                {
                  icon: <Search className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />,
                  title: "Recherche Intelligente",
                  desc: "Trouvez instantanément n'importe quel document grâce à l'OCR intégré et la recherche sémantique."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />,
                  title: "Sécurité de Grade Entreprise",
                  desc: "Vos données sont cryptées et stockées en toute sécurité sur nos serveurs haute performance."
                },
                {
                  icon: <FolderSearch className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />,
                  title: "Organisation Intuitive",
                  desc: "Une structure de dossiers propre et automatisée pour ne plus jamais perdre de fichier."
                },
                {
                  icon: <Cloud className="w-8 h-8 md:w-10 md:h-10 text-sky-500" />,
                  title: "Accès Cloud 24/7",
                  desc: "Accédez à vos documents partout, tout le temps, depuis n'importe quel appareil."
                },
                {
                  icon: <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
                  title: "Collaboration Simple",
                  desc: "Partagez vos documents et gérez les rôles d'accès en quelques clics."
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="p-6 md:p-8 rounded-2xl md:rounded-3xl border bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="mb-4 md:mb-6 bg-muted inline-block p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">{feat.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 md:py-32 border-t overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 italic">Simplifiez votre gestion documentaire</h2>
                <div className="space-y-8 md:space-y-10 text-left">
                  {[
                    { step: "01", title: "Déposez vos documents", desc: "Glissez-déposez vos fichiers PDF ou images sur la plateforme." },
                    { step: "02", title: "L'IA analyse et classe", desc: "Notre système identifie le type de document et extrait les informations clés." },
                    { step: "03", title: "Recherchez et partagez", desc: "Retrouvez vos documents en quelques secondes et partagez-les en sécurité." }
                  ].map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex gap-4 md:gap-6"
                    >
                      <div className="text-3xl md:text-4xl font-black text-primary/20 shrink-0">{s.step}</div>
                      <div>
                        <h4 className="text-lg md:text-xl font-bold mb-2">{s.title}</h4>
                        <p className="text-sm md:text-base text-muted-foreground">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none">
                <div className="aspect-square bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-3xl md:rounded-[4rem] flex items-center justify-center p-4 md:p-8">
                  <div className="bg-card w-full h-full rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden border flex flex-col items-center justify-center p-6 md:p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-primary mb-4 md:mb-6" />
                    <h3 className="text-xl md:text-2xl font-bold italic mb-4">Prêt à transformer votre entreprise ?</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-6">Rejoignez des centaines d&apos;entreprises qui font confiance à YunoDoc.</p>
                    <Button className="rounded-full w-full sm:w-auto">Essayer maintenant</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
              <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-6xl font-extrabold mb-6 md:mb-8 italic leading-tight">Prêt à passer au niveau supérieur ?</h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto">
                  Démarrez dès aujourd&apos;hui et voyez comment YunoDoc peut révolutionner votre organisation. Pas de carte de crédit requise.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" variant="secondary" className="h-14 md:h-16 px-8 md:px-12 rounded-2xl text-lg font-bold w-full sm:w-auto" asChild>
                    <Link href="/inscription">Créer un compte</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-12 rounded-2xl text-lg font-bold border-white/20 hover:bg-white/10 w-full sm:w-auto" asChild>
                    <Link href="/contact">Parler à un expert</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                  Y
                </div>
                <span className="text-xl font-bold tracking-tight">
                  YunoDoc
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6 mx-auto md:mx-0">
                Solution de gestion documentaire intelligente conçue pour les entreprises modernes.
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Ekoue Jeremie</p>
                <a href="mailto:jeremiekoue8@gmail.com" className="hover:text-primary transition-colors underline">jeremiekoue8@gmail.com</a>
                <p>Tél : +228 79797940</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-bold mb-6">Produit</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Tarification</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-bold mb-6">Légal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Conditions</Link></li>
                <li><Link href="/security" className="hover:text-primary transition-colors">Sécurité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">
            <p>© 2026 YUNODOC. TOUS DROITS RÉSERVÉS.</p>
            <div className="flex gap-6 md:gap-8">
              <a href="https://linkedin.com/in/jeremie-ekoue-a95873308" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}