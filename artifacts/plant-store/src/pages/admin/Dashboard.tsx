import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatPrice } from '@/lib/api-helpers';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!stats) return <div className="p-8">Erreur de chargement des statistiques.</div>;

  const COLORS = ['#2F6F4E', '#3b82f6', '#eab308', '#a855f7'];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de Bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Revenu Total</p>
          <h3 className="text-2xl font-bold text-primary">{formatPrice(stats.totalRevenue || 0)} TND</h3>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Commandes</p>
          <h3 className="text-2xl font-bold">{stats.totalOrders || 0}</h3>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Produits</p>
          <h3 className="text-2xl font-bold">{stats.totalProducts || 0}</h3>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Clients</p>
          <h3 className="text-2xl font-bold">{stats.totalCustomers || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenus Mensuels</h3>
          <div className="h-[300px]">
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} TND`, 'Revenu']} />
                  <Bar dataKey="revenue" fill="#2F6F4E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Pas de données de revenus</div>
            )}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Statut des Commandes</h3>
          <div className="h-[300px]">
            {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {stats.ordersByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Pas de données de commandes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
