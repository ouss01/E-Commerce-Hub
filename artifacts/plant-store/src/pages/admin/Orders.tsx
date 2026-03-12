import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/api-helpers';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Commandes</h1>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Client</th>
              <th className="p-4 font-semibold text-sm">Date</th>
              <th className="p-4 font-semibold text-sm">Total</th>
              <th className="p-4 font-semibold text-sm">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-muted/50">
                <td className="p-4 font-medium">#{order.id}</td>
                <td className="p-4">
                  <div>{order.user?.name || 'Guest'}</div>
                  <div className="text-xs text-muted-foreground">{order.user?.email || ''}</div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 font-medium">
                  {formatPrice(order.total)} TND
                </td>
                <td className="p-4">
                  <select 
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">En cours</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune commande trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
