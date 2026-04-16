import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  const { t, lang, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {t('nav.contact')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question concernant nos plantes ou votre commande.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold mb-6">Nos Coordonnées</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <MapPin />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Adresse</h3>
                <p className="text-muted-foreground">Khniss, Monastir 5011<br />Tunisie</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <Phone />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Téléphone</h3>
                <p className="text-muted-foreground">+216 73 000 000</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <Mail />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-muted-foreground">contact@florista.tn</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <Clock />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Heures d'ouverture</h3>
                <p className="text-muted-foreground">Lundi - Samedi: 9h00 - 19h00<br />Dimanche: Fermé</p>
              </div>
            </div>

            <div className="w-full h-64 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center mt-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
              <div className="bg-background/90 backdrop-blur p-4 rounded-xl shadow-lg relative z-10 flex items-center gap-3">
                <MapPin className="text-primary" />
                <span className="font-semibold">Florista, Khniss, Monastir</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="text-2xl font-serif font-bold mb-6">Envoyez-nous un message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <Input placeholder="Votre nom" className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="votre@email.com" className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sujet</label>
                <Input placeholder="Sujet de votre message" className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Comment pouvons-nous vous aider ?" className="min-h-[150px] rounded-xl" />
              </div>
              
              <Button size="lg" className="w-full h-12 rounded-xl text-lg font-bold">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
