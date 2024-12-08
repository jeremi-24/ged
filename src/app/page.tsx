import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-500 to-green-700">
      {/* Header section */}
      <header className="z-50 sticky top-0 w-full bg-transparent  py-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-wide text-white hover:text-yellow-400">
            Yuno<span className="text-yellow-400">Doc</span>
          </Link>
          <nav className="flex gap-4">
            <Button variant="default" size="lg" className="rounded-full">
              <Link href="/dashboard">
                Essayer
                <ArrowRightIcon className="ml-2" />
              </Link>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex items-center justify-center py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4">
            Gérez vos documents intelligemment avec YunoDoc
          </h1>
          <p className="text-lg sm:text-xl mb-6">
            Une plateforme moderne qui utilise l&apos;intelligence artificielle pour organiser et rechercher vos documents efficacement.
          </p>

          <div className="flex justify-center gap-6">
            <Button variant="default" size="lg">
              <Link href="/dashboard">
                Commencer
                
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-black">
              <Link href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
                Se Connecter
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer section */}
      <footer className="py-6 bg-green-800 text-white">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            YunoDoc est une solution de gestion documentaire intelligente. Découvrez plus sur notre site et rejoignez-nous !
          </p>
        </div>
      </footer>
    </div>
  );
}
