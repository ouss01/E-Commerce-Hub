import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ShieldCheck, Phone, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { useAuthOptions, formatPrice } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type PaymentMethod = "cash_on_delivery" | "flouci" | "click2pay";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const authOptions = useAuthOptions();
  const { toast } = useToast();
  const { mutate: createOrder, isPending } = useCreateOrder(authOptions);

  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "Monastir",
  });

  if (items.length === 0 && !success) {
    setLocation('/shop');
    return null;
  }

  const handleFlouciPayment = async (orderId: number) => {
    setIsPaymentLoading(true);
    try {
      const res = await fetch('/api/payment/flouci/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: lang === 'ar' ? 'فشل الدفع عبر فلوسي' : 'Échec du paiement Flouci' });
        setIsPaymentLoading(false);
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
      setIsPaymentLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder({
      data: {
        ...formData,
        paymentMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      }
    }, {
      onSuccess: (order: any) => {
        clearCart();
        if (paymentMethod === "flouci") {
          handleFlouciPayment(order.id || order.orderId || 0);
        } else if (paymentMethod === "click2pay") {
          const orderId = order.id || order.orderId || 0;
          const APP_URL = window.location.origin;
          const returnUrl = encodeURIComponent(`${APP_URL}/checkout/success?orderId=${orderId}`);
          const click2payUrl = `https://www.click2pay.com.tn/payment?amount=${(total * 1000).toFixed(0)}&order_id=${orderId}&return_url=${returnUrl}&merchant_key=${encodeURIComponent(import.meta.env.VITE_CLICK2PAY_MERCHANT_KEY || '')}`;
          window.location.href = click2payUrl;
        } else {
          setSuccess(true);
          window.scrollTo(0, 0);
        }
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue' });
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
        <p className="text-lg text-muted-foreground mb-4 max-w-lg">
          {lang === 'ar'
            ? 'شكراً لتسوقك معنا. لقد اخترت الدفع عند الاستلام.'
            : 'Merci pour votre commande. Vous avez choisi le paiement à la livraison.'}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 max-w-md flex gap-4 items-start text-start">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Phone size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800 text-base mb-1">
              {lang === 'ar' ? '📞 سنتصل بك لتأكيد الطلب' : '📞 Nous vous appellerons pour confirmer'}
            </p>
            <p className="text-amber-700 text-sm">
              {lang === 'ar'
                ? 'سيتصل بك فريقنا خلال 24 ساعة لتأكيد طلبك وموعد التوصيل.'
                : 'Notre équipe vous contactera dans les 24h pour confirmer votre commande et le créneau de livraison.'}
            </p>
          </div>
        </div>

        <Button size="lg" className="rounded-xl px-8" onClick={() => setLocation('/')}>
          {t('nav.home')}
        </Button>
      </div>
    );
  }

  const paymentOptions: { id: PaymentMethod; label: string; labelAr: string; icon: React.ReactNode; description: string; descriptionAr: string }[] = [
    {
      id: "cash_on_delivery",
      label: t('checkout.cod'),
      labelAr: "الدفع عند الاستلام",
      icon: <Banknote size={22} className="text-primary" />,
      description: "Payez en espèces lors de la livraison",
      descriptionAr: "ادفع نقداً عند استلام الطلب",
    },
    {
      id: "flouci",
      label: "Flouci",
      labelAr: "فلوسي",
      icon: <Smartphone size={22} className="text-blue-600" />,
      description: "Paiement mobile sécurisé via Flouci",
      descriptionAr: "دفع آمن عبر تطبيق فلوسي",
    },
    {
      id: "click2pay",
      label: "Click2Pay",
      labelAr: "كليك تو باي",
      icon: <CreditCard size={22} className="text-violet-600" />,
      description: "Carte bancaire via Click2Pay (D17 / Sobflous)",
      descriptionAr: "بطاقة بنكية عبر Click2Pay",
    },
  ];

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-10 border-b border-border pb-6">
          {t('checkout.title')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                  {lang === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{lang === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}</Label>
                    <Input id="name" required className="rounded-xl h-12 bg-background" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{lang === 'ar' ? 'رقم الهاتف *' : 'Téléphone *'}</Label>
                    <Input id="phone" type="tel" required className="rounded-xl h-12 bg-background" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} placeholder="+216 XX XXX XXX" />
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
                    <Label htmlFor="city">{lang === 'ar' ? 'المدينة *' : 'Ville *'}</Label>
                    <select id="city" required className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={formData.shippingCity} onChange={e => setFormData({...formData, shippingCity: e.target.value})}>
                      <option>Tunis</option>
                      <option>Sousse</option>
                      <option>Monastir</option>
                      <option>Sfax</option>
                      <option>Bizerte</option>
                      <option>Nabeul</option>
                      <option>Gabès</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{lang === 'ar' ? 'العنوان الكامل *' : 'Adresse complète *'}</Label>
                    <Input id="address" required className="rounded-xl h-12 bg-background" value={formData.shippingAddress} onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                  {t('checkout.payment')}
                </h2>
                <div className="space-y-3">
                  {paymentOptions.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === option.id ? 'bg-primary/10' : 'bg-muted'}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{lang === 'ar' ? option.labelAr : option.label}</p>
                        <p className="text-sm text-muted-foreground">{lang === 'ar' ? option.descriptionAr : option.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id ? 'border-primary' : 'border-muted-foreground/40'}`}>
                        {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "cash_on_delivery" && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                    <Phone size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      {lang === 'ar'
                        ? 'سنتصل بك لتأكيد الطلب وموعد التوصيل.'
                        : 'Nous vous appellerons pour confirmer la commande et le créneau de livraison.'}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-lg sticky top-28">
              <h3 className="font-serif text-2xl font-bold mb-6">{lang === 'ar' ? 'ملخص الطلب' : 'Résumé'}</h3>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.image || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-2">{lang === 'ar' ? item.nameAr : item.nameFr}</p>
                      <p className="text-muted-foreground text-sm">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}</span>
                  <span>{formatPrice(total)} {t('general.price')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{lang === 'ar' ? 'التوصيل' : 'Livraison'}</span>
                  <span className="text-primary font-semibold">{lang === 'ar' ? 'مجاني' : 'Gratuite'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border">
                  <span>{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span className="text-primary">{formatPrice(total)} {t('general.price')}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={isPending || isPaymentLoading}
                className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
              >
                {isPending || isPaymentLoading
                  ? t('status.loading')
                  : paymentMethod === 'cash_on_delivery'
                    ? (lang === 'ar' ? 'تأكيد الطلب' : 'Confirmer la commande')
                    : (lang === 'ar' ? 'متابعة للدفع' : 'Procéder au paiement')}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} />
                {lang === 'ar' ? 'معاملة آمنة ومحمية' : 'Transaction sécurisée'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
