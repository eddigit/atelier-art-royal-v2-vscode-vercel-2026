import Link from 'next/link';
import { ArrowLeft, Phone, Mail } from 'lucide-react';

export default function SurMesurePage() {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-royal mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Service Sur Mesure
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-xl text-gray-600 leading-relaxed">
              Donnez vie à vos projets les plus ambitieux avec notre service de création sur mesure. 
              Nos artisans vous accompagnent de la conception à la réalisation.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-12 mb-4">Création Personnalisée</h2>
            <p>
              Chaque loge, chaque frère a ses propres spécificités. Nous créons des pièces entièrement 
              personnalisées selon vos besoins : tabliers, cordons, sautoirs, bijoux et décors de loge.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-12 mb-4">Notre Processus</h2>
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>Consultation</strong> : Échangeons sur votre projet et vos attentes</li>
              <li><strong>Design</strong> : Création de croquis et sélection des matériaux</li>
              <li><strong>Validation</strong> : Présentation du projet finalisé</li>
              <li><strong>Réalisation</strong> : Fabrication artisanale dans notre atelier</li>
              <li><strong>Livraison</strong> : Remise de votre création d'exception</li>
            </ol>

            <h2 className="text-2xl font-bold text-charcoal mt-12 mb-4">Délais et Tarifs</h2>
            <p>
              Les délais de réalisation varient selon la complexité du projet, généralement entre 
              4 et 12 semaines. Pour un devis personnalisé, contactez-nous directement.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
              <h3 className="text-xl font-bold text-charcoal">Contactez-nous</h3>
              <div className="flex flex-col gap-3">
                <a 
                  href="tel:+33646683610" 
                  className="inline-flex items-center gap-2 text-royal hover:text-royal-dark"
                >
                  <Phone className="w-5 h-5" />
                  +33 6 46 68 36 10
                </a>
                <a 
                  href="mailto:contact@atelierartroyal.fr" 
                  className="inline-flex items-center gap-2 text-royal hover:text-royal-dark"
                >
                  <Mail className="w-5 h-5" />
                  contact@atelierartroyal.fr
                </a>
              </div>
              
              <Link 
                href="/contact" 
                className="inline-block px-8 py-3 bg-royal text-white text-sm font-medium uppercase tracking-wider hover:bg-royal-dark transition-colors mt-6"
              >
                Formulaire de contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
