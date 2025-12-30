import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'L\'Atelier',
      links: [
        { name: 'À propos', href: '/maison' },
        { name: 'Notre savoir-faire', href: '/savoir-faire' },
        { name: 'Sur mesure', href: '/sur-mesure' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Collections',
      links: [
        { name: 'Tabliers maçonniques', href: '/collections/tabliers' },
        { name: 'Sautoirs', href: '/collections/sautoirs' },
        { name: 'Bijoux et décors', href: '/collections/bijoux' },
        { name: 'Tout le catalogue', href: '/catalog' },
      ],
    },
    {
      title: 'Service Client',
      links: [
        { name: 'Mon compte', href: '/account' },
        { name: 'Mes commandes', href: '/orders' },
        { name: 'Livraison', href: '/cgv#livraison' },
        { name: 'Retours et échanges', href: '/cgv#retours' },
      ],
    },
    {
      title: 'Informations',
      links: [
        { name: 'Conditions générales', href: '/cgv' },
        { name: 'Mentions légales', href: '/mentions-legales' },
        { name: 'Confidentialité', href: '/confidentialite' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white flex items-center justify-center">
                  <span className="text-neutral-900 font-bold text-xl">AR</span>
                </div>
                <div>
                  <div className="font-playfair text-xl font-bold">Atelier Art Royal</div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Haute Couture Maçonnique</div>
                </div>
              </div>
            </Link>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm">
              Fabrication artisanale française de tabliers, sautoirs et décors maçonniques depuis plusieurs générations. 
              Qualité premium et respect de la tradition.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <a href="tel:+33646683610" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span>+33 6 46 68 36 10</span>
              </a>
              <a href="mailto:contact@artroyal.fr" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span>contact@artroyal.fr</span>
              </a>
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span>France</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
            <div>
              © {currentYear} Atelier Art Royal. Tous droits réservés.
            </div>
            <div className="flex items-center gap-1">
              <span>Conçu et développé avec</span>
              <span className="text-red-500">❤</span>
              <span>en France</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
