import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/api-helpers';

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Clients</h1>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-semibold text-sm">Nom</th>
              <th className="p-4 font-semibold text-sm">Email</th>
              <th className="p-4 font-semibold text-sm">Commandes</th>
              <th className="p-4 font-semibold text-sm">Total Dépensé</th>
              <th className="p-4 font-semibold text-sm">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-muted/50">
                <td className="p-4 font-medium">{customer.name}</td>
                <td className="p-4 text-muted-foreground">{customer.email}</td>
                <td className="p-4">{customer.ordersCount || 0}</td>
                <td className="p-4 font-medium">{formatPrice(customer.totalSpent || 0)} TND</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun client trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
