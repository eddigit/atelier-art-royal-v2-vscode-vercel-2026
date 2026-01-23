'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const errorMessages: { [key: string]: string } = {
  Configuration: 'Il y a un problème de configuration du serveur.',
  AccessDenied: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  Verification: 'Le lien de vérification a expiré ou a déjà été utilisé.',
  Default: 'Une erreur est survenue lors de la connexion.',
  CredentialsSignin: 'Email ou mot de passe incorrect.',
  OAuthSignin: 'Erreur lors de la connexion OAuth.',
  OAuthCallback: 'Erreur lors du callback OAuth.',
  OAuthCreateAccount: 'Impossible de créer un compte avec ce provider OAuth.',
  EmailCreateAccount: 'Impossible de créer un compte avec cet email.',
  Callback: 'Erreur lors du callback d\'authentification.',
  OAuthAccountNotLinked: 'Cet email est déjà associé à un autre compte.',
  SessionRequired: 'Vous devez être connecté pour accéder à cette page.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#C4A052]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-white">
              Erreur d'authentification
            </h1>
            <p className="text-white/60">
              {errorMessage}
            </p>
            {error !== 'Default' && (
              <p className="text-xs text-white/40 mt-2">
                Code erreur: {error}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-[#C4A052] hover:bg-[#b39142] text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer de se connecter
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Besoin d'aide ?{' '}
              <a href="mailto:contact@artroyal.fr" className="text-[#C4A052] hover:underline">
                Contactez-nous
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
