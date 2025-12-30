import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function LuxeFooter() {
  return (
    <footer className="footer-luxe">
      <div className="container-luxe">
        <div className="footer-luxe__grid">
          <div>
            <Image
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
              alt="Atelier Art Royal"
              width={160}
              height={45}
              className="h-10 w-auto mb-6 brightness-0 invert opacity-70"
            />
            <p className="text-sm leading-relaxed text-white/50 mb-6 max-w-xs">
              La Haute Couture de la Franc-Maçonnerie Française.
              Créations artisanales sur mesure depuis notre atelier.
            </p>
            <div className="footer-luxe__badge">
              🇫🇷 Made in France
            </div>
          </div>

          <div>
            <h4 className="footer-luxe__title">Navigation</h4>
            <Link href="/maison" className="footer-luxe__link">La Maison</Link>
            <Link href="/catalog" className="footer-luxe__link">Collections</Link>
            <Link href="/sur-mesure" className="footer-luxe__link">Sur Mesure</Link>
            <Link href="/savoir-faire" className="footer-luxe__link">Savoir-Faire</Link>
          </div>

          <div>
            <h4 className="footer-luxe__title">Contact</h4>
            <a href="tel:+33646683610" className="footer-luxe__link flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C9A227]" /> +33 6 46 68 36 10
            </a>
            <a href="mailto:contact@artroyal.fr" className="footer-luxe__link flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C9A227]" /> contact@artroyal.fr
            </a>
            <span className="footer-luxe__link flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A227]" /> France
            </span>
          </div>

          <div>
            <h4 className="footer-luxe__title">Informations</h4>
            <Link href="/cgv" className="footer-luxe__link">Conditions Générales</Link>
            <Link href="/mentions-legales" className="footer-luxe__link">Mentions Légales</Link>
            <Link href="/confidentialite" className="footer-luxe__link">Confidentialité</Link>
          </div>
        </div>

        <div className="footer-luxe__bottom">
          <p>© {new Date().getFullYear()} Atelier Art Royal. Tous droits réservés.</p>
          <p>Design & Développement par <span className="text-[#C9A227]">GILLES KORZEC</span></p>
        </div>
      </div>
    </footer>
  );
}
