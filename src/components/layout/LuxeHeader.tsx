'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, ShoppingBag, Search, X, Menu } from 'lucide-react';
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

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    
    const handleCartUpdate = (e: CustomEvent) => {
      setCartCount(e.detail?.itemCount || 0);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    window.addEventListener('storage', updateCart);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('storage', updateCart);
    };
  }, []);

  return cartCount;
}

function useScrollDetection(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const collectionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hooks
  const cartCount = useCartCount();
  const isScrolled = useScrollDetection(20);

  // Computed values
  const logesSymboliques = useMemo(
    () => degrees.filter((d) => d.loge_type === 'Loge Symbolique'),
    [degrees]
  );
  const hautsGrades = useMemo(
    () => degrees.filter((d) => d.loge_type === 'Loge Hauts Grades'),
    [degrees]
  );

  // Lock body scroll when modal open
  useEffect(() => {
    if (showSearch || showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSearch, showMobileMenu]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [obData, riteData, degreeData] = await Promise.all([
          fetch('/api/obediences?activeOnly=true').then((r) => r.json()),
          fetch('/api/rites?activeOnly=true').then((r) => r.json()),
          fetch('/api/degrees?activeOnly=true').then((r) => r.json()).catch(() => ({ degrees: [] })),
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
    loadData();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.length < SEARCH_MIN_LENGTH) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/products-v2?search=${encodeURIComponent(searchQuery)}&limit=${SEARCH_RESULTS_LIMIT}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.products || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleNavigate = () => {
    setShowMobileMenu(false);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleCollectionsEnter = () => {
    if (collectionsTimeoutRef.current) {
      clearTimeout(collectionsTimeoutRef.current);
    }
    if (!isLoading) {
      setShowCollectionsMenu(true);
    }
  };

  const handleCollectionsLeave = () => {
    collectionsTimeoutRef.current = setTimeout(() => {
      setShowCollectionsMenu(false);
    }, 150);
  };

  const displayCartCount = cartCount > MAX_CART_DISPLAY ? '99+' : cartCount;

  return (
    <>
      {/* ================================================================== */}
      {/* HEADER PRINCIPAL */}
      {/* ================================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-[#FDFBF7]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* === GAUCHE: Logo + Drapeau === */}
            <div className="flex items-center gap-3 lg:gap-4">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
                  alt="Atelier Art Royal"
                  width={160}
                  height={45}
                  className="h-8 lg:h-10 w-auto"
                  priority
                />
              </Link>
              
              {/* Séparateur + Drapeau - visible tablette+ */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-px h-6 bg-gray-300" />
                <span 
                  className="w-6 h-4 rounded-sm border border-gray-200 shadow-sm"
                  style={{
                    background: 'linear-gradient(90deg, #002395 0% 33.33%, #FFFFFF 33.33% 66.66%, #ED2939 66.66% 100%)'
                  }}
                  title="Fabriqué en France"
                />
              </div>
            </div>

            {/* === CENTRE: Navigation Desktop === */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/maison"
                className="px-4 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-[#C9A227] transition-colors"
              >
                La Maison
              </Link>

              {/* Collections avec Mega Menu */}
              <div
                className="relative"
                onMouseEnter={handleCollectionsEnter}
                onMouseLeave={handleCollectionsLeave}
              >
                <button
                  className="flex items-center gap-1 px-4 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-[#C9A227] transition-colors"
                  aria-expanded={showCollectionsMenu}
                >
                  Collections
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showCollectionsMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mega Menu */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 w-[800px] bg-white border border-gray-200 shadow-xl transition-all duration-200 ${
                    showCollectionsMenu
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  <div className="grid grid-cols-4 gap-0 p-6">
                    {/* Obédiences */}
                    <div className="pr-4 border-r border-gray-200">
                      <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3 pb-2 border-b border-gray-200">
                        Par Obédience
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {isLoading ? (
                          <p className="text-xs text-gray-400 col-span-2">Chargement...</p>
                        ) : obediences.length > 0 ? (
                          obediences.map((ob) => (
                            <Link
                              key={ob._id}
                              href={`/catalog?obedience=${ob._id}`}
                              className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-[#C9A227]/10 transition-colors"
                              onClick={handleNavigate}
                            >
                              {ob.image_url && (
                                <Image
                                  src={ob.image_url}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain rounded-full"
                                />
                              )}
                              <span className="text-[11px] font-semibold tracking-wide">
                                {ob.code}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 col-span-2">Aucune obédience</p>
                        )}
                      </div>
                    </div>

                    {/* Rites */}
                    <div className="px-4 border-r border-gray-200">
                      <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3 pb-2 border-b border-gray-200">
                        Par Rite
                      </h3>
                      <div className="space-y-1">
                        {isLoading ? (
                          <p className="text-xs text-gray-400">Chargement...</p>
                        ) : rites.length > 0 ? (
                          rites.slice(0, 6).map((rite) => (
                            <Link
                              key={rite._id}
                              href={`/catalog?rite=${rite._id}`}
                              className="block text-xs text-gray-600 hover:text-[#C9A227] hover:pl-1 transition-all py-1"
                              onClick={handleNavigate}
                            >
                              {rite.name}
                            </Link>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">Aucun rite</p>
                        )}
                      </div>
                    </div>

                    {/* Degrés */}
                    <div className="px-4 border-r border-gray-200">
                      <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3 pb-2 border-b border-gray-200">
                        Loges Bleues
                      </h3>
                      <div className="space-y-1 mb-4">
                        {logesSymboliques.length > 0 ? (
                          logesSymboliques.map((degree) => (
                            <Link
                              key={degree._id}
                              href={`/catalog?degree=${degree._id}`}
                              className="block text-xs text-gray-600 hover:text-[#C9A227] hover:pl-1 transition-all py-1"
                              onClick={handleNavigate}
                            >
                              {degree.name}
                            </Link>
                          ))
                        ) : (
                          <>
                            <Link href="/catalog?logeType=Loge Symbolique" className="block text-xs text-gray-600 hover:text-[#C9A227] py-1" onClick={handleNavigate}>Apprenti (1°)</Link>
                            <Link href="/catalog?logeType=Loge Symbolique" className="block text-xs text-gray-600 hover:text-[#C9A227] py-1" onClick={handleNavigate}>Compagnon (2°)</Link>
                            <Link href="/catalog?logeType=Loge Symbolique" className="block text-xs text-gray-600 hover:text-[#C9A227] py-1" onClick={handleNavigate}>Maître (3°)</Link>
                          </>
                        )}
                      </div>

                      <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3 pb-2 border-b border-gray-200">
                        Hauts Grades
                      </h3>
                      <div className="space-y-1">
                        {hautsGrades.length > 0 ? (
                          hautsGrades.slice(0, 4).map((degree) => (
                            <Link
                              key={degree._id}
                              href={`/catalog?degree=${degree._id}`}
                              className="block text-xs text-gray-600 hover:text-[#C9A227] hover:pl-1 transition-all py-1"
                              onClick={handleNavigate}
                            >
                              {degree.name}
                            </Link>
                          ))
                        ) : (
                          <Link href="/catalog?logeType=Loge Hauts Grades" className="block text-xs text-gray-600 hover:text-[#C9A227] py-1" onClick={handleNavigate}>
                            Voir les Hauts Grades
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Catégories */}
                    <div className="pl-4">
                      <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3 pb-2 border-b border-gray-200">
                        Catégories
                      </h3>
                      <div className="space-y-1">
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            className="block text-xs text-gray-600 hover:text-[#C9A227] hover:pl-1 transition-all py-1"
                            onClick={handleNavigate}
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Mega Menu */}
                  <div className="flex items-center justify-center gap-6 px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <Link
                      href="/equiper-ma-loge"
                      className="text-xs font-semibold text-white bg-[#C9A227] px-4 py-2 hover:bg-[#D4B44A] transition-colors"
                      onClick={handleNavigate}
                    >
                      Équiper ma Loge complète →
                    </Link>
                    <Link
                      href="/catalog"
                      className="text-xs font-semibold text-[#C9A227] hover:text-[#1B3A5F] transition-colors"
                      onClick={handleNavigate}
                    >
                      Voir toutes les collections →
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/sur-mesure"
                className="px-4 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-[#C9A227] transition-colors"
              >
                Sur Mesure
              </Link>

              <Link
                href="/savoir-faire"
                className="px-4 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-[#C9A227] transition-colors"
              >
                Savoir-Faire
              </Link>

              <Link
                href="/contact"
                className="px-4 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-[#C9A227] transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* === DROITE: Actions === */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Bouton Recherche Desktop */}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm hover:border-[#C9A227] hover:bg-gray-50 transition-colors min-w-[180px]"
              >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">Rechercher...</span>
              </button>

              {/* Bouton Recherche Mobile */}
              <button
                onClick={() => setShowSearch(true)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#C9A227] transition-colors"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Panier */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-[#C9A227] transition-colors"
                aria-label={`Panier (${cartCount} articles)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#C9A227] text-white text-[10px] font-bold rounded-full px-1">
                    {displayCartCount}
                  </span>
                )}
              </Link>

              {/* Rendez-vous - Desktop */}
              <Link href="/contact" className="hidden xl:block">
                <button className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-colors">
                  Rendez-vous
                </button>
              </Link>

              {/* Espace Client */}
              <Link href="/auth/login" className="hidden sm:block">
                <button className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase bg-[#1B3A5F] text-white hover:bg-[#0F2340] transition-colors">
                  Espace Client
                </button>
              </Link>

              {/* Menu Mobile */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#C9A227] transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer pour le contenu */}
      <div className="h-16 lg:h-20" />

      {/* ================================================================== */}
      {/* MODAL RECHERCHE */}
      {/* ================================================================== */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-[15vh]"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-4 bg-white p-4 shadow-2xl"
            >
              <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, un rite, une obédience..."
                className="flex-1 text-lg outline-none bg-transparent text-gray-800 placeholder-gray-400"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </form>

            {/* Résultats */}
            {searchQuery.length >= SEARCH_MIN_LENGTH && (
              <div className="bg-white shadow-2xl max-h-[50vh] overflow-y-auto">
                {isSearching ? (
                  <p className="p-6 text-center text-gray-500">Recherche en cours...</p>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug || product._id}`}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                          onClick={handleNavigate}
                        >
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=""
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">🎭</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{product.name}</p>
                            <p className="text-sm font-semibold text-[#C9A227]">
                              {product.price?.toFixed(2)} €
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                      className="block p-4 text-center text-[#C9A227] font-medium border-t border-gray-200 hover:bg-[#C9A227]/5 transition-colors"
                      onClick={handleNavigate}
                    >
                      Voir tous les résultats →
                    </Link>
                  </>
                ) : (
                  <p className="p-6 text-center text-gray-500">
                    Aucun produit trouvé pour "{searchQuery}"
                  </p>
                )}
              </div>
            )}

            {/* Recherches populaires */}
            {searchQuery.length < SEARCH_MIN_LENGTH && (
              <div className="bg-white p-6 shadow-2xl">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
                  Recherches populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((query) => (
                    <button
                      key={query}
                      onClick={() => setSearchQuery(query)}
                      type="button"
                      className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-sm text-gray-700 hover:bg-[#C9A227]/10 hover:border-[#C9A227] hover:text-[#C9A227] transition-colors"
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

      {/* ================================================================== */}
      {/* MENU MOBILE */}
      {/* ================================================================== */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-[100] bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        >
          <nav
            className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-[#FDFBF7] overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Mobile Menu */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Image
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
                alt="Atelier Art Royal"
                width={130}
                height={36}
                className="h-8 w-auto"
              />
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-600 hover:text-gray-800"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3">
                Navigation
              </h3>
              <div className="space-y-0">
                {[
                  { href: '/maison', label: 'La Maison' },
                  { href: '/catalog', label: 'Collections' },
                  { href: '/sur-mesure', label: 'Sur Mesure' },
                  { href: '/savoir-faire', label: 'Savoir-Faire' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/equiper-ma-loge', label: 'Équiper ma Loge' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-gray-700 border-b border-gray-100 hover:text-[#C9A227] transition-colors"
                    onClick={handleNavigate}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Obédiences */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3">
                Votre Obédience
              </h3>
              {isLoading ? (
                <p className="text-sm text-gray-400">Chargement...</p>
              ) : obediences.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {obediences.map((ob) => (
                    <Link
                      key={ob._id}
                      href={`/catalog?obedience=${ob._id}`}
                      className="flex items-center gap-2 p-2 bg-gray-100 text-center justify-center hover:bg-[#C9A227]/10 transition-colors"
                      onClick={handleNavigate}
                    >
                      {ob.image_url && (
                        <Image
                          src={ob.image_url}
                          alt=""
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold">{ob.code}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucune obédience</p>
              )}
            </div>

            {/* Rites */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] mb-3">
                Par Rite
              </h3>
              {isLoading ? (
                <p className="text-sm text-gray-400">Chargement...</p>
              ) : rites.length > 0 ? (
                <div className="space-y-0">
                  {rites.slice(0, 4).map((rite) => (
                    <Link
                      key={rite._id}
                      href={`/catalog?rite=${rite._id}`}
                      className="block py-2 text-sm text-gray-700 border-b border-gray-100 hover:text-[#C9A227] transition-colors"
                      onClick={handleNavigate}
                    >
                      {rite.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucun rite</p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4">
              <Link href="/cart" onClick={handleNavigate}>
                <button className="w-full mb-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Panier {cartCount > 0 && `(${displayCartCount})`}
                </button>
              </Link>
              <Link href="/auth/login" onClick={handleNavigate}>
                <button className="w-full px-4 py-3 text-xs font-semibold tracking-wider uppercase bg-[#1B3A5F] text-white hover:bg-[#0F2340] transition-colors">
                  Espace Client
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Style pour l'animation slide-in */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
