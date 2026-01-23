'use client';

import Link from 'next/link';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-[#0f0f12] border border-white/10 rounded-lg p-8">
          <h1 className="font-display text-3xl font-bold mb-8 text-white">
            Conditions Générales de Vente
          </h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 1 - Objet</h2>
              <p className="text-white/70">
                Les présentes Conditions Générales de Vente (CGV) régissent les ventes de
                produits effectuées par Atelier Art Royal sur le site artroyal.fr. Toute
                commande implique l'acceptation sans réserve des présentes CGV.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 2 - Produits</h2>
              <p className="text-white/70 mb-4">
                Les produits proposés à la vente sont des décors et accessoires maçonniques
                fabriqués artisanalement en France. Les photographies illustrant les produits
                n'entrent pas dans le champ contractuel et ne sauraient engager la
                responsabilité du vendeur.
              </p>
              <p className="text-white/70">
                Les produits sont conformes à la législation française en vigueur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 3 - Prix</h2>
              <p className="text-white/70 mb-4">
                Les prix sont indiqués en euros toutes taxes comprises (TTC). Atelier Art
                Royal se réserve le droit de modifier ses prix à tout moment. Les produits
                seront facturés sur la base des tarifs en vigueur au moment de la validation
                de la commande.
              </p>
              <p className="text-white/70">
                Les frais de livraison sont offerts pour toute commande supérieure à 500€.
                En dessous de ce montant, les frais de livraison sont de 15€.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 4 - Commande</h2>
              <p className="text-white/70 mb-4">
                La commande est validée après acceptation des présentes CGV et confirmation
                du paiement. Un email de confirmation sera envoyé à l'acheteur.
              </p>
              <p className="text-white/70">
                Atelier Art Royal se réserve le droit de refuser toute commande pour motif
                légitime.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 5 - Paiement</h2>
              <p className="text-white/70 mb-4">
                Le paiement s'effectue par carte bancaire de manière sécurisée. Le débit de
                la carte est effectué au moment de la commande.
              </p>
              <p className="text-white/70">
                En cas de paiement par virement bancaire, la commande sera traitée à réception
                du virement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 6 - Livraison</h2>
              <p className="text-white/70 mb-4">
                Les produits sont livrés à l'adresse indiquée par l'acheteur lors de la
                commande. Le délai de livraison est de 5 à 7 jours ouvrés pour les produits
                en stock. Les articles sur-mesure ou personnalisés peuvent nécessiter un
                délai supplémentaire communiqué au moment de la commande.
              </p>
              <p className="text-white/70">
                En cas de retard de livraison, l'acheteur peut annuler la commande par
                lettre recommandée avec accusé de réception si le retard dépasse 30 jours.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 7 - Droit de rétractation</h2>
              <p className="text-white/70 mb-4">
                Conformément à l'article L.221-18 du Code de la consommation, l'acheteur
                dispose d'un délai de 14 jours à compter de la réception du produit pour
                exercer son droit de rétractation sans avoir à justifier de motifs ni à
                payer de pénalités.
              </p>
              <p className="text-white/70 mb-4">
                <strong>Exception :</strong> Ce droit de rétractation ne s'applique pas aux
                produits personnalisés ou fabriqués sur-mesure selon les spécifications du
                client.
              </p>
              <p className="text-white/70">
                Les frais de retour sont à la charge de l'acheteur. Les produits doivent être
                retournés dans leur état d'origine et complets.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 8 - Garantie</h2>
              <p className="text-white/70 mb-4">
                Tous les produits bénéficient de la garantie légale de conformité (articles
                L.217-4 et suivants du Code de la consommation) et de la garantie contre les
                vices cachés (articles 1641 et suivants du Code civil).
              </p>
              <p className="text-white/70">
                En cas de défaut de conformité, l'acheteur peut demander le remplacement ou
                le remboursement du produit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 9 - Réclamations</h2>
              <p className="text-white/70">
                Pour toute réclamation, veuillez nous contacter par email à contact@artroyal.fr
                ou par téléphone au +33 6 46 68 36 10.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Article 10 - Médiation</h2>
              <p className="text-white/70">
                En cas de litige, l'acheteur peut recourir à une procédure de médiation
                conventionnelle ou à tout autre mode alternatif de règlement des différends.
                Le médiateur de la consommation compétent est [À compléter].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Article 11 - Droit applicable</h2>
              <p className="text-white/70">
                Les présentes CGV sont soumises au droit français. En cas de litige, les
                tribunaux français seront seuls compétents.
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
