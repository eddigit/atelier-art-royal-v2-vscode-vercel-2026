'use client';

import Link from 'next/link';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-[#0f0f12] border border-white/10 rounded-lg p-8">
          <h1 className="font-display text-3xl font-bold mb-8 text-white">Mentions Légales</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">1. Éditeur du site</h2>
              <p className="text-white/70 mb-4">
                Le site artroyal.fr est édité par :
              </p>
              <ul className="list-none text-white/60 space-y-2">
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
              <h2 className="text-xl font-semibold mb-4 text-white">2. Directeur de publication</h2>
              <p className="text-white/70">
                Le directeur de la publication est [Nom du directeur], en qualité de [Fonction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">3. Hébergement</h2>
              <p className="text-white/70">
                Le site est hébergé par :
              </p>
              <ul className="list-none text-white/60 space-y-2 mt-4">
                <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                <li><strong>Site web :</strong> vercel.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">4. Propriété intellectuelle</h2>
              <p className="text-white/70 mb-4">
                L'ensemble du contenu du site artroyal.fr (textes, images, graphismes, logo,
                icônes, sons, logiciels, etc.) est la propriété exclusive de Atelier Art Royal
                ou de ses partenaires et est protégé par les lois françaises et internationales
                relatives à la propriété intellectuelle.
              </p>
              <p className="text-white/70">
                Toute reproduction, représentation, modification, publication, transmission,
                dénaturation, totale ou partielle du site ou de son contenu, par quelque
                procédé que ce soit, et sur quelque support que ce soit est interdite sans
                autorisation préalable écrite de Atelier Art Royal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">5. Protection des données personnelles</h2>
              <p className="text-white/70 mb-4">
                Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée
                et au Règlement Général sur la Protection des Données (RGPD), vous disposez
                d'un droit d'accès, de rectification, de suppression et d'opposition aux
                données personnelles vous concernant.
              </p>
              <p className="text-white/70">
                Pour exercer ce droit, vous pouvez nous contacter à l'adresse email :
                contact@artroyal.fr
              </p>
              <p className="text-white/70 mt-4">
                Pour plus d'informations, consultez notre{' '}
                <Link href="/confidentialite" className="text-[#C5A059] hover:text-[#d4af5a]">
                  Politique de Confidentialité
                </Link>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">6. Cookies</h2>
              <p className="text-white/70">
                Le site artroyal.fr utilise des cookies pour améliorer l'expérience utilisateur
                et réaliser des statistiques de visites. En poursuivant votre navigation sur
                ce site, vous acceptez l'utilisation de cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">7. Limitation de responsabilité</h2>
              <p className="text-white/70 mb-4">
                Atelier Art Royal s'efforce d'assurer l'exactitude et la mise à jour des
                informations diffusées sur ce site. Toutefois, Atelier Art Royal ne peut
                garantir l'exactitude, la précision ou l'exhaustivité des informations
                mises à disposition sur ce site.
              </p>
              <p className="text-white/70">
                En conséquence, Atelier Art Royal décline toute responsabilité pour toute
                imprécision, inexactitude ou omission portant sur des informations disponibles
                sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">8. Droit applicable</h2>
              <p className="text-white/70">
                Les présentes mentions légales sont soumises au droit français. En cas de
                litige, les tribunaux français seront seuls compétents.
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
