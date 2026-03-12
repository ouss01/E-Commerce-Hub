export type Language = 'fr' | 'ar';

export const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.shop': 'Boutique',
    'nav.categories': 'Catégories',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    
    // Actions
    'action.addToCart': 'Ajouter au panier',
    'action.buyNow': 'Acheter maintenant',
    'action.viewDetails': 'Voir les détails',
    'action.checkout': 'Passer la commande',
    'action.login': 'Connexion',
    'action.register': 'S\'inscrire',
    'action.logout': 'Déconnexion',
    'action.search': 'Rechercher...',
    'action.subscribe': 'S\'abonner',
    'action.remove': 'Supprimer',
    'action.save': 'Enregistrer',
    
    // Status
    'status.inStock': 'En stock',
    'status.outOfStock': 'Rupture de stock',
    'status.loading': 'Chargement...',
    'status.error': 'Une erreur est survenue',
    
    // Pages - Home
    'home.hero.title': 'Des plantes pour votre intérieur',
    'home.hero.subtitle': 'Apportez la nature chez vous avec notre collection de plantes d\'intérieur premium, livrées partout en Tunisie.',
    'home.featured': 'Plantes Vedettes',
    'home.newArrivals': 'Nouveautés',
    'home.benefits.delivery': 'Livraison Rapide',
    'home.benefits.deliveryDesc': 'Partout en Tunisie',
    'home.benefits.quality': 'Qualité Premium',
    'home.benefits.qualityDesc': 'Plantes sélectionnées avec soin',
    'home.benefits.support': 'Support Client',
    'home.benefits.supportDesc': 'Conseils d\'entretien',
    'home.newsletter.title': 'Rejoignez notre communauté',
    'home.newsletter.desc': 'Recevez nos conseils d\'entretien et offres exclusives.',
    
    // Shop / Product
    'shop.title': 'Notre Collection',
    'shop.filters': 'Filtres',
    'shop.price': 'Prix',
    'shop.sort.newest': 'Plus récents',
    'shop.sort.priceAsc': 'Prix croissant',
    'shop.sort.priceDesc': 'Prix décroissant',
    'product.care': 'Entretien',
    'product.light': 'Lumière',
    'product.water': 'Arrosage',
    'product.reviews': 'Avis clients',
    'product.related': 'Vous aimerez aussi',
    
    // Cart / Checkout
    'cart.title': 'Votre Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.subtotal': 'Sous-total',
    'cart.total': 'Total',
    'checkout.title': 'Finaliser la commande',
    'checkout.shipping': 'Adresse de livraison',
    'checkout.payment': 'Paiement',
    'checkout.cod': 'Paiement à la livraison',
    
    // General
    'general.price': 'TND',
    'general.quantity': 'Quantité',
    'general.address': 'Khniss, Monastir 5011, Tunisie'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.shop': 'المتجر',
    'nav.categories': 'الفئات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    
    // Actions
    'action.addToCart': 'أضف إلى السلة',
    'action.buyNow': 'اشتري الآن',
    'action.viewDetails': 'عرض التفاصيل',
    'action.checkout': 'إتمام الطلب',
    'action.login': 'تسجيل الدخول',
    'action.register': 'إنشاء حساب',
    'action.logout': 'تسجيل خروج',
    'action.search': 'ابحث...',
    'action.subscribe': 'إشتراك',
    'action.remove': 'إزالة',
    'action.save': 'حفظ',
    
    // Status
    'status.inStock': 'متوفر',
    'status.outOfStock': 'نفذت الكمية',
    'status.loading': 'جاري التحميل...',
    'status.error': 'حدث خطأ ما',
    
    // Pages - Home
    'home.hero.title': 'نباتات لمنزلك',
    'home.hero.subtitle': 'اجلب الطبيعة إلى منزلك مع مجموعتنا من النباتات الداخلية الفاخرة، يتم توصيلها إلى جميع أنحاء تونس.',
    'home.featured': 'نباتات مميزة',
    'home.newArrivals': 'وصل حديثاً',
    'home.benefits.delivery': 'توصيل سريع',
    'home.benefits.deliveryDesc': 'في جميع أنحاء تونس',
    'home.benefits.quality': 'جودة عالية',
    'home.benefits.qualityDesc': 'نباتات مختارة بعناية',
    'home.benefits.support': 'دعم العملاء',
    'home.benefits.supportDesc': 'نصائح للعناية بالنباتات',
    'home.newsletter.title': 'انضم إلى مجتمعنا',
    'home.newsletter.desc': 'احصل على نصائح العناية وعروض حصرية.',
    
    // Shop / Product
    'shop.title': 'مجموعتنا',
    'shop.filters': 'تصفية',
    'shop.price': 'السعر',
    'shop.sort.newest': 'الأحدث',
    'shop.sort.priceAsc': 'السعر: من الأقل للأعلى',
    'shop.sort.priceDesc': 'السعر: من الأعلى للأقل',
    'product.care': 'العناية',
    'product.light': 'الضوء',
    'product.water': 'الري',
    'product.reviews': 'تقييمات العملاء',
    'product.related': 'قد يعجبك أيضاً',
    
    // Cart / Checkout
    'cart.title': 'سلة المشتريات',
    'cart.empty': 'سلتك فارغة',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.total': 'المجموع الإجمالي',
    'checkout.title': 'إتمام الطلب',
    'checkout.shipping': 'عنوان التوصيل',
    'checkout.payment': 'الدفع',
    'checkout.cod': 'الدفع عند الاستلام',
    
    // General
    'general.price': 'د.ت',
    'general.quantity': 'الكمية',
    'general.address': 'خنيس، المنستير 5011، تونس'
  }
};
