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
              <Link href="/connexion" target="_blank" rel="noopener noreferrer">
                Se Connecter
              </Link>
            </Button>
          </div>
        </div>

        {/* Section avec séparation oblique */}
        <section className="relative w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Ligne oblique (pseudo-élément avec ::before) */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
              {/* Recherche et filtrage */}
              <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Recherche et filtrage</h2>
                <p className="text-gray-700 mb-6">
                  Retrouvez rapidement vos documents grâce à nos fonctionnalités de recherche avancées et de classification intelligente.
                </p>
                <Button
                  variant="default"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600 transition"
                >
                  En savoir plus
                </Button>
              </div>

              {/* Collaboration sécurisée */}
              <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <h2 className="text-3xl font-bold mb-4">Téléversement automatisé</h2>
                <p className="text-gray-300 mb-6">
                 Reduction des actions de classification
                </p>
                <Button
                  variant="default"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600 transition"
                >
                  En savoir plus
                </Button>
              </div>
            </div>

            {/* Ligne oblique */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 top-0 w-full h-full transform origin-center -rotate-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
            </div>
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
            Ekoue Jeremie - <a href="mailto:jeremiekoue8@gmail.com" className="text-yellow-400 underline">jeremiekoue8@gmail.com</a> - <span>Tél : +228 79797940</span>
            - <span>LinkedIn : <a href="https://www.linkedin.com/in/jeremie-ekoue-a95873308" className="text-yellow-400 underline">https://www.linkedin.com/in/jeremie-ekoue-a95873308</a></span>
          </p>
        </div>
      </footer>
    </div>
  );
}
