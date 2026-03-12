import { useParams } from 'wouter';
import { ShoppingBag, Heart, Droplets, Sun, Activity, Star } from 'lucide-react';
import { useGetProduct } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import NotFound from './not-found';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  
  const { data: product, isLoading, error } = useGetProduct(slug);

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (error || !product) {
    return <NotFound />;
  }

  const name = lang === 'ar' ? product.nameAr : product.nameFr;
  const desc = lang === 'ar' ? product.descriptionAr : product.descriptionFr;
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80';

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Image Gallery */}
            <div className="bg-muted relative h-[50vh] lg:h-auto min-h-[500px]">
              <img 
                src={image} 
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-2 text-sm text-primary font-bold tracking-wider uppercase">
                {product.category ? (lang === 'ar' ? product.category.nameAr : product.category.nameFr) : ''}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                {name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)} {t('general.price')}
                </span>
                {product.stock > 0 ? (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {t('status.inStock')}
                  </span>
                ) : (
                  <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-semibold">
                    {t('status.outOfStock')}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {desc}
              </p>

              {/* Care Info */}
              <div className="grid grid-cols-3 gap-4 mb-10 py-6 border-y border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-primary">
                    <Sun size={24} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t('product.light')}</span>
                  <span className="font-medium">{product.lightRequirement || 'Lumière indirecte'}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-blue-500">
                    <Droplets size={24} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t('product.water')}</span>
                  <span className="font-medium">{product.wateringFrequency || '1x par semaine'}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-accent-foreground">
                    <Activity size={24} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t('product.care')}</span>
                  <span className="font-medium">{product.careLevel || 'Facile'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-auto">
                <Button 
                  size="lg" 
                  className="flex-1 h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  disabled={product.stock === 0}
                  onClick={() => addItem({
                    productId: product.id,
                    name: product.name,
                    nameFr: product.nameFr,
                    nameAr: product.nameAr,
                    price: product.price,
                    image: image
                  })}
                >
                  <ShoppingBag className="mr-2" size={20} />
                  {t('action.addToCart')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 w-14 rounded-xl p-0 text-muted-foreground hover:text-red-500 hover:border-red-500 transition-colors"
                >
                  <Heart size={24} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
