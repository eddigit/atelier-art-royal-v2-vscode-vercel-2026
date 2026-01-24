'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from './types';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_RESULTS_LIMIT = 6;
const POPULAR_SEARCHES = [
    'tablier maître',
    'REAA',
    'sautoir',
    'bijoux',
    '14e degré',
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            // Small delay to allow animation to start
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        if (query.length < SEARCH_MIN_LENGTH) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/products-v2?search=${encodeURIComponent(query)}&limit=${SEARCH_RESULTS_LIMIT}`
                );
                if (response.ok) {
                    const data = await response.json();
                    // Assuming API structure. Adjust if needed based on original file.
                    // Original: keys are products
                    setResults(data.products || []);
                }
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-2xl mx-4 bg-white rounded-xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-4 p-5 border-b border-gray-100 bg-white relative z-10"
                        >
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher un produit, un rite, une obédience..."
                                className="flex-1 text-lg outline-none bg-transparent text-gray-800 placeholder-gray-400 font-medium"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Results Area */}
                        <div className="bg-gray-50/50 min-h-[100px]">
                            {query.length >= SEARCH_MIN_LENGTH ? (
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {isSearching ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mb-2 opacity-50" />
                                            <span className="text-sm">Recherche en cours...</span>
                                        </div>
                                    ) : results.length > 0 ? (
                                        <div className="py-2">
                                            {results.map((product) => (
                                                <Link
                                                    key={product._id}
                                                    href={`/product/${product.slug || product._id}`}
                                                    className="flex items-center gap-4 px-6 py-3 hover:bg-white hover:shadow-sm transition-all group"
                                                    onClick={onClose}
                                                >
                                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-[#C9A227]/30 transition-colors">
                                                        {product.images?.[0] ? (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt=""
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-lg opacity-50">⚖️</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800 truncate group-hover:text-[#C9A227] transition-colors">{product.name}</p>
                                                        <p className="text-sm font-semibold text-[#C9A227]">
                                                            {product.price?.toFixed(2)} €
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400">
                                                        →
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link
                                                href={`/catalog?search=${encodeURIComponent(query)}`}
                                                className="block p-4 text-center text-[#C9A227] text-sm font-semibold hover:underline mt-2 border-t border-gray-100"
                                                onClick={onClose}
                                            >
                                                Voir tous les résultats
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 px-6">
                                            <p className="text-gray-500">Aucun produit trouvé pour "<span className="font-semibold text-gray-700">{query}</span>"</p>
                                            <p className="text-sm text-gray-400 mt-1">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6">
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
                                        Recherches populaires
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {POPULAR_SEARCHES.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => setQuery(term)}
                                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#C9A227] hover:text-[#C9A227] hover:shadow-sm transition-all"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
