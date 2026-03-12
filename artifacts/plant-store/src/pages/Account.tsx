import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/api-helpers';

export default function Account() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/users/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, token, setLocation]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        // We'd ideally update user in context here if API returned updated user
        toast({ title: 'Profil mis à jour' });
      } else {
        toast({ variant: 'destructive', title: 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Mon Compte</h1>
          <p className="text-muted-foreground">Bonjour, {user?.name}</p>
        </div>
        <Button variant="outline" onClick={logout} className="text-destructive">
          {t('action.logout')}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="bg-card p-6 rounded-2xl border border-border">
          <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input 
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? '...' : t('action.save')}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <p className="text-lg text-muted-foreground mb-4">Vous n'avez pas encore passé de commande.</p>
              <Button onClick={() => setLocation('/shop')}>Découvrir nos plantes</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-card p-6 rounded-2xl border border-border flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold">Commande #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="mt-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatPrice(order.total)} {t('general.price')}</p>
                    <p className="text-sm text-muted-foreground">{order.items?.length || 0} articles</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
