import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';

export default function Login() {
  const { t, lang, isRTL } = useLanguage();
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth(data);
        toast({
          title: lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Connexion réussie',
        });
        setLocation('/account');
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: data.message || 'Identifiants invalides'
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-center mb-8">
          {t('action.login')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl h-12"
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl h-12"
              placeholder="••••••••"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-lg font-bold"
            disabled={isLoading}
          >
            {isLoading ? '...' : t('action.login')}
          </Button>
        </form>
        
        <div className="mt-8 text-center text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            {t('action.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
