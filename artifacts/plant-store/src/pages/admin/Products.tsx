import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/api-helpers';

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.slug !== slug));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Produits</h1>
        <Button>Nouveau Produit</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-semibold text-sm">Nom</th>
              <th className="p-4 font-semibold text-sm">Catégorie</th>
              <th className="p-4 font-semibold text-sm">Prix</th>
              <th className="p-4 font-semibold text-sm">Stock</th>
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-muted/50">
                <td className="p-4">
                  <div className="font-medium">{product.nameFr}</div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {product.category?.nameFr || '-'}
                </td>
                <td className="p-4 font-medium">
                  {formatPrice(product.price)} TND
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Éditer</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.slug)}>
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun produit trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
