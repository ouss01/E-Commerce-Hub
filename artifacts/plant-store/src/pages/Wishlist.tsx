import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Wishlist() {
  const { isAuthenticated, token } = useAuth();
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWishlist(data);
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWishlist();
  }, [isAuthenticated, token, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-serif font-bold">Mes Favoris</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4">Votre liste est vide</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Vous n'avez pas encore ajouté de plantes à vos favoris. Découvrez notre collection pour trouver votre bonheur.
          </p>
          <Link href="/shop">
            <Button size="lg" className="rounded-xl">Parcourir la boutique</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={async () => {
                  try {
                    await fetch('/api/wishlist', {
                      method: 'DELETE',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify({ productId: item.productId })
                    });
                    setWishlist(wishlist.filter(w => w.productId !== item.productId));
                  } catch (e) {
                    console.error('Failed to remove item', e);
                  }
                }}
              >
                Retirer
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
