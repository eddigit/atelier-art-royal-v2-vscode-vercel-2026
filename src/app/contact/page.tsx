'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageSquare, Users, Sparkles, ArrowRight } from 'lucide-react'
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark'
import LuxeFooterDark from '@/components/layout/LuxeFooterDark'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulated delay for form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
    setIsSubmitted(false)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+33 6 46 68 36 10',
      href: 'tel:+33646683610'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@artroyal.fr',
      href: 'mailto:contact@artroyal.fr'
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: 'Lundi-Vendredi, 9h-18h',
      href: null
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Atelier Art Royal, France',
      href: null
    }
  ]

  const faqItems = [
    {
      question: 'Quels sont vos délais de fabrication ?',
      answer: 'Nos délais varient selon le type de produit. Comptez 2 à 4 semaines pour les articles standards et 4 à 8 semaines pour les commandes sur mesure.'
    },
    {
      question: 'Livrez-vous à l\'international ?',
      answer: 'Oui, nous livrons dans le monde entier. Les frais et délais de livraison sont calculés en fonction de votre destination.'
    },
    {
      question: 'Puis-je personnaliser un produit ?',
      answer: 'Absolument ! Nous sommes spécialisés dans la création sur mesure. Contactez-nous pour discuter de votre projet personnalisé.'
    },
    {
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal, et les virements bancaires pour les commandes importantes.'
    },
    {
      question: 'Comment suivre ma commande ?',
      answer: 'Après expédition, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande depuis votre espace client.'
    },
    {
      question: 'Proposez-vous des garanties ?',
      answer: 'Tous nos produits sont garantis pour les défauts de fabrication. Nous offrons également un service de restauration et d\'entretien.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <LuxeHeaderDark />
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Decorative geometric circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-[#C4A052]/10" />
        <div className="absolute top-40 left-20 w-32 h-32 rounded-full border border-[#C4A052]/20" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full border border-[#C4A052]/10" />
        {/* Photo Tristan Llorca */}
        <div className="absolute top-10 right-20 w-48 h-48 rounded-full overflow-hidden border-2 border-[#C4A052]/30 shadow-lg shadow-[#C4A052]/10">
          <Image
            src="https://res.cloudinary.com/dniurvpzd/image/upload/v1769207599/Generated_Image_January_23_2026_-_11_31PM_dbvibh.jpg"
            alt="Tristan Llorca - Artisan Art Royal"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
              <MessageSquare className="w-4 h-4 text-[#C4A052]" />
              <span className="text-sm text-white/60">Nous Contacter</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
              Contactez-<span className="text-[#C4A052]">nous</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Notre équipe d'artisans et de conseillers est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos projets.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-light text-white mb-6">Nos coordonnées</h2>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div 
                      key={index}
                      className="group p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-all duration-300"
                    >
                      {info.href ? (
                        <a href={info.href} className="flex items-start gap-4">
                          <div className="p-3 bg-[#C4A052]/10 rounded-lg group-hover:bg-[#C4A052]/20 transition-colors">
                            <info.icon className="w-5 h-5 text-[#C4A052]" />
                          </div>
                          <div>
                            <p className="text-white/50 text-sm mb-1">{info.title}</p>
                            <p className="text-white group-hover:text-[#C4A052] transition-colors">{info.value}</p>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#C4A052]/10 rounded-lg">
                            <info.icon className="w-5 h-5 text-[#C4A052]" />
                          </div>
                          <div>
                            <p className="text-white/50 text-sm mb-1">{info.title}</p>
                            <p className="text-white">{info.value}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Box - Devis */}
              <div className="p-6 bg-gradient-to-br from-[#C4A052]/10 to-transparent border border-[#C4A052]/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-[#C4A052]" />
                  <h3 className="text-lg font-medium text-white">Besoin d'un devis ?</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Pour les commandes sur mesure ou les projets spéciaux, notre équipe établit des devis personnalisés sous 48h.
                </p>
                <Link 
                  href="/sur-mesure"
                  className="inline-flex items-center gap-2 text-[#C4A052] hover:text-[#C5A059] transition-colors text-sm"
                >
                  Demander un devis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-2">
              <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
                {isSubmitted ? (
                  /* Success State */
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#C4A052]/10 mb-6">
                      <CheckCircle className="w-10 h-10 text-[#C4A052]" />
                    </div>
                    <h3 className="text-2xl font-light text-white mb-4">Message envoyé !</h3>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                      Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures.
                    </p>
                    <button
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white hover:bg-white/[0.1] transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  /* Contact Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Nom complet */}
                      <div>
                        <label htmlFor="name" className="block text-sm text-white/60 mb-2">
                          Nom complet <span className="text-[#C4A052]">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#C4A052] focus:outline-none focus:ring-1 focus:ring-[#C4A052]/50 transition-all"
                          placeholder="Votre nom"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm text-white/60 mb-2">
                          Email <span className="text-[#C4A052]">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#C4A052] focus:outline-none focus:ring-1 focus:ring-[#C4A052]/50 transition-all"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Téléphone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm text-white/60 mb-2">
                          Téléphone <span className="text-white/30">(optionnel)</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#C4A052] focus:outline-none focus:ring-1 focus:ring-[#C4A052]/50 transition-all"
                          placeholder="+33 6 00 00 00 00"
                        />
                      </div>

                      {/* Objet */}
                      <div>
                        <label htmlFor="subject" className="block text-sm text-white/60 mb-2">
                          Objet <span className="text-[#C4A052]">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#C4A052] focus:outline-none focus:ring-1 focus:ring-[#C4A052]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0a0a0c]">Sélectionnez un objet</option>
                          <option value="general" className="bg-[#0a0a0c]">Question générale</option>
                          <option value="devis" className="bg-[#0a0a0c]">Demande de devis</option>
                          <option value="sur-mesure" className="bg-[#0a0a0c]">Commande sur mesure</option>
                          <option value="sav" className="bg-[#0a0a0c]">Service après-vente</option>
                          <option value="autre" className="bg-[#0a0a0c]">Autre</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm text-white/60 mb-2">
                        Message <span className="text-[#C4A052]">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#C4A052] focus:outline-none focus:ring-1 focus:ring-[#C4A052]/50 transition-all resize-none"
                        placeholder="Décrivez votre demande en détail..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#C4A052] to-[#C5A059] text-[#0a0a0c] font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#0a0a0c]/30 border-t-[#0a0a0c] rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">
                Questions <span className="text-[#C4A052]">fréquentes</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Retrouvez les réponses aux questions les plus courantes sur nos services et produits.
              </p>
            </div>

            {/* FAQ Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {faqItems.map((faq, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.03] transition-all duration-300"
                >
                  <h3 className="text-lg font-medium text-white mb-3">{faq.question}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Contact Options Section */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">
                Autres moyens de nous <span className="text-[#C4A052]">contacter</span>
              </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Devis sur mesure */}
              <Link 
                href="/sur-mesure"
                className="group p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-[#C4A052]/30 transition-all duration-300"
              >
                <div className="p-4 bg-[#C4A052]/10 rounded-xl w-fit mb-6 group-hover:bg-[#C4A052]/20 transition-colors">
                  <Sparkles className="w-8 h-8 text-[#C4A052]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Devis sur mesure</h3>
                <p className="text-white/60 text-sm mb-4">
                  Vous avez un projet spécifique ? Demandez un devis personnalisé pour vos créations sur mesure.
                </p>
                <span className="inline-flex items-center gap-2 text-[#C4A052] text-sm group-hover:gap-3 transition-all">
                  Demander un devis
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* WhatsApp/Appel */}
              <a 
                href="tel:+33646683610"
                className="group p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-[#C4A052]/30 transition-all duration-300"
              >
                <div className="p-4 bg-[#C4A052]/10 rounded-xl w-fit mb-6 group-hover:bg-[#C4A052]/20 transition-colors">
                  <Phone className="w-8 h-8 text-[#C4A052]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">WhatsApp / Appel</h3>
                <p className="text-white/60 text-sm mb-4">
                  Appelez-nous directement pour une réponse immédiate à vos questions.
                </p>
                <span className="inline-flex items-center gap-2 text-[#C4A052] text-sm group-hover:gap-3 transition-all">
                  +33 6 46 68 36 10
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>

              {/* Rendez-vous atelier */}
              <div className="group p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-[#C4A052]/30 transition-all duration-300">
                <div className="p-4 bg-[#C4A052]/10 rounded-xl w-fit mb-6 group-hover:bg-[#C4A052]/20 transition-colors">
                  <Users className="w-8 h-8 text-[#C4A052]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Rendez-vous atelier</h3>
                <p className="text-white/60 text-sm mb-4">
                  Visitez notre atelier pour découvrir notre savoir-faire et discuter de vos projets en personne.
                </p>
                <span className="inline-flex items-center gap-2 text-[#C4A052] text-sm">
                  Sur rendez-vous uniquement
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LuxeFooterDark />
    </div>
  )
}
