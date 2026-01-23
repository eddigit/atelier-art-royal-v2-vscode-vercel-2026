import Link from 'next/link';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function SurMesurePage() {
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
            Service Sur Mesure
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-xl text-white/60 leading-relaxed">
              Donnez vie à vos projets les plus ambitieux avec notre service de création sur mesure. 
              Nos artisans vous accompagnent de la conception à la réalisation.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Création Personnalisée</h2>
            <p className="text-white/70">
              Chaque loge, chaque frère a ses propres spécificités. Nous créons des pièces entièrement 
              personnalisées selon vos besoins : tabliers, cordons, sautoirs, bijoux et décors de loge.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Notre Processus</h2>
            <ol className="list-decimal list-inside space-y-3 text-white/70">
              <li><strong className="text-white">Consultation</strong> : Échangeons sur votre projet et vos attentes</li>
              <li><strong className="text-white">Design</strong> : Création de croquis et sélection des matériaux</li>
              <li><strong className="text-white">Validation</strong> : Présentation du projet finalisé</li>
              <li><strong className="text-white">Réalisation</strong> : Fabrication artisanale dans notre atelier</li>
              <li><strong className="text-white">Livraison</strong> : Remise de votre création d'exception</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Délais et Tarifs</h2>
            <p className="text-white/70">
              Les délais de réalisation varient selon la complexité du projet, généralement entre 
              4 et 12 semaines. Pour un devis personnalisé, contactez-nous directement.
            </p>

            <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-white">Contactez-nous</h3>
              <div className="flex flex-col gap-3">
                <a 
                  href="tel:+33646683610" 
                  className="inline-flex items-center gap-2 text-[#C4A052] hover:text-[#d4b066]"
                >
                  <Phone className="w-5 h-5" />
                  +33 6 46 68 36 10
                </a>
                <a 
                  href="mailto:contact@atelierartroyal.fr" 
                  className="inline-flex items-center gap-2 text-[#C4A052] hover:text-[#d4b066]"
                >
                  <Mail className="w-5 h-5" />
                  contact@atelierartroyal.fr
                </a>
              </div>
              
              <Link 
                href="/contact" 
                className="inline-block px-8 py-3 bg-[#C4A052] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#b39142] transition-colors rounded-lg mt-6"
              >
                Formulaire de contact
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
