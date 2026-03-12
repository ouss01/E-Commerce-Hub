import { Link } from 'wouter';
import { ArrowRight, Truck, ShieldCheck, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetFeaturedProducts, useGetCategories } from '@workspace/api-client-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { lang, t, isRTL } = useLanguage();
  const { data: featured, isLoading: isFeaturedLoading } = useGetFeaturedProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero.png`}
          alt="Beautiful indoor plants" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        
        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-medium leading-relaxed drop-shadow-md">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="rounded-xl h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {t('action.buyNow')}
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-all">
                  {t('nav.categories')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
            <div className="flex items-center justify-center gap-4 pt-4 md:pt-0">
              <Truck size={36} className="opacity-80" />
              <div>
                <h3 className="font-bold text-lg">{t('home.benefits.delivery')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('home.benefits.deliveryDesc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-8 md:pt-0">
              <ShieldCheck size={36} className="opacity-80" />
              <div>
                <h3 className="font-bold text-lg">{t('home.benefits.quality')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('home.benefits.qualityDesc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-8 md:pt-0">
              <HeadphonesIcon size={36} className="opacity-80" />
              <div>
                <h3 className="font-bold text-lg">{t('home.benefits.support')}</h3>
                <p className="text-primary-foreground/70 text-sm">{t('home.benefits.supportDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-pattern">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('nav.categories')}
            </h2>
            <Link href="/categories" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              {t('action.viewDetails')} 
              <ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isCategoriesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))
            ) : categories?.slice(0, 3).map(cat => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800&q=80'} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">
                    {lang === 'ar' ? cat.nameAr : cat.nameFr}
                  </h3>
                  <p className="text-white/80 text-sm font-medium">
                    {cat.productCount} Produits
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {t('home.featured')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection de plantes les plus appréciées pour apporter de la vie à votre espace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isFeaturedLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
              ))
            ) : featured?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button size="lg" variant="outline" className="rounded-xl px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Voir toute la boutique
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
