import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Scissors, Award, Clock, Phone } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Rite from '@/models/Rite';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';

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

export default async function HomePage() {
  const [featuredProducts, categories, rites] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getRites(),
  ]);

  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER LUXE
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="header-luxe">
        <div className="header-luxe__inner">
          {/* Logo */}
          <Link href="/" className="header-luxe__brand">
            <Image
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
              alt="Atelier Art Royal"
              width={180}
              height={50}
              className="header-luxe__logo"
              priority
            />
          </Link>

          {/* Séparateur + Drapeau */}
          <div className="header-luxe__separator" />
          <span className="header-luxe__flag" role="img" aria-label="Drapeau français" />
          
          {/* Navigation */}
          <nav className="header-luxe__nav">
            <Link href="/maison" className="header-luxe__link">La Maison</Link>
            <Link href="/catalog" className="header-luxe__link">Collections</Link>
            <Link href="/sur-mesure" className="header-luxe__link">Sur Mesure</Link>
            <Link href="/savoir-faire" className="header-luxe__link">Savoir-Faire</Link>
            <Link href="/contact" className="header-luxe__link">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="header-luxe__actions">
            <Link href="/contact" className="hidden lg:block">
              <button className="btn-luxe btn-luxe--outline">Rendez-vous</button>
            </Link>
            <Link href="/auth/login">
              <button className="btn-luxe btn-luxe--primary">Espace Client</button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO LUXE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="hero-luxe">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-luxe__video"
        >
          <source 
            src="https://res.cloudinary.com/dkvhbcuaz/video/upload/background_hero_video_raji06.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="hero-luxe__overlay" />
        
        <div className="hero-luxe__content">
          <p className="hero-luxe__eyebrow">
            Haute Couture Maçonnique Française
          </p>
          
          <h1 className="hero-luxe__title">
            L&apos;Excellence du<br />
            <em>Fait Main</em>
          </h1>
          
          <p className="hero-luxe__subtitle">
            Depuis notre atelier français, nous perpétuons l&apos;art ancestral 
            de la broderie maçonnique. Chaque création est une œuvre unique.
          </p>
          
          <div className="hero-luxe__cta">
            <Link href="/catalog">
              <button className="btn-luxe btn-luxe--gold">
                Découvrir les Collections
              </button>
            </Link>
            <Link href="/sur-mesure">
              <button className="btn-luxe btn-luxe--white">
                Création Sur Mesure
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-luxe__scroll">
          <span>Découvrir</span>
          <div className="hero-luxe__scroll-line" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION MANIFESTE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-luxe section-luxe--ivory">
        <div className="container-luxe">
          <div className="max-w-3xl mx-auto text-center">
            <div className="ornament">
              <div className="ornament__line" />
              <Sparkles className="ornament__icon w-5 h-5" />
              <div className="ornament__line" />
            </div>
            
            <h2 className="heading-xl mb-8">
              La Haute Couture au service <br />
              <em>de la Tradition</em>
            </h2>
            
            <p className="text-body mb-6">
              L&apos;Atelier Art Royal incarne l&apos;excellence de l&apos;artisanat français 
              au service de la franc-maçonnerie. Chaque tablier, chaque sautoir, chaque décor 
              est le fruit d&apos;un savoir-faire transmis de génération en génération.
            </p>
            
            <p className="text-muted">
              Nous créons des pièces uniques qui honorent les traditions 
              tout en embrassant une esthétique contemporaine.
            </p>

            <Link href="/maison" className="btn-luxe btn-luxe--ghost inline-flex items-center gap-2 mt-10">
              Découvrir notre histoire
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION COLLECTIONS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-luxe section-luxe--dark">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <p className="eyebrow">Nos Créations</p>
            <h2 className="heading-xl text-white">Collections Signature</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Collection Tabliers */}
            <Link href="/collections/tabliers" className="collection-card group">
              <div className="collection-card__image">
                <Image
                  src="https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/6f70ee0da_Tablier-Venerable-maitre-Installe-rite-Emulation-VM-VMI-Atelier-Art-Royal-EMUTMI5PE.jpg"
                  alt="Collection Tabliers"
                  width={600}
                  height={800}
                />
              </div>
              <div className="collection-card__overlay" />
              <div className="collection-card__content">
                <p className="collection-card__eyebrow">Collection</p>
                <h3 className="collection-card__title">Tabliers</h3>
                <p className="collection-card__desc">
                  Cuir sélectionné, broderie main, finitions d&apos;exception
                </p>
                <span className="collection-card__link">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Collection Sautoirs */}
            <Link href="/collections/sautoirs" className="collection-card group">
              <div className="collection-card__image">
                <Image
                  src="https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/9e11b2930_Tablier-Maitre-rite-Emulation-M-Atelier-Art-Royal-EMUTM13PE.jpg"
                  alt="Collection Sautoirs"
                  width={600}
                  height={800}
                />
              </div>
              <div className="collection-card__overlay" />
              <div className="collection-card__content">
                <p className="collection-card__eyebrow">Collection</p>
                <h3 className="collection-card__title">Sautoirs</h3>
                <p className="collection-card__desc">
                  Velours de Lyon, moiré, broderie or et argent
                </p>
                <span className="collection-card__link">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Collection Bijoux */}
            <Link href="/collections/bijoux" className="collection-card group">
              <div className="collection-card__image">
                <Image
                  src="https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/6f70ee0da_Tablier-Venerable-maitre-Installe-rite-Emulation-VM-VMI-Atelier-Art-Royal-EMUTMI5PE.jpg"
                  alt="Collection Bijoux"
                  width={600}
                  height={800}
                />
              </div>
              <div className="collection-card__overlay" />
              <div className="collection-card__content">
                <p className="collection-card__eyebrow">Collection</p>
                <h3 className="collection-card__title">Bijoux & Décors</h3>
                <p className="collection-card__desc">
                  Métal doré, émaux, pierres précieuses
                </p>
                <span className="collection-card__link">
                  Explorer <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-14">
            <Link href="/catalog">
              <button className="btn-luxe btn-luxe--outline">
                Voir toutes les collections
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION SAVOIR-FAIRE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-luxe section-luxe--cream">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow">Notre Savoir-Faire</p>
              <h2 className="heading-xl mb-8">
                L&apos;Art de la <em>Broderie Main</em>
              </h2>
              
              <div className="space-y-6">
                <p className="text-body">
                  Chaque pièce qui sort de notre atelier est le résultat de dizaines d&apos;heures 
                  de travail minutieux. Nos artisans maîtrisent les techniques ancestrales 
                  de broderie au fil d&apos;or et d&apos;argent.
                </p>
                <p className="text-muted">
                  Du choix des matières premières – cuirs sélectionnés, velours de Lyon, 
                  fils précieux – jusqu&apos;à la dernière finition, nous veillons à l&apos;excellence.
                </p>
              </div>

              <div className="feature-grid mt-12">
                <div className="feature-item">
                  <div className="feature-item__icon">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <h4 className="feature-item__title">Fait Main</h4>
                  <p className="feature-item__desc">100% artisanal</p>
                </div>
                <div className="feature-item">
                  <div className="feature-item__icon">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="feature-item__title">Made in France</h4>
                  <p className="feature-item__desc">Atelier français</p>
                </div>
                <div className="feature-item">
                  <div className="feature-item__icon">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="feature-item__title">4-6 Semaines</h4>
                  <p className="feature-item__desc">Délai création</p>
                </div>
                <div className="feature-item">
                  <div className="feature-item__icon">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="feature-item__title">Sur Mesure</h4>
                  <p className="feature-item__desc">Personnalisation</p>
                </div>
              </div>

              <Link href="/savoir-faire">
                <button className="btn-luxe btn-luxe--primary mt-10">
                  Découvrir notre atelier
                  <ArrowRight className="ml-2 w-4 h-4 inline" />
                </button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-[#E8E6E1]">
                <Image
                  src="https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/6f70ee0da_Tablier-Venerable-maitre-Installe-rite-Emulation-VM-VMI-Atelier-Art-Royal-EMUTMI5PE.jpg"
                  alt="Savoir-faire Atelier Art Royal"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#C9A227] text-white p-8">
                <p className="text-4xl font-light mb-1">+500</p>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase">Créations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION RITES
      ═══════════════════════════════════════════════════════════════════ */}
      {rites.length > 0 && (
        <section className="section-luxe section-luxe--ivory">
          <div className="container-luxe">
            <div className="text-center mb-12">
              <p className="eyebrow">Tous les Rites</p>
              <h2 className="heading-xl">Trouvez vos Décors</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {rites.map((rite: any) => (
                <Link
                  key={rite._id}
                  href={`/catalog?rite=${rite._id}`}
                  className="btn-luxe btn-luxe--outline"
                >
                  {rite.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION CTA SUR MESURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-luxe section-luxe--dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] border border-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container-luxe relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="eyebrow">Création Sur Mesure</p>
            <h2 className="heading-xl text-white mb-6">
              Donnez Vie à <em>Votre Vision</em>
            </h2>
            <p className="text-body text-[rgba(255,255,255,0.6)] mb-10 max-w-xl mx-auto">
              Vous avez un projet spécifique ? Notre équipe vous accompagne 
              de la conception à la réalisation pour créer des pièces uniques.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/sur-mesure">
                <button className="btn-luxe btn-luxe--gold">
                  Démarrer un projet
                  <ArrowRight className="ml-2 w-4 h-4 inline" />
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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER LUXE
      ═══════════════════════════════════════════════════════════════════ */}
      <LuxeFooter />
    </main>
  );
}
