import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, Menu, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { itemCount, setIsOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const toggleLang = () => setLang(lang === 'fr' ? 'ar' : 'fr');

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Florista Logo" className="w-8 h-8" />
            <span className="font-serif text-2xl font-bold text-primary tracking-tight">Florista</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-semibold transition-colors hover:text-primary relative py-2 ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}>
            {t('nav.home')}
            {location === '/' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </Link>

          <Link href="/shop" className={`text-sm font-semibold transition-colors hover:text-primary relative py-2 ${location === '/shop' ? 'text-primary' : 'text-foreground/80'}`}>
            {t('nav.shop')}
            {location === '/shop' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </Link>

          {/* Categories dropdown */}
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <Link
              href="/categories"
              className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary relative py-2 ${location.startsWith('/categories') ? 'text-primary' : 'text-foreground/80'}`}
            >
              {t('nav.categories')}
              <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              {location.startsWith('/categories') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </Link>
            {catOpen && categories.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-2 min-w-[200px]">
                  <Link href="/categories" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium mb-1">
                    {lang === 'ar' ? 'كل الفئات' : 'Toutes les catégories'}
                  </Link>
                  <div className="h-px bg-border mb-1" />
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      {cat.image && <img src={cat.image} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                      <span className="text-sm font-medium">{lang === 'ar' ? cat.nameAr : cat.nameFr}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{cat.productCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/about" className={`text-sm font-semibold transition-colors hover:text-primary relative py-2 ${location === '/about' ? 'text-primary' : 'text-foreground/80'}`}>
            {t('nav.about')}
            {location === '/about' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </Link>

          <Link href="/contact" className={`text-sm font-semibold transition-colors hover:text-primary relative py-2 ${location === '/contact' ? 'text-primary' : 'text-foreground/80'}`}>
            {t('nav.contact')}
            {location === '/contact' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={toggleLang} title="Language" className="hidden sm:flex text-foreground/70 hover:text-primary w-9 h-9">
            <span className="font-bold text-xs uppercase">{lang}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                <User size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">Dashboard Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">Mon Compte</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">Favoris</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    {t('action.logout')}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">{t('action.login')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="cursor-pointer">{t('action.register')}</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary transition-all duration-300"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {[
            { href: '/', label: t('nav.home') },
            { href: '/shop', label: t('nav.shop') },
            { href: '/categories', label: t('nav.categories') },
            { href: '/about', label: t('nav.about') },
            { href: '/contact', label: t('nav.contact') },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl font-medium text-sm ${location === link.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
              {link.label}
            </Link>
          ))}
          {categories.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted ml-4">
              — {lang === 'ar' ? cat.nameAr : cat.nameFr}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            <Button variant="ghost" onClick={toggleLang} className="w-full justify-start gap-2 text-sm">
              <span className="font-bold uppercase">{lang}</span>
              {lang === 'fr' ? 'Passer en Arabe' : 'التبديل للفرنسية'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
