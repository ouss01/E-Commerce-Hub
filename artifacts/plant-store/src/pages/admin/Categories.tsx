import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, X, FolderOpen } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const emptyForm = { name: '', nameFr: '', nameAr: '', description: '', image: '' };

export default function AdminCategories() {
  const { token } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, nameFr: cat.nameFr, nameAr: cat.nameAr, description: cat.description || '', image: cat.image || '' });
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload/single', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, image: data.url }));
      else toast({ variant: 'destructive', title: 'Upload échoué' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nameFr) { toast({ variant: 'destructive', title: 'Nom FR requis' }); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/categories/${editing.slug}` : '/api/categories';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: editing ? 'Catégorie mise à jour' : 'Catégorie créée' });
        setShowModal(false);
        fetchCategories();
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

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Supprimer la catégorie "${cat.nameFr}" ?`)) return;
    const res = await fetch(`/api/categories/${cat.slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { toast({ title: 'Catégorie supprimée' }); fetchCategories(); }
    else toast({ variant: 'destructive', title: 'Erreur suppression' });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} catégorie(s)</p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl">
          <Plus size={16} /> Nouvelle Catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {cat.image ? (
                <img src={cat.image} alt={cat.nameFr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen size={40} className="text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base">{cat.nameFr}</h3>
              <p className="text-sm text-muted-foreground">{cat.nameAr}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">{cat.productCount} produit(s)</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => openEdit(cat)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(cat)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune catégorie. Créez-en une !</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X size={18} /></Button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nom (FR) *</Label>
                  <Input value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value, name: e.target.value })} className="rounded-xl" placeholder="Plantes d'intérieur" />
                </div>
                <div className="space-y-1.5">
                  <Label>الاسم (AR)</Label>
                  <Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className="rounded-xl" dir="rtl" placeholder="نباتات داخلية" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl" placeholder="Description courte..." />
              </div>
              <div className="space-y-1.5">
                <Label>Image de la catégorie</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4">
                  {form.image ? (
                    <div className="relative">
                      <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={() => setForm({ ...form, image: '' })} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">Glissez une image ou</p>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        {uploading ? 'Upload...' : 'Choisir une image'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">ou coller une URL :</p>
                      <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="rounded-xl mt-2 text-xs" placeholder="https://..." />
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
