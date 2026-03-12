import { Link } from 'wouter';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, isRTL, t, lang } = useCart();
  const { t: translate } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
          {translate('cart.empty')}
        </h2>
        <Link href="/shop">
          <Button size="lg" className="rounded-xl px-8 mt-4">
            Continuer vos achats
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-4xl font-serif font-bold mb-10">{translate('cart.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{lang === 'ar' ? item.nameAr : item.nameFr}</h3>
                    <p className="text-primary font-bold">{formatPrice(item.price)} {translate('general.price')}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center bg-muted rounded-lg">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none rounded-l-lg"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none rounded-r-lg"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <div className="text-sm font-medium ml-auto">
                    Total: {formatPrice(item.price * item.quantity)} {translate('general.price')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-28">
            <h3 className="text-xl font-bold mb-6">Résumé de la commande</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{translate('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(total)} {translate('general.price')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium">Calculé à l'étape suivante</span>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>{translate('cart.total')}</span>
                <span className="text-primary">{formatPrice(total)} {translate('general.price')}</span>
              </div>
            </div>
            
            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full rounded-xl gap-2 h-14 text-lg">
                {translate('action.checkout')}
                <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
