import Link from 'next/link';
import { ArrowLeft, Award, Clock, Users, Sparkles } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function SavoirFairePage() {
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
            Notre Savoir-Faire
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-xl text-white/60 leading-relaxed">
              L'excellence artisanale au service de la tradition maçonnique. 
              Découvrez les techniques ancestrales que nous perpétuons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <div className="bg-white/[0.03] p-6 border border-white/10 rounded-xl">
                <Award className="w-10 h-10 text-[#C4A052] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Broderie d'Or</h3>
                <p className="text-sm text-white/60">
                  Technique ancestrale de broderie utilisant fils d'or et d'argent véritables
                </p>
              </div>
              
              <div className="bg-white/[0.03] p-6 border border-white/10 rounded-xl">
                <Clock className="w-10 h-10 text-[#C4A052] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Fait Main</h3>
                <p className="text-sm text-white/60">
                  Chaque pièce nécessite des dizaines d'heures de travail minutieux
                </p>
              </div>
              
              <div className="bg-white/[0.03] p-6 border border-white/10 rounded-xl">
                <Users className="w-10 h-10 text-[#C4A052] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Artisans Experts</h3>
                <p className="text-sm text-white/60">
                  Notre équipe perpétue un savoir-faire transmis de génération en génération
                </p>
              </div>
              
              <div className="bg-white/[0.03] p-6 border border-white/10 rounded-xl">
                <Sparkles className="w-10 h-10 text-[#C4A052] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Matériaux Nobles</h3>
                <p className="text-sm text-white/60">
                  Soies, velours, fils précieux : seuls les meilleurs matériaux sont sélectionnés
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Les Étapes de Création</h2>
            
            <h3 className="text-xl font-semibold text-[#C4A052] mt-8 mb-3">1. Conception</h3>
            <p className="text-white/70">
              Chaque création débute par un dessin précis, réalisé en collaboration avec nos clients 
              pour les pièces sur mesure, ou selon nos modèles traditionnels.
            </p>

            <h3 className="text-xl font-semibold text-[#C4A052] mt-8 mb-3">2. Sélection des Matériaux</h3>
            <p className="text-white/70">
              Nous choisissons avec soin chaque matériau : soies naturelles, velours de qualité supérieure, 
              fils d'or et d'argent véritables.
            </p>

            <h3 className="text-xl font-semibold text-[#C4A052] mt-8 mb-3">3. Broderie</h3>
            <p className="text-white/70">
              Nos artisans brodeurs réalisent chaque symbole à la main, point par point, 
              avec une précision millimétrique.
            </p>

            <h3 className="text-xl font-semibold text-[#C4A052] mt-8 mb-3">4. Assemblage</h3>
            <p className="text-white/70">
              Chaque élément est assemblé avec soin, cousu main, pour garantir une solidité 
              et une durabilité exceptionnelles.
            </p>

            <h3 className="text-xl font-semibold text-[#C4A052] mt-8 mb-3">5. Contrôle Qualité</h3>
            <p className="text-white/70">
              Avant expédition, chaque pièce est inspectée minutieusement pour s'assurer 
              qu'elle répond à nos standards d'excellence.
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
