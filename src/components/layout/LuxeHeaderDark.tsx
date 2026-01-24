'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, X, Menu, ChevronRight, Phone, Mail, Sun, Moon, Building2, ScrollText, Star, Award, Gem, Scissors, Hand, Landmark, Grid3X3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
interface Obedience {
  _id: string;
  name: string;
  code: string;
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

const CATEGORIES = [
  { href: '/catalog?category=tabliers', label: 'Tabliers', icon: Award },
  { href: '/catalog?category=cordons', label: 'Cordons & Sautoirs', icon: ScrollText },
  { href: '/catalog?category=bijoux', label: 'Bijoux', icon: Gem },
  { href: '/catalog?category=accessoires', label: 'Accessoires', icon: Scissors },
  { href: '/catalog?category=gants', label: 'Gants', icon: Hand },
  { href: '/catalog?category=decors', label: 'Décors de Loge', icon: Landmark },
];

const NAV_LINKS = [
  { href: '/maison', label: 'La Maison' },
  { href: '/sur-mesure', label: 'Sur Mesure' },
  { href: '/savoir-faire', label: 'Savoir-Faire' },
  { href: '/contact', label: 'Contact' },
];

export default function LuxeHeaderDark() {
  const router = useRouter();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'obediences' | 'rites' | 'degrees' | 'categories'>('menu');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [degrees, setDegrees] = useState<DegreeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart count
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
      } catch {
        setCartCount(0);
      }
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart as EventListener);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart as EventListener);
    };
  }, []);

  // Load API data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [obRes, riteRes, degreeRes] = await Promise.all([
          fetch('/api/obediences?activeOnly=true'),
          fetch('/api/rites?activeOnly=true'),
          fetch('/api/degrees?activeOnly=true'),
        ]);
        if (obRes.ok) setObediences((await obRes.json()).obediences || []);
        if (riteRes.ok) setRites((await riteRes.json()).rites || []);
        if (degreeRes.ok) setDegrees((await degreeRes.json()).degrees || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Focus search
  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showSearch]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = showMenu || showSearch ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMenu, showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const closeMenu = () => {
    setShowMenu(false);
    setActiveTab('menu');
  };

  const blueLogeDegreees = degrees.filter(d => d.loge_type === 'Loge Bleue');
  const highGradeDegrees = degrees.filter(d => d.loge_type === 'Loge Hauts Grades');

  return (
    <>
      {/* ================================================================ */}
      {/* HEADER - Compact & Modern */}
      {/* ================================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-150 ease-out ${
          isScrolled
            ? 'h-16 bg-[#0a0a0c] shadow-lg shadow-black/30'
            : 'h-20 bg-[#0a0a0c]/95 backdrop-blur-sm'
        }`}
      >
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: Burger + Logo */}
          <div className="flex items-center gap-4">
            {/* Burger Menu Button */}
            <button
              onClick={() => setShowMenu(true)}
              className="relative w-10 h-10 flex items-center justify-center text-white/80 hover:text-[#C5A059] transition-colors group"
              aria-label="Ouvrir le menu"
            >
              <div className="flex flex-col gap-1.5">
                <span className="block w-6 h-0.5 bg-current transition-all group-hover:w-5" />
                <span className="block w-5 h-0.5 bg-current transition-all group-hover:w-6" />
                <span className="block w-4 h-0.5 bg-current transition-all group-hover:w-6" />
              </div>
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              {/* Favicon for mobile */}
              <Image
                src="/Favicon Atelier Art Royal.svg"
                alt="Atelier Art Royal"
                width={40}
                height={40}
                className={`lg:hidden transition-all duration-150 ease-out ${isScrolled ? 'h-8' : 'h-10'} w-auto`}
                priority
                unoptimized
              />
              {/* Full logo for desktop */}
              <Image
                src="/logo2026.png"
                alt="Atelier Art Royal"
                width={220}
                height={40}
                className={`hidden lg:block transition-all duration-150 ease-out ${isScrolled ? 'h-9' : 'h-11'} w-auto`}
                priority
                unoptimized
              />
            </Link>

            {/* French Flag - Desktop only */}
            <div className="hidden lg:flex items-center gap-3 ml-2">
              <div className="w-px h-6 bg-white/20" />
              <div className="flex w-5 h-3.5 rounded-[1px] overflow-hidden" title="Fabriqué en France">
                <div className="w-1/3 bg-[#002395]" />
                <div className="w-1/3 bg-white" />
                <div className="w-1/3 bg-[#ED2939]" />
              </div>
            </div>
          </div>

          {/* CENTER: Quick Links - Desktop only */}
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-[#C5A059] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-[#C5A059] transition-all duration-150 ease-out"
              aria-label={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
            >
              <div className="relative w-5 h-5">
                <Sun 
                  className={`absolute inset-0 w-5 h-5 transition-all duration-150 ease-out ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} 
                />
                <Moon 
                  className={`absolute inset-0 w-5 h-5 transition-all duration-150 ease-out ${isDarkMode ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} 
                />
              </div>
            </button>

            {/* Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-[#C5A059] transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-10 h-10 flex items-center justify-center text-white/70 hover:text-[#C5A059] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[#C5A059] text-[#0a0a0c] text-[10px] font-bold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* CTA Button - Desktop */}
            <Link href="/auth/login" className="hidden sm:block">
              <button className="px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-[#C5A059] text-[#0a0a0c] hover:bg-[#d4af5a] transition-colors">
                Espace Client
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* MEGA MENU SIDEBAR */}
      {/* ================================================================ */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-200 ease-out ${
          showMenu ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ease-out ${
            showMenu ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-full max-w-md bg-[#0a0a0c] shadow-2xl transition-transform duration-200 ease-out ${
            showMenu ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <Image
              src="/Favicon Atelier Art Royal.svg"
              alt="Atelier Art Royal"
              width={40}
              height={40}
              className="h-9 w-auto"
              unoptimized
            />
            <button
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-80px)] overflow-y-auto">
            
            {/* Main Menu */}
            {activeTab === 'menu' && (
              <div className="p-6">
                {/* Navigation Links */}
                <nav className="space-y-1 mb-8">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between py-4 text-lg font-medium text-white/90 hover:text-[#C5A059] border-b border-white/5 transition-colors"
                      onClick={closeMenu}
                    >
                      {link.label}
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </Link>
                  ))}
                </nav>

                {/* Collections Section */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#C5A059] mb-4">
                    Explorez nos Collections
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('obediences')}
                      className="flex flex-col items-start p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all group"
                    >
                      <Building2 className="w-6 h-6 mb-2 text-[#C5A059] stroke-[1.5]" />
                      <span className="text-sm font-medium text-white/80 group-hover:text-[#C5A059]">Par Obédience</span>
                      <span className="text-xs text-white/40">{obediences.length} disponibles</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('rites')}
                      className="flex flex-col items-start p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all group"
                    >
                      <ScrollText className="w-6 h-6 mb-2 text-[#C5A059] stroke-[1.5]" />
                      <span className="text-sm font-medium text-white/80 group-hover:text-[#C5A059]">Par Rite</span>
                      <span className="text-xs text-white/40">{rites.length} disponibles</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('degrees')}
                      className="flex flex-col items-start p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all group"
                    >
                      <Star className="w-6 h-6 mb-2 text-[#C5A059] stroke-[1.5]" />
                      <span className="text-sm font-medium text-white/80 group-hover:text-[#C5A059]">Par Degré</span>
                      <span className="text-xs text-white/40">{degrees.length} disponibles</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('categories')}
                      className="flex flex-col items-start p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all group"
                    >
                      <Grid3X3 className="w-6 h-6 mb-2 text-[#C5A059] stroke-[1.5]" />
                      <span className="text-sm font-medium text-white/80 group-hover:text-[#C5A059]">Catégories</span>
                      <span className="text-xs text-white/40">{CATEGORIES.length} types</span>
                    </button>
                  </div>
                </div>

                {/* Quick Access */}
                <div className="space-y-3">
                  <Link
                    href="/catalog"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#C5A059] text-[#0a0a0c] font-semibold text-sm uppercase tracking-wider hover:bg-[#d4af5a] transition-colors"
                    onClick={closeMenu}
                  >
                    Voir tout le catalogue
                  </Link>
                  
                  <Link
                    href="/equiper-ma-loge"
                    className="flex items-center justify-center gap-2 w-full py-3 border border-[#C5A059] text-[#C5A059] font-semibold text-sm uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#0a0a0c] transition-all"
                    onClick={closeMenu}
                  >
                    Équiper ma Loge
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4">Contact</p>
                  <div className="space-y-3">
                    <a href="tel:+33123456789" className="flex items-center gap-3 text-sm text-white/60 hover:text-[#C5A059] transition-colors">
                      <Phone className="w-4 h-4" />
                      +33 1 23 45 67 89
                    </a>
                    <a href="mailto:contact@artroyal.fr" className="flex items-center gap-3 text-sm text-white/60 hover:text-[#C5A059] transition-colors">
                      <Mail className="w-4 h-4" />
                      contact@artroyal.fr
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Obédiences Tab */}
            {activeTab === 'obediences' && (
              <div className="p-6">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Retour
                </button>
                <h2 className="text-xl font-semibold text-white mb-6">Par Obédience</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {obediences.map((ob) => (
                      <Link
                        key={ob._id}
                        href={`/catalog?obedience=${ob._id}`}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                        onClick={closeMenu}
                      >
                        {ob.image_url && (
                          <Image src={ob.image_url} alt="" width={40} height={40} className="w-10 h-10 object-contain rounded-full bg-white/10" />
                        )}
                        <div>
                          <p className="font-semibold text-white/90 group-hover:text-[#C5A059]">{ob.code}</p>
                          <p className="text-xs text-white/50">{ob.name}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rites Tab */}
            {activeTab === 'rites' && (
              <div className="p-6">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Retour
                </button>
                <h2 className="text-xl font-semibold text-white mb-6">Par Rite</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rites.map((rite) => (
                      <Link
                        key={rite._id}
                        href={`/catalog?rite=${rite._id}`}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                        onClick={closeMenu}
                      >
                        <span className="font-medium text-white/90 group-hover:text-[#C5A059]">{rite.name}</span>
                        <ChevronRight className="w-5 h-5 text-white/30" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Degrees Tab */}
            {activeTab === 'degrees' && (
              <div className="p-6">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Retour
                </button>
                <h2 className="text-xl font-semibold text-white mb-6">Par Degré</h2>
                
                {/* Loge Bleue */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#C5A059] mb-3">Loge Bleue</h3>
                  <div className="space-y-2">
                    {blueLogeDegreees.map((deg) => (
                      <Link
                        key={deg._id}
                        href={`/catalog?degree=${deg._id}`}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                        onClick={closeMenu}
                      >
                        <span className="text-sm text-white/90 group-hover:text-[#C5A059]">{deg.name}</span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Hauts Grades */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#C5A059] mb-3">Hauts Grades</h3>
                  <div className="space-y-2">
                    {highGradeDegrees.map((deg) => (
                      <Link
                        key={deg._id}
                        href={`/catalog?degree=${deg._id}`}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                        onClick={closeMenu}
                      >
                        <span className="text-sm text-white/90 group-hover:text-[#C5A059]">{deg.name}</span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="p-6">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Retour
                </button>
                <h2 className="text-xl font-semibold text-white mb-6">Catégories</h2>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                      onClick={closeMenu}
                    >
                      <IconComponent className="w-6 h-6 text-[#C5A059] stroke-[1.5]" />
                      <span className="font-medium text-white/90 group-hover:text-[#C5A059]">{cat.label}</span>
                      <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
                    </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SEARCH MODAL */}
      {/* ================================================================ */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0c]/95 backdrop-blur-lg">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Rechercher</h2>
              <button
                onClick={() => setShowSearch(false)}
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Form */}
            <div className="flex-1 flex flex-col items-center justify-start pt-12 px-6">
              <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que recherchez-vous ?"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/20 rounded-xl text-xl text-white placeholder-white/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                    autoFocus
                  />
                </div>
              </form>

              {/* Popular Searches */}
              <div className="w-full max-w-2xl mt-10">
                <p className="text-sm font-medium text-white/40 mb-4">Recherches populaires</p>
                <div className="flex flex-wrap gap-3">
                  {['Tablier Maître', 'REAA', 'Sautoir 30e', 'Bijoux', 'Gants', 'GODF'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        router.push(`/catalog?search=${encodeURIComponent(term)}`);
                        setShowSearch(false);
                      }}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:bg-[#C5A059]/20 hover:border-[#C5A059]/50 hover:text-white transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="w-full max-w-2xl mt-10">
                <p className="text-sm font-medium text-white/40 mb-4">Accès rapide</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.slice(0, 6).map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-[#C5A059]/20 transition-colors group"
                      onClick={() => setShowSearch(false)}
                    >
                      <IconComponent className="w-5 h-5 text-[#C5A059] stroke-[1.5]" />
                      <span className="text-sm text-white/70 group-hover:text-white">{cat.label}</span>
                    </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`} />
    </>
  );
}
