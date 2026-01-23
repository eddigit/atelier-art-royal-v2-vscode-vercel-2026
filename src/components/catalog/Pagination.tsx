'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
  onPageChange?: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const handleClick = (page: number, e?: React.MouseEvent) => {
    if (onPageChange) {
      e?.preventDefault();
      onPageChange(page);
    }
  };

  // Calculer les pages à afficher
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Toujours montrer la première page
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Toujours montrer la dernière page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Bouton Précédent */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          onClick={(e) => handleClick(currentPage - 1, e)}
          className="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white/40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      {/* Numéros de page */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-2 text-white/50">
                  ...
                </span>
              );
            }

            return page === currentPage ? (
              <span
                key={page}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#C5A059] text-white"
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={buildUrl(page)}
                onClick={(e) => handleClick(page, e)}
                className="px-4 py-2 text-sm rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                {page}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bouton Suivant */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          onClick={(e) => handleClick(currentPage + 1, e)}
          className="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white/40 cursor-not-allowed">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

export default Pagination;
