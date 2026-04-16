import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-card pt-16 pb-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Florista Logo" className="w-8 h-8" />
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">Florista</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-foreground">Navigation</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">{t('nav.home')}</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">{t('nav.shop')}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('nav.about')}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-foreground">{t('nav.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                <span>{t('general.address')}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone size={20} className="text-primary shrink-0" />
                <span dir="ltr">+216 55 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail size={20} className="text-primary shrink-0" />
                <span>hello@florista.tn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-foreground">{t('home.newsletter.title')}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('home.newsletter.desc')}
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Email..." 
                className="bg-background border-border focus-visible:ring-primary rounded-xl"
              />
              <Button type="submit" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                {t('action.subscribe')}
              </Button>
            </form>
          </div>

        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Florista Plants. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
