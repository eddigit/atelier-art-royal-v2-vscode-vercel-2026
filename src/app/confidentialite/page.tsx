import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Politique de Confidentialité | Atelier Art Royal',
  description: 'Politique de confidentialité et protection des données personnelles',
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="font-display text-2xl font-bold text-gold-600">
            Atelier Art Royal
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-sm font-medium hover:text-gold-600">
              Catalogue
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-gold-600">
              Contact
            </Link>
          </nav>
          <Link href="/cart">
            <Button variant="outline" size="sm">
              Panier
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 shadow-sm">
          <h1 className="font-display text-3xl font-bold mb-8">
            Politique de Confidentialité
          </h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                Atelier Art Royal s'engage à protéger la vie privée des utilisateurs de son
                site web artroyal.fr. La présente politique de confidentialité explique
                comment nous collectons, utilisons et protégeons vos données personnelles
                conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Responsable du traitement</h2>
              <p className="text-gray-600">
                Le responsable du traitement des données personnelles est :<br />
                <strong>Atelier Art Royal</strong><br />
                Email : contact@artroyal.fr<br />
                Téléphone : +33 6 46 68 36 10
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Données collectées</h2>
              <p className="text-gray-600 mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Données de livraison :</strong> adresse postale</li>
                <li><strong>Données de paiement :</strong> traitées de manière sécurisée par notre prestataire de paiement</li>
                <li><strong>Données de navigation :</strong> adresse IP, cookies, pages consultées</li>
                <li><strong>Données de commande :</strong> historique des achats, préférences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Finalités du traitement</h2>
              <p className="text-gray-600 mb-4">
                Vos données sont collectées pour :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
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
              <h2 className="text-xl font-semibold mb-4">5. Base légale du traitement</h2>
              <p className="text-gray-600">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                <li><strong>L'exécution du contrat :</strong> pour le traitement de vos commandes</li>
                <li><strong>Votre consentement :</strong> pour les communications commerciales et les cookies</li>
                <li><strong>L'intérêt légitime :</strong> pour l'amélioration de nos services</li>
                <li><strong>L'obligation légale :</strong> pour la conservation des factures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Destinataires des données</h2>
              <p className="text-gray-600 mb-4">
                Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Nos prestataires de livraison</li>
                <li>Notre prestataire de paiement sécurisé</li>
                <li>Notre hébergeur (Vercel)</li>
                <li>Les autorités compétentes si la loi l'exige</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Durée de conservation</h2>
              <p className="text-gray-600">
                Vos données sont conservées pendant :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                <li><strong>Données clients :</strong> 3 ans après le dernier achat</li>
                <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
                <li><strong>Données de contact :</strong> 3 ans après le dernier contact</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Vos droits</h2>
              <p className="text-gray-600 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Pour exercer ces droits, contactez-nous à contact@artroyal.fr
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Cookies</h2>
              <p className="text-gray-600 mb-4">
                Notre site utilise des cookies pour :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Cookies essentiels :</strong> fonctionnement du site, panier d'achat</li>
                <li><strong>Cookies analytiques :</strong> mesure d'audience (avec votre consentement)</li>
                <li><strong>Cookies de préférences :</strong> mémorisation de vos choix</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre
                navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Sécurité</h2>
              <p className="text-gray-600">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                pour protéger vos données personnelles contre tout accès non autorisé,
                modification, divulgation ou destruction. Les transmissions de données sont
                chiffrées via le protocole HTTPS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Réclamation</h2>
              <p className="text-gray-600">
                Si vous estimez que le traitement de vos données constitue une violation de
                vos droits, vous pouvez introduire une réclamation auprès de la CNIL
                (Commission Nationale de l'Informatique et des Libertés) :
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 hover:underline ml-1"
                >
                  www.cnil.fr
                </a>
              </p>
            </section>
          </div>

          <p className="text-sm text-gray-500 mt-8 pt-8 border-t">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Atelier Art Royal. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}
