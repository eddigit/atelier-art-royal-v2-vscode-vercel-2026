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
        className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 transition-colors"
      >
        <span>Trier par : </span>
        <span className="font-medium">{currentOption.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-20 min-w-[180px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  option.value === currentSort ? 'bg-gold-50 text-gold-700 font-medium' : ''
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
