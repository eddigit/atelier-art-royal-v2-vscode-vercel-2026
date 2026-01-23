'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

const defaultSortOptions: SortOption[] = [
  { value: '-created_at', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
  { value: '-name', label: 'Nom Z-A' },
  { value: 'featured', label: 'Produits vedettes' },
  { value: 'popular', label: 'Popularité' },
];

interface ProductSortProps {
  currentSort: string;
  onChange: (sort: string) => void;
  options?: SortOption[];
  className?: string;
}

export function ProductSort({
  currentSort,
  onChange,
  options = defaultSortOptions,
  className = '',
}: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = options.find(o => o.value === currentSort) || options[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-white/20 rounded-md bg-white/5 text-white hover:bg-white/10 transition-colors"
      >
        <span className="text-white/70">Trier par : </span>
        <span className="font-medium text-white">{currentOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 bg-[#0f0f12] border border-white/10 rounded-md shadow-lg z-20 min-w-[180px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                  option.value === currentSort ? 'bg-[#C5A059]/20 text-[#C5A059] font-medium' : 'text-white/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductSort;
