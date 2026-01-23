'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Obedience {
  _id: string;
  name: string;
  logo?: string;
}

interface Rite {
  _id: string;
  name: string;
  image_url?: string;
}

interface DegreeOrder {
  _id: string;
  name: string;
  level: number;
}

type AccountType = 'personal' | 'lodge' | 'both';

interface FormData {
  // Step 1: Compte
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Step 2: Type de compte
  account_type: AccountType;
  
  // Step 3: Profil maçonnique (optionnel)
  obedience_id: string;
  rite_id: string;
  degree: string;
  lodge_name: string;
  lodge_number: string;
  lodge_role: string;
  
  // Step 4: Adresses
  billing_street: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
  use_billing_for_shipping: boolean;
  shipping_street: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Lodge address
  lodge_street: string;
  lodge_city: string;
  lodge_postal_code: string;
  lodge_country: string;
  default_shipping_type: 'personal' | 'lodge';
  
  // Préférences
  newsletter_subscribed: boolean;
  order_notifications: boolean;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  phone: '',
  account_type: 'personal',
  obedience_id: '',
  rite_id: '',
  degree: '',
  lodge_name: '',
  lodge_number: '',
  lodge_role: '',
  billing_street: '',
  billing_city: '',
  billing_postal_code: '',
  billing_country: 'France',
  use_billing_for_shipping: true,
  shipping_street: '',
  shipping_city: '',
  shipping_postal_code: '',
  shipping_country: 'France',
  lodge_street: '',
  lodge_city: '',
  lodge_postal_code: '',
  lodge_country: 'France',
  default_shipping_type: 'personal',
  newsletter_subscribed: true,
  order_notifications: true,
};

const LODGE_ROLES = [
  'Vénérable Maître',
  'Premier Surveillant',
  'Second Surveillant',
  'Orateur',
  'Secrétaire',
  'Trésorier',
  'Hospitalier',
  'Expert',
  'Maître des Cérémonies',
  'Couvreur',
  'Frère',
];

interface OnboardingWizardProps {
  redirectTo?: string;
  onComplete?: () => void;
}

export default function OnboardingWizard({ redirectTo = '/account', onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [degrees, setDegrees] = useState<DegreeOrder[]>([]);
  
  const totalSteps = formData.account_type === 'personal' ? 3 : 4;
  
  // Charger les données de référence
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [obediencesRes, ritesRes, degreesRes] = await Promise.all([
          fetch('/api/obediences'),
          fetch('/api/rites'),
          fetch('/api/admin/degrees'),
        ]);
        
        if (obediencesRes.ok) {
          const data = await obediencesRes.json();
          setObediences(data.obediences || data);
        }
        if (ritesRes.ok) {
          const data = await ritesRes.json();
          setRites(data.rites || data);
        }
        if (degreesRes.ok) {
          const data = await degreesRes.json();
          setDegrees(data.degrees || data);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };
    fetchData();
  }, []);
  
  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
          toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
          return false;
        }
        if (formData.password.length < 6) {
          toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
          return false;
        }
        break;
      case 2:
        // Type de compte - pas de validation particulière
        break;
      case 3:
        if (formData.account_type !== 'personal') {
          // Validation loge
          if (!formData.lodge_name) {
            toast({ title: 'Erreur', description: 'Veuillez indiquer le nom de votre loge', variant: 'destructive' });
            return false;
          }
        }
        break;
    }
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        name: `${formData.first_name} ${formData.last_name}`,
        full_name: `${formData.first_name} ${formData.last_name}`,
        phone: formData.phone,
        account_type: formData.account_type,
        obedience_id: formData.obedience_id || undefined,
        rite_id: formData.rite_id || undefined,
        degree: formData.degree ? parseInt(formData.degree) : undefined,
        lodge_name: formData.lodge_name || undefined,
        lodge_number: formData.lodge_number || undefined,
        lodge_role: formData.lodge_role || undefined,
        billing_address: formData.billing_street ? {
          street: formData.billing_street,
          city: formData.billing_city,
          postal_code: formData.billing_postal_code,
          country: formData.billing_country,
        } : undefined,
        shipping_address: formData.use_billing_for_shipping ? undefined : {
          street: formData.shipping_street,
          city: formData.shipping_city,
          postal_code: formData.shipping_postal_code,
          country: formData.shipping_country,
          use_billing_address: false,
        },
        lodge_address: formData.lodge_street ? {
          street: formData.lodge_street,
          city: formData.lodge_city,
          postal_code: formData.lodge_postal_code,
          country: formData.lodge_country,
        } : undefined,
        default_shipping_type: formData.default_shipping_type,
        newsletter_subscribed: formData.newsletter_subscribed,
        order_notifications: formData.order_notifications,
        onboarding_completed: true,
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }
      
      // Connexion automatique
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        throw new Error('Compte créé mais erreur de connexion');
      }
      
      toast({ title: 'Bienvenue !', description: 'Votre compte a été créé avec succès' });
      
      if (onComplete) {
        onComplete();
      } else {
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              index + 1 === step
                ? 'bg-[#C4A052] text-white'
                : index + 1 < step
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {index + 1 < step ? '✓' : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${index + 1 < step ? 'bg-green-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Créer votre compte</h2>
        <p className="text-white/60 mt-2">Rejoignez l'Atelier Art Royal</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Prénom *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateFormData('first_name', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nom *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateFormData('last_name', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
            placeholder="Votre nom"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
          placeholder="votre@email.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Téléphone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
          placeholder="06 00 00 00 00"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Mot de passe *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Confirmer *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
            placeholder="••••••••"
          />
        </div>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Type de compte</h2>
        <p className="text-white/60 mt-2">Comment comptez-vous utiliser votre compte ?</p>
      </div>
      
      <div className="grid gap-4">
        {[
          {
            type: 'personal' as AccountType,
            title: 'Usage personnel',
            description: 'Je commande pour moi-même',
            icon: '👤',
          },
          {
            type: 'lodge' as AccountType,
            title: 'Pour ma Loge',
            description: 'Je commande pour ma Loge (souvent en quantité)',
            icon: '🏛️',
          },
          {
            type: 'both' as AccountType,
            title: 'Les deux',
            description: 'Je commande pour moi et pour ma Loge',
            icon: '👥',
          },
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => updateFormData('account_type', option.type)}
            className={`p-6 border-2 rounded-xl text-left transition-all ${
              formData.account_type === option.type
                ? 'border-[#C4A052] bg-[#C4A052]/10'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{option.icon}</span>
              <div>
                <h3 className="font-semibold text-lg text-white">{option.title}</h3>
                <p className="text-white/60 mt-1">{option.description}</p>
              </div>
              {formData.account_type === option.type && (
                <span className="ml-auto text-[#C4A052] text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Votre profil maçonnique</h2>
        <p className="text-white/60 mt-2">
          {formData.account_type === 'personal' 
            ? 'Ces informations sont optionnelles'
            : 'Ces informations nous aident à mieux vous servir'}
        </p>
      </div>
      
      {/* Obédience */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Obédience</label>
        <select
          value={formData.obedience_id}
          onChange={(e) => updateFormData('obedience_id', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
        >
          <option value="" className="bg-[#0f0f12] text-white">Sélectionnez une obédience</option>
          {obediences.map((ob) => (
            <option key={ob._id} value={ob._id} className="bg-[#0f0f12] text-white">{ob.name}</option>
          ))}
        </select>
      </div>
      
      {/* Rite */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Rite pratiqué</label>
        <select
          value={formData.rite_id}
          onChange={(e) => updateFormData('rite_id', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
        >
          <option value="" className="bg-[#0f0f12] text-white">Sélectionnez un rite</option>
          {rites.map((rite) => (
            <option key={rite._id} value={rite._id} className="bg-[#0f0f12] text-white">{rite.name}</option>
          ))}
        </select>
      </div>
      
      {/* Degré */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Degré</label>
        <select
          value={formData.degree}
          onChange={(e) => updateFormData('degree', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
        >
          <option value="" className="bg-[#0f0f12] text-white">Sélectionnez votre degré</option>
          {degrees.sort((a, b) => a.level - b.level).map((deg) => (
            <option key={deg._id} value={deg.level} className="bg-[#0f0f12] text-white">{deg.level}° - {deg.name}</option>
          ))}
        </select>
      </div>
      
      {/* Infos Loge (si lodge ou both) */}
      {formData.account_type !== 'personal' && (
        <>
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="font-semibold text-lg text-white mb-4">Informations de votre Loge</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-white/70 mb-1">Nom de la Loge *</label>
              <input
                type="text"
                value={formData.lodge_name}
                onChange={(e) => updateFormData('lodge_name', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="Ex: La Parfaite Union"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-white/70 mb-1">N° de Loge</label>
              <input
                type="text"
                value={formData.lodge_number}
                onChange={(e) => updateFormData('lodge_number', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="Ex: 123"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Votre fonction en Loge</label>
            <select
              value={formData.lodge_role}
              onChange={(e) => updateFormData('lodge_role', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
            >
              <option value="" className="bg-[#0f0f12] text-white">Sélectionnez votre fonction</option>
              {LODGE_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#0f0f12] text-white">{role}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Adresses de livraison</h2>
        <p className="text-white/60 mt-2">Où souhaitez-vous recevoir vos commandes ?</p>
      </div>
      
      {/* Adresse personnelle */}
      <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl">
        <h3 className="font-semibold text-white mb-4">📍 Adresse personnelle</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={formData.billing_street}
            onChange={(e) => updateFormData('billing_street', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
            placeholder="Rue et numéro"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.billing_postal_code}
              onChange={(e) => updateFormData('billing_postal_code', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
              placeholder="Code postal"
            />
            <input
              type="text"
              value={formData.billing_city}
              onChange={(e) => updateFormData('billing_city', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
              placeholder="Ville"
            />
          </div>
        </div>
      </div>
      
      {/* Adresse de la Loge */}
      {formData.account_type !== 'personal' && (
        <div className="bg-[#C4A052]/5 border border-[#C4A052]/20 p-4 rounded-xl">
          <h3 className="font-semibold text-white mb-4">🏛️ Adresse de la Loge</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.lodge_street}
              onChange={(e) => updateFormData('lodge_street', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
              placeholder="Rue et numéro du Temple"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.lodge_postal_code}
                onChange={(e) => updateFormData('lodge_postal_code', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="Code postal"
              />
              <input
                type="text"
                value={formData.lodge_city}
                onChange={(e) => updateFormData('lodge_city', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="Ville"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Choix adresse par défaut */}
      {formData.account_type !== 'personal' && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Adresse de livraison par défaut
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="default_shipping"
                checked={formData.default_shipping_type === 'personal'}
                onChange={() => updateFormData('default_shipping_type', 'personal')}
                className="w-4 h-4 text-[#C4A052]"
              />
              <span className="text-white/70">Personnelle</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="default_shipping"
                checked={formData.default_shipping_type === 'lodge'}
                onChange={() => updateFormData('default_shipping_type', 'lodge')}
                className="w-4 h-4 text-[#C4A052]"
              />
              <span className="text-white/70">Loge</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Préférences */}
      <div className="border-t border-white/10 pt-6 mt-6">
        <h3 className="font-semibold text-white mb-4">Préférences de communication</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.newsletter_subscribed}
              onChange={(e) => updateFormData('newsletter_subscribed', e.target.checked)}
              className="w-5 h-5 text-[#C4A052] bg-white/5 border-white/20 rounded"
            />
            <span className="text-white/70">Recevoir notre newsletter (nouveautés, promotions)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.order_notifications}
              onChange={(e) => updateFormData('order_notifications', e.target.checked)}
              className="w-5 h-5 text-[#C4A052] bg-white/5 border-white/20 rounded"
            />
            <span className="text-white/70">Notifications sur mes commandes par email</span>
          </label>
        </div>
      </div>
    </div>
  );
  
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };
  
  const isLastStep = step === totalSteps;
  
  return (
    <div className="min-h-screen bg-[#0a0a0c] py-12 relative">
      {/* Cercles décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-2xl mx-auto px-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Atelier <span className="text-[#C4A052]">Art Royal</span>
          </h1>
        </div>
        
        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {renderStepIndicator()}
          
          {renderCurrentStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
                className="border-white/20 text-white hover:bg-white/5"
              >
                ← Précédent
              </Button>
            ) : (
              <div />
            )}
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#C4A052] hover:bg-[#b39142] text-white px-8"
              >
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#C4A052] hover:bg-[#b39142] text-white px-8"
              >
                Suivant →
              </Button>
            )}
          </div>
        </div>
        
        {/* Login link */}
        <p className="text-center mt-6 text-white/60">
          Déjà un compte ?{' '}
          <a href="/auth/login" className="text-[#C4A052] hover:underline font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
