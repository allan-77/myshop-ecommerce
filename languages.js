// simple translations
const TRANSLATIONS = {
  en: {
    brand: "MyShop",
    register: "Create Account",
    already: "Already have an account?",
    login: "Login",
    shopTitle: "Shop",
    cart: "Cart",
    wishlist: "Wishlist",
    orders: "Orders",
    profile: "Profile",
    logout: "Logout",
    proceed: "Proceed to Checkout",
    checkout: "Checkout",
    confirmPurchase: "Confirm Purchase",
    purchaseComplete: "Thank you! Your purchase was successful.",
    cartEmpty: "Your cart is empty.",
    added: "Added to cart",
    addedWish: "Added to wishlist",
    remove: "Remove",
    searchPlaceholder: "Search products or categories..."
  },
  sw: {
    brand: "DukaLako",
    register: "Unda Akaunti",
    already: "Tayari unaakaunti?",
    login: "Ingia",
    shopTitle: "Nunua",
    cart: "Kikapu",
    wishlist: "Yeyeza",
    orders: "Madiresha",
    profile: "Wasifu",
    logout: "Toka",
    proceed: "Endelea Kulipia",
    checkout: "Malipo",
    confirmPurchase: "Thibitisha Ununuzi",
    purchaseComplete: "Asante! Ununuzi umefanikiwa.",
    cartEmpty: "Kikapu chako ni tupu.",
    added: "Imeongezwa kikapuni",
    addedWish: "Imeongezwa kwenye wishlist",
    remove: "Ondoa",
    searchPlaceholder: "Tafuta bidhaa au kategoria..."
  },
  fr: {
    brand: "MonShop",
    register: "Créer un compte",
    already: "Vous avez déjà un compte ?",
    login: "Connexion",
    shopTitle: "Boutique",
    cart: "Panier",
    wishlist: "Liste",
    orders: "Commandes",
    profile: "Profil",
    logout: "Déconnexion",
    proceed: "Passer à la caisse",
    checkout: "Paiement",
    confirmPurchase: "Confirmer l'achat",
    purchaseComplete: "Merci ! Votre achat a été effectué.",
    cartEmpty: "Votre panier est vide.",
    added: "Ajouté au panier",
    addedWish: "Ajouté à la liste",
    remove: "Retirer",
    searchPlaceholder: "Rechercher produits ou catégories..."
  }
};

function initLangSelector(selectId){
  const el = document.getElementById(selectId);
  if(!el) return;
  el.innerHTML = `
    <option value="en">English</option>
    <option value="sw">Kiswahili</option>
    <option value="fr">Français</option>
  `;
  const saved = localStorage.getItem('myshop_lang') || 'en';
  el.value = saved;
  el.addEventListener('change', (e) => {
    const v = e.target.value; localStorage.setItem('myshop_lang', v);
    document.dispatchEvent(new CustomEvent('languageChanged',{detail:v}));
  });
}

function getLang(){ return localStorage.getItem('myshop_lang') || 'en' }
function t(key){ const lang = getLang(); return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['en'][key] || key; }
