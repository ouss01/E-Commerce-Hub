import { Link } from 'wouter';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();

  const name = lang === 'ar' ? product.nameAr : product.nameFr;
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80'; // fallback stock plant

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* product indoor plant */}
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {lang === 'ar' ? 'مميز' : 'Vedette'}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {lang === 'ar' ? 'كمية محدودة' : 'Stock limité'}
            </span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button className="w-9 h-9 bg-white/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors">
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {product.category ? (lang === 'ar' ? product.category.nameAr : product.category.nameFr) : ''}
        </div>
        <Link href={`/product/${product.slug}`} className="block mb-2">
          <h3 className="font-serif text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-sans font-bold text-lg text-primary">
            {formatPrice(product.price)} {t('general.price')}
          </span>
          <Button 
            size="icon" 
            variant="secondary"
            className="rounded-full w-10 h-10 hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => addItem({
              productId: product.id,
              name: product.name,
              nameFr: product.nameFr,
              nameAr: product.nameAr,
              price: product.price,
              image: image
            })}
            disabled={product.stock === 0}
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
