'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Obedience, Rite, DegreeOrder } from './types';
import { useEffect, useMemo, useState } from 'react';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isLoading: boolean;
    obediences: Obedience[];
    rites: Rite[];
    degrees: DegreeOrder[];
}

const PRODUCT_CATEGORIES = [
    { href: '/catalog?category=tabliers', label: 'Tabliers' },
    { href: '/catalog?category=cordons', label: 'Cordons & Sautoirs' },
    { href: '/catalog?category=bijoux', label: 'Bijoux' },
    { href: '/catalog?category=accessoires', label: 'Accessoires' },
    { href: '/catalog?category=gants', label: 'Gants' },
];

export default function MegaMenu({
    isOpen,
    onClose,
    onMouseEnter,
    onMouseLeave,
    isLoading,
    obediences,
    rites,
    degrees,
}: MegaMenuProps) {
    const logesSymboliques = useMemo(
        () => degrees.filter((d) => d.loge_type === 'Loge Symbolique'),
        [degrees]
    );
    const hautsGrades = useMemo(
        () => degrees.filter((d) => d.loge_type === 'Loge Hauts Grades'),
        [degrees]
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ originY: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[900px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-b-2xl overflow-hidden z-50 mt-2"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <div className="grid grid-cols-4 gap-0 p-8 relative">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-[#C9A227]/5 to-transparent -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Obédiences */}
                        <div className="pr-6 border-r border-gray-100">
                            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#C9A227] mb-4 pb-2 border-b border-[#C9A227]/20 flex items-center justify-between">
                                <span>Par Obédience</span>
                                <span className="text-[9px] text-gray-400 font-normal normal-case">Sélection</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {isLoading ? (
                                    <p className="text-xs text-gray-400 col-span-2">Chargement...</p>
                                ) : obediences.length > 0 ? (
                                    obediences.map((ob) => (
                                        <Link
                                            key={ob._id}
                                            href={`/catalog?obedience=${ob._id}`}
                                            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gradient-to-br hover:from-[#C9A227]/5 hover:to-transparent transition-all border border-transparent hover:border-[#C9A227]/10"
                                            onClick={onClose}
                                        >
                                            {ob.image_url && (
                                                <div className="p-1 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                                    <Image
                                                        src={ob.image_url}
                                                        alt=""
                                                        width={24}
                                                        height={24}
                                                        className="w-5 h-5 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-[11px] font-medium tracking-wide text-gray-700 group-hover:text-[#C9A227] transition-colors">
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
                        <div className="px-6 border-r border-gray-100">
                            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#C9A227] mb-4 pb-2 border-b border-[#C9A227]/20">
                                Par Rite
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {isLoading ? (
                                    <p className="text-xs text-gray-400">Chargement...</p>
                                ) : rites.length > 0 ? (
                                    rites.slice(0, 8).map((rite) => (
                                        <Link
                                            key={rite._id}
                                            href={`/catalog?rite=${rite._id}`}
                                            className="group flex items-center justify-between text-xs text-gray-600 hover:text-[#C9A227] hover:pl-1 transition-all py-1"
                                            onClick={onClose}
                                        >
                                            <span>{rite.name}</span>
                                            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C9A227]">→</span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400">Aucun rite</p>
                                )}
                            </div>
                        </div>

                        {/* Degrés */}
                        <div className="px-6 border-r border-gray-100">
                            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#1B3A5F] mb-4 pb-2 border-b border-[#1B3A5F]/10">
                                Loges Bleues
                            </h3>
                            <div className="flex flex-col gap-1.5 mb-6">
                                {logesSymboliques.length > 0 ? (
                                    logesSymboliques.map((degree) => (
                                        <Link
                                            key={degree._id}
                                            href={`/catalog?degree=${degree._id}`}
                                            className="text-xs text-gray-600 hover:text-[#1B3A5F] font-medium transition-colors py-0.5"
                                            onClick={onClose}
                                        >
                                            {degree.name}
                                        </Link>
                                    ))
                                ) : (
                                    <>
                                        <Link href="/catalog?logeType=Loge Symbolique" className="text-xs text-gray-600 hover:text-[#1B3A5F] py-0.5" onClick={onClose}>Apprenti (1°)</Link>
                                        <Link href="/catalog?logeType=Loge Symbolique" className="text-xs text-gray-600 hover:text-[#1B3A5F] py-0.5" onClick={onClose}>Compagnon (2°)</Link>
                                        <Link href="/catalog?logeType=Loge Symbolique" className="text-xs text-gray-600 hover:text-[#1B3A5F] py-0.5" onClick={onClose}>Maître (3°)</Link>
                                    </>
                                )}
                            </div>

                            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#C9A227] mb-4 pb-2 border-b border-[#C9A227]/20">
                                Hauts Grades
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {hautsGrades.length > 0 ? (
                                    hautsGrades.slice(0, 5).map((degree) => (
                                        <Link
                                            key={degree._id}
                                            href={`/catalog?degree=${degree._id}`}
                                            className="text-xs text-gray-600 hover:text-[#C9A227] transition-colors py-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                                            onClick={onClose}
                                        >
                                            {degree.name}
                                        </Link>
                                    ))
                                ) : (
                                    <Link href="/catalog?logeType=Loge Hauts Grades" className="text-xs text-gray-600 hover:text-[#C9A227] py-0.5" onClick={onClose}>
                                        Voir les Hauts Grades
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Catégories */}
                        <div className="pl-6 bg-gray-50/50 -my-8 -mr-8 p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                    Collections
                                </h3>
                                <div className="space-y-3">
                                    {PRODUCT_CATEGORIES.map((cat) => (
                                        <Link
                                            key={cat.href}
                                            href={cat.href}
                                            className="block text-xs font-medium text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-transform"
                                            onClick={onClose}
                                        >
                                            {cat.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/equiper-ma-loge"
                                className="mt-6 flex flex-col gap-2 p-3 bg-[#1B3A5F] text-white rounded-lg hover:bg-[#152e4d] transition-colors group text-center"
                                onClick={onClose}
                            >
                                <span className="text-[10px] uppercase tracking-wider opacity-80">Offre Loge</span>
                                <span className="text-xs font-semibold">Équiper ma Loge →</span>
                            </Link>
                        </div>
                    </div>

                    {/* Footer Mega Menu */}
                    <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Atelier Art Royal</span>
                        <Link
                            href="/catalog"
                            className="text-xs font-semibold text-[#C9A227] hover:text-[#1B3A5F] transition-colors flex items-center gap-2 group"
                            onClick={onClose}
                        >
                            Voir catalogue complet
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
