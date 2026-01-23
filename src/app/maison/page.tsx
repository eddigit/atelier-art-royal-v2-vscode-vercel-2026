import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function MaisonPage() {
  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c] relative">
        {/* Cercles décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 -left-32 w-80 h-80 bg-[#C4A052]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 -right-32 w-80 h-80 bg-[#C4A052]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#C4A052] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            La Maison Atelier Art Royal
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-xl text-white/60 leading-relaxed">
              Depuis notre atelier français, nous perpétuons l'art ancestral de la broderie maçonnique 
              et créons des pièces d'exception entièrement faites main.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Notre Histoire</h2>
            <p className="text-white/70">
              L'Atelier Art Royal est né de la passion pour l'artisanat d'excellence et le respect 
              des traditions maçonniques. Chaque création est le fruit d'un savoir-faire unique, 
              transmis de génération en génération.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Notre Savoir-Faire</h2>
            <p className="text-white/70">
              Nos artisans brodeurs perpétuent des techniques ancestrales de broderie d'or et d'argent. 
              Chaque symbole, chaque détail est réalisé avec la plus grande précision pour créer 
              des pièces d'une qualité exceptionnelle.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Notre Engagement</h2>
            <p className="text-white/70">
              Nous nous engageons à offrir des produits de la plus haute qualité, fabriqués en France 
              dans le respect des traditions et de l'environnement. Chaque pièce est unique et conçue 
              pour durer dans le temps.
            </p>

            <div className="mt-12 pt-8 border-t border-white/10">
              <Link 
                href="/catalog" 
                className="inline-block px-8 py-3 bg-[#C4A052] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#b39142] transition-colors rounded-lg"
              >
                Découvrir nos créations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
    <LuxeFooterDark />
    </>
  );
}
