import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/api-helpers';
import { Plus, Pencil, Trash2, Upload, X, ImageOff, AlertTriangle, Star } from 'lucide-react';

interface Product {
  id: number;
  nameFr: string;
  nameAr: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  category?: { nameFr: string; id: number };
  categoryId?: number;
  descriptionFr?: string;
  descriptionAr?: string;
  careLevel?: string;
  lightRequirement?: string;
  wateringFrequency?: string;
}

interface Category { id: number; nameFr: string; }

const emptyForm = {
  nameFr: '', nameAr: '', descriptionFr: '', descriptionAr: '',
  price: '', stock: '0', categoryId: '', featured: false,
  careLevel: 'easy', lightRequirement: 'medium', wateringFrequency: 'weekly',
  images: [] as string[],
};

export default function AdminProducts() {
  const { token } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d)).catch(() => {});
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products?limit=200');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  const filtered = products.filter(p =>
    p.nameFr.toLowerCase().includes(search.toLowerCase()) ||
    (p.nameAr || '').includes(search)
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      nameFr: p.nameFr || '', nameAr: p.nameAr || '',
      descriptionFr: p.descriptionFr || '', descriptionAr: p.descriptionAr || '',
      price: String(p.price), stock: String(p.stock),
      categoryId: p.categoryId ? String(p.categoryId) : '',
      featured: p.featured, images: p.images || [],
      careLevel: p.careLevel || 'easy',
      lightRequirement: p.lightRequirement || 'medium',
      wateringFrequency: p.wateringFrequency || 'weekly',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.urls) setForm(f => ({ ...f, images: [...f.images, ...data.urls] }));
      else toast({ variant: 'destructive', title: 'Upload échoué' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur upload' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addImageUrl = (url: string) => {
    if (url.trim()) setForm(f => ({ ...f, images: [...f.images, url.trim()] }));
  };

  const handleSave = async () => {
    if (!form.nameFr || !form.price) { toast({ variant: 'destructive', title: 'Nom FR et Prix requis' }); return; }
    setSaving(true);
    try {
      const body = {
        name: form.nameFr, nameFr: form.nameFr, nameAr: form.nameAr,
        description: form.descriptionFr, descriptionFr: form.descriptionFr, descriptionAr: form.descriptionAr,
        price: parseFloat(form.price), stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        featured: form.featured, images: form.images,
        careLevel: form.careLevel, lightRequirement: form.lightRequirement, wateringFrequency: form.wateringFrequency,
      };
      const url = editing ? `/api/products/${editing.slug}` : '/api/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: editing ? 'Produit mis à jour' : 'Produit créé' });
        setShowModal(false);
        fetchProducts();
      } else {
        const d = await res.json();
        toast({ variant: 'destructive', title: 'Erreur', description: d.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur serveur' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Supprimer "${p.nameFr}" ?`)) return;
    const res = await fetch(`/api/products/${p.slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { toast({ title: 'Produit supprimé' }); fetchProducts(); }
    else toast({ variant: 'destructive', title: 'Erreur suppression' });
  };

  const stockBadge = (s: number) =>
    s > 10 ? 'bg-green-100 text-green-700' : s > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  if (loading) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produit(s)</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="rounded-xl h-10 w-full sm:w-56"
          />
          <Button onClick={openAdd} className="gap-2 rounded-xl shrink-0">
            <Plus size={16} /> Nouveau
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Produit</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Prix</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Stock</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Images</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <ImageOff size={16} className="text-muted-foreground/50" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{product.nameFr}</p>
                        <p className="text-xs text-muted-foreground">{product.nameAr}</p>
                      </div>
                      {product.featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{product.category?.nameFr || '—'}</td>
                  <td className="px-4 py-3.5 font-semibold">{formatPrice(product.price)} TND</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${stockBadge(product.stock)}`}>
                      {product.stock <= 5 && product.stock > 0 && <AlertTriangle size={10} />}
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {(product.images || []).slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-8 h-8 rounded-lg object-cover border border-border" />
                      ))}
                      {(product.images?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{(product.images?.length || 0) - 3}
                        </div>
                      )}
                      {!product.images?.length && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => openEdit(product)}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="destructive" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(product)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    {search ? 'Aucun résultat.' : 'Aucun produit.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h2 className="text-lg font-bold">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X size={18} /></Button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nom (FR) *</Label>
                  <Input value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="rounded-xl" placeholder="Monstera Deliciosa" />
                </div>
                <div className="space-y-1.5">
                  <Label>الاسم (AR)</Label>
                  <Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className="rounded-xl" dir="rtl" placeholder="مونستيرا" />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Description (FR)</Label>
                  <textarea
                    value={form.descriptionFr}
                    onChange={e => setForm({ ...form, descriptionFr: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Description en français..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>الوصف (AR)</Label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    dir="rtl"
                    placeholder="الوصف بالعربية..."
                  />
                </div>
              </div>

              {/* Price / Stock / Category */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Prix (TND) *</Label>
                  <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="rounded-xl" placeholder="29.90" />
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Sans catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                  </select>
                </div>
              </div>

              {/* Care Level / Light / Water */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Entretien</Label>
                  <select value={form.careLevel} onChange={e => setForm({ ...form, careLevel: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Lumière</Label>
                  <select value={form.lightRequirement} onChange={e => setForm({ ...form, lightRequirement: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="low">Faible</option>
                    <option value="medium">Indirecte</option>
                    <option value="high">Directe</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Arrosage</Label>
                  <select value={form.wateringFrequency} onChange={e => setForm({ ...form, wateringFrequency: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="daily">Quotidien</option>
                    <option value="twice-weekly">2× / semaine</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="biweekly">2× / mois</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </div>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted/50">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded" />
                <div>
                  <p className="text-sm font-medium">Produit mis en avant</p>
                  <p className="text-xs text-muted-foreground">Afficher sur la page d'accueil</p>
                </div>
                <Star size={16} className={form.featured ? 'text-amber-500 fill-amber-500 ml-auto' : 'text-muted-foreground ml-auto'} />
              </label>

              {/* Images */}
              <div className="space-y-2">
                <Label>Images du produit</Label>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">Principal</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                  <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Sélectionnez plusieurs images</p>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Envoi...' : 'Choisir des images'}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => e.target.files && handleImageUpload(e.target.files)} />
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Ou collez une URL d'image..."
                      className="rounded-xl text-xs"
                      onKeyDown={e => { if (e.key === 'Enter') { addImageUrl((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                    />
                    <Button variant="outline" size="sm" className="rounded-xl shrink-0"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement);
                        addImageUrl(input.value); input.value = '';
                      }}>
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-border shrink-0">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer le produit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
