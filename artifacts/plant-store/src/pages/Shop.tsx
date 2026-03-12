import { useState } from 'react';
import { useLocation } from 'wouter';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useGetProducts, useGetCategories } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Shop() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Debounce search in a real app, keeping it simple here
  const { data, isLoading } = useGetProducts({
    limit: 12,
    page: 1,
    search: search || undefined,
    category: category || undefined,
    sortBy
  });

  const { data: categories } = useGetCategories();

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-border">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              {t('shop.title')}
            </h1>
            <p className="text-muted-foreground">
              {data?.total || 0} produits trouvés
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Input 
                placeholder={t('action.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl bg-card border-border pr-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl bg-card border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  <SelectValue placeholder="Trier par" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('shop.sort.newest')}</SelectItem>
                <SelectItem value="priceAsc">{t('shop.sort.priceAsc')}</SelectItem>
                <SelectItem value="priceDesc">{t('shop.sort.priceDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-border pb-2">
                  <Filter size={18} /> {t('shop.filters')}
                </h3>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">{t('nav.categories')}</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setCategory('')}
                      className={`block w-full text-start text-sm px-3 py-2 rounded-lg transition-colors ${category === '' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      Toutes les catégories
                    </button>
                    {categories?.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setCategory(cat.slug)}
                        className={`block w-full text-start text-sm px-3 py-2 rounded-lg transition-colors ${category === cat.slug ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {lang === 'ar' ? cat.nameAr : cat.nameFr}
                        <span className="float-right text-xs opacity-50">({cat.productCount})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : data?.products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-xl text-muted-foreground">Aucun produit ne correspond à votre recherche.</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl"
                  onClick={() => { setSearch(''); setCategory(''); }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
