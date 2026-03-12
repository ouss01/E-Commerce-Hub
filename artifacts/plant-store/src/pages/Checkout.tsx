import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { useAuthOptions, formatPrice } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const authOptions = useAuthOptions();
  const { mutate: createOrder, isPending } = useCreateOrder(authOptions);

  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "Monastir",
    paymentMethod: "COD"
  });

  if (items.length === 0 && !success) {
    setLocation('/shop');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder({
      data: {
        ...formData,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      }
    }, {
      onSuccess: () => {
        setSuccess(true);
        clearCart();
        window.scrollTo(0, 0);
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4 py-20 text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
          {lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Commande confirmée !'}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg">
          {lang === 'ar' 
            ? 'شكراً لتسوقك معنا. سنتصل بك قريباً لتأكيد موعد التوصيل.' 
            : 'Merci pour votre achat. Nous vous contacterons bientôt pour confirmer la livraison.'}
        </p>
        <Button size="lg" className="rounded-xl px-8" onClick={() => setLocation('/')}>
          {t('nav.home')}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-10 border-b border-border pb-6">
          {t('checkout.title')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Form */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                  Informations personnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input id="name" required className="rounded-xl h-12 bg-background" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input id="phone" type="tel" required className="rounded-xl h-12 bg-background" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required className="rounded-xl h-12 bg-background" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                  {t('checkout.shipping')}
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <select id="city" required className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.shippingCity} onChange={e => setFormData({...formData, shippingCity: e.target.value})}>
                      <option value="Tunis">Tunis</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Sfax">Sfax</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse complète *</Label>
                    <Input id="address" required className="rounded-xl h-12 bg-background" value={formData.shippingAddress} onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                  {t('checkout.payment')}
                </h2>
                <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center gap-3">
                  <input type="radio" id="cod" checked readOnly className="w-5 h-5 text-primary" />
                  <Label htmlFor="cod" className="font-bold text-base cursor-pointer">
                    {t('checkout.cod')}
                  </Label>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-lg sticky top-28">
              <h3 className="font-serif text-2xl font-bold mb-6">Résumé</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.image || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-2">{lang === 'ar' ? item.nameAr : item.nameFr}</p>
                      <p className="text-muted-foreground text-sm">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)} {t('general.price')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span className="text-primary font-semibold">Gratuite</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)} {t('general.price')}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isPending}
                className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
              >
                {isPending ? t('status.loading') : 'Confirmer la commande'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} /> Paiement sécurisé à la livraison
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
