import Link from 'next/link';
import { ArrowLeft, Award, Clock, Users, Sparkles } from 'lucide-react';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';

export default function SavoirFairePage() {
  return (
    <>
      <LuxeHeader />
      <main className="min-h-screen bg-ivory">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-royal mb-8">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Notre Savoir-Faire
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-xl text-gray-600 leading-relaxed">
              L'excellence artisanale au service de la tradition maçonnique. 
              Découvrez les techniques ancestrales que nous perpétuons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <div className="bg-white p-6 border border-gray-200">
                <Award className="w-10 h-10 text-gold mb-4" />
                <h3 className="text-lg font-bold text-charcoal mb-2">Broderie d'Or</h3>
                <p className="text-sm text-gray-600">
                  Technique ancestrale de broderie utilisant fils d'or et d'argent véritables
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200">
                <Clock className="w-10 h-10 text-gold mb-4" />
                <h3 className="text-lg font-bold text-charcoal mb-2">Fait Main</h3>
                <p className="text-sm text-gray-600">
                  Chaque pièce nécessite des dizaines d'heures de travail minutieux
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200">
                <Users className="w-10 h-10 text-gold mb-4" />
                <h3 className="text-lg font-bold text-charcoal mb-2">Artisans Experts</h3>
                <p className="text-sm text-gray-600">
                  Notre équipe perpétue un savoir-faire transmis de génération en génération
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200">
                <Sparkles className="w-10 h-10 text-gold mb-4" />
                <h3 className="text-lg font-bold text-charcoal mb-2">Matériaux Nobles</h3>
                <p className="text-sm text-gray-600">
                  Soies, velours, fils précieux : seuls les meilleurs matériaux sont sélectionnés
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mt-12 mb-4">Les Étapes de Création</h2>
            
            <h3 className="text-xl font-semibold text-charcoal mt-8 mb-3">1. Conception</h3>
            <p>
              Chaque création débute par un dessin précis, réalisé en collaboration avec nos clients 
              pour les pièces sur mesure, ou selon nos modèles traditionnels.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-8 mb-3">2. Sélection des Matériaux</h3>
            <p>
              Nous choisissons avec soin chaque matériau : soies naturelles, velours de qualité supérieure, 
              fils d'or et d'argent véritables.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-8 mb-3">3. Broderie</h3>
            <p>
              Nos artisans brodeurs réalisent chaque symbole à la main, point par point, 
              avec une précision millimétrique.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-8 mb-3">4. Assemblage</h3>
            <p>
              Chaque élément est assemblé avec soin, cousu main, pour garantir une solidité 
              et une durabilité exceptionnelles.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-8 mb-3">5. Contrôle Qualité</h3>
            <p>
              Avant expédition, chaque pièce est inspectée minutieusement pour s'assurer 
              qu'elle répond à nos standards d'excellence.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link 
                href="/catalog" 
                className="inline-block px-8 py-3 bg-royal text-white text-sm font-medium uppercase tracking-wider hover:bg-royal-dark transition-colors"
              >
                Découvrir nos créations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
    <LuxeFooter />
    </>
  );
}
