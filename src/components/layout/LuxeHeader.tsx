'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, ShoppingBag, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// CONSTANTS
// ============================================================================

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_RESULTS_LIMIT = 6;
const MAX_CART_DISPLAY = 99;

const POPULAR_SEARCHES = [
  'tablier maître',
  'REAA',
  'sautoir',
  'bijoux',
  '14e degré',
];

const PRODUCT_CATEGORIES = [
  { href: '/catalog?category=tabliers', label: 'Tabliers' },
  { href: '/catalog?category=cordons', label: 'Cordons & Sautoirs' },
  { href: '/catalog?category=bijoux', label: 'Bijoux' },
  { href: '/catalog?category=accessoires', label: 'Accessoires' },
  { href: '/catalog?category=gants', label: 'Gants' },
];

const NAVIGATION_LINKS = [
  { href: '/maison', label: 'La Maison' },
  { href: '/sur-mesure', label: 'Sur Mesure' },
  { href: '/savoir-faire', label: 'Savoir-Faire' },
  { href: '/contact', label: 'Contact' },
];

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook pour gérer le compteur du panier avec synchronisation localStorage
 */
function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );
      setCartCount(count);
    } catch (error) {
      console.error('Error reading cart:', error);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = (e: CustomEvent) => {
      setCartCount(e.detail?.itemCount || 0);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, [updateCartCount]);

  return cartCount;
}

/**
 * Hook pour détecter le scroll
 */
function useScrollDetection(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}

/**
 * Hook pour bloquer le scroll du body
 */
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isLocked]);
}

/**
 * Hook pour gérer la navigation au clavier (Escape, Tab)
 */
function useKeyboardNavigation(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, containerRef]);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LuxeHeader() {
  const router = useRouter();

  // State
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [degrees, setDegrees] = useState<DegreeOrder[]>([]);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Custom hooks
  const cartCount = useCartCount();
  const isScrolled = useScrollDetection(20);
  useBodyScrollLock(showSearch || showMobileMenu);
  useKeyboardNavigation(showSearch, () => setShowSearch(false), searchRef);
  useKeyboardNavigation(showMobileMenu, () => setShowMobileMenu(false), mobileMenuRef);

  // Raccourci CTRL+K pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Computed values
  const logesSymboliques = useMemo(
    () => degrees.filter((d) => d.loge_type === 'Loge Symbolique'),
    [degrees]
  );

  const hautsGrades = useMemo(
    () => degrees.filter((d) => d.loge_type === 'Loge Hauts Grades'),
    [degrees]
  );

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [obData, riteData, degreeData] = await Promise.all([
          fetch('/api/obediences?activeOnly=true').then((r) => r.json()),
          fetch('/api/rites?activeOnly=true').then((r) => r.json()),
          fetch('/api/degrees?activeOnly=true')
            .then((r) => r.json())
            .catch(() => ({ degrees: [] })),
        ]);

        setObediences(obData.obediences || []);
        setRites(riteData.rites || []);
        setDegrees(degreeData.degrees || []);
      } catch (error) {
        console.error('Error loading header data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search avec debounce
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < SEARCH_MIN_LENGTH) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/products-v2?search=${encodeURIComponent(query)}&limit=${SEARCH_RESULTS_LIMIT}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  // Handlers
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim();
      
      if (trimmedQuery) {
        router.push(`/catalog?search=${encodeURIComponent(trimmedQuery)}`);
        setShowSearch(false);
        setSearchQuery('');
      }
    },
    [searchQuery, router]
  );

  const handleOpenSearch = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setShowSearch(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    previousFocusRef.current?.focus();
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setShowMobileMenu(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
    previousFocusRef.current?.focus();
  }, []);

  const handleNavigate = useCallback(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const handlePopularSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Format cart count
  const displayCartCount = cartCount > MAX_CART_DISPLAY ? '99+' : cartCount;

  return (
    <>
      {/* ====================================================================== */}
      {/* HEADER */}
      {/* ====================================================================== */}
      <header
        className={`header-luxe ${isScrolled ? 'header-luxe--scrolled' : ''}`}
        role="banner"
      >
        <div className="header-luxe__inner">
          {/* Logo */}
          <Link
            href="/"
            className="header-luxe__brand"
            aria-label="Atelier Art Royal - Retour à l'accueil"
          >
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
          <nav className="header-luxe__nav" aria-label="Navigation principale">
            <Link href="/maison" className="header-luxe__link">La Maison</Link>

            {/* Collections avec mega-menu */}
            <div
              className="header-luxe__link-wrapper"
              onMouseEnter={() => !isLoading && setShowCollectionsMenu(true)}
              onMouseLeave={() => setShowCollectionsMenu(false)}
            >
              <button
                className="header-luxe__link header-luxe__link--dropdown"
                onClick={() => setShowCollectionsMenu(!showCollectionsMenu)}
                aria-expanded={showCollectionsMenu}
                aria-haspopup="true"
                aria-controls="collections-megamenu"
                disabled={isLoading}
              >
                Collections
                <ChevronDown 
                  className={`w-3 h-3 ml-1 transition-transform ${showCollectionsMenu ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {/* Mega Menu Collections */}
              <div 
                id="collections-megamenu"
                className={`mega-menu ${showCollectionsMenu ? 'mega-menu--visible' : ''}`}
                role="menu"
                aria-label="Menu des collections"
              >
                <div className="mega-menu__inner">
                  {/* Obédiences */}
                  <div className="mega-menu__section" role="group" aria-labelledby="obediences-title">
                    <h3 id="obediences-title" className="mega-menu__title">Par Obédience</h3>
                    <div className="mega-menu__grid mega-menu__grid--obediences" role="list">
                      {isLoading ? (
                        <div className="mega-menu__loading" role="status" aria-live="polite">
                          Chargement...
                        </div>
                      ) : obediences.length > 0 ? (
                        obediences.map((ob) => (
                          <Link
                            key={ob._id}
                            href={`/catalog?obedience=${ob._id}`}
                            className="mega-menu__item mega-menu__item--obedience"
                            role="menuitem"
                            onClick={handleNavigate}
                            aria-label={`Filtrer par obédience ${ob.name}`}
                          >
                            {ob.image_url && (
                              <Image
                                src={ob.image_url}
                                alt=""
                                width={32}
                                height={32}
                                className="mega-menu__item-image"
                                aria-hidden="true"
                              />
                            )}
                            <span className="mega-menu__item-code">{ob.code}</span>
                          </Link>
                        ))
                      ) : (
                        <p className="mega-menu__empty">Aucune obédience disponible</p>
                      )}
                    </div>
                  </div>

                  {/* Rites */}
                  <div className="mega-menu__section" role="group" aria-labelledby="rites-title">
                    <h3 id="rites-title" className="mega-menu__title">Par Rite</h3>
                    <div className="mega-menu__list" role="list">
                      {isLoading ? (
                        <div className="mega-menu__loading" role="status" aria-live="polite">
                          Chargement...
                        </div>
                      ) : rites.length > 0 ? (
                        rites.slice(0, 6).map((rite) => (
                          <Link
                            key={rite._id}
                            href={`/catalog?rite=${rite._id}`}
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            {rite.name}
                          </Link>
                        ))
                      ) : (
                        <p className="mega-menu__empty">Aucun rite disponible</p>
                      )}
                    </div>
                  </div>

                  {/* Degrés - Loges Symboliques */}
                  <div className="mega-menu__section" role="group" aria-labelledby="degrees-title">
                    <h3 id="degrees-title" className="mega-menu__title">Loges Bleues</h3>
                    <div className="mega-menu__list" role="list">
                      {isLoading ? (
                        <div className="mega-menu__loading" role="status" aria-live="polite">
                          Chargement...
                        </div>
                      ) : logesSymboliques.length > 0 ? (
                        logesSymboliques.map((degree) => (
                          <Link
                            key={degree._id}
                            href={`/catalog?degree=${degree._id}`}
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            {degree.name}
                          </Link>
                        ))
                      ) : (
                        <>
                          <Link 
                            href="/catalog?logeType=Loge Symbolique" 
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            Apprenti (1°)
                          </Link>
                          <Link 
                            href="/catalog?logeType=Loge Symbolique" 
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            Compagnon (2°)
                          </Link>
                          <Link 
                            href="/catalog?logeType=Loge Symbolique" 
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            Maître (3°)
                          </Link>
                        </>
                      )}
                    </div>

                    <h3 id="hauts-grades-title" className="mega-menu__title mt-4">Hauts Grades</h3>
                    <div className="mega-menu__list" role="list">
                      {isLoading ? (
                        <div className="mega-menu__loading" role="status" aria-live="polite">
                          Chargement...
                        </div>
                      ) : hautsGrades.length > 0 ? (
                        hautsGrades.slice(0, 5).map((degree) => (
                          <Link
                            key={degree._id}
                            href={`/catalog?degree=${degree._id}`}
                            className="mega-menu__item"
                            role="menuitem"
                            onClick={handleNavigate}
                          >
                            {degree.name}
                          </Link>
                        ))
                      ) : (
                        <Link 
                          href="/catalog?logeType=Loge Hauts Grades" 
                          className="mega-menu__item"
                          role="menuitem"
                          onClick={handleNavigate}
                        >
                          Voir tous les Hauts Grades
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Catégories produits */}
                  <div className="mega-menu__section" role="group" aria-labelledby="categories-title">
                    <h3 id="categories-title" className="mega-menu__title">Catégories</h3>
                    <div className="mega-menu__list" role="list">
                      {PRODUCT_CATEGORIES.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="mega-menu__item"
                          role="menuitem"
                          onClick={handleNavigate}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mega-menu__footer" role="group">
                  <Link 
                    href="/equiper-ma-loge" 
                    className="mega-menu__cta mega-menu__cta--highlight"
                    onClick={handleNavigate}
                  >
                    Équiper ma Loge complète →
                  </Link>
                  <Link 
                    href="/catalog" 
                    className="mega-menu__cta"
                    onClick={handleNavigate}
                  >
                    Voir toutes les collections →
                  </Link>
                </div>
              </div>
            </div>

            {NAVIGATION_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="header-luxe__link">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-luxe__actions">
            {/* Search Button avec CTRL+K */}
            <button
              onClick={handleOpenSearch}
              className="header-luxe__search-btn"
              aria-label="Ouvrir la recherche (Ctrl+K)"
              aria-expanded={showSearch}
              aria-controls="search-overlay"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="header-luxe__search-text">Rechercher...</span>
              <kbd className="header-luxe__search-kbd">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Cart Button */}
            <Link 
              href="/cart" 
              className="header-luxe__icon-btn header-luxe__cart-btn"
              aria-label={`Panier, ${cartCount} ${cartCount > 1 ? 'articles' : 'article'}`}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span 
                  className="header-luxe__cart-count"
                  aria-label={`${displayCartCount} articles dans le panier`}
                >
                  {displayCartCount}
                </span>
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
            onClick={handleOpenMobileMenu}
            aria-label={showMobileMenu ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={showMobileMenu}
            aria-controls="mobile-menu"
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
        <div 
          className="search-overlay" 
          onClick={handleCloseSearch}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-title"
        >
          <div 
            ref={searchRef}
            className="search-overlay__content" 
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="search-overlay__form" role="search">
              <Search className="search-overlay__icon" aria-hidden="true" />
              <label htmlFor="search-input" className="sr-only" id="search-title">
                Rechercher un produit
              </label>
              <input
                id="search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, un rite, une obédience..."
                className="search-overlay__input"
                aria-describedby="search-description"
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleCloseSearch}
                className="search-overlay__close"
                aria-label="Fermer la recherche"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </form>

            {/* Search Results */}
            {searchQuery.length >= SEARCH_MIN_LENGTH && (
              <div 
                className="search-overlay__results"
                role="region"
                aria-live="polite"
                aria-atomic="true"
              >
                {isSearching ? (
                  <div className="search-overlay__loading" role="status">
                    <span className="sr-only">Recherche en cours...</span>
                    Recherche en cours...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-overlay__results-list" role="list">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug || product._id}`}
                          className="search-overlay__result-item"
                          role="listitem"
                          onClick={handleNavigate}
                          aria-label={`${product.name}, ${product.price?.toFixed(2)} euros`}
                        >
                          <div className="search-overlay__result-image" aria-hidden="true">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=""
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
                      onClick={handleNavigate}
                    >
                      Voir tous les résultats →
                    </Link>
                  </>
                ) : (
                  <div className="search-overlay__no-results" role="status">
                    Aucun produit trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {/* Quick Links */}
            {searchQuery.length < SEARCH_MIN_LENGTH && (
              <div className="search-overlay__quick-links">
                <p className="search-overlay__quick-title" id="search-description">
                  Recherches populaires
                </p>
                <div className="search-overlay__quick-tags" role="list">
                  {POPULAR_SEARCHES.map((query) => (
                    <button 
                      key={query}
                      onClick={() => handlePopularSearch(query)}
                      role="listitem"
                      type="button"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="mobile-menu-overlay" 
          onClick={handleCloseMobileMenu}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <nav 
            id="mobile-menu"
            ref={mobileMenuRef}
            className="mobile-menu" 
            onClick={(e) => e.stopPropagation()}
            aria-label="Menu de navigation mobile"
          >
            <div className="mobile-menu__header">
              <Image
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
                alt="Atelier Art Royal"
                width={150}
                height={42}
                id="mobile-menu-title"
              />
              <button 
                onClick={handleCloseMobileMenu} 
                className="mobile-menu__close"
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Navigation</h3>
              {NAVIGATION_LINKS.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={handleNavigate}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/catalog" onClick={handleNavigate}>Collections</Link>
              <Link href="/equiper-ma-loge" onClick={handleNavigate}>Équiper ma Loge</Link>
            </div>

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Votre Obédience</h3>
              {isLoading ? (
                <div className="mobile-menu__loading" role="status" aria-live="polite">
                  Chargement...
                </div>
              ) : obediences.length > 0 ? (
                <div className="mobile-menu__obediences" role="list">
                  {obediences.map((ob) => (
                    <Link
                      key={ob._id}
                      href={`/catalog?obedience=${ob._id}`}
                      className="mobile-menu__obedience"
                      onClick={handleNavigate}
                      role="listitem"
                      aria-label={`Filtrer par obédience ${ob.name}`}
                    >
                      {ob.image_url && (
                        <Image 
                          src={ob.image_url} 
                          alt="" 
                          width={28} 
                          height={28}
                          aria-hidden="true"
                        />
                      )}
                      <span>{ob.code}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mobile-menu__empty">Aucune obédience disponible</p>
              )}
            </div>

            <div className="mobile-menu__section">
              <h3 className="mobile-menu__title">Par Rite</h3>
              {isLoading ? (
                <div className="mobile-menu__loading" role="status" aria-live="polite">
                  Chargement...
                </div>
              ) : rites.length > 0 ? (
                <div className="mobile-menu__rites" role="list">
                  {rites.slice(0, 4).map((rite) => (
                    <Link
                      key={rite._id}
                      href={`/catalog?rite=${rite._id}`}
                      onClick={handleNavigate}
                      role="listitem"
                    >
                      {rite.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mobile-menu__empty">Aucun rite disponible</p>
              )}
            </div>

            <div className="mobile-menu__actions">
              <Link href="/cart" onClick={handleNavigate}>
                <button 
                  className="btn-luxe btn-luxe--outline w-full mb-3"
                  aria-label={`Voir le panier, ${cartCount} ${cartCount > 1 ? 'articles' : 'article'}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" aria-hidden="true" />
                  Panier {cartCount > 0 && `(${displayCartCount})`}
                </button>
              </Link>
              <Link href="/auth/login" onClick={handleNavigate}>
                <button className="btn-luxe btn-luxe--primary w-full">Espace Client</button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
