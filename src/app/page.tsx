'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  Zap,
  Cloud,
  Bot,
  FolderSearch,
  Users
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
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* Premium Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:rotate-6 transition-transform">
              Y
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              YunoDoc
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</Link>
            <Link href="#security" className="hover:text-primary transition-colors">Sécurité</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/connexion" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link href="/inscription">
                Commencer
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Dynamic Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 border border-primary/20 px-4"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Géré par l&apos;IA de pointe</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto"
            >
              Gérez vos documents avec une
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 italic"> intelligence supérieure</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              YunoDoc automatise le dépôt, la classification et la recherche de vos documents professionnels grâce à l&apos;IA. Gagnez du temps et restez organisé sans effort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
            >
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg shadow-xl shadow-primary/30" asChild>
                <Link href="/inscription">Essai Gratuit</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg border-2" asChild>
                <Link href="#features">Voir en action</Link>
              </Button>
            </motion.div>

            {/* Product Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative max-w-6xl mx-auto rounded-3xl border bg-card/50 backdrop-blur p-2 shadow-2xl animate-float"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent -z-10 rounded-3xl blur-3xl opacity-50" />
              <Image
                src="/yuno2.PNG"
                alt="Product Interface Mockup"
                width={1200}
                height={800}
                className="rounded-2xl border w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Dynamic Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 italic">Tout ce dont vous avez besoin</h2>
              <p className="text-muted-foreground text-lg">Une suite complète d&apos;outils alimentés par l&apos;IA pour vos documents.</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <Bot className="w-10 h-10 text-primary" />,
                  title: "Auto-Classification IA",
                  desc: "L'IA analyse le contenu de vos PDF et les range automatiquement dans les bons dossiers."
                },
                {
                  icon: <Search className="w-10 h-10 text-blue-500" />,
                  title: "Recherche Intelligente",
                  desc: "Trouvez instantanément n'importe quel document grâce à l'OCR intégré et la recherche sémantique."
                },
                {
                  icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
                  title: "Sécurité de Grade Entreprise",
                  desc: "Vos données sont cryptées et stockées en toute sécurité sur nos serveurs haute performance."
                },
                {
                  icon: <FolderSearch className="w-10 h-10 text-orange-500" />,
                  title: "Organisation Intuitive",
                  desc: "Une structure de dossiers propre et automatisée pour ne plus jamais perdre de fichier."
                },
                {
                  icon: <Cloud className="w-10 h-10 text-sky-500" />,
                  title: "Accès Cloud 24/7",
                  desc: "Accédez à vos documents partout, tout le temps, depuis n'importe quel appareil."
                },
                {
                  icon: <Users className="w-10 h-10 text-purple-500" />,
                  title: "Collaboration Simple",
                  desc: "Partagez vos documents et gérez les rôles d'accès en quelques clics."
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="p-8 rounded-3xl border bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="mb-6 bg-muted inline-block p-4 rounded-2xl group-hover:scale-110 transition-transform">{feat.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works / Steps Section */}
        <section id="how-it-works" className="py-24 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 italic">Simplifiez votre gestion documentaire</h2>
                <div className="space-y-8">
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
                      className="flex gap-6"
                    >
                      <div className="text-4xl font-black text-primary/20">{s.step}</div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                        <p className="text-muted-foreground">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="aspect-square bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[4rem] flex items-center justify-center p-8">
                  <div className="bg-card w-full h-full rounded-[3rem] shadow-2xl overflow-hidden border">
                    {/* Placeholder for interactive illustration or video */}
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-12 text-center">
                      <CheckCircle2 className="w-20 h-20 text-primary mb-4" />
                      <h3 className="text-2xl font-bold italic">Prêt à transformer votre entreprise ?</h3>
                      <p className="text-muted-foreground">Rejoignez des centaines d&apos;entreprises qui font confiance à YunoDoc.</p>
                      <Button className="rounded-full mt-4">Essayer maintenant</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-extrabold mb-8 italic">Prêt à passer au niveau supérieur ?</h2>
                <p className="text-primary-foreground/80 text-xl mb-12 max-w-2xl mx-auto">
                  Démarrez dès aujourd&apos;hui et voyez comment YunoDoc peut révolutionner votre organisation. Pas de carte de crédit requise.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" variant="secondary" className="h-16 px-12 rounded-2xl text-lg font-bold" asChild>
                    <Link href="/inscription">Créer un compte</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl text-lg font-bold border-white/20 hover:bg-white/10" asChild>
                    <Link href="/contact">Parler à un expert</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                  Y
                </div>
                <span className="text-xl font-bold tracking-tight">
                  YunoDoc
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6">
                Solution de gestion documentaire intelligente conçue pour les entreprises modernes.
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Ekoue Jeremie</p>
                <a href="mailto:jeremiekoue8@gmail.com" className="hover:text-primary transition-colors underline">jeremiekoue8@gmail.com</a>
                <p>Tél : +228 79797940</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Produit</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Tarification</Link></li>
                <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Légal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/security" className="hover:text-primary transition-colors">Sécurité</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
            <p>© 2026 YUNODOC. TOUS DROITS RÉSERVÉS.</p>
            <div className="flex gap-8">
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
