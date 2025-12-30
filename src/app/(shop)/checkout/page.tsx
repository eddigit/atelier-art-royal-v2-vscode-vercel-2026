'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    stock_quantity?: number;
  };
  quantity: number;
}

interface UserProfile {
  _id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_type: 'personal' | 'lodge' | 'both';
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    use_billing_address?: boolean;
  };
  lodge_name?: string;
  lodge_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  default_shipping_type: 'personal' | 'lodge';
}

type CheckoutStep = 'info' | 'shipping' | 'payment' | 'confirmation';

interface FormDataState {
  // Informations client
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Adresse de livraison
  shipping_type: 'personal' | 'lodge';
  shipping_street: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Adresse de facturation
  use_shipping_for_billing: boolean;
  billing_street: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
  
  // Notes
  notes: string;
  
  // Acceptation
  accept_terms: boolean;
  
  // Numéro de commande après confirmation
  order_number?: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState<FormDataState>({
    // Informations client
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    
    // Adresse de livraison
    shipping_type: 'personal',
    shipping_street: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: 'France',
    
    // Adresse de facturation
    use_shipping_for_billing: true,
    billing_street: '',
    billing_city: '',
    billing_postal_code: '',
    billing_country: 'France',
    
    // Notes
    notes: '',
    
    // Acceptation
    accept_terms: false,
  });
  
  // Frais de livraison
  const SHIPPING_COST = 6.90;
  const FREE_SHIPPING_THRESHOLD = 100;
  
  // Charger le panier et le profil
  useEffect(() => {
    fetchCart();
    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);
  
  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
        if (!data.items || data.items.length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
    }
  };
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        
        // Pré-remplir le formulaire
        const user = data.user;
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          shipping_type: user.default_shipping_type || 'personal',
          shipping_street: user.billing_address?.street || '',
          shipping_city: user.billing_address?.city || '',
          shipping_postal_code: user.billing_address?.postal_code || '',
        }));
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculer les totaux
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Appliquer l'adresse de la loge
  const useLodgeAddress = () => {
    if (profile?.lodge_address) {
      setFormData(prev => ({
        ...prev,
        shipping_type: 'lodge',
        shipping_street: profile.lodge_address?.street || '',
        shipping_city: profile.lodge_address?.city || '',
        shipping_postal_code: profile.lodge_address?.postal_code || '',
        shipping_country: profile.lodge_address?.country || 'France',
      }));
    }
  };
  
  // Appliquer l'adresse personnelle
  const usePersonalAddress = () => {
    if (profile?.billing_address) {
      setFormData(prev => ({
        ...prev,
        shipping_type: 'personal',
        shipping_street: profile.billing_address?.street || '',
        shipping_city: profile.billing_address?.city || '',
        shipping_postal_code: profile.billing_address?.postal_code || '',
        shipping_country: profile.billing_address?.country || 'France',
      }));
    }
  };
  
  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'info':
        if (!formData.email || !formData.first_name || !formData.last_name) {
          toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
          return false;
        }
        break;
      case 'shipping':
        if (!formData.shipping_street || !formData.shipping_city || !formData.shipping_postal_code) {
          toast({ title: 'Erreur', description: 'Veuillez remplir l\'adresse de livraison', variant: 'destructive' });
          return false;
        }
        break;
      case 'payment':
        if (!formData.accept_terms) {
          toast({ title: 'Erreur', description: 'Veuillez accepter les conditions générales', variant: 'destructive' });
          return false;
        }
        break;
    }
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      const steps: CheckoutStep[] = ['info', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };
  
  const handlePrevious = () => {
    const steps: CheckoutStep[] = ['info', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  
  const handleSubmitOrder = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        customer_email: formData.email,
        customer_name: `${formData.first_name} ${formData.last_name}`,
        customer_phone: formData.phone,
        shipping_address: {
          full_name: `${formData.first_name} ${formData.last_name}`,
          street: formData.shipping_street,
          city: formData.shipping_city,
          postal_code: formData.shipping_postal_code,
          country: formData.shipping_country,
          phone: formData.phone,
        },
        billing_address: formData.use_shipping_for_billing
          ? {
              full_name: `${formData.first_name} ${formData.last_name}`,
              street: formData.shipping_street,
              city: formData.shipping_city,
              postal_code: formData.shipping_postal_code,
              country: formData.shipping_country,
              phone: formData.phone,
            }
          : {
              full_name: `${formData.first_name} ${formData.last_name}`,
              street: formData.billing_street,
              city: formData.billing_city,
              postal_code: formData.billing_postal_code,
              country: formData.billing_country,
              phone: formData.phone,
            },
        notes: formData.notes,
        shipping_type: formData.shipping_type,
      };
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la commande');
      }
      
      // Stocker le numéro de commande pour l'affichage
      setFormData(prev => ({ ...prev, order_number: data.order_number }));
      
      // Si SumUp a retourné une URL de paiement, rediriger
      if (data.checkout_url) {
        toast({ title: 'Redirection vers le paiement...', description: `Commande ${data.order_number}` });
        window.location.href = data.checkout_url;
        return;
      }
      
      // Sinon, confirmation directe (validation téléphonique)
      toast({ title: 'Commande confirmée !', description: `Numéro: ${data.order_number}` });
      setCurrentStep('confirmation');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const steps = [
    { id: 'info', label: 'Informations', icon: '👤' },
    { id: 'shipping', label: 'Livraison', icon: '🚚' },
    { id: 'payment', label: 'Paiement', icon: '💳' },
    { id: 'confirmation', label: 'Confirmation', icon: '✓' },
  ];
  
  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step.id === currentStep
                ? 'bg-[#C4A052] text-white'
                : steps.findIndex(s => s.id === currentStep) > index
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {steps.findIndex(s => s.id === currentStep) > index ? '✓' : step.icon}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-1 mx-2 ${steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
  
  const renderInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Vos informations</h2>
      
      {!session && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <Link href="/auth/login?callbackUrl=/checkout" className="font-medium underline">Connectez-vous</Link> pour retrouver vos informations et historique de commandes, ou continuez en tant qu'invité.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateFormData('first_name', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateFormData('last_name', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
        />
      </div>
    </div>
  );
  
  const renderShippingStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Adresse de livraison</h2>
      
      {/* Choix rapide pour compte loge */}
      {profile && profile.account_type !== 'personal' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={usePersonalAddress}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.shipping_type === 'personal' ? 'border-[#C4A052] bg-[#C4A052]/5' : 'border-gray-200'
            }`}
          >
            <span className="text-2xl">📍</span>
            <p className="font-medium mt-2">Adresse personnelle</p>
          </button>
          <button
            onClick={useLodgeAddress}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.shipping_type === 'lodge' ? 'border-[#C4A052] bg-[#C4A052]/5' : 'border-gray-200'
            }`}
          >
            <span className="text-2xl">🏛️</span>
            <p className="font-medium mt-2">Adresse de la Loge</p>
            {profile.lodge_name && <p className="text-sm text-gray-500">{profile.lodge_name}</p>}
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input
            type="text"
            value={formData.shipping_street}
            onChange={(e) => updateFormData('shipping_street', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
            placeholder="Rue et numéro"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
            <input
              type="text"
              value={formData.shipping_postal_code}
              onChange={(e) => updateFormData('shipping_postal_code', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input
              type="text"
              value={formData.shipping_city}
              onChange={(e) => updateFormData('shipping_city', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.use_shipping_for_billing}
            onChange={(e) => updateFormData('use_shipping_for_billing', e.target.checked)}
            className="w-5 h-5 text-[#C4A052] rounded"
          />
          <span>Utiliser la même adresse pour la facturation</span>
        </label>
      </div>
      
      {!formData.use_shipping_for_billing && (
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-gray-900">Adresse de facturation</h3>
          <input
            type="text"
            value={formData.billing_street}
            onChange={(e) => updateFormData('billing_street', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
            placeholder="Rue et numéro"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.billing_postal_code}
              onChange={(e) => updateFormData('billing_postal_code', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
              placeholder="Code postal"
            />
            <input
              type="text"
              value={formData.billing_city}
              onChange={(e) => updateFormData('billing_city', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
              placeholder="Ville"
            />
          </div>
        </div>
      )}
      
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes de commande (optionnel)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C4A052]"
          placeholder="Instructions spéciales pour la livraison..."
        />
      </div>
    </div>
  );
  
  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700">
          Pour le moment, les paiements sont traités par validation téléphonique. Vous recevrez un appel pour confirmer votre commande.
        </p>
      </div>
      
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de la commande</h3>
        
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">📦</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium">{(item.product.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>{shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
      
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.accept_terms}
          onChange={(e) => updateFormData('accept_terms', e.target.checked)}
          className="w-5 h-5 text-[#C4A052] rounded mt-0.5"
        />
        <span className="text-sm text-gray-700">
          J'accepte les <Link href="/terms" className="text-[#C4A052] underline">conditions générales de vente</Link> et la <Link href="/privacy" className="text-[#C4A052] underline">politique de confidentialité</Link>
        </span>
      </label>
    </div>
  );
  
  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-4xl">✓</span>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900">Merci pour votre commande !</h2>
      
      <p className="text-gray-600">
        Votre commande a été enregistrée. Vous recevrez un email de confirmation à l'adresse <strong>{formData.email}</strong>.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 inline-block">
        <p className="text-sm text-gray-500">Numéro de commande</p>
        <p className="text-2xl font-bold text-[#C4A052]">{formData.order_number || 'AR2024XXXX'}</p>
      </div>
      
      <p className="text-gray-600">
        Notre équipe vous contactera prochainement pour confirmer votre commande.
      </p>
      
      <div className="flex gap-4 justify-center pt-4">
        {session ? (
          <Link href="/account">
            <Button className="bg-[#C4A052] hover:bg-[#b39142]">Voir mes commandes</Button>
          </Link>
        ) : (
          <Link href="/auth/register">
            <Button className="bg-[#C4A052] hover:bg-[#b39142]">Créer un compte</Button>
          </Link>
        )}
        <Link href="/catalog">
          <Button variant="outline">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  );
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return renderInfoStep();
      case 'shipping':
        return renderShippingStep();
      case 'payment':
        return renderPaymentStep();
      case 'confirmation':
        return renderConfirmation();
      default:
        return renderInfoStep();
    }
  };
  
  if (isLoading) {
    return (
      <>
        <LuxeHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]" />
        </div>
        <LuxeFooter />
      </>
    );
  }
  
  return (
    <>
      <LuxeHeader />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Finaliser ma commande</h1>
          
          {currentStep !== 'confirmation' && renderStepIndicator()}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className={`${currentStep === 'confirmation' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <div className="bg-white rounded-xl shadow p-6">
                {renderCurrentStep()}
                
                {currentStep !== 'confirmation' && (
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    {currentStep !== 'info' ? (
                      <Button variant="outline" onClick={handlePrevious}>
                        ← Précédent
                      </Button>
                    ) : (
                      <Link href="/cart">
                        <Button variant="outline">← Retour au panier</Button>
                      </Link>
                    )}
                    
                    {currentStep === 'payment' ? (
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="bg-[#C4A052] hover:bg-[#b39142] px-8"
                      >
                        {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="bg-[#C4A052] hover:bg-[#b39142] px-8"
                      >
                        Suivant →
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Résumé panier (visible sur étapes 1-3) */}
            {currentStep !== 'confirmation' && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow p-6 sticky top-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Votre panier</h3>
                  
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} × {item.product.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Livraison</span>
                      <span>{shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-green-600">
                        Livraison gratuite à partir de {FREE_SHIPPING_THRESHOLD} €
                      </p>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <LuxeFooter />
    </>
  );
}
