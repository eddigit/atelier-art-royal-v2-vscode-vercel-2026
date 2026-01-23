'use client'

import Link from 'next/link'
import { Award, Clock, Gem, Heart, Shield, Sparkles, Star, Users, ArrowRight, MapPin } from 'lucide-react'
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark'
import LuxeFooterDark from '@/components/layout/LuxeFooterDark'

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'Chaque création est le fruit d\'un savoir-faire exceptionnel, transmis de génération en génération.'
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'L\'amour du travail bien fait guide chacun de nos gestes, de l\'esquisse à la finition.'
  },
  {
    icon: Shield,
    title: 'Tradition',
    description: 'Nous perpétuons les techniques ancestrales tout en embrassant l\'innovation.'
  },
  {
    icon: Users,
    title: 'Fraternité',
    description: 'Au cœur de notre démarche, le respect des valeurs maçonniques et le sens du partage.'
  }
]

const stats = [
  { value: '500+', label: 'Créations uniques' },
  { value: '50+', label: 'Loges équipées' },
  { value: '100%', label: 'Satisfaction' },
  { value: '7', label: 'Années' }
]

const qualityFeatures = [
  {
    icon: Gem,
    title: 'Matériaux nobles',
    description: 'Cuirs pleine fleur, soies naturelles, métaux précieux sélectionnés avec soin.'
  },
  {
    icon: Clock,
    title: 'Temps de création',
    description: 'Chaque pièce nécessite des heures de travail minutieux pour atteindre la perfection.'
  },
  {
    icon: MapPin,
    title: 'Fabrication française',
    description: 'Nos ateliers sont situés en France, garantissant un savoir-faire local d\'exception.'
  },
  {
    icon: Star,
    title: 'Garantie à vie',
    description: 'Nous nous engageons sur la durabilité de nos créations avec une garantie à vie.'
  }
]

export default function MaisonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />

      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Blurred gold circles decoration */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#C4A052]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#C4A052]/8 rounded-full blur-[100px]" />
        
        {/* Geometric circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full border border-white/5" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-[#C4A052]" />
            <span className="text-white/60 text-sm">Depuis 2018</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight">
            La Maison
          </h1>
          <p className="text-4xl md:text-5xl font-light text-[#C4A052] mb-8">
            Art Royal
          </p>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Un héritage de savoir-faire et d&apos;excellence au service de la tradition maçonnique. 
            Découvrez l&apos;histoire d&apos;une maison dédiée à l&apos;artisanat d&apos;exception.
          </p>
          
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">500+</div>
              <div className="text-white/40 text-sm">Créations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">100%</div>
              <div className="text-white/40 text-sm">Fait main</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">France</div>
              <div className="text-white/40 text-sm">Fabrication</div>
            </div>
          </div>
        </div>
        
        {/* Animated scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs uppercase tracking-widest">Découvrir</span>
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#C4A052] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* NOTRE HISTOIRE SECTION */}
      <section className="py-32 bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#C4A052]/20 to-[#C4A052]/5 flex items-center justify-center border border-white/10">
                <Gem className="w-24 h-24 text-[#C4A052]/40" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#C4A052] text-black px-6 py-4 rounded-xl shadow-2xl">
                <div className="text-2xl font-semibold">7+</div>
                <div className="text-sm">Années d&apos;excellence</div>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                <span className="text-[#C4A052] text-sm">Notre histoire</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
                Une tradition<br />
                <span className="text-[#C4A052]">perpétuée</span>
              </h2>
              
              <div className="space-y-6 text-white/60 leading-relaxed">
                <p>
                  Fondée en 2018, la Maison Art Royal est née de la passion d&apos;artisans 
                  maîtres de leur art, unis par une vision commune : créer des pièces 
                  d&apos;exception pour la tradition maçonnique.
                </p>
                <p>
                  Notre atelier perpétue les techniques ancestrales de la broderie, 
                  de la maroquinerie et de l&apos;orfèvrerie, tout en intégrant les 
                  innovations qui permettent d&apos;atteindre une qualité irréprochable.
                </p>
                <p>
                  Chaque création qui sort de nos ateliers porte en elle l&apos;empreinte 
                  de cet héritage précieux, sublimée par la passion de nos artisans 
                  et leur quête perpétuelle de perfection.
                </p>
              </div>
              
              <Link 
                href="/savoir-faire"
                className="inline-flex items-center gap-2 mt-8 text-[#C4A052] hover:text-white transition-colors group"
              >
                <span>Découvrir notre savoir-faire</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NOS VALEURS SECTION */}
      <section className="py-32 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-6">
              <span className="text-[#C4A052] text-sm">Ce qui nous anime</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white">
              Nos <span className="text-[#C4A052]">valeurs</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div 
                  key={index}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-[#C4A052]/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#C4A052]/10 flex items-center justify-center mb-6 group-hover:bg-[#C4A052]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#C4A052]" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">{value.title}</h3>
                  <p className="text-white/50 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS SECTION */}
      <section className="py-32 relative overflow-hidden">
        {/* Gold-tinted background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4A052]/10 via-[#0f0f12] to-[#C4A052]/5" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C4A052]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C4A052]/30 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-6">
              <span className="text-[#C4A052] text-sm">En chiffres</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white">
              Chiffres <span className="text-[#C4A052]">clés</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-5xl md:text-6xl font-light text-[#C4A052] mb-3">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT QUALITÉ SECTION */}
      <section className="py-32 bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                <span className="text-[#C4A052] text-sm">Notre promesse</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
                Engagement<br />
                <span className="text-[#C4A052]">qualité</span>
              </h2>
              
              <p className="text-white/60 leading-relaxed mb-10">
                Nous nous engageons à vous offrir des créations d&apos;une qualité 
                irréprochable, façonnées dans le respect des traditions et avec 
                les meilleurs matériaux.
              </p>
              
              <div className="space-y-6">
                {qualityFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#C4A052]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#C4A052]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#C4A052]/20 to-[#C4A052]/5 flex items-center justify-center border border-white/10">
                <Award className="w-24 h-24 text-[#C4A052]/40" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-[#C4A052]/20 rounded-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-[#C4A052]/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 bg-[#0a0a0c]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-1 h-1 rounded-full bg-[#C4A052]" />
            <div className="w-1 h-1 rounded-full bg-[#C4A052]/60" />
            <div className="w-1 h-1 rounded-full bg-[#C4A052]/30" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Prêt à découvrir<br />
            <span className="text-[#C4A052]">nos créations ?</span>
          </h2>
          
          <p className="text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Explorez notre catalogue de pièces d&apos;exception ou laissez-nous créer 
            une œuvre unique, spécialement conçue pour vous.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C4A052] text-black font-medium rounded-xl hover:bg-[#D4B062] transition-colors"
            >
              <span>Voir le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sur-mesure"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 hover:border-[#C4A052]/50 transition-all"
            >
              <span>Créations sur mesure</span>
              <Sparkles className="w-4 h-4 text-[#C4A052]" />
            </Link>
          </div>
        </div>
      </section>

      <LuxeFooterDark />
    </div>
  )
}
