'use client'

import Link from 'next/link'
import { 
  Palette, 
  Ruler, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Shield, 
  Star,
  Scissors,
  Award,
  Package,
  Flag,
  Gem,
  Crown
} from 'lucide-react'
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark'
import LuxeFooterDark from '@/components/layout/LuxeFooterDark'

export default function SurMesurePage() {
  const benefits = [
    {
      icon: Sparkles,
      title: "Pièce unique",
      description: "Chaque création est unique, conçue exclusivement pour vous selon vos spécifications exactes."
    },
    {
      icon: Ruler,
      title: "Adapté à vos besoins",
      description: "Dimensions, couleurs, symboles... Tout est personnalisable pour correspondre parfaitement à vos attentes."
    },
    {
      icon: Shield,
      title: "Qualité exceptionnelle",
      description: "Matériaux nobles et savoir-faire artisanal français pour des pièces qui traversent le temps."
    },
    {
      icon: Users,
      title: "Accompagnement personnalisé",
      description: "Un interlocuteur dédié vous guide à chaque étape de la création de votre pièce."
    }
  ]

  const processSteps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Premier Contact",
      description: "Échangeons sur votre projet, vos besoins et vos envies lors d'un premier entretien."
    },
    {
      number: "02",
      icon: Palette,
      title: "Étude & Devis",
      description: "Nous réalisons une étude personnalisée avec croquis et devis détaillé sans engagement."
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Validation",
      description: "Vous validez le design final et les spécifications avant le lancement de la fabrication."
    },
    {
      number: "04",
      icon: Scissors,
      title: "Fabrication",
      description: "Nos artisans créent votre pièce avec soin dans notre atelier français. Durée : 4 à 12 semaines."
    },
    {
      number: "05",
      icon: Package,
      title: "Livraison",
      description: "Contrôle qualité final et livraison soignée de votre création sur mesure."
    }
  ]

  const categories = [
    {
      title: "Tabliers personnalisés",
      description: "Tabliers de tous grades, brodés main ou machine, aux couleurs de votre rite et obédience.",
      icon: Award
    },
    {
      title: "Sautoirs et cordons",
      description: "Sautoirs d'officiers et de dignitaires, cordons de maître, créés selon vos spécifications.",
      icon: Crown
    },
    {
      title: "Bijoux sur mesure",
      description: "Bijoux d'officiers, médailles commémoratives, épingles et accessoires personnalisés.",
      icon: Gem
    },
    {
      title: "Décors de loge",
      description: "Tapis de loge, housses d'autel, tentures et tous éléments décoratifs rituels.",
      icon: Palette
    },
    {
      title: "Bannières et drapeaux",
      description: "Bannières de loge, drapeaux, étendards brodés aux armes de votre atelier.",
      icon: Flag
    },
    {
      title: "Accessoires rituels",
      description: "Maillets, épées, chandeliers, et tous accessoires nécessaires à vos travaux.",
      icon: Sparkles
    }
  ]

  const testimonials = [
    {
      quote: "Un travail exceptionnel sur notre bannière de loge. La qualité de la broderie et le respect des traditions sont remarquables. Nous recommandons vivement Art Royal.",
      author: "V∴M∴ Jean-Pierre L.",
      role: "Loge La Parfaite Union"
    },
    {
      quote: "Accompagnement professionnel et à l'écoute pour la création de nos sautoirs d'officiers. Le résultat dépasse nos attentes, avec une attention aux détails impressionnante.",
      author: "F∴ Michel D.",
      role: "Grand Officier"
    },
    {
      quote: "Nos tabliers personnalisés sont magnifiques. L'équipe a su comprendre nos besoins spécifiques et proposer des solutions créatives. Service irréprochable.",
      author: "F∴ Philippe M.",
      role: "Secrétaire de Loge"
    }
  ]

  const pricingInfo = [
    {
      icon: Star,
      title: "À partir de",
      value: "150€",
      description: "Pour les créations simples. Devis gratuit et sans engagement pour chaque projet."
    },
    {
      icon: Clock,
      title: "Délai moyen",
      value: "4-12 semaines",
      description: "Selon la complexité de la pièce. Nous vous tenons informé à chaque étape."
    },
    {
      icon: Shield,
      title: "Acompte",
      value: "30%",
      description: "À la commande, solde à la livraison. Paiement sécurisé et garanti."
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#C4A052]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.02] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#C4A052]/10 rounded-full" />
        </div>

        {/* Geometric decorations */}
        <div className="absolute top-32 right-20 w-4 h-4 border border-[#C4A052]/40 rotate-45" />
        <div className="absolute bottom-40 left-32 w-6 h-6 border border-[#C4A052]/30 rotate-45" />
        <div className="absolute top-48 left-1/4 w-2 h-2 bg-[#C4A052]/50 rotate-45" />
        <div className="absolute bottom-32 right-1/3 w-3 h-3 border border-white/20 rotate-45" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#C4A052]" />
            <span className="text-white/60 text-sm tracking-wide">Excellence artisanale française</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 tracking-tight">
            Créations{' '}
            <span className="text-[#C4A052] italic font-serif">Sur Mesure</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
            Donnez vie à vos projets les plus ambitieux avec nos créations personnalisées, 
            façonnées par des artisans d'exception dans le respect des traditions maçonniques.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#C4A052] text-black font-medium rounded-full hover:bg-[#D4B062] transition-all duration-300"
            >
              <span>Demander un devis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/catalog"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 text-white font-medium rounded-full hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
            >
              <span>Nos réalisations</span>
            </Link>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
      </section>

      {/* Pourquoi le sur mesure Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Pourquoi choisir le{' '}
              <span className="text-[#C4A052] italic font-serif">sur mesure</span> ?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Parce que chaque détail compte, nous créons des pièces uniques qui reflètent votre identité et vos valeurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-[#C4A052]/30 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-xl bg-[#C4A052]/10 flex items-center justify-center mb-6 group-hover:bg-[#C4A052]/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-[#C4A052]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{benefit.title}</h3>
                <p className="text-white/50 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Processus Section */}
      <section className="py-32 relative bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Notre{' '}
              <span className="text-[#C4A052] italic font-serif">processus</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              De la première idée à la livraison finale, nous vous accompagnons à chaque étape de votre projet.
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            {/* Connection line */}
            <div className="absolute top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C4A052]/30 to-transparent" />
            
            <div className="grid grid-cols-5 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step number circle */}
                  <div className="relative z-10 w-32 h-32 mx-auto mb-8 rounded-full bg-[#0a0a0c] border-2 border-[#C4A052]/30 flex flex-col items-center justify-center group hover:border-[#C4A052] transition-colors">
                    <span className="text-[#C4A052] text-2xl font-light">{step.number}</span>
                    <step.icon className="w-6 h-6 text-white/60 mt-1 group-hover:text-[#C4A052] transition-colors" />
                  </div>
                  
                  {/* Arrow connecting to next */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute top-16 left-[60%] right-0 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-[#C4A052]/40" />
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-3">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-6">
            {processSteps.map((step, index) => (
              <div key={index} className="relative flex gap-6">
                {/* Vertical line */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-[30px] top-20 bottom-0 w-[2px] bg-[#C4A052]/20" />
                )}
                
                {/* Number circle */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-[#0a0a0c] border-2 border-[#C4A052]/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[#C4A052] text-lg font-light">{step.number}</span>
                </div>

                <div className="pt-2 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="w-5 h-5 text-[#C4A052]" />
                    <h3 className="text-lg font-medium text-white">{step.title}</h3>
                  </div>
                  <p className="text-white/50 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce que nous créons Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Ce que nous{' '}
              <span className="text-[#C4A052] italic font-serif">créons</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Des tabliers aux bannières, découvrez l'étendue de notre savoir-faire artisanal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#C4A052]/40 transition-all duration-500"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/3] relative bg-gradient-to-br from-white/[0.03] to-transparent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <category.icon className="w-20 h-20 text-[#C4A052]/20 group-hover:text-[#C4A052]/40 transition-colors" />
                  </div>
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-medium text-white mb-3 group-hover:text-[#C4A052] transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed mb-4">{category.description}</p>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center gap-2 text-[#C4A052] text-sm hover:gap-3 transition-all"
                  >
                    <span>Demander un devis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages Section */}
      <section className="py-32 relative bg-gradient-to-b from-transparent via-[#C4A052]/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Ils nous ont fait{' '}
              <span className="text-[#C4A052] italic font-serif">confiance</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Découvrez les témoignages de ceux qui ont choisi Art Royal pour leurs créations sur mesure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.03] transition-all duration-500"
              >
                {/* Quote icon */}
                <div className="mb-6">
                  <svg className="w-10 h-10 text-[#C4A052]/30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <p className="text-white/70 leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C4A052]/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#C4A052]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-white/40 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs & Délais Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Tarifs &{' '}
              <span className="text-[#C4A052] italic font-serif">délais</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Transparence totale sur nos conditions, pour un projet en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pricingInfo.map((info, index) => (
              <div 
                key={index}
                className="text-center p-10 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-[#C4A052]/30 transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-[#C4A052]/10 flex items-center justify-center mb-6">
                  <info.icon className="w-8 h-8 text-[#C4A052]" />
                </div>
                <p className="text-white/50 text-sm uppercase tracking-wider mb-2">{info.title}</p>
                <p className="text-4xl font-light text-white mb-4">{info.value}</p>
                <p className="text-white/50 leading-relaxed">{info.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center p-8 bg-[#C4A052]/[0.05] border border-[#C4A052]/20 rounded-2xl max-w-3xl mx-auto">
            <CheckCircle className="w-8 h-8 text-[#C4A052] mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Devis gratuit et sans engagement</p>
            <p className="text-white/50">
              Chaque projet étant unique, nous établissons un devis personnalisé après étude de votre demande. 
              N'hésitez pas à nous contacter pour en discuter.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#C4A052]/[0.03] to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A052]/10 border border-[#C4A052]/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#C4A052]" />
            <span className="text-[#C4A052] text-sm tracking-wide">Prêt à créer ?</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Démarrez votre{' '}
            <span className="text-[#C4A052] italic font-serif">projet</span>
          </h2>
          
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-12">
            Contactez-nous dès maintenant pour discuter de votre projet sur mesure. 
            Notre équipe se fera un plaisir de vous accompagner.
          </p>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            <a 
              href="tel:+33646683610" 
              className="flex items-center gap-3 text-white hover:text-[#C4A052] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-lg">+33 6 46 68 36 10</span>
            </a>
            <a 
              href="mailto:contact@artroyal.fr" 
              className="flex items-center gap-3 text-white hover:text-[#C4A052] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-lg">contact@artroyal.fr</span>
            </a>
          </div>

          {/* CTA Button */}
          <Link 
            href="/contact"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-[#C4A052] text-black font-medium rounded-full hover:bg-[#D4B062] transition-all duration-300 text-lg"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Nous contacter</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/10">
            <div className="flex items-center gap-3 text-white/40">
              <Shield className="w-5 h-5" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <CheckCircle className="w-5 h-5" />
              <span>Devis sous 48h</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Star className="w-5 h-5" />
              <span>Satisfaction garantie</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Award className="w-5 h-5" />
              <span>Fabrication française</span>
            </div>
          </div>
        </div>
      </section>

      <LuxeFooterDark />
    </div>
  )
}
