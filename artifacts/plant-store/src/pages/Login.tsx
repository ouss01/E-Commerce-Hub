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
  const { t, lang } = useLanguage();
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
        toast({ title: lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Connexion réussie' });
        setLocation('/account');
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: data.error || 'Identifiants invalides' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'microsoft' | 'apple') => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-center mb-8">{t('action.login')}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-12" placeholder="votre@email.com" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
              </Link>
            </div>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-12" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={isLoading}>
            {isLoading ? '...' : t('action.login')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'أو' : 'ou continuer avec'}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            title="Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('microsoft')}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            title="Microsoft"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
              <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
            </svg>
            <span className="text-sm font-medium">Microsoft</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            title="Apple"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-sm font-medium">Apple</span>
          </button>
        </div>

        <div className="mt-8 text-center text-muted-foreground">
          {lang === 'ar' ? 'ليس لديك حساب؟' : 'Pas encore de compte ?'}{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">{t('action.register')}</Link>
        </div>
      </div>
    </div>
  );
}
