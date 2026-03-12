import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const error = params.get('error');

    if (error) {
      const messages: Record<string, string> = {
        oauth_cancelled: 'Connexion annulée.',
        oauth_failed: 'Échec de la connexion OAuth.',
        oauth_no_email: 'Email non fourni par le fournisseur.',
        invalid_token: 'Token invalide ou expiré.',
      };
      toast({ variant: 'destructive', title: 'Erreur', description: messages[error] || 'Une erreur est survenue.' });
      setLocation('/login');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth({ token, user });
        toast({ title: 'Connexion réussie !' });
        setLocation('/account');
      } catch {
        setLocation('/login');
      }
    } else {
      setLocation('/login');
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
        <Leaf className="w-6 h-6 text-primary" />
      </div>
      <p className="text-muted-foreground">Connexion en cours...</p>
    </div>
  );
}
