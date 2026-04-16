import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatPrice } from '@/lib/api-helpers';
import {
  TrendingUp, ShoppingCart, Package, Users,
  AlertTriangle, Clock, CheckCircle, Truck
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'En attente',   color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
  processing: { label: 'En cours',     color: 'bg-blue-100 text-blue-800',    icon: <Package size={12} /> },
  shipped:    { label: 'Expédié',      color: 'bg-purple-100 text-purple-800', icon: <Truck size={12} /> },
  delivered:  { label: 'Livré',        color: 'bg-green-100 text-green-800',  icon: <CheckCircle size={12} /> },
};

const PIE_COLORS = ['#eab308', '#3b82f6', '#a855f7', '#22c55e'];

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      Chargement...
    </div>
  );
  if (!stats) return <div className="p-8 text-destructive">Erreur de chargement.</div>;

  const statCards = [
    { label: 'Revenu Total', value: `${formatPrice(stats.totalRevenue || 0)} TND`, icon: <TrendingUp size={20} />, color: 'text-emerald-600 bg-emerald-50', trend: null },
    { label: 'Commandes', value: stats.totalOrders || 0, icon: <ShoppingCart size={20} />, color: 'text-blue-600 bg-blue-50', sub: `${stats.pendingOrders || 0} en attente` },
    { label: 'Produits', value: stats.totalProducts || 0, icon: <Package size={20} />, color: 'text-violet-600 bg-violet-50', sub: stats.lowStockProducts > 0 ? `⚠ ${stats.lowStockProducts} stock bas` : 'Tous en stock', warn: stats.lowStockProducts > 0 },
    { label: 'Clients', value: stats.totalCustomers || 0, icon: <Users size={20} />, color: 'text-orange-600 bg-orange-50', sub: null },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            {card.sub && (
              <p className={`text-xs mt-1 ${card.warn ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                {card.warn && <AlertTriangle size={10} className="inline mr-1" />}{card.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-base font-bold mb-5">Revenus Mensuels (6 derniers mois)</h3>
          <div className="h-[240px]">
            {stats.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} TND`, 'Revenu']} />
                  <Bar dataKey="revenue" fill="#2F6F4E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-base font-bold mb-5">Statut des Commandes</h3>
          <div className="h-[240px]">
            {stats.ordersByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.ordersByStatus} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="status">
                    {stats.ordersByStatus.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, _: any, p: any) => [v, STATUS_LABELS[p.payload.status]?.label || p.payload.status]} />
                  <Legend formatter={(v) => STATUS_LABELS[v]?.label || v} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Aucune commande</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-bold">Dernières Commandes</h3>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">Voir tout →</Link>
        </div>
        {stats.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-xs text-muted-foreground uppercase">ID</th>
                  <th className="px-5 py-3 font-semibold text-xs text-muted-foreground uppercase">Client</th>
                  <th className="px-5 py-3 font-semibold text-xs text-muted-foreground uppercase">Date</th>
                  <th className="px-5 py-3 font-semibold text-xs text-muted-foreground uppercase">Total</th>
                  <th className="px-5 py-3 font-semibold text-xs text-muted-foreground uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order: any) => {
                  const s = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800', icon: null };
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{order.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{order.customerName || 'Guest'}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail || ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-3.5 font-semibold">{formatPrice(order.total)} TND</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                          {s.icon}{s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">Aucune commande</div>
        )}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900">{stats.lowStockProducts} produit(s) en stock bas</p>
            <p className="text-sm text-amber-700 mt-0.5">Certains produits ont un stock inférieur à 5 unités.</p>
            <Link href="/admin/products" className="text-sm font-semibold text-amber-800 underline mt-2 inline-block">Gérer l'inventaire →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
