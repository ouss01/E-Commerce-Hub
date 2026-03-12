import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetCategories } from '@workspace/api-client-react';

export default function Categories() {
  const { lang, t } = useLanguage();
  const { data: categories, isLoading } = useGetCategories();

  return (
    <div className="bg-background min-h-screen py-16 bg-pattern">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {t('nav.categories')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez la plante parfaite selon vos besoins et votre espace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-card border border-border animate-pulse" />
            ))
          ) : categories?.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img 
                src={cat.image || 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800&q=80'} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <h3 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">
                  {lang === 'ar' ? cat.nameAr : cat.nameFr}
                </h3>
                <span className="inline-block bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                  {cat.productCount} Produits
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
