'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Search, Phone, Mail } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Catalogue', href: '/catalog' },
    { name: 'Collections', href: '/collections', submenu: [
      { name: 'Tabliers', href: '/collections/tabliers' },
      { name: 'Sautoirs', href: '/collections/sautoirs' },
      { name: 'Bijoux', href: '/collections/bijoux' },
    ]},
    { name: 'Sur Mesure', href: '/sur-mesure' },
    { name: 'La Maison', href: '/maison' },
    { name: 'Savoir-Faire', href: '/savoir-faire' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-neutral-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="tel:+33646683610" className="flex items-center gap-2 hover:text-neutral-300 transition-colors">
                <Phone className="w-4 h-4" />
                <span>+33 6 46 68 36 10</span>
              </a>
              <a href="mailto:contact@artroyal.fr" className="flex items-center gap-2 hover:text-neutral-300 transition-colors">
                <Mail className="w-4 h-4" />
                <span>contact@artroyal.fr</span>
              </a>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs">
              <span>🇫🇷 Fabrication artisanale française</span>
              <span>✨ Qualité supérieure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
              <span className="text-white font-bold text-xl">AR</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-playfair text-2xl font-bold text-neutral-900">Atelier Art Royal</div>
              <div className="text-xs text-neutral-600 uppercase tracking-wider">Haute Couture Maçonnique</div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-neutral-900 ${
                    isActive(item.href) ? 'text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  {item.name}
                </Link>
                {item.submenu && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link href="/catalog?search=" className="text-neutral-600 hover:text-neutral-900 transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            <Link href="/cart" className="text-neutral-600 hover:text-neutral-900 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {session ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link href={session.user?.role === 'admin' ? '/admin' : '/account'} className="text-neutral-600 hover:text-neutral-900 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden lg:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Connexion</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                {session ? (
                  <>
                    <Link
                      href={session.user?.role === 'admin' ? '/admin' : '/account'}
                      className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
