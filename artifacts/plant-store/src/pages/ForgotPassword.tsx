import { useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Leaf, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSent(true);
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border shadow-lg text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {lang === 'ar' ? 'تم إرسال الرسالة!' : 'Email envoyé !'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {lang === 'ar'
              ? `إذا كان البريد الإلكتروني ${email} مسجلاً، ستتلقى رابط إعادة التعيين.`
              : `Si l'adresse ${email} est enregistrée, vous recevrez un lien de réinitialisation dans quelques minutes.`}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {lang === 'ar' ? 'تحقق من مجلد البريد غير المرغوب فيه.' : 'Vérifiez aussi votre dossier spam.'}
          </p>
          <Link href="/login">
            <Button className="rounded-xl">
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
            </Button>
          </Link>
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
          {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {lang === 'ar'
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
            : 'Entrez votre email et nous vous enverrons un lien de réinitialisation.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold" disabled={isLoading}>
            {isLoading ? '...' : (lang === 'ar' ? 'إرسال الرابط' : 'Envoyer le lien')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            <ArrowLeft size={14} />
            {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
          </Link>
        </div>
      </div>
    </div>
  );
}
