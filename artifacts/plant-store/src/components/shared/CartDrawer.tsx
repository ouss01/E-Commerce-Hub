import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clsx } from 'clsx';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, total } = useCart();
  const { lang, t, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className={clsx(
        "fixed top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out",
        isRTL ? "left-0 translate-x-0" : "right-0 translate-x-0"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary" />
            {t('cart.title')}
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p className="text-lg">{t('cart.empty')}</p>
              <Button 
                className="mt-6 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.shop')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={item.image || ''} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground leading-tight">
                          {lang === 'ar' ? item.nameAr : item.nameFr}
                        </h3>
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(item.price)} {t('general.price')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-muted rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background shadow-sm transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background shadow-sm transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card">
            <div className="flex justify-between mb-2 text-muted-foreground">
              <span>{t('cart.subtotal')}</span>
              <span>{formatPrice(total)} {t('general.price')}</span>
            </div>
            <div className="flex justify-between mb-6 font-bold text-xl text-foreground">
              <span>{t('cart.total')}</span>
              <span className="text-primary">{formatPrice(total)} {t('general.price')}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-14 text-lg rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                {t('action.checkout')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
