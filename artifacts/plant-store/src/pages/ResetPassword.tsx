import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Leaf, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ variant: 'destructive', title: 'Erreur', description: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Erreur', description: lang === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Mot de passe trop court (6 caractères min)' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setLocation('/login'), 3000);
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: data.error || lang === 'ar' ? 'رابط منتهي الصلاحية' : 'Lien invalide ou expiré' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'رابط غير صالح.' : 'Lien invalide.'}</p>
          <Link href="/forgot-password"><Button className="rounded-xl">{lang === 'ar' ? 'طلب رابط جديد' : 'Demander un nouveau lien'}</Button></Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">{lang === 'ar' ? 'تم إعادة التعيين!' : 'Mot de passe réinitialisé !'}</h2>
          <p className="text-muted-foreground">{lang === 'ar' ? 'سيتم توجيهك لتسجيل الدخول...' : 'Redirection vers la connexion...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-serif font-bold text-center mb-2">
          {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Nouveau mot de passe'}
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {lang === 'ar' ? 'اختر كلمة مرور جديدة لحسابك.' : 'Choisissez un nouveau mot de passe pour votre compte.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-12" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</Label>
            <Input id="confirm" type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} className="rounded-xl h-12" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold" disabled={isLoading}>
            {isLoading ? '...' : (lang === 'ar' ? 'حفظ كلمة المرور' : 'Enregistrer')}
          </Button>
        </form>
      </div>
    </div>
  );
}
