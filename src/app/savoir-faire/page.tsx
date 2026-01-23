'use client'

import Link from 'next/link'
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark'
import LuxeFooterDark from '@/components/layout/LuxeFooterDark'
import { 
  Sparkles, 
  Hand, 
  Users, 
  Gem, 
  Palette, 
  Scissors, 
  Layers, 
  CheckCircle2,
  Crown,
  Star,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react'

export default function SavoirFairePage() {
  const highlights = [
    { icon: Sparkles, label: "Broderie d'Or", value: "Fil précieux" },
    { icon: Hand, label: "Fait Main", value: "100% artisanal" },
    { icon: Users, label: "Artisans Experts", value: "Depuis 1920" },
    { icon: Gem, label: "Matériaux Nobles", value: "Sélection rigoureuse" },
  ]

  const steps = [
    {
      number: "01",
      title: "Conception",
      description: "Nos maîtres artisans créent des dessins originaux respectant les symboles et traditions maçonniques. Chaque motif est étudié pour garantir une parfaite harmonie visuelle et symbolique."
    },
    {
      number: "02",
      title: "Sélection des Matériaux",
      description: "Nous sélectionnons les plus beaux velours de Lyon, les soies naturelles les plus fines et les fils d'or et d'argent de la plus haute qualité pour chaque création."
    },
    {
      number: "03",
      title: "Broderie",
      description: "Nos brodeuses d'art réalisent chaque motif à la main, point par point, perpétuant des techniques ancestrales transmises de génération en génération."
    },
    {
      number: "04",
      title: "Assemblage",
      description: "Les différents éléments sont assemblés avec une précision minutieuse. Chaque couture, chaque finition fait l'objet d'une attention particulière."
    },
    {
      number: "05",
      title: "Contrôle Qualité",
      description: "Avant livraison, chaque pièce est soigneusement inspectée pour garantir qu'elle répond à nos exigences d'excellence et aux attentes de nos clients."
    }
  ]

  const techniques = [
    {
      icon: Crown,
      title: "Broderie au Fil d'Or",
      description: "La broderie au fil d'or est l'art le plus noble de notre métier. Nous utilisons du fil d'or véritable, gainé sur âme de soie, pour créer des motifs d'une brillance exceptionnelle. Cette technique ancestrale requiert des années de pratique pour être maîtrisée."
    },
    {
      icon: Star,
      title: "Broderie au Passé Plat",
      description: "Le passé plat est une technique de broderie traditionnelle où les points sont posés côte à côte pour créer des surfaces lisses et régulières. Cette méthode permet de réaliser des dégradés subtils et des effets de volume remarquables."
    },
    {
      icon: Zap,
      title: "Cannetille et Paillettes",
      description: "La cannetille, fil métallique en spirale, et les paillettes apportent relief et éclat aux broderies. Ces éléments sont cousus un à un, créant des textures riches et des jeux de lumière uniques sur chaque décor."
    }
  ]

  const materials = [
    {
      title: "Soies Naturelles",
      description: "Importées des meilleures manufactures, nos soies offrent un toucher incomparable et une tenue parfaite dans le temps.",
      origin: "France, Italie"
    },
    {
      title: "Velours de Lyon",
      description: "Le velours lyonnais est reconnu mondialement pour sa qualité exceptionnelle. Sa densité et son éclat en font le support idéal pour nos broderies.",
      origin: "Lyon, France"
    },
    {
      title: "Fils d'Or et d'Argent",
      description: "Nos fils précieux sont fabriqués selon des méthodes traditionnelles, avec un placage d'or ou d'argent véritable sur âme textile.",
      origin: "France, Japon"
    },
    {
      title: "Cuirs Fins",
      description: "Pour nos tabliers et accessoires, nous sélectionnons des cuirs d'agneau et de chevreau d'une souplesse et d'une finesse remarquables.",
      origin: "France, Espagne"
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#C4A052]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#C4A052]/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C4A052]/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-[#C4A052]" />
            <span className="text-sm text-white/70 tracking-wider uppercase">Artisanat d'Excellence</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6">
            Notre{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C4A052] via-[#E8D5A3] to-[#C4A052]">
                Savoir-Faire
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4A052]/50 to-transparent" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-16 leading-relaxed">
            Depuis plus d'un siècle, nos maîtres artisans perpétuent les techniques ancestrales 
            de la broderie d'art pour créer des décors maçonniques d'exception.
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {highlights.map((item, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#C4A052]/30 transition-all duration-500 hover:bg-white/[0.04]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#C4A052]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <item.icon className="w-8 h-8 text-[#C4A052] mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">{item.label}</h3>
                  <p className="text-white/50 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Le Métier Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4A052]/10 border border-[#C4A052]/20 mb-6">
                <span className="text-xs text-[#C4A052] tracking-wider uppercase">Notre Métier</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
                L'Art de la{' '}
                <span className="text-[#C4A052]">Broderie Maçonnique</span>
              </h2>
              
              <div className="space-y-6 text-white/60 leading-relaxed">
                <p>
                  La broderie d'or et d'argent est un art ancestral qui trouve ses lettres de noblesse 
                  dans la confection des décors maçonniques. Chaque pièce que nous réalisons est le 
                  fruit d'un savoir-faire transmis de génération en génération, alliant précision 
                  technique et sensibilité artistique.
                </p>
                <p>
                  Nos artisans, formés pendant plusieurs années aux techniques traditionnelles, 
                  maîtrisent l'ensemble des points de broderie nécessaires à la réalisation de 
                  décors d'exception : le passé empiétant, le point de Boulogne, la pose de 
                  cannetille, le travail de la paillette.
                </p>
                <p>
                  Chaque décor est une œuvre unique, réalisée entièrement à la main dans notre 
                  atelier français. De la conception du dessin à la finition des bordures, nous 
                  apportons le même soin et la même exigence à chaque étape de fabrication.
                </p>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#0f0f12] to-[#0a0a0c] border border-white/10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C4A052]/10 flex items-center justify-center">
                      <Hand className="w-12 h-12 text-[#C4A052]" />
                    </div>
                    <p className="text-white/40 text-sm">Image d'illustration</p>
                    <p className="text-white/30 text-xs mt-1">Broderie artisanale en cours</p>
                  </div>
                </div>
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-[#C4A052]/30 rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#C4A052]/30 rounded-br-lg" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-[#0f0f12] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#C4A052]/10 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-[#C4A052]" />
                  </div>
                  <div>
                    <p className="text-2xl font-light text-white">100+</p>
                    <p className="text-white/50 text-sm">Années d'expertise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les Étapes de Création Section */}
      <section className="py-32 relative bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4A052]/10 border border-[#C4A052]/20 mb-6">
              <Layers className="w-4 h-4 text-[#C4A052]" />
              <span className="text-xs text-[#C4A052] tracking-wider uppercase">Processus</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Le Processus de{' '}
              <span className="text-[#C4A052]">Création</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              De la conception à la livraison, chaque étape de fabrication est réalisée 
              avec le plus grand soin dans notre atelier français.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#C4A052]/50 via-[#C4A052]/30 to-[#C4A052]/10 md:-translate-x-1/2" />

            <div className="space-y-12 md:space-y-24">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`relative flex items-start gap-8 md:gap-16 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ml-20 md:ml-0 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`inline-block ${index % 2 === 0 ? 'md:float-right' : ''}`}>
                      <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#C4A052]/30 transition-all duration-500 max-w-lg">
                        <span className="text-6xl font-extralight text-[#C4A052]/20 group-hover:text-[#C4A052]/40 transition-colors">
                          {step.number}
                        </span>
                        <h3 className="text-2xl font-light text-white mt-4 mb-3">{step.title}</h3>
                        <p className="text-white/60 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#C4A052] ring-4 ring-[#0f0f12] ring-offset-0" />

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos Techniques Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4A052]/10 border border-[#C4A052]/20 mb-6">
              <Palette className="w-4 h-4 text-[#C4A052]" />
              <span className="text-xs text-[#C4A052] tracking-wider uppercase">Techniques</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Nos{' '}
              <span className="text-[#C4A052]">Techniques</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Maîtriser l'art de la broderie d'or requiert des années de pratique 
              et une connaissance approfondie des techniques traditionnelles.
            </p>
          </div>

          {/* Techniques Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {techniques.map((technique, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-[#C4A052]/30 transition-all duration-500"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#C4A052]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-[#C4A052]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <technique.icon className="w-8 h-8 text-[#C4A052]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium text-white mb-4">{technique.title}</h3>

                  {/* Description */}
                  <p className="text-white/60 leading-relaxed">{technique.description}</p>

                  {/* Decorative line */}
                  <div className="mt-6 h-px bg-gradient-to-r from-[#C4A052]/30 via-[#C4A052]/10 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matériaux Section */}
      <section className="py-32 relative bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4A052]/10 border border-[#C4A052]/20 mb-6">
              <Gem className="w-4 h-4 text-[#C4A052]" />
              <span className="text-xs text-[#C4A052] tracking-wider uppercase">Qualité</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Matériaux{' '}
              <span className="text-[#C4A052]">d'Exception</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              La qualité de nos créations repose sur une sélection rigoureuse 
              des matériaux les plus nobles auprès des meilleurs fournisseurs.
            </p>
          </div>

          {/* Materials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#C4A052]/30 transition-all duration-500 hover:bg-white/[0.04]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#C4A052]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Decorative number */}
                  <span className="text-5xl font-extralight text-[#C4A052]/10 group-hover:text-[#C4A052]/20 transition-colors">
                    0{index + 1}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-lg font-medium text-white mt-2 mb-3">{material.title}</h3>
                  
                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{material.description}</p>
                  
                  {/* Origin */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#C4A052]/70 uppercase tracking-wider">Origine:</span>
                    <span className="text-xs text-white/50">{material.origin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C4A052]/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Decorative icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#C4A052]/10 border border-[#C4A052]/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#C4A052]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Découvrez{' '}
            <span className="text-[#C4A052]">Nos Créations</span>
          </h2>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Explorez notre collection de décors maçonniques d'exception, 
            ou confiez-nous la réalisation de vos pièces sur mesure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/catalog"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C4A052] text-[#0a0a0c] font-medium hover:bg-[#E8D5A3] transition-all duration-300"
            >
              Voir le catalogue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/sur-mesure"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:border-[#C4A052]/50 hover:bg-white/[0.02] transition-all duration-300"
            >
              Commander sur mesure
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white/60 group-hover:text-[#C4A052]" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-white/40">
              <CheckCircle2 className="w-5 h-5 text-[#C4A052]/60" />
              <span className="text-sm">Fabrication française</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <CheckCircle2 className="w-5 h-5 text-[#C4A052]/60" />
              <span className="text-sm">100% fait main</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <CheckCircle2 className="w-5 h-5 text-[#C4A052]/60" />
              <span className="text-sm">Garantie à vie</span>
            </div>
          </div>
        </div>
      </section>

      <LuxeFooterDark />
    </div>
  )
}
