'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c]">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f12] to-[#0a0a0c]"></div>
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-20 left-20 w-[300px] h-[300px] border border-white rounded-full" />
            <div className="absolute bottom-10 right-20 w-[200px] h-[200px] border border-white rounded-full" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <p className="text-[#C5A059] text-xs font-bold tracking-[0.4em] uppercase mb-4">Nous Contacter</p>
            <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight mb-6">Contactez-nous</h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
              et vous accompagner dans vos projets.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-light text-white mb-8">Nos coordonnées</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#C5A059]/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Téléphone</h3>
                      <a
                        href="tel:+33646683610"
                        className="text-[#C5A059] hover:text-[#D4B44A] transition-colors"
                      >
                        +33 6 46 68 36 10
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#C5A059]/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Email</h3>
                      <a
                        href="mailto:contact@artroyal.fr"
                        className="text-[#C5A059] hover:text-[#D4B44A] transition-colors"
                      >
                        contact@artroyal.fr
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#C5A059]/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Horaires</h3>
                      <p className="text-white/60">
                        Du lundi au vendredi<br />
                        9h00 - 18h00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#C5A059]/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Adresse</h3>
                      <p className="text-white/60">
                        Atelier Art Royal<br />
                        France
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-xl p-6">
                <h3 className="font-medium text-white mb-3">Besoin d&apos;un devis ?</h3>
                <p className="text-sm text-white/60 mb-4">
                  Pour les commandes sur-mesure, les commandes en quantité ou les
                  projets spécifiques, contactez-nous pour obtenir un devis personnalisé.
                </p>
                <p className="text-sm text-white/60">
                  Délai de réponse: <strong className="text-[#C5A059]">24-48h</strong>
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-light text-white mb-3">Message envoyé !</h2>
                    <p className="text-white/60 mb-8">
                      Nous avons bien reçu votre message et vous répondrons dans les
                      plus brefs délais.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          subject: '',
                          message: '',
                        });
                      }}
                      className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-light text-white mb-8">
                      Envoyez-nous un message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-white/60 mb-2"
                          >
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                            placeholder="Votre nom"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white/60 mb-2"
                          >
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-white/60 mb-2"
                          >
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                            placeholder="06 00 00 00 00"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-medium text-white/60 mb-2"
                          >
                            Sujet *
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                          >
                            <option value="" className="bg-[#0a0a0c]">Sélectionnez un sujet</option>
                            <option value="devis" className="bg-[#0a0a0c]">Demande de devis</option>
                            <option value="commande" className="bg-[#0a0a0c]">Question sur une commande</option>
                            <option value="produit" className="bg-[#0a0a0c]">Question sur un produit</option>
                            <option value="sur-mesure" className="bg-[#0a0a0c]">Création sur-mesure</option>
                            <option value="autre" className="bg-[#0a0a0c]">Autre</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-white/60 mb-2"
                        >
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all resize-none"
                          placeholder="Décrivez votre demande..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-[#C5A059] text-black font-bold tracking-widest uppercase text-sm rounded-lg hover:bg-[#D4B44A] transition-all shadow-lg shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          'Envoi en cours...'
                        ) : (
                          <>
                            Envoyer le message
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-white/40 text-center">
                        En soumettant ce formulaire, vous acceptez notre{' '}
                        <Link href="/confidentialite" className="text-[#C5A059] hover:underline">
                          politique de confidentialité
                        </Link>
                        .
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <LuxeFooterDark />
    </>
  );
}
