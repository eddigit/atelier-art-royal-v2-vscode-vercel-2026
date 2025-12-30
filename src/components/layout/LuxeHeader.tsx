'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ShoppingBag, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface DegreeOrder {
  _id: string;
  name: string;
  level: number;
  loge_type: string;
}

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  category_slugs?: string[];
}

export default function LuxeHeader() {
  const router = useRouter();
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [degrees, setDegrees] = useState<DegreeOrder[]>([]);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Charger les données au montage
    Promise.all([
      fetch('/api/obediences?activeOnly=true').then(r => r.json()),
      fetch('/api/rites?activeOnly=true').then(r => r.json()),
      fetch('/api/degrees?activeOnly=true').then(r => r.json()).catch(() => ({ degrees: [] })),
    ]).then(([obData, riteData, degreeData]) => {
      setObediences(obData.obediences || []);
      setRites(riteData.rites || []);
      setDegrees(degreeData.degrees || []);
    }).catch(console.error);

    // Charger le compteur panier
    updateCartCount();

    // Écouter les mises à jour du panier
    const handleCartUpdate = (e: CustomEvent) => {
      setCartCount(e.detail?.itemCount || 0);
    };
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    // Détecter le scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  // Search debounce
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products-v2?search=${encodeURIComponent(query)}&limit=6`);
      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  // Grouper les degrés par type de loge
  const logesSymboliques = degrees.filter(d => d.loge_type === 'Loge Symbolique');
  const hautsGrades = degrees.filter(d => d.loge_type === 'Loge Hauts Grades');

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

                  {/* Degrés - Loges Symboliques */}
                  <div className="mega-menu__section">
                    <h3 className="mega-menu__title">Loges Bleues</h3>
                    <div className="mega-menu__list">
                      {logesSymboliques.length > 0 ? (
                        logesSymboliques.map((degree) => (
                          <Link
                            key={degree._id}
                            href={`/catalog?degree=${degree._id}`}
                            className="mega-menu__item"
                          >
                            {degree.name}
                          </Link>
                        ))
                      ) : (
                        <>
                          <Link href="/catalog?logeType=Loge Symbolique" className="mega-menu__item">
                            Apprenti (1°)
                          </Link>
                          <Link href="/catalog?logeType=Loge Symbolique" className="mega-menu__item">
                            Compagnon (2°)
                          </Link>
                          <Link href="/catalog?logeType=Loge Symbolique" className="mega-menu__item">
                            Maître (3°)
                          </Link>
                        </>
                      )}
                    </div>

                    <h3 className="mega-menu__title mt-4">Hauts Grades</h3>
                    <div className="mega-menu__list">
                      {hautsGrades.length > 0 ? (
                        hautsGrades.slice(0, 5).map((degree) => (
                          <Link
                            key={degree._id}
                            href={`/catalog?degree=${degree._id}`}
                            className="mega-menu__item"
                          >
                            {degree.name}
                          </Link>
                        ))
                      ) : (
                        <Link href="/catalog?logeType=Loge Hauts Grades" className="mega-menu__item">
                          Voir tous les Hauts Grades
                        </Link>
                      )}
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
                      <Link href="/catalog?category=gants" className="mega-menu__item">Gants</Link>
                    </div>
                  </div>
                </div>

                <div className="mega-menu__footer">
                  <Link href="/equiper-ma-loge" className="mega-menu__cta mega-menu__cta--highlight">
                    Équiper ma Loge complète →
                  </Link>
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
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="header-luxe__icon-btn"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <Link href="/cart" className="header-luxe__icon-btn header-luxe__cart-btn">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="header-luxe__cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

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

      {/* Search Overlay */}
      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-overlay__content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="search-overlay__form">
              <Search className="search-overlay__icon" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, un rite, une obédience..."
                className="search-overlay__input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="search-overlay__close"
              >
                <X className="w-6 h-6" />
              </button>
            </form>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="search-overlay__results">
                {isSearching ? (
                  <div className="search-overlay__loading">Recherche en cours...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-overlay__results-list">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug || product._id}`}
                          className="search-overlay__result-item"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="search-overlay__result-image">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>🎭</span>
                            )}
                          </div>
                          <div className="search-overlay__result-info">
                            <p className="search-overlay__result-name">{product.name}</p>
                            <p className="search-overlay__result-price">{product.price?.toFixed(2)} €</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                      className="search-overlay__view-all"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      Voir tous les résultats →
                    </Link>
                  </>
                ) : (
                  <div className="search-overlay__no-results">
                    Aucun produit trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {/* Quick Links */}
            {searchQuery.length < 2 && (
              <div className="search-overlay__quick-links">
                <p className="search-overlay__quick-title">Recherches populaires</p>
                <div className="search-overlay__quick-tags">
                  <button onClick={() => setSearchQuery('tablier maître')}>Tablier Maître</button>
                  <button onClick={() => setSearchQuery('REAA')}>REAA</button>
                  <button onClick={() => setSearchQuery('sautoir')}>Sautoirs</button>
                  <button onClick={() => setSearchQuery('bijoux')}>Bijoux</button>
                  <button onClick={() => setSearchQuery('14e degré')}>14e degré</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              <Link href="/equiper-ma-loge" onClick={() => setShowMobileMenu(false)}>Équiper ma Loge</Link>
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

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Par Rite</h3>
              <div className="mobile-menu__rites">
                {rites.slice(0, 4).map((rite) => (
                  <Link
                    key={rite._id}
                    href={`/catalog?rite=${rite._id}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {rite.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mobile-menu__actions">
              <Link href="/cart" onClick={() => setShowMobileMenu(false)}>
                <button className="btn-luxe btn-luxe--outline w-full mb-3">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Panier {cartCount > 0 && `(${cartCount})`}
                </button>
              </Link>
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
