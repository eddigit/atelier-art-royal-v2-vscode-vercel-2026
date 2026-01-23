'use client';

import Link from 'next/link';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-[#0f0f12] border border-white/10 rounded-lg p-8">
          <h1 className="font-display text-3xl font-bold mb-8 text-white">
            Politique de Confidentialité
          </h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">1. Introduction</h2>
              <p className="text-white/70">
                Atelier Art Royal s'engage à protéger la vie privée des utilisateurs de son
                site web artroyal.fr. La présente politique de confidentialité explique
                comment nous collectons, utilisons et protégeons vos données personnelles
                conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">2. Responsable du traitement</h2>
              <p className="text-white/70">
                Le responsable du traitement des données personnelles est :<br />
                <strong>Atelier Art Royal</strong><br />
                Email : contact@artroyal.fr<br />
                Téléphone : +33 6 46 68 36 10
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">3. Données collectées</h2>
              <p className="text-white/70 mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Données de livraison :</strong> adresse postale</li>
                <li><strong>Données de paiement :</strong> traitées de manière sécurisée par notre prestataire de paiement</li>
                <li><strong>Données de navigation :</strong> adresse IP, cookies, pages consultées</li>
                <li><strong>Données de commande :</strong> historique des achats, préférences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">4. Finalités du traitement</h2>
              <p className="text-white/70 mb-4">
                Vos données sont collectées pour :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2">
                <li>Traiter et suivre vos commandes</li>
                <li>Gérer votre compte client</li>
                <li>Vous contacter concernant votre commande</li>
                <li>Personnaliser votre expérience sur le site</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
                <li>Vous envoyer des communications commerciales (avec votre consentement)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">5. Base légale du traitement</h2>
              <p className="text-white/70">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2 mt-4">
                <li><strong>L'exécution du contrat :</strong> pour le traitement de vos commandes</li>
                <li><strong>Votre consentement :</strong> pour les communications commerciales et les cookies</li>
                <li><strong>L'intérêt légitime :</strong> pour l'amélioration de nos services</li>
                <li><strong>L'obligation légale :</strong> pour la conservation des factures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">6. Destinataires des données</h2>
              <p className="text-white/70 mb-4">
                Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2">
                <li>Nos prestataires de livraison</li>
                <li>Notre prestataire de paiement sécurisé</li>
                <li>Notre hébergeur (Vercel)</li>
                <li>Les autorités compétentes si la loi l'exige</li>
              </ul>
              <p className="text-white/70 mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">7. Durée de conservation</h2>
              <p className="text-white/70">
                Vos données sont conservées pendant :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2 mt-4">
                <li><strong>Données clients :</strong> 3 ans après le dernier achat</li>
                <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
                <li><strong>Données de contact :</strong> 3 ans après le dernier contact</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">8. Vos droits</h2>
              <p className="text-white/70 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-white/70 mt-4">
                Pour exercer ces droits, contactez-nous à contact@artroyal.fr
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">9. Cookies</h2>
              <p className="text-white/70 mb-4">
                Notre site utilise des cookies pour :
              </p>
              <ul className="list-disc pl-6 text-white/60 space-y-2">
                <li><strong>Cookies essentiels :</strong> fonctionnement du site, panier d'achat</li>
                <li><strong>Cookies analytiques :</strong> mesure d'audience (avec votre consentement)</li>
                <li><strong>Cookies de préférences :</strong> mémorisation de vos choix</li>
              </ul>
              <p className="text-white/70 mt-4">
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre
                navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">10. Sécurité</h2>
              <p className="text-white/70">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                pour protéger vos données personnelles contre tout accès non autorisé,
                modification, divulgation ou destruction. Les transmissions de données sont
                chiffrées via le protocole HTTPS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">11. Réclamation</h2>
              <p className="text-white/70">
                Si vous estimez que le traitement de vos données constitue une violation de
                vos droits, vous pouvez introduire une réclamation auprès de la CNIL
                (Commission Nationale de l'Informatique et des Libertés) :
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C5A059] hover:text-[#d4af5a] ml-1"
                >
                  www.cnil.fr
                </a>
              </p>
            </section>
          </div>

          <p className="text-sm text-white/50 mt-8 pt-8 border-t border-white/10">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <LuxeFooterDark />
    </main>
  );
}
