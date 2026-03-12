import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, LayoutDashboard, Package, ShoppingCart, Users, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, setLocation]);

  if (!isAdmin) return null;

  const links = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/products', label: 'Produits', icon: <Package size={20} /> },
    { href: '/admin/orders', label: 'Commandes', icon: <ShoppingCart size={20} /> },
    { href: '/admin/customers', label: 'Clients', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-bold text-primary">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                location === link.href 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <div className="px-4 py-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Home size={18} />
              Retour au site
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { logout(); setLocation('/'); }}>
            <LogOut size={18} />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
