import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { lang } = useLanguage();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 text-center">
      <img 
        src={`${import.meta.env.BASE_URL}images/not-found.png`} 
        alt="Not Found" 
        className="w-64 h-64 object-contain mb-8 opacity-80"
      />
      <h1 className="text-5xl font-serif font-bold text-foreground mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        {lang === 'ar' 
          ? 'عذراً، هذه الصفحة غير موجودة.' 
          : 'Oups! Cette page n\'existe pas ou a été déplacée.'}
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-xl px-8 h-14 text-lg">
          {lang === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
        </Button>
      </Link>
    </div>
  );
}
