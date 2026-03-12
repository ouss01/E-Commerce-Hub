import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, MapPin, Target } from 'lucide-react';

export default function About() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {t('nav.about')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {lang === 'ar' 
              ? "متجر نباتاتنا وُلد من شغف الطبيعة والرغبة في تجميل المنازل التونسية."
              : "Notre boutique de plantes est née de la passion pour la nature et le désir d'embellir les intérieurs tunisiens."}
          </p>
        </div>
      </div>

      {/* Stats/Info */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Leaf size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'نباتات طبيعية' : 'Plantes Naturelles'}</h3>
            <p className="text-muted-foreground">Des plantes d'intérieur soigneusement sélectionnées et acclimatées pour votre intérieur.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'مهمتنا' : 'Notre Mission'}</h3>
            <p className="text-muted-foreground">Apporter une touche de verdure et de bien-être dans chaque foyer tunisien.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'موقعنا' : 'Notre Localisation'}</h3>
            <p className="text-muted-foreground">Khniss, Monastir 5011, Tunisie. Un espace dédié à la passion des plantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
