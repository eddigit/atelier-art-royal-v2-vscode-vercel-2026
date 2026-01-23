'use client';

import { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Erreur de connexion',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Connexion réussie',
          description: 'Vous êtes maintenant connecté',
        });
        
        // Récupérer la session pour vérifier le rôle
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        // Rediriger vers admin si role admin, sinon vers callback ou compte
        if (session?.user?.role === 'admin') {
          router.push(callbackUrl || '/admin');
        } else {
          router.push(callbackUrl || '/account');
        }
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-4">
      {/* Cercles décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C4A052]/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-playfair font-bold text-white">
              Connexion
            </h1>
            <p className="text-white/60">
              Accédez à votre espace Atelier Art Royal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent placeholder:text-white/30"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C4A052] hover:bg-[#b39142] text-white"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="text-center space-y-2 pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-[#C4A052] hover:text-[#d4b066] font-medium">
                Créer un compte
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/" className="text-white/40 hover:text-white/60">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
