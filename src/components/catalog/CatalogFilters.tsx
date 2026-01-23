'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FilterOptions {
  categories: Array<{ _id: string; name: string; slug: string; product_count?: number }>;
  rites: Array<{ _id: string; name: string; code: string; product_count?: number }>;
  obediences: Array<{ _id: string; name: string; code: string; product_count?: number }>;
  degrees: Array<{ _id: string; name: string; level: number; loge_type: string; product_count?: number }>;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  priceRange?: { min: number; max: number };
}

export interface ActiveFilters {
  category?: string;
  rite?: string;
  obedience?: string;
  degree?: string;
  logeType?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  material?: string;
  showPromotions?: string;
  showNew?: string;
  inStockOnly?: string;
  sortBy?: string;
}

interface CatalogFiltersProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange?: (filters: ActiveFilters) => void;
  totalProducts?: number;
  className?: string;
}

export function CatalogFilters({
  options,
  activeFilters,
  onFilterChange,
  totalProducts = 0,
  className = '',
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [localFilters, setLocalFilters] = useState<ActiveFilters>(activeFilters);
  const [searchInput, setSearchInput] = useState(activeFilters.search || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    rites: true,
    obediences: true,
    degrees: true,
    price: false,
    attributes: false,
    status: false,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Synchroniser avec les paramètres URL
  useEffect(() => {
    const filtersFromUrl: ActiveFilters = {
      category: searchParams.get('category') || undefined,
      rite: searchParams.get('rite') || undefined,
      obedience: searchParams.get('obedience') || undefined,
      degree: searchParams.get('degree') || searchParams.get('degreeOrder') || undefined,
      logeType: searchParams.get('logeType') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      size: searchParams.get('size') || undefined,
      color: searchParams.get('color') || undefined,
      material: searchParams.get('material') || undefined,
      showPromotions: searchParams.get('showPromotions') || undefined,
      showNew: searchParams.get('showNew') || undefined,
      inStockOnly: searchParams.get('inStockOnly') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
    };
    setLocalFilters(filtersFromUrl);
    setSearchInput(filtersFromUrl.search || '');
  }, [searchParams]);

  // Mettre à jour l'URL avec les filtres
  const updateUrl = useCallback((newFilters: ActiveFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    
    router.push(newUrl, { scroll: false });
    
    // Déclencher l'événement pour les composants qui écoutent
    window.dispatchEvent(new Event('urlchange'));
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [pathname, router, onFilterChange]);

  // Appliquer un filtre
  const applyFilter = useCallback((key: keyof ActiveFilters, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    
    // Réinitialiser la page lors d'un changement de filtre
    delete (newFilters as any).page;
    
    setLocalFilters(newFilters);
    updateUrl(newFilters);
  }, [localFilters, updateUrl]);

  // Toggle un filtre booléen
  const toggleBooleanFilter = useCallback((key: 'showPromotions' | 'showNew' | 'inStockOnly') => {
    const currentValue = localFilters[key];
    const newValue = currentValue === 'true' ? undefined : 'true';
    applyFilter(key, newValue);
  }, [localFilters, applyFilter]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (localFilters.search || '')) {
        applyFilter('search', searchInput || undefined);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput, localFilters.search, applyFilter]);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setLocalFilters({});
    setSearchInput('');
    router.push(pathname, { scroll: false });
    window.dispatchEvent(new Event('urlchange'));
    if (onFilterChange) {
      onFilterChange({});
    }
  }, [pathname, router, onFilterChange]);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Compter les filtres actifs
  const activeFilterCount = Object.values(localFilters).filter(v => v && v !== '').length;

  // Grouper les degrés par type de loge
  const degreesByLogeType = {
    'Loge Symbolique': options.degrees.filter(d => d.loge_type === 'Loge Symbolique'),
    'Loge Hauts Grades': options.degrees.filter(d => d.loge_type === 'Loge Hauts Grades'),
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    sectionKey: string; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-white/10 pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full text-left font-medium text-sm mb-3 text-white"
        onClick={() => toggleSection(sectionKey)}
      >
        {title}
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-white/70" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/70" />
        )}
      </button>
      {expandedSections[sectionKey] && children}
    </div>
  );

  const FilterContent = () => (
    <>
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059]"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                applyFilter('search', undefined);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-white/50 hover:text-white/70" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => toggleBooleanFilter('showPromotions')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            localFilters.showPromotions === 'true'
              ? 'bg-red-500/20 border-red-500/30 text-red-400'
              : 'border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          🏷️ Promos
        </button>
        <button
          onClick={() => toggleBooleanFilter('showNew')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            localFilters.showNew === 'true'
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : 'border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          ✨ Nouveautés
        </button>
        <button
          onClick={() => toggleBooleanFilter('inStockOnly')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            localFilters.inStockOnly === 'true'
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              : 'border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          📦 En stock
        </button>
      </div>

      {/* Catégories */}
      {options.categories.length > 0 && (
        <FilterSection title="Catégories" sectionKey="categories">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {options.categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => applyFilter('category', localFilters.category === cat._id ? undefined : cat._id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                  localFilters.category === cat._id
                    ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-medium'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {cat.name}
                {cat.product_count !== undefined && (
                  <span className="text-white/50 text-xs ml-1">({cat.product_count})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rites */}
      {options.rites.length > 0 && (
        <FilterSection title="Rites" sectionKey="rites">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {options.rites.map((rite) => (
              <button
                key={rite._id}
                onClick={() => applyFilter('rite', localFilters.rite === rite._id ? undefined : rite._id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                  localFilters.rite === rite._id
                    ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-medium'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {rite.name}
                {rite.product_count !== undefined && (
                  <span className="text-white/50 text-xs ml-1">({rite.product_count})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Obédiences */}
      {options.obediences.length > 0 && (
        <FilterSection title="Obédiences" sectionKey="obediences">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {options.obediences.map((ob) => (
              <button
                key={ob._id}
                onClick={() => applyFilter('obedience', localFilters.obedience === ob._id ? undefined : ob._id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                  localFilters.obedience === ob._id
                    ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-medium'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {ob.name}
                {ob.product_count !== undefined && (
                  <span className="text-white/50 text-xs ml-1">({ob.product_count})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Degrés par type de loge */}
      {options.degrees.length > 0 && (
        <FilterSection title="Degrés & Ordres" sectionKey="degrees">
          {/* Filtre par type de loge */}
          <div className="mb-3">
            <p className="text-xs text-white/50 mb-2">Type de Loge</p>
            <div className="flex gap-2">
              <button
                onClick={() => applyFilter('logeType', localFilters.logeType === 'Loge Symbolique' ? undefined : 'Loge Symbolique')}
                className={`flex-1 text-xs py-1.5 px-2 rounded border transition-colors ${
                  localFilters.logeType === 'Loge Symbolique'
                    ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                    : 'border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                Symbolique
              </button>
              <button
                onClick={() => applyFilter('logeType', localFilters.logeType === 'Loge Hauts Grades' ? undefined : 'Loge Hauts Grades')}
                className={`flex-1 text-xs py-1.5 px-2 rounded border transition-colors ${
                  localFilters.logeType === 'Loge Hauts Grades'
                    ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                    : 'border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                Hauts Grades
              </button>
            </div>
          </div>
          
          {/* Liste des degrés */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(degreesByLogeType).map(([logeType, degrees]) => (
              degrees.length > 0 && (
                <div key={logeType}>
                  <p className="text-xs font-medium text-white/50 mb-1">{logeType}</p>
                  <div className="space-y-1 pl-2">
                    {degrees.map((deg) => (
                      <button
                        key={deg._id}
                        onClick={() => applyFilter('degree', localFilters.degree === deg._id ? undefined : deg._id)}
                        className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                          localFilters.degree === deg._id
                            ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-medium'
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {deg.name}
                        {deg.product_count !== undefined && (
                          <span className="text-white/50 text-xs ml-1">({deg.product_count})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </FilterSection>
      )}

      {/* Prix */}
      <FilterSection title="Prix" sectionKey="price">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice || ''}
            onChange={(e) => applyFilter('minPrice', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059]"
            min="0"
          />
          <span className="text-white/50">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ''}
            onChange={(e) => applyFilter('maxPrice', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059]"
            min="0"
          />
        </div>
        {options.priceRange && (
          <p className="text-xs text-white/50 mt-2">
            Plage : {options.priceRange.min}€ - {options.priceRange.max}€
          </p>
        )}
      </FilterSection>

      {/* Attributs */}
      {(options.sizes?.length || options.colors?.length || options.materials?.length) && (
        <FilterSection title="Attributs" sectionKey="attributes">
          {options.sizes && options.sizes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/50 mb-2">Tailles</p>
              <div className="flex flex-wrap gap-1">
                {options.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => applyFilter('size', localFilters.size === size ? undefined : size)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.size === size
                        ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                        : 'border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {options.colors && options.colors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/50 mb-2">Couleurs</p>
              <div className="flex flex-wrap gap-1">
                {options.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => applyFilter('color', localFilters.color === color ? undefined : color)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.color === color
                        ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                        : 'border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {options.materials && options.materials.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-2">Matières</p>
              <div className="flex flex-wrap gap-1">
                {options.materials.map((material) => (
                  <button
                    key={material}
                    onClick={() => applyFilter('material', localFilters.material === material ? undefined : material)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.material === material
                        ? 'bg-[#C5A059]/20 border-[#C5A059]/50 text-[#C5A059]'
                        : 'border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>
          )}
        </FilterSection>
      )}

      {/* Réinitialiser */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={resetFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Réinitialiser les filtres ({activeFilterCount})
        </Button>
      )}
    </>
  );

  return (
    <>
      {/* Bouton mobile */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(true)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-gold-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Sidebar desktop */}
      <aside className={`hidden lg:block ${className}`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 shadow-sm sticky top-24">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Filter className="h-4 w-4 text-white/70" />
            Filtres
            {totalProducts > 0 && (
              <span className="text-sm font-normal text-white/50">
                ({totalProducts} produit{totalProducts > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <FilterContent />
        </div>
      </aside>

      {/* Modal mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setIsMobileOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-[#0f0f12] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2 text-white">
                <Filter className="h-4 w-4 text-white/70" />
                Filtres
              </h2>
              <button onClick={() => setIsMobileOpen(false)}>
                <X className="h-5 w-5 text-white/70 hover:text-white" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CatalogFilters;
