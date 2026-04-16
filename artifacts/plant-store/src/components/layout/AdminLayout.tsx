import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, LayoutDashboard, Package, ShoppingCart, Users, LogOut, Home, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdmin) setLocation('/');
  }, [isAdmin, setLocation]);

  if (!isAdmin) return null;

  const links = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { href: '/admin/products', label: 'Produits', icon: <Package size={18} /> },
    { href: '/admin/categories', label: 'Catégories', icon: <FolderOpen size={18} /> },
    { href: '/admin/orders', label: 'Commandes', icon: <ShoppingCart size={18} /> },
    { href: '/admin/customers', label: 'Clients', icon: <Users size={18} /> },
  ];

  const isActive = (link: typeof links[0]) =>
    link.exact ? location === link.href : location.startsWith(link.href);

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex-col hidden md:flex flex-shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-bold text-primary">Florista</span>
            <span className="text-xs font-medium text-muted-foreground ml-0.5">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2 mt-1">Navigation</p>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                isActive(link) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
              <Home size={16} />
              Retour au site
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { logout(); setLocation('/'); }}
          >
            <LogOut size={16} />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
