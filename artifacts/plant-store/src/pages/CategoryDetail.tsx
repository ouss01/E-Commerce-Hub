import { useParams, Link } from 'wouter';
import { useGetCategoryBySlug, useGetProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();

  const { data: category, isLoading: isCategoryLoading } = useGetCategoryBySlug(slug!);
  const { data: productsData, isLoading: isProductsLoading } = useGetProducts({ category: slug, limit: 50 });

  if (isCategoryLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Catégorie introuvable</h1>
        <Link href="/categories">
          <Button>Retour aux catégories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Hero */}
      <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden bg-primary/5">
        {category.image && (
          <img 
            src={category.image} 
            alt={category.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {lang === 'ar' ? category.nameAr : category.nameFr}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/categories">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
              Toutes les catégories
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-muted-foreground">
            {productsData?.total || 0} produits
          </span>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <p className="text-xl text-muted-foreground">Aucun produit dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData?.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
