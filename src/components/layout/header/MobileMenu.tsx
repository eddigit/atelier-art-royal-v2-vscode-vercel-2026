'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Search, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Obedience, Rite, DegreeOrder } from './types';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    obediences: Obedience[];
    rites: Rite[];
    degrees: DegreeOrder[];
    darkMode?: boolean;
}

const PRODUCT_CATEGORIES = [
    { id: 'tabliers', label: 'Tabliers', icon: '👘' },
    { id: 'sautoirs', label: 'Sautoirs', icon: '🎗️' },
    { id: 'bijoux', label: 'Bijoux', icon: '✨' },
    { id: 'gants', label: 'Gants', icon: '🧤' },
    { id: 'accessoires', label: 'Accessoires', icon: '👜' },
];

export default function MobileMenu({
    isOpen,
    onClose,
    isLoading,
    obediences,
    rites,
    degrees,
    darkMode = false,
}: MobileMenuProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState<string | null>('obedience');

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
            onClose();
        }
    };

    // Grouper les degrés
    const blueDegrees = degrees.filter(d => d.loge_type === 'Loge Symbolique');
    const highDegrees = degrees.filter(d => d.loge_type === 'Loge Hauts Grades');

    // Theme values
    const bgMain = darkMode ? 'bg-[#0a0a0c]' : 'bg-[#FDFBF7]';
    const bgContent = darkMode ? 'bg-[#151518]' : 'bg-white';
    const textMain = darkMode ? 'text-white' : 'text-gray-800';
    const textMuted = darkMode ? 'text-white/60' : 'text-gray-500';
    const textMutedLight = darkMode ? 'text-white/40' : 'text-gray-400';
    const borderMain = darkMode ? 'border-white/10' : 'border-gray-200';
    const borderMuted = darkMode ? 'border-white/5' : 'border-gray-100';
    const inputBg = darkMode ? 'bg-white/5' : 'bg-gray-50';
    const cardBg = darkMode ? 'bg-white/5' : 'bg-white';
    const cardHover = darkMode ? 'hover:bg-[#C9A227]/10 hover:border-[#C9A227]' : 'hover:border-[#C9A227] hover:shadow-md';
    const footerBg = darkMode ? 'bg-[#151518]' : 'bg-gray-50';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className={`fixed inset-y-0 right-0 z-[101] w-full max-w-sm ${bgMain} shadow-2xl flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`flex-shrink-0 flex items-center justify-between p-4 border-b ${borderMain} ${bgContent}`}>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-[#C9A227]" />
                                <span className={`text-sm font-bold uppercase tracking-widest ${textMain}`}>
                                    Assistant Recherche
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 -mr-2 ${textMutedLight} hover:${textMain} transition-colors ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-full`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Search Bar */}
                            <div className={`p-5 ${bgContent} border-b ${borderMuted}`}>
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Que recherchez-vous ?"
                                        className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${borderMain} rounded-lg text-sm ${textMain} placeholder-${textMutedLight} focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all`}
                                    />
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMutedLight}`} />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#1B3A5F] text-white rounded-md">
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </form>
                            </div>

                            <div className="p-5 space-y-6">

                                {/* SECTION 1: OBÉDIENCE */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>
                                            1. Votre Obédience
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {isLoading ? (
                                            <div className={`col-span-2 text-center py-4 ${textMutedLight} text-sm`}>Chargement...</div>
                                        ) : (
                                            obediences.map((ob) => (
                                                <Link
                                                    key={ob._id}
                                                    href={`/catalog?obedience=${ob._id}`}
                                                    onClick={onClose}
                                                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border ${borderMain} ${cardBg} ${cardHover} transition-all`}
                                                >
                                                    {ob.image_url && (
                                                        <div className="w-8 h-8 relative grayscale group-hover:grayscale-0 transition-all duration-300">
                                                            <Image
                                                                src={ob.image_url}
                                                                alt={ob.code}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className={`text-[10px] font-bold ${darkMode ? 'text-white/70' : 'text-gray-600'} group-hover:text-[#C9A227]`}>
                                                        {ob.code}
                                                    </span>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className={`w-full h-px ${darkMode ? 'bg-white/5' : 'bg-gray-200/50'}`} />

                                {/* SECTION 2: GRADE */}
                                <div className="space-y-3">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>
                                        2. Votre Grade
                                    </h3>

                                    {/* Loges Bleues */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase text-[#1B3A5F] font-semibold mb-2">Loges Bleues</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {blueDegrees.length > 0 ? blueDegrees.map((degree) => (
                                                <Link
                                                    key={degree._id}
                                                    href={`/catalog?degree=${degree._id}`}
                                                    onClick={onClose}
                                                    className={`flex items-center justify-center p-2 text-center text-xs font-medium ${cardBg} border ${borderMain} rounded-lg hover:bg-[#1B3A5F] hover:text-white hover:border-[#1B3A5F] transition-all ${textMain}`}
                                                >
                                                    {degree.name}
                                                </Link>
                                            )) : (
                                                ['Apprenti', 'Compagnon', 'Maître'].map(name => (
                                                    <Link
                                                        key={name}
                                                        href={`/catalog?search=${name}`}
                                                        onClick={onClose}
                                                        className={`flex items-center justify-center p-2 text-center text-xs font-medium ${cardBg} border ${borderMain} rounded-lg hover:bg-[#1B3A5F] hover:text-white hover:border-[#1B3A5F] transition-all ${textMain}`}
                                                    >
                                                        {name}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Hauts Grades Toggle */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => toggleSection('hauts-grades')}
                                            className={`flex items-center justify-between w-full p-3 ${cardBg} border ${borderMain} rounded-lg hover:border-[#C9A227] transition-all group`}
                                        >
                                            <span className={`text-xs font-bold ${textMain} group-hover:text-[#C9A227] uppercase`}>
                                                Hauts Grades
                                            </span>
                                            <ChevronDown className={`w-4 h-4 ${textMutedLight} transition-transform ${activeSection === 'hauts-grades' ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {activeSection === 'hauts-grades' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        {highDegrees.map((d) => (
                                                            <Link
                                                                key={d._id}
                                                                href={`/catalog?degree=${d._id}`}
                                                                onClick={onClose}
                                                                className={`px-3 py-2 text-[10px] font-medium ${darkMode ? 'text-white/70 bg-white/5' : 'text-gray-600 bg-gray-50'} rounded hover:bg-[#C9A227] hover:text-white transition-colors truncate`}
                                                            >
                                                                {d.name}
                                                            </Link>
                                                        ))}
                                                        <Link
                                                            href="/catalog?logeType=Loge Hauts Grades"
                                                            onClick={onClose}
                                                            className="px-3 py-2 text-[10px] font-bold text-[#C9A227] bg-[#C9A227]/10 rounded hover:bg-[#C9A227] hover:text-white transition-colors text-center col-span-2"
                                                        >
                                                            Voir tous les hauts grades
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className={`w-full h-px ${darkMode ? 'bg-white/5' : 'bg-gray-200/50'}`} />

                                {/* SECTION 3: CATÉGORIES */}
                                <div className="space-y-3">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>
                                        3. Type de produit
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/catalog?category=${cat.id}`}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 p-3 ${cardBg} border ${borderMain} rounded-lg hover:border-[#C9A227] hover:shadow-sm group transition-all`}
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                                <span className={`text-xs font-bold ${textMain} group-hover:text-[#C9A227]`}>{cat.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className={`p-4 ${footerBg} border-t ${borderMain} space-y-3`}>
                            <Link href="/catalog" onClick={onClose}>
                                <button className="w-full py-3 bg-[#1B3A5F] text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-[#1B3A5F]/20 hover:bg-[#152e4d] hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    <span>Voir tout le catalogue</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <div className="flex items-center justify-center gap-4 pt-2">
                                <Link href="/auth/login" onClick={onClose} className={`text-[10px] font-semibold ${textMuted} hover:text-[#1B3A5F] uppercase tracking-wider`}>
                                    Mon Compte
                                </Link>
                                <span className={textMutedLight}>|</span>
                                <Link href="/contact" onClick={onClose} className={`text-[10px] font-semibold ${textMuted} hover:text-[#1B3A5F] uppercase tracking-wider`}>
                                    Aide & Contact
                                </Link>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
