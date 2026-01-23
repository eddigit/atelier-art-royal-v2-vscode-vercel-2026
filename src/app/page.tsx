import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, Calendar } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Rite from '@/models/Rite';
import Obedience from '@/models/Obedience';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

async function getFeaturedProducts() {
  await dbConnect();
  const products = await Product.find({ is_active: true, featured: true })
    .limit(6)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({ is_active: true })
    .sort({ order: 1 })
    .limit(6)
    .lean();
  return JSON.parse(JSON.stringify(categories));
}

async function getRites() {
  await dbConnect();
  const rites = await Rite.find({ is_active: true })
    .sort({ order: 1 })
    .limit(6)
    .lean();
  return JSON.parse(JSON.stringify(rites));
}

async function getObediences() {
  await dbConnect();
  const obediences = await Obedience.find({ is_active: true })
    .sort({ order: 1 })
    .lean();
  return JSON.parse(JSON.stringify(obediences));
}

export default async function HomePage() {
  const [featuredProducts, categories, rites, obediences] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getRites(),
    getObediences(),
  ]);

  return (
    <main className="relative flex flex-col w-full overflow-x-hidden bg-[#0a0a0c]">
      {/* Header Dark avec Mega Menu */}
      <LuxeHeaderDark />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/60 via-[#0a0a0c]/20 to-[#0a0a0c] z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
          >
            <source 
              src="https://res.cloudinary.com/dniurvpzd/video/upload/v1769189992/e5d81045-77ca-4cda-8782-a9dd6e64963a_zqlqjj.mp4" 
              type="video/mp4" 
            />
          </video>
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <h4 className="text-[#C5A059] text-xs font-bold tracking-[0.5em] uppercase mb-6">
            La Haute Couture Franc-Maçonnique
          </h4>
          <h2 className="text-white text-5xl md:text-7xl font-extralight tracking-tight leading-tight mb-8">
            L&apos;Art de l&apos;Exception
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Vêtements et décors maçonniques de haute facture, brodés à la main dans la plus pure tradition artisanale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <button className="px-10 py-4 bg-[#C5A059] text-black text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#C5A059]/90 transition-all shadow-xl shadow-[#C5A059]/20">
                Entrer dans l&apos;Atelier
              </button>
            </Link>
            <Link href="/catalog">
              <button className="px-10 py-4 border border-white/20 text-white text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                Découvrir la Collection
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INTRODUCTION SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-20 bg-[#0a0a0c]">
        <div className="max-w-5xl mx-auto text-center">
          <svg className="w-12 h-12 text-[#C5A059] mx-auto mb-6" fill="currentColor" viewBox="0 0 48 48">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
          </svg>
          <h3 className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-8">Notre Savoir-Faire</h3>
          <p className="text-white/60 text-2xl md:text-3xl font-extralight leading-relaxed mb-12">
            Chaque pièce est une œuvre unique, alliant la <span className="text-white font-normal">précision du geste</span> à la noblesse des matériaux. Soie, velours et fils d&apos;or s&apos;unissent pour magnifier votre engagement.
          </p>
          <div className="w-24 h-px bg-[#C5A059]/30 mx-auto"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GRID SHOWCASE - Collections
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-20 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Collection Tabliers */}
            <Link href="/collections/tabliers" className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-900">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(10,10,12,0.9), transparent), url('https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/6f70ee0da_Tablier-Venerable-maitre-Installe-rite-Emulation-VM-VMI-Atelier-Art-Royal-EMUTMI5PE.jpg')`
                }}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h4 className="text-white text-2xl font-light mb-2">Tabliers d&apos;Excellence</h4>
                <p className="text-white/50 text-sm tracking-widest uppercase mb-4">Pièces de Maître</p>
                <span className="text-[#C5A059] text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Collection Sautoirs */}
            <Link href="/collections/sautoirs" className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-900 md:mt-12">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(10,10,12,0.9), transparent), url('https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/9e11b2930_Tablier-Maitre-rite-Emulation-M-Atelier-Art-Royal-EMUTM13PE.jpg')`
                }}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h4 className="text-white text-2xl font-light mb-2">Sautoirs de Loge</h4>
                <p className="text-white/50 text-sm tracking-widest uppercase mb-4">Décors de Dignitaires</p>
                <span className="text-[#C5A059] text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Collection Hauts Grades */}
            <Link href="/catalog?category=hauts-grades" className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-900">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(10,10,12,0.9), transparent), url('https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/6f70ee0da_Tablier-Venerable-maitre-Installe-rite-Emulation-VM-VMI-Atelier-Art-Royal-EMUTMI5PE.jpg')`
                }}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h4 className="text-white text-2xl font-light mb-2">Hauts Grades</h4>
                <p className="text-white/50 text-sm tracking-widest uppercase mb-4">Rites et Traditions</p>
                <span className="text-[#C5A059] text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION OBÉDIENCES
      ═══════════════════════════════════════════════════════════════════ */}
      {obediences.length > 0 && (
        <section className="py-20 px-6 md:px-20 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#C5A059] text-xs font-bold tracking-[0.3em] uppercase mb-4">Votre Obédience</p>
              <h2 className="text-white text-4xl md:text-5xl font-extralight tracking-tight">Sélectionnez votre Obédience</h2>
              <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto">
                Découvrez les décors et ornements spécifiques à votre obédience. Chaque création respecte les traditions et les exigences de votre maison.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {obediences.map((obedience: any) => (
                <Link
                  key={obedience._id}
                  href={`/catalog?obedience=${obedience._id}`}
                  className="group flex flex-col items-center bg-white/[0.03] border border-white/10 rounded-xl p-6 transition-all duration-300 hover:bg-[#C5A059]/10 hover:border-[#C5A059] hover:-translate-y-1"
                >
                  <div className="w-24 h-24 bg-[#151518] border-2 border-white/10 rounded-full overflow-hidden flex items-center justify-center mb-4 transition-all duration-300 group-hover:border-[#C5A059] group-hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]">
                    {obedience.image_url ? (
                      <Image
                        src={obedience.image_url}
                        alt={obedience.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[#C5A059]">{obedience.code}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-[#C5A059] font-semibold text-sm tracking-wider uppercase">{obedience.code}</h3>
                    <p className="text-white/50 text-xs mt-1">{obedience.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION RITES
      ═══════════════════════════════════════════════════════════════════ */}
      {rites.length > 0 && (
        <section className="py-20 px-6 md:px-20 bg-[#0f0f12]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#C5A059] text-xs font-bold tracking-[0.3em] uppercase mb-4">Votre Rite</p>
              <h2 className="text-white text-4xl md:text-5xl font-extralight tracking-tight">Sélectionnez votre Rite</h2>
              <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto">
                Chaque rite possède ses propres symboles et décors. Trouvez les créations adaptées à votre pratique.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {rites.map((rite: any) => (
                <Link
                  key={rite._id}
                  href={`/catalog?rite=${rite._id}`}
                  className="group flex flex-col items-center bg-white/[0.03] border border-white/10 rounded-xl p-5 transition-all duration-300 hover:bg-[#C5A059]/10 hover:border-[#C5A059] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(197,160,89,0.2)]"
                >
                  <div className="w-20 h-20 bg-[#151518] rounded-full overflow-hidden flex items-center justify-center mb-3 transition-all duration-300 border-2 border-white/10 group-hover:border-[#C5A059] group-hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]">
                    {rite.image_url ? (
                      <Image
                        src={rite.image_url}
                        alt={rite.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-xl font-bold text-[#C5A059]">{rite.code}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-[#C5A059] group-hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors">{rite.code}</h3>
                    <p className="text-white/40 text-[0.65rem] mt-1">{rite.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          BESPOKE CTA - Sur Mesure
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-20 bg-[#0f0f12] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 100 100">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h3 className="text-[#C5A059] text-xs font-bold tracking-[0.4em] uppercase">Service Exclusif</h3>
            <h2 className="text-white text-4xl md:text-5xl font-extralight tracking-tight">Le Sur-Mesure Royal</h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
              Votre parcours est unique. Nos maîtres tailleurs et brodeuses collaborent avec vous pour créer des pièces qui incarnent parfaitement votre identité et vos fonctions. De la sélection des soies à la personnalisation des motifs.
            </p>
            <Link href="/contact" className="group inline-flex items-center gap-4 text-white font-bold tracking-widest uppercase text-sm border-b-2 border-[#C5A059] pb-2 hover:text-[#C5A059] transition-all">
              Prendre rendez-vous 
              <Calendar className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[400px] object-cover"
              >
                <source 
                  src="https://res.cloudinary.com/dniurvpzd/video/upload/v1769188699/Montrer_une_broderie_1080p_202601231816_nxmip4.mp4" 
                  type="video/mp4" 
                />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA CONTACT
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-20 bg-[#0a0a0c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] border border-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-[#C5A059] text-xs font-bold tracking-[0.3em] uppercase mb-4">Création Sur Mesure</p>
          <h2 className="text-white text-4xl md:text-5xl font-extralight tracking-tight mb-6">
            Donnez Vie à <em className="not-italic text-[#C5A059]">Votre Vision</em>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Vous avez un projet spécifique ? Notre équipe vous accompagne de la conception à la réalisation pour créer des pièces uniques.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/sur-mesure">
              <button className="px-10 py-4 bg-[#C5A059] text-white text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#C5A059]/90 transition-all shadow-xl shadow-[#C5A059]/20 inline-flex items-center gap-2">
                Démarrer un projet
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a 
              href="tel:+33646683610" 
              className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="text-lg font-light">+33 6 46 68 36 10</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Dark avec tous les liens */}
      <LuxeFooterDark />
    </main>
  );
}
