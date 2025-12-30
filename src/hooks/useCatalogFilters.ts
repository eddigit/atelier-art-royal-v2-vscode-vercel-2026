'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface ProductFilters {
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
  page?: string;
}

interface UseCatalogFiltersOptions {
  syncWithUrl?: boolean;
  defaultFilters?: Partial<ProductFilters>;
  onFilterChange?: (filters: ProductFilters) => void;
}

interface UseCatalogFiltersReturn {
  filters: ProductFilters;
  setFilter: (key: keyof ProductFilters, value: string | undefined) => void;
  setFilters: (newFilters: Partial<ProductFilters>) => void;
  toggleFilter: (key: keyof ProductFilters, value: string) => void;
  clearFilter: (key: keyof ProductFilters) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  buildApiUrl: (baseUrl?: string) => string;
}

export function useCatalogFilters(options: UseCatalogFiltersOptions = {}): UseCatalogFiltersReturn {
  const {
    syncWithUrl = true,
    defaultFilters = {},
    onFilterChange,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialiser les filtres depuis l'URL ou les valeurs par défaut
  const getFiltersFromUrl = useCallback((): ProductFilters => {
    if (!syncWithUrl) return defaultFilters;

    return {
      category: searchParams.get('category') || defaultFilters.category,
      rite: searchParams.get('rite') || defaultFilters.rite,
      obedience: searchParams.get('obedience') || defaultFilters.obedience,
      degree: searchParams.get('degree') || searchParams.get('degreeOrder') || defaultFilters.degree,
      logeType: searchParams.get('logeType') || defaultFilters.logeType,
      search: searchParams.get('search') || defaultFilters.search,
      minPrice: searchParams.get('minPrice') || defaultFilters.minPrice,
      maxPrice: searchParams.get('maxPrice') || defaultFilters.maxPrice,
      size: searchParams.get('size') || defaultFilters.size,
      color: searchParams.get('color') || defaultFilters.color,
      material: searchParams.get('material') || defaultFilters.material,
      showPromotions: searchParams.get('showPromotions') || defaultFilters.showPromotions,
      showNew: searchParams.get('showNew') || defaultFilters.showNew,
      inStockOnly: searchParams.get('inStockOnly') || defaultFilters.inStockOnly,
      sortBy: searchParams.get('sortBy') || defaultFilters.sortBy || '-created_at',
      page: searchParams.get('page') || defaultFilters.page || '1',
    };
  }, [searchParams, syncWithUrl, defaultFilters]);

  const [filters, setFiltersState] = useState<ProductFilters>(getFiltersFromUrl);

  // Synchroniser avec l'URL quand les paramètres changent
  useEffect(() => {
    if (syncWithUrl) {
      setFiltersState(getFiltersFromUrl());
    }
  }, [searchParams, syncWithUrl, getFiltersFromUrl]);

  // Écouter les événements de changement d'URL custom
  useEffect(() => {
    const handleUrlChange = () => {
      if (syncWithUrl) {
        setFiltersState(getFiltersFromUrl());
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('urlchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlchange', handleUrlChange);
    };
  }, [syncWithUrl, getFiltersFromUrl]);

  // Mettre à jour l'URL avec les filtres
  const updateUrl = useCallback((newFilters: ProductFilters) => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== '1' && key !== 'page') {
        params.set(key, value);
      } else if (key === 'page' && value && value !== '1') {
        params.set(key, value);
      }
    });

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.push(newUrl, { scroll: false });
    window.dispatchEvent(new Event('urlchange'));
  }, [pathname, router, syncWithUrl]);

  // Définir un filtre
  const setFilter = useCallback((key: keyof ProductFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    
    // Réinitialiser la page lors d'un changement de filtre (sauf si on change la page)
    if (key !== 'page') {
      newFilters.page = '1';
    }

    // Supprimer les valeurs undefined
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k as keyof ProductFilters] === undefined) {
        delete newFilters[k as keyof ProductFilters];
      }
    });

    setFiltersState(newFilters);
    updateUrl(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, updateUrl, onFilterChange]);

  // Définir plusieurs filtres à la fois
  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const mergedFilters = { ...filters, ...newFilters };
    
    // Réinitialiser la page si on ne la définit pas explicitement
    if (!('page' in newFilters)) {
      mergedFilters.page = '1';
    }

    // Supprimer les valeurs undefined
    Object.keys(mergedFilters).forEach(k => {
      if (mergedFilters[k as keyof ProductFilters] === undefined) {
        delete mergedFilters[k as keyof ProductFilters];
      }
    });

    setFiltersState(mergedFilters);
    updateUrl(mergedFilters);
    onFilterChange?.(mergedFilters);
  }, [filters, updateUrl, onFilterChange]);

  // Toggle un filtre (ajouter/supprimer)
  const toggleFilter = useCallback((key: keyof ProductFilters, value: string) => {
    const currentValue = filters[key];
    setFilter(key, currentValue === value ? undefined : value);
  }, [filters, setFilter]);

  // Supprimer un filtre
  const clearFilter = useCallback((key: keyof ProductFilters) => {
    setFilter(key, undefined);
  }, [setFilter]);

  // Supprimer tous les filtres
  const clearAllFilters = useCallback(() => {
    const clearedFilters: ProductFilters = {
      sortBy: filters.sortBy || '-created_at',
      page: '1',
    };
    setFiltersState(clearedFilters);
    updateUrl(clearedFilters);
    onFilterChange?.(clearedFilters);
  }, [filters.sortBy, updateUrl, onFilterChange]);

  // Calculer les métriques des filtres actifs
  const { hasActiveFilters, activeFilterCount } = useMemo(() => {
    const filterableKeys: (keyof ProductFilters)[] = [
      'category', 'rite', 'obedience', 'degree', 'logeType',
      'search', 'minPrice', 'maxPrice', 'size', 'color', 'material',
      'showPromotions', 'showNew', 'inStockOnly'
    ];

    const activeFilters = filterableKeys.filter(key => 
      filters[key] && filters[key] !== ''
    );

    return {
      hasActiveFilters: activeFilters.length > 0,
      activeFilterCount: activeFilters.length,
    };
  }, [filters]);

  // Construire l'URL de l'API
  const buildApiUrl = useCallback((baseUrl = '/api/products') => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    buildApiUrl,
  };
}

export default useCatalogFilters;
