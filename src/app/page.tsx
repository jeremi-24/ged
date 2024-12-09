import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-500 to-green-700">
      {/* Header section */}
      <header className="z-50 sticky top-0 w-full bg-transparent py-6">
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
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4">
            Gérez vos documents intelligemment avec YunoDoc
          </h1>
          <p className="text-lg sm:text-xl mb-6">
            Une plateforme moderne qui utilise l&apos;intelligence artificielle pour organiser et rechercher vos documents efficacement.
          </p>

          <div className="flex justify-center gap-6 mb-16">
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

        {/* Frame Section */}
        <section className="w-full max-w-5xl mx-auto rounded-lg p-6 text-gray-800">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">Démonstration</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
            <video
              src="" // Remplace par l'URL de ta démonstration
              title="Démonstration de YunoDoc"
              className="w-full h-full border-0"
              controls
            ></video>
          </div>
        </section>
      </main>

      {/* Footer section */}
      <footer className="py-6 bg-green-800 text-white">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            YunoDoc est une solution de gestion documentaire intelligente. Découvrez plus sur notre site et rejoignez-nous !
          </p>
          <p className="mt-2 text-sm">
            Ekoue Jeremie - <a href="mailto:email@example.com" className="text-yellow-400 underline">jeremiekoue8@gmail.com</a> - <span>Tél : +228 79797940</span>
            - <span>LinkedIn : <a href="mailto:https://www.linkedin.com/in/jeremie-ekoue-a95873308" className="text-yellow-400 underline">https://www.linkedin.com/in/jeremie-ekoue-a95873308</a></span>
          </p>
        </div>
      </footer>
    </div>
  );
}
