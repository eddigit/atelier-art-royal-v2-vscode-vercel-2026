'use client';

import Link from 'next/link';
import { Mail, MapPin, Clock, Share2 } from 'lucide-react';

// ============================================================================
// STAR ICON COMPONENT
// ============================================================================
const StarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" 
      fill="currentColor"
    />
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LuxeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-stitch">
      <div className="container-stitch">
        {/* Grid principal */}
        <div className="footer-stitch__grid">
          {/* Colonne Marque */}
          <div>
            <div className="footer-stitch__brand">
              <StarIcon className="footer-stitch__brand-icon" />
              <span className="footer-stitch__brand-name">Atelier Art Royal</span>
            </div>
            <p className="footer-stitch__description">
              Gardiens de la tradition, créateurs de demain. L'art de la parure 
              maçonnique élevé au rang de chef-d'œuvre.
            </p>
            <div className="footer-stitch__social">
              <a 
                href="#" 
                className="footer-stitch__social-link"
                aria-label="Partager"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a 
                href="mailto:contact@artroyal.fr" 
                className="footer-stitch__social-link"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Colonne Maison */}
          <div>
            <h5 className="footer-stitch__title">Maison</h5>
            <div className="footer-stitch__links">
              <Link href="/maison" className="footer-stitch__link">
                Notre Histoire
              </Link>
              <Link href="/savoir-faire" className="footer-stitch__link">
                Le Savoir-Faire
              </Link>
              <Link href="/actualites" className="footer-stitch__link">
                Actualités
              </Link>
              <Link href="/contact" className="footer-stitch__link">
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Colonne Boutique */}
          <div>
            <h5 className="footer-stitch__title">Boutique</h5>
            <div className="footer-stitch__links">
              <Link href="/catalog" className="footer-stitch__link">
                Toutes les Collections
              </Link>
              <Link href="/catalog?category=accessoires" className="footer-stitch__link">
                Accessoires
              </Link>
              <Link href="/cgv" className="footer-stitch__link">
                Livraison & Retours
              </Link>
              <Link href="/sur-mesure" className="footer-stitch__link">
                Sur-Mesure
              </Link>
            </div>
          </div>

          {/* Colonne Contact */}
          <div>
            <h5 className="footer-stitch__title">Contact</h5>
            <div className="space-y-0">
              <div className="footer-stitch__contact-item">
                <MapPin className="w-4 h-4" />
                <span>75001 Paris, France</span>
              </div>
              <div className="footer-stitch__contact-item">
                <Mail className="w-4 h-4" />
                <span>contact@artroyal.fr</span>
              </div>
              <div className="footer-stitch__contact-item">
                <Clock className="w-4 h-4" />
                <span>Sur rendez-vous uniquement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-stitch__bottom">
          <p className="footer-stitch__copyright">
            © {currentYear} Atelier Art Royal. Tous droits réservés.
          </p>
          <div className="footer-stitch__legal">
            <Link href="/mentions-legales">Mentions Légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
