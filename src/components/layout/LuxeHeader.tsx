'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Obedience {
  _id: string;
  name: string;
  code: string;
  slug: string;
  image_url?: string;
}

interface Rite {
  _id: string;
  name: string;
  code: string;
}

export default function LuxeHeader() {
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Charger les données au montage
    Promise.all([
      fetch('/api/obediences?activeOnly=true').then(r => r.json()),
      fetch('/api/rites?activeOnly=true').then(r => r.json()),
    ]).then(([obData, riteData]) => {
      setObediences(obData.obediences || []);
      setRites(riteData.rites || []);
    }).catch(console.error);

    // Détecter le scroll pour le style du header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Grouper les loges bleues (Apprenti, Compagnon, Maître)
  const logesBleues = ['Apprenti', 'Compagnon', 'Maître'];

  return (
    <>
      <header className={`header-luxe ${isScrolled ? 'header-luxe--scrolled' : ''}`}>
        <div className="header-luxe__inner">
          {/* Logo */}
          <Link href="/" className="header-luxe__brand">
            <Image
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
              alt="Atelier Art Royal"
              width={180}
              height={50}
              className="header-luxe__logo"
              priority
            />
          </Link>

          {/* Séparateur + Drapeau */}
          <div className="header-luxe__separator" />
          <span className="header-luxe__flag" role="img" aria-label="Drapeau français" />
          
          {/* Navigation */}
          <nav className="header-luxe__nav">
            <Link href="/maison" className="header-luxe__link">La Maison</Link>
            
            {/* Collections avec mega-menu */}
            <div 
              className="header-luxe__link-wrapper"
              onMouseEnter={() => setShowCollectionsMenu(true)}
              onMouseLeave={() => setShowCollectionsMenu(false)}
            >
              <Link href="/catalog" className="header-luxe__link header-luxe__link--dropdown">
                Collections
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showCollectionsMenu ? 'rotate-180' : ''}`} />
              </Link>
              
              {/* Mega Menu Collections */}
              <div className={`mega-menu ${showCollectionsMenu ? 'mega-menu--visible' : ''}`}>
                <div className="mega-menu__inner">
                  {/* Obédiences */}
                  <div className="mega-menu__section">
                    <h3 className="mega-menu__title">Par Obédience</h3>
                    <div className="mega-menu__grid mega-menu__grid--obediences">
                      {obediences.map((ob) => (
                        <Link 
                          key={ob._id}
                          href={`/catalog?obedience=${ob._id}`}
                          className="mega-menu__item mega-menu__item--obedience"
                        >
                          {ob.image_url && (
                            <Image
                              src={ob.image_url}
                              alt={ob.name}
                              width={32}
                              height={32}
                              className="mega-menu__item-image"
                            />
                          )}
                          <span className="mega-menu__item-code">{ob.code}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Rites */}
                  <div className="mega-menu__section">
                    <h3 className="mega-menu__title">Par Rite</h3>
                    <div className="mega-menu__list">
                      {rites.slice(0, 6).map((rite) => (
                        <Link 
                          key={rite._id}
                          href={`/catalog?rite=${rite._id}`}
                          className="mega-menu__item"
                        >
                          {rite.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Degrés */}
                  <div className="mega-menu__section">
                    <h3 className="mega-menu__title">Par Degré</h3>
                    <div className="mega-menu__list">
                      {logesBleues.map((degree) => (
                        <Link 
                          key={degree}
                          href={`/catalog?search=${encodeURIComponent(degree)}`}
                          className="mega-menu__item"
                        >
                          {degree}
                        </Link>
                      ))}
                      <Link href="/catalog?logeType=Perfection" className="mega-menu__item">
                        Loges de Perfection
                      </Link>
                      <Link href="/catalog?logeType=Chapitre" className="mega-menu__item">
                        Chapitres
                      </Link>
                      <Link href="/catalog?logeType=Aréopage" className="mega-menu__item">
                        Aréopages
                      </Link>
                    </div>
                  </div>

                  {/* Catégories produits */}
                  <div className="mega-menu__section">
                    <h3 className="mega-menu__title">Catégories</h3>
                    <div className="mega-menu__list">
                      <Link href="/catalog?category=tabliers" className="mega-menu__item">Tabliers</Link>
                      <Link href="/catalog?category=cordons" className="mega-menu__item">Cordons & Sautoirs</Link>
                      <Link href="/catalog?category=bijoux" className="mega-menu__item">Bijoux</Link>
                      <Link href="/catalog?category=accessoires" className="mega-menu__item">Accessoires</Link>
                    </div>
                  </div>
                </div>

                <div className="mega-menu__footer">
                  <Link href="/catalog" className="mega-menu__cta">
                    Voir toutes les collections →
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/sur-mesure" className="header-luxe__link">Sur Mesure</Link>
            <Link href="/savoir-faire" className="header-luxe__link">Savoir-Faire</Link>
            <Link href="/contact" className="header-luxe__link">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="header-luxe__actions">
            <Link href="/contact" className="hidden lg:block">
              <button className="btn-luxe btn-luxe--outline">Rendez-vous</button>
            </Link>
            <Link href="/auth/login">
              <button className="btn-luxe btn-luxe--primary">Espace Client</button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="header-luxe__mobile-toggle lg:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <span className={`hamburger ${showMobileMenu ? 'hamburger--active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu__header">
              <Image
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
                alt="Atelier Art Royal"
                width={150}
                height={42}
              />
              <button onClick={() => setShowMobileMenu(false)} className="mobile-menu__close">✕</button>
            </div>

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Navigation</h3>
              <Link href="/maison" onClick={() => setShowMobileMenu(false)}>La Maison</Link>
              <Link href="/catalog" onClick={() => setShowMobileMenu(false)}>Collections</Link>
              <Link href="/sur-mesure" onClick={() => setShowMobileMenu(false)}>Sur Mesure</Link>
              <Link href="/savoir-faire" onClick={() => setShowMobileMenu(false)}>Savoir-Faire</Link>
              <Link href="/contact" onClick={() => setShowMobileMenu(false)}>Contact</Link>
            </div>

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Votre Obédience</h3>
              <div className="mobile-menu__obediences">
                {obediences.map((ob) => (
                  <Link 
                    key={ob._id}
                    href={`/catalog?obedience=${ob._id}`}
                    className="mobile-menu__obedience"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {ob.image_url && (
                      <Image src={ob.image_url} alt={ob.code} width={28} height={28} />
                    )}
                    <span>{ob.code}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mobile-menu__actions">
              <Link href="/auth/login" onClick={() => setShowMobileMenu(false)}>
                <button className="btn-luxe btn-luxe--primary w-full">Espace Client</button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
