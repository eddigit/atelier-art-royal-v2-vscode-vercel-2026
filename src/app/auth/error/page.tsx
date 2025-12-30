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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1628] via-[#1a2a4a] to-[#0A1628] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-[#0A1628]">
              Erreur d'authentification
            </h1>
            <p className="text-gray-600">
              {errorMessage}
            </p>
            {error !== 'Default' && (
              <p className="text-xs text-gray-400 mt-2">
                Code erreur: {error}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-[#B8860B] hover:bg-[#C9A84C]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer de se connecter
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Besoin d'aide ?{' '}
              <a href="mailto:contact@artroyal.fr" className="text-[#B8860B] hover:underline">
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
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
