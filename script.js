// core site script: auth, products, cart, wishlist, orders, search, filters, dark mode

// -------- PRODUCTS (5 categories, 15 items each => 75 products) --------
const PRODUCTS = (function(){
  const categories = {
    Electronics: [
      "Smartphone Alpha","Smartphone Beta","Laptop Air 13","Laptop Pro 15","Tablet Mini 8",
      "Wireless Headphones","Bluetooth Speaker","4K Monitor 27","Gaming Mouse","Mechanical Keyboard",
      "Smart TV 50\"","Portable Charger 20000mAh","Action Camera X","Home Assistant Hub","Noise Cancelling Earbuds"
    ],
    Fashion: [
      "Men's Sneakers","Running Shoes","Casual Loafers","Denim Jacket","Leather Wallet",
      "Women's Sandals","Evening Dress","Baseball Cap","Sunglasses","Formal Shirt",
      "Sports Socks (3pack)","Beanie Hat","Backpack Small","Leather Belt","Watch Strap"
    ],
    Home: [
      "Ergo Office Chair","Dining Table 4pcs","Double Door Fridge","Microwave 20L","Air Fryer 3.5L",
      "Washing Machine 7kg","Vacuum Cleaner","LED Lamp","Bed Sheet Set","Pillow Foam",
      "Kitchen Knife Set","Blender 600W","Coffee Maker","Curtain 2x","Shoe Rack 5-tier"
    ],
    Sports: [
      "Size 5 Football","Basketball Pro","Tennis Racket","Yoga Mat","Gym Gloves",
      "Dumbbell 10kg","Skipping Rope","Cycling Helmet","Running Shorts","Water Bottle 1L",
      "Soccer Boots","Swim Goggles","Portable Goal Net","Fitness Tracker","Resistance Bands"
    ],
    Beauty: [
      "Perfume 100ml","Face Cream","Sunscreen SPF50","Lipstick Set","Eau de Toilette",
      "Shampoo 500ml","Conditioner 500ml","Makeup Brush Set","Nail Polish Kit","Facial Cleanser",
      "Beard Oil","Hair Dryer","Electric Shaver","Body Lotion","Hand Cream"
    ]
  };
  const images = {
    Electronics: "https://images.unsplash.com/photo-1510557880182-3a8353d4b60b",
    Fashion: "https://images.unsplash.com/photo-1520975919658-6f0b9b6d5b2a",
    Home: "https://images.unsplash.com/photo-1582582494702-15d6b9ea2d3d",
    Sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    Beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
  };
  let id = 1;
  const list = [];
  for(const cat in categories){
    categories[cat].forEach((name, i) => {
      list.push({
        id: id++,
        title: name,
        category: cat,
        price: +( (Math.random()*180 + (i+1)*5) .toFixed(2) ),
        img: images[cat] + `?w=800&q=60&crop=faces&sat=20&ixid=prod-${cat}-${i}`
      });
    });
  }
  return list;
})();

// -------- STORAGE KEYS & UTILITIES --------
const KEY_USERS = 'myshop_users';
const KEY_SESSION = 'myshop_user';
const KEY_CART = 'myshop_cart';
const KEY_WISHLIST = 'myshop_wishlist';
const KEY_ORDERS = 'myshop_orders';
const KEY_LANG = 'myshop_lang';
const KEY_THEME = 'myshop_theme';

function saveJSON(key,obj){ localStorage.setItem(key, JSON.stringify(obj)) }
function readJSON(key){ try{return JSON.parse(localStorage.getItem(key))||[] }catch(e){return[]} }

// -------- AUTH --------
function saveUser(user){ // {name,email,password}
  let users = readJSON(KEY_USERS);
  if(users.find(u=>u.email===user.email)) return false;
  users.push(user); saveJSON(KEY_USERS,users); return true;
}
function findUser(email,password){
  const users = readJSON(KEY_USERS);
  return users.find(u=>u.email===email && u.password===password);
}
function setSession(email){ localStorage.setItem(KEY_SESSION,email) }
function getSession(){ return localStorage.getItem(KEY_SESSION) }
function logout(){ localStorage.removeItem(KEY_SESSION); location.href='index.html' }

// -------- CART & WISHLIST & ORDERS --------
function getCart(){ return readJSON(KEY_CART) }
function saveCart(cart){ saveJSON(KEY_CART,cart) }
function addToCart(id, qty=1){
  const cart = getCart();
  const item = cart.find(i=>i.id===id);
  if(item) item.qty += qty; else cart.push({id,qty});
  saveCart(cart);
  flash(t('added'));
  updateNavCounts();
}
function setQty(id, qty){
  let cart = getCart().map(i=>i.id===id?{...i, qty:Math.max(1,qty)}:i).filter(i=>i.qty>0);
  saveCart(cart); updateNavCounts();
}
function removeFromCart(id){ let cart = getCart().filter(i=>i.id!==id); saveCart(cart); updateNavCounts(); }

function getWishlist(){ return readJSON(KEY_WISHLIST) }
function toggleWishlist(id){
  let list = getWishlist();
  if(list.find(i=>i===id)){ list = list.filter(x=>x!==id); saveJSON(KEY_WISHLIST,list); return false; }
  list.push(id); saveJSON(KEY_WISHLIST,list); flash(t('addedWish')); return true;
}
function removeFromWishlist(id){ let l = getWishlist().filter(x=>x!==id); saveJSON(KEY_WISHLIST,l); }

// orders
function saveOrder(order){
  const orders = readJSON(KEY_ORDERS);
  orders.unshift(order); saveJSON(KEY_ORDERS,orders);
  // clear cart
  localStorage.removeItem(KEY_CART);
  updateNavCounts();
}

// -------- RENDER HELPERS --------
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatPrice(n){ return '$' + Number(n).toFixed(2) }
function flash(msg){
  const d = document.createElement('div'); d.innerText = msg;
  d.style.position='fixed'; d.style.right='20px'; d.style.bottom='20px'; d.style.padding='8px 12px';
  d.style.background='rgba(0,0,0,0.8)'; d.style.color='#fff'; d.style.borderRadius='8px'; d.style.zIndex=9999;
  document.body.appendChild(d); setTimeout(()=>d.remove(),1600);
}

// -------- NAV & UI --------
function updateNavCounts(){
  const cartCount = getCart().reduce((s,i)=>s+i.qty,0);
  const wishlistCount = getWishlist().length;
  document.querySelectorAll('.cart-count').forEach(el=>el.innerText = cartCount);
  document.querySelectorAll('.wish-count').forEach(el=>el.innerText = wishlistCount);
}
function ensureLoggedInThen(cb){
  if(!getSession()){ location.href='index.html'; return; }
  cb && cb();
}

// -------- SEARCH & FILTERS (for shop) --------
function renderFilters(categories){
  const container = document.getElementById('filtersBox');
  if(!container) return;
  container.innerHTML = `<button class="filter-btn" data-cat="all">All</button>` +
    categories.map(c=>`<button class="filter-btn" data-cat="${c}">${c}</button>`).join('');
  container.querySelectorAll('[data-cat]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const cat = b.getAttribute('data-cat');
      document.querySelectorAll('.filter-btn').forEach(x=>x.style.background='transparent');
      b.style.background='linear-gradient(90deg,#ff6b35,#ff9b3d)'; // highlight
      renderProducts(cat, document.getElementById('searchInput')?.value || '');
    });
  });
}

// render products: filter by cat & search
function renderProducts(cat='all', q=''){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  q = (q||'').toLowerCase().trim();
  let list = PRODUCTS.filter(p => (cat==='all' || p.category===cat) && (p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
  if(list.length===0){ grid.innerHTML = '<div class="card">No products found.</div>'; return; }
  grid.innerHTML = list.map(p=>{
    const inWish = getWishlist().includes(p.id);
    return `
      <div class="card product">
        <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy"/>
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="cat">${escapeHtml(p.category)}</div>
        <div class="price">${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn primary add-btn" data-id="${p.id}">Add to cart</button>
          <button class="btn ghost wish-btn" data-id="${p.id}">${inWish? '♥':'♡'}</button>
        </div>
      </div>`;
  }).join('');
  // bind
  grid.querySelectorAll('.add-btn').forEach(b=> b.addEventListener('click', ()=>{ addToCart(parseInt(b.getAttribute('data-id')),1); updateNavCounts(); }));
  grid.querySelectorAll('.wish-btn').forEach(b=> b.addEventListener('click', ()=>{ const id = parseInt(b.getAttribute('data-id')); toggleWishlist(id); renderProducts(cat, q); updateNavCounts(); }));
}

// -------- CART PAGE RENDER --------
function renderCartPage(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = getCart();
  if(cart.length===0){ container.innerHTML = `<div class="card">${t('cartEmpty')}</div>`; document.getElementById('cartSummary')?.classList.add('hidden'); return; }
  let html = cart.map(it=>{
    const p = PRODUCTS.find(x=>x.id===it.id);
    if(!p) return '';
    return `
      <div class="card cart-item">
        <img src="${p.img}" alt="${escapeHtml(p.title)}"/>
        <div style="flex:1;text-align:left">
          <strong>${escapeHtml(p.title)}</strong>
          <div class="cat">${escapeHtml(p.category)}</div>
          <div class="muted">Unit: ${formatPrice(p.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div>
            <button class="btn ghost dec" data-id="${p.id}">-</button>
            <span class="qty">${it.qty}</span>
            <button class="btn ghost inc" data-id="${p.id}">+</button>
          </div>
          <button class="btn ghost remove" data-id="${p.id}">${t('remove')}</button>
          <div style="font-weight:800">${formatPrice(p.price * it.qty)}</div>
        </div>
      </div>`;
  }).join('');
  container.innerHTML = html;
  document.getElementById('cartSummary').classList.remove('hidden');
  // summary totals
  const total = cart.reduce((s,i)=> s + ( (PRODUCTS.find(p=>p.id===i.id)||{price:0}).price * i.qty), 0);
  document.getElementById('summaryCount').innerText = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('summaryTotal').innerText = formatPrice(total);
  // bind controls
  container.querySelectorAll('.inc').forEach(b=>b.addEventListener('click', ()=>{ const id=parseInt(b.dataset.id); const cart=getCart(); const it=cart.find(x=>x.id===id); setQty(id,it.qty+1); renderCartPage(); }));
  container.querySelectorAll('.dec').forEach(b=>b.addEventListener('click', ()=>{ const id=parseInt(b.dataset.id); const cart=getCart(); const it=cart.find(x=>x.id===id); setQty(id,it.qty-1); renderCartPage(); }));
  container.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', ()=>{ removeFromCart(parseInt(b.dataset.id)); renderCartPage(); }));
}

// -------- WISHLIST PAGE --------
function renderWishlistPage(){
  const container = document.getElementById('wishlistContainer'); if(!container) return;
  const list = getWishlist();
  if(list.length===0){ container.innerHTML = `<div class="card">Your wishlist is empty.</div>`; return; }
  container.innerHTML = list.map(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return `<div class="card" style="display:flex;gap:12px;align-items:center">
      <img src="${p.img}" style="width:120px;height:80px;object-fit:cover;border-radius:8px"/>
      <div style="flex:1">
        <strong>${escapeHtml(p.title)}</strong>
        <div class="muted">${escapeHtml(p.category)}</div>
        <div style="margin-top:8px">
          <button class="btn primary add-w" data-id="${p.id}">Add to cart</button>
          <button class="btn ghost rem-w" data-id="${p.id}">Remove</button>
        </div>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('.add-w').forEach(b=>b.addEventListener('click', ()=>{ addToCart(parseInt(b.dataset.id)); removeFromWishlist(parseInt(b.dataset.id)); renderWishlistPage(); updateNavCounts(); }));
  container.querySelectorAll('.rem-w').forEach(b=>b.addEventListener('click', ()=>{ removeFromWishlist(parseInt(b.dataset.id)); renderWishlistPage(); updateNavCounts(); }));
}

// -------- ORDERS PAGE --------
function renderOrdersPage(){
  const container = document.getElementById('ordersContainer'); if(!container) return;
  const orders = readJSON(KEY_ORDERS);
  if(orders.length===0){ container.innerHTML = `<div class="card">No orders yet.</div>`; return; }
  container.innerHTML = orders.map(o=>{
    return `<div class="card" style="padding:12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between">
        <div><strong>Order #${o.id}</strong><div class="muted">On ${new Date(o.date).toLocaleString()}</div></div>
        <div><strong>${formatPrice(o.total)}</strong></div>
      </div>
      <div style="margin-top:8px">${ o.items.map(it=> {
        const p = PRODUCTS.find(x=>x.id===it.id) || {title:'Unknown'};
        return `<div style="display:flex;justify-content:space-between"><div>${escapeHtml(p.title)} x ${it.qty}</div><div>${formatPrice((p.price||0)*it.qty)}</div></div>`;
      }).join('') }</div>
    </div>`;
  }).join('');
}

// -------- CHECKOUT LOGIC --------
function renderCheckoutSummary(){
  const box = document.getElementById('checkoutSummaryBox'); if(!box) return;
  const cart = getCart();
  if(cart.length===0){ box.innerHTML = `<div class="card">${t('cartEmpty')}</div>`; return; }
  const rows = cart.map(i=>{ const p=PRODUCTS.find(x=>x.id===i.id); return `<div style="display:flex;justify-content:space-between;padding:6px 0">${escapeHtml(p.title)} x ${i.qty} <strong>${formatPrice(p.price*i.qty)}</strong></div>`; }).join('');
  const total = cart.reduce((s,i)=> s + (PRODUCTS.find(x=>x.id===i.id).price * i.qty), 0);
  box.innerHTML = `<div class="card">${rows}<hr style="margin:8px 0"><div style="text-align:right;font-weight:800">Total: ${formatPrice(total)}</div></div>`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  // global language init for any page
  document.querySelectorAll('.lang-select').forEach(sel=>{
    initLangSelector(sel.id);
  });

  // default theme
  const theme = localStorage.getItem(KEY_THEME) || 'light';
  if(theme==='dark') document.body.classList.add('dark');

  // page-specific initializations
  // INDEX PAGE
  if(document.getElementById('registerForm')){
    // show/hide
    document.getElementById('toLoginBtn').addEventListener('click', ()=>{ document.getElementById('registerForm').classList.add('hidden'); document.getElementById('loginForm').classList.remove('hidden'); });
    document.getElementById('toRegisterBtn').addEventListener('click', ()=>{ document.getElementById('loginForm').classList.add('hidden'); document.getElementById('registerForm').classList.remove('hidden'); });

    document.getElementById('registerForm').addEventListener('submit', (e)=>{ e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const pass = document.getElementById('regPassword').value;
      if(!name || !email || pass.length<6){ document.getElementById('registerNote').innerText='Please fill fields & use 6+ char password'; return; }
      const ok = saveUser({name,email,password:pass});
      if(!ok){ document.getElementById('registerNote').innerText='User already exists'; return; }
      setSession(email); location.href='shop.html';
    });

    document.getElementById('loginForm').addEventListener('submit', (e)=>{ e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass = document.getElementById('loginPassword').value;
      const user = findUser(email,pass);
      if(!user){ document.getElementById('loginNote').innerText='Invalid credentials'; return; }
      setSession(email); location.href='shop.html';
    });
    document.querySelectorAll('.brandName').forEach(b=>b.innerText = t('brand'));
  }

  // SHOP PAGE
  if(document.getElementById('productsGrid')){
    // populate categories
    const cats = Array.from(new Set(PRODUCTS.map(p=>p.category)));
    renderFilters(cats);
    // default highlight 'All'
    const first = document.querySelector('#filtersBox [data-cat="all"]'); if(first) first.style.background='linear-gradient(90deg,#ff6b35,#ff9b3d)';
    renderProducts('all','');
    // search
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', ()=> renderProducts(document.querySelector('#filtersBox .filter-btn[style]')?.dataset?.cat || 'all', searchInput.value));
    // logout
    document.getElementById('logoutBtn')?.addEventListener('click', ()=> logout());
    updateNavCounts();
  }

  // CART PAGE
  if(document.getElementById('cartContainer')){
    ensureLoggedInThen(()=>{
      renderCartPage();
      document.getElementById('clearCartBtn')?.addEventListener('click', ()=>{ if(confirm('Clear cart?')){ localStorage.removeItem(KEY_CART); renderCartPage(); updateNavCounts(); }});
      updateNavCounts();
    });
  }

  // WISHLIST PAGE
  if(document.getElementById('wishlistContainer')){ ensureLoggedInThen(()=>{ renderWishlistPage(); updateNavCounts(); }); }

  // ORDERS PAGE
  if(document.getElementById('ordersContainer')){ ensureLoggedInThen(()=>{ renderOrdersPage(); updateNavCounts(); }); }

  // CHECKOUT PAGE
  if(document.getElementById('checkoutSummaryBox')){
    ensureLoggedInThen(()=>{
      renderCheckoutSummary();
      document.getElementById('confirmPurchaseBtn')?.addEventListener('click', (e)=>{
        e.preventDefault();
        // validate shipping fields
        const name = document.getElementById('shipName').value.trim();
        const addr = document.getElementById('shipAddress').value.trim();
        const phone = document.getElementById('shipPhone').value.trim();
        const payMethod = document.getElementById('payMethod').value;
        if(!name || !addr || !phone){ alert('Please fill shipping info'); return; }
        const cart = getCart(); if(cart.length===0){ alert(t('cartEmpty')); return; }
        const total = cart.reduce((s,i)=> s + (PRODUCTS.find(p=>p.id===i.id).price * i.qty), 0);
        const order = { id: 'ORD' + Date.now(), user: getSession(), items: cart, total, shipping:{name,addr,phone}, payment:payMethod, date: new Date().toISOString() };
        saveOrder(order);
        alert(t('purchaseComplete'));
        location.href='orders.html';
      });
    });
  }

  // PROFILE PAGE
  if(document.getElementById('profileBox')){
    ensureLoggedInThen(()=> {
      const email = getSession();
      const users = readJSON(KEY_USERS);
      const user = users.find(u=>u.email===email);
      if(user){ document.getElementById('profileName').innerText = user.name; document.getElementById('profileEmail').innerText = user.email; }
      document.getElementById('logoutBtnProfile')?.addEventListener('click', ()=> logout());
    });
  }

  // Nav counts every second (keeps badge live)
  setInterval(updateNavCounts, 800);
  // language change re-render basic strings
  document.addEventListener('languageChanged', ()=> {
    document.querySelectorAll('.site-brand').forEach(e=> e.innerText = t('brand'));
    document.querySelectorAll('.nav-cart-label').forEach(e=> e.innerText = t('cart'));
    document.querySelectorAll('.nav-wish-label').forEach(e=> e.innerText = t('wishlist'));
  });

  // theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem(KEY_THEME, theme);
  });
});
