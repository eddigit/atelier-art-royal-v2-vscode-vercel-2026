import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Mentions Légales | Atelier Art Royal',
  description: 'Mentions légales du site Atelier Art Royal',
};

export default function MentionsLegalesPage() {
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
          <h1 className="font-display text-3xl font-bold mb-8">Mentions Légales</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Éditeur du site</h2>
              <p className="text-gray-600 mb-4">
                Le site artroyal.fr est édité par :
              </p>
              <ul className="list-none text-gray-600 space-y-2">
                <li><strong>Raison sociale :</strong> Atelier Art Royal</li>
                <li><strong>Forme juridique :</strong> [À compléter]</li>
                <li><strong>Capital social :</strong> [À compléter]</li>
                <li><strong>Siège social :</strong> [À compléter]</li>
                <li><strong>SIRET :</strong> [À compléter]</li>
                <li><strong>N° TVA intracommunautaire :</strong> [À compléter]</li>
                <li><strong>Téléphone :</strong> +33 6 46 68 36 10</li>
                <li><strong>Email :</strong> contact@artroyal.fr</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Directeur de publication</h2>
              <p className="text-gray-600">
                Le directeur de la publication est [Nom du directeur], en qualité de [Fonction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Hébergement</h2>
              <p className="text-gray-600">
                Le site est hébergé par :
              </p>
              <ul className="list-none text-gray-600 space-y-2 mt-4">
                <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                <li><strong>Site web :</strong> vercel.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-600 mb-4">
                L'ensemble du contenu du site artroyal.fr (textes, images, graphismes, logo,
                icônes, sons, logiciels, etc.) est la propriété exclusive de Atelier Art Royal
                ou de ses partenaires et est protégé par les lois françaises et internationales
                relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-600">
                Toute reproduction, représentation, modification, publication, transmission,
                dénaturation, totale ou partielle du site ou de son contenu, par quelque
                procédé que ce soit, et sur quelque support que ce soit est interdite sans
                autorisation préalable écrite de Atelier Art Royal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Protection des données personnelles</h2>
              <p className="text-gray-600 mb-4">
                Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée
                et au Règlement Général sur la Protection des Données (RGPD), vous disposez
                d'un droit d'accès, de rectification, de suppression et d'opposition aux
                données personnelles vous concernant.
              </p>
              <p className="text-gray-600">
                Pour exercer ce droit, vous pouvez nous contacter à l'adresse email :
                contact@artroyal.fr
              </p>
              <p className="text-gray-600 mt-4">
                Pour plus d'informations, consultez notre{' '}
                <Link href="/confidentialite" className="text-gold-600 hover:underline">
                  Politique de Confidentialité
                </Link>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
              <p className="text-gray-600">
                Le site artroyal.fr utilise des cookies pour améliorer l'expérience utilisateur
                et réaliser des statistiques de visites. En poursuivant votre navigation sur
                ce site, vous acceptez l'utilisation de cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-600 mb-4">
                Atelier Art Royal s'efforce d'assurer l'exactitude et la mise à jour des
                informations diffusées sur ce site. Toutefois, Atelier Art Royal ne peut
                garantir l'exactitude, la précision ou l'exhaustivité des informations
                mises à disposition sur ce site.
              </p>
              <p className="text-gray-600">
                En conséquence, Atelier Art Royal décline toute responsabilité pour toute
                imprécision, inexactitude ou omission portant sur des informations disponibles
                sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Droit applicable</h2>
              <p className="text-gray-600">
                Les présentes mentions légales sont soumises au droit français. En cas de
                litige, les tribunaux français seront seuls compétents.
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
