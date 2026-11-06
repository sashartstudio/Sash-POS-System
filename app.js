'use strict';
/* =====================================================================
   SASH ART STUDIO POS - single file, offline, localStorage only
   Sections: Storage | Helpers | Data | Cart | Views | Receipt | Actions
   ===================================================================== */
(() => {

/* ============================ STORAGE ============================ */
const KEYS = { settings:'companySettings', products:'products', categories:'categories', sales:'sales',
  invoices:'invoices', counter:'invoiceCounter', theme:'theme', reports:'reports' };
const DB = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { toast('Storage is full or blocked', 'err'); return false; } }
};
const save = (...ks) => ks.forEach(k => DB.set(KEYS[k], S[k]));

const DEF = { name:'Sash art Studio', logo:'', address:'Old Galle, Sarikkamulla, Panadura, Sri Lanka, 12500',
  phone:'+94 72 803 2199', currency:'LKR', tax:5, footer:'Thank you for choosing Sash art Studio! Art that tells your story.',
  receiptSize:'80mm', prefix:'SAS-', cashier:'Admin' };
const SEED_CATS = ['Portrait Art','Wall Art','Chemical Art','Graphic Design','Branding','Social Media','Web Visuals'];
const SEED = [
  ['Custom Portrait - A4','Portrait Art','POR-A4','1000001',2500,6500,50],
  ['Custom Portrait - A3','Portrait Art','POR-A3','1000002',4500,11000,50],
  ['Wall Artwork - Medium','Wall Art','WAL-M','1000003',6000,15000,30],
  ['Chemical Artwork','Chemical Art','CHE-01','1000004',5000,13500,20],
  ['Logo Design','Graphic Design','GRA-LOGO','1000005',1500,8000,999],
  ['Brand Identity Kit','Branding','BRN-KIT','1000006',6000,25000,999],
  ['Social Media Pack (10 posts)','Social Media','SOC-10','1000007',2000,9000,999],
  ['Website Visual Set','Web Visuals','WEB-SET','1000008',3500,14000,999]
];
const S = {
  settings: { ...DEF, ...DB.get(KEYS.settings, {}) },
  products: DB.get(KEYS.products, null), categories: DB.get(KEYS.categories, null),
  sales: DB.get(KEYS.sales, []), invoices: DB.get(KEYS.invoices, []),
  counter: DB.get(KEYS.counter, 1), theme: DB.get(KEYS.theme, 'dark'), reports: DB.get(KEYS.reports, {})
};
if (!S.products) {
  S.products = SEED.map(([name, category, sku, barcode, cost, price, stock]) => ({ id: uid(), name, category, sku, barcode, cost, price, stock, low: 5, img: '' }));
  S.categories = [...SEED_CATS];
  save('products', 'categories', 'settings', 'counter', 'theme');
}
if (!S.categories) S.categories = [...SEED_CATS];

/* ============================ HELPERS ============================ */
const $ = s => document.querySelector(s);
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const num = v => parseFloat(v) || 0;
const money = n => `${S.settings.currency} ${num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fDate = iso => new Date(iso).toLocaleDateString('en-GB');
const fTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const day0 = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const W = ['w-[0%]','w-[5%]','w-[10%]','w-[15%]','w-[20%]','w-[25%]','w-[30%]','w-[35%]','w-[40%]','w-[45%]','w-[50%]','w-[55%]','w-[60%]','w-[65%]','w-[70%]','w-[75%]','w-[80%]','w-[85%]','w-[90%]','w-[95%]','w-[100%]'];
const H = ['h-[0%]','h-[5%]','h-[10%]','h-[15%]','h-[20%]','h-[25%]','h-[30%]','h-[35%]','h-[40%]','h-[45%]','h-[50%]','h-[55%]','h-[60%]','h-[65%]','h-[70%]','h-[75%]','h-[80%]','h-[85%]','h-[90%]','h-[95%]','h-[100%]'];
const bucket = (arr, v, max) => arr[Math.max(v > 0 ? 1 : 0, Math.round((max ? v / max : 0) * 20))];

const UI = {
  card: 'rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30',
  inp: 'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-ink-800 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-maroon-500',
  btn: 'rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40',
  pri: 'rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 bg-maroon-600 hover:bg-maroon-500 text-white shadow-lg shadow-maroon-900/40',
  sec: 'rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20',
  dng: 'rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 bg-red-600 hover:bg-red-500 text-white',
  sm: 'rounded-lg px-2.5 py-1 text-xs font-semibold transition active:scale-95 bg-black/5 dark:bg-white/10 hover:bg-maroon-600 hover:text-white',
  th: 'px-3 py-2 text-left text-xs uppercase tracking-wider text-neutral-500',
  td: 'px-3 py-2.5',
  tr: 'border-t border-black/5 dark:border-white/5 hover:bg-maroon-600/5',
  lbl: 'mb-1 block text-xs font-medium text-neutral-500'
};

const V = { view: 'dashboard', cart: [], disc: 0, discType: 'amt', cash: '', cat: 'All', rep: 'today', rc: null, undo: null, confirmCb: null, tmpImg: '', tmpLogo: null };
const NAV = [['dashboard','📊','Dashboard'],['pos','🛒','POS'],['products','🎨','Products'],['sales','🧾','Sales'],['reports','📈','Reports'],['backup','💾','Backup'],['settings','⚙️','Settings']];

/* ============================ TOAST / MODAL ============================ */
function toast(msg, type = 'ok', actionLabel) {
  const cls = { ok: 'bg-emerald-600', err: 'bg-red-600', info: 'bg-maroon-600' }[type];
  const el = document.createElement('div');
  el.className = `${cls} animate-fade-up flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl`;
  el.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button data-a="undo" class="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold hover:bg-white/30">${esc(actionLabel)}</button>` : ''}`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), actionLabel ? 6000 : 2800);
}
function openModal(html, wide = 'max-w-lg') {
  $('#modal').innerHTML = `<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div class="${UI.card} animate-fade-up max-h-[92vh] w-full ${wide} overflow-y-auto bg-white dark:bg-ink-900 p-5">${html}</div></div>`;
}
const closeModal = () => { $('#modal').innerHTML = ''; V.tmpImg = ''; };
function confirmBox(msg, cb, label = 'Delete') {
  V.confirmCb = cb;
  openModal(`<h3 class="mb-2 text-lg font-bold">Please confirm</h3><p class="mb-5 text-sm text-neutral-500">${esc(msg)}</p>
    <div class="flex justify-end gap-2"><button data-a="closeModal" class="${UI.sec}">Cancel</button><button data-a="confirmYes" class="${UI.dng}">${esc(label)}</button></div>`, 'max-w-sm');
}

/* ============================ DATA / STATS ============================ */
function range(kind) {
  const t = day0(); let from;
  if (kind === 'today') from = t;
  else if (kind === 'week') from = new Date(t.getTime() - 6 * 864e5);
  else from = new Date(t.getFullYear(), t.getMonth(), 1);
  return S.sales.filter(s => new Date(s.ts) >= from);
}
function stat(list) {
  const rev = list.reduce((a, s) => a + s.total, 0), profit = list.reduce((a, s) => a + s.profit, 0);
  return { rev: r2(rev), profit: r2(profit), n: list.length, avg: list.length ? r2(rev / list.length) : 0 };
}
function soldMap(list) {
  const m = {};
  list.forEach(s => s.items.forEach(i => { const o = m[i.id] || (m[i.id] = { id: i.id, name: i.name, category: i.category, qty: 0, rev: 0 }); o.qty += i.qty; o.rev += i.qty * i.price; }));
  return Object.values(m);
}
const lowCount = () => S.products.filter(p => p.stock <= p.low).length;

/* ============================ CART ============================ */
function calc() {
  const sub = V.cart.reduce((a, i) => a + i.price * i.qty, 0);
  const d = num(V.disc);
  const disc = V.discType === 'pct' ? sub * Math.min(d, 100) / 100 : Math.min(d, sub);
  const tax = (sub - disc) * num(S.settings.tax) / 100, total = sub - disc + tax;
  const cash = V.cash === '' ? total : num(V.cash);
  return { sub, disc, tax, total, cash, bal: cash - total };
}
function addToCart(p) {
  const it = V.cart.find(i => i.id === p.id);
  const q = it ? it.qty : 0;
  if (q + 1 > p.stock) return toast(`Only ${p.stock} in stock: ${p.name}`, 'err');
  if (it) it.qty++; else V.cart.push({ id: p.id, name: p.name, sku: p.sku, price: p.price, cost: p.cost, category: p.category, qty: 1 });
  updateCart();
}
function updateCart() {
  const box = $('#cartItems'); if (!box) return;
  box.innerHTML = V.cart.length ? V.cart.map(i => `<div class="flex items-center gap-2 border-b border-black/5 dark:border-white/5 py-2">
      <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">${esc(i.name)}</p><p class="text-xs text-neutral-500">${money(i.price)}</p></div>
      <div class="flex items-center gap-1"><button data-a="qty" data-id="${i.id}" data-d="-1" class="${UI.sm}">-</button>
      <span class="w-7 text-center text-sm font-bold">${i.qty}</span><button data-a="qty" data-id="${i.id}" data-d="1" class="${UI.sm}">+</button></div>
      <p class="w-24 text-right text-sm font-semibold">${money(i.price * i.qty)}</p>
      <button data-a="rm" data-id="${i.id}" class="text-red-500 hover:text-red-400">✕</button></div>`).join('')
    : '<p class="py-10 text-center text-sm text-neutral-500">Cart is empty. Tap a product or scan a barcode.</p>';
  const c = calc();
  $('#tSub').textContent = money(c.sub); $('#tDisc').textContent = '- ' + money(c.disc);
  $('#tTax').textContent = money(c.tax); $('#tTotal').textContent = money(c.total);
  const bal = $('#tBal'); bal.textContent = money(c.bal);
  bal.className = c.bal < -0.001 ? 'font-bold text-red-500' : 'font-bold text-emerald-500';
}
function posList() {
  const q = ($('#posSearch')?.value || '').trim().toLowerCase();
  return S.products.filter(p => (V.cat === 'All' || p.category === V.cat) &&
    (!q || [p.name, p.sku, p.barcode].some(x => String(x || '').toLowerCase().includes(q))));
}
function updatePosGrid() {
  const g = $('#posGrid'); if (!g) return;
  const l = posList();
  g.innerHTML = l.length ? l.map(p => `<button data-a="add" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}
    class="${UI.card} group p-3 text-left transition hover:-translate-y-0.5 hover:border-maroon-500 disabled:cursor-not-allowed disabled:opacity-40">
    <div class="mb-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-maroon-800 to-ink-800 text-3xl font-bold text-white/80">
      ${p.img ? `<img src="${p.img}" alt="" class="h-full w-full object-cover">` : esc(p.name.charAt(0))}</div>
    <p class="truncate text-sm font-semibold">${esc(p.name)}</p>
    <div class="mt-1 flex items-center justify-between"><span class="text-sm font-bold text-maroon-400">${money(p.price)}</span>
    <span class="rounded-md px-1.5 py-0.5 text-[10px] font-bold ${p.stock <= 0 ? 'bg-red-600 text-white' : p.stock <= p.low ? 'bg-amber-500 text-black' : 'bg-black/5 dark:bg-white/10'}">${p.stock <= 0 ? 'OUT' : p.stock}</span></div></button>`).join('')
    : '<p class="col-span-full py-10 text-center text-sm text-neutral-500">No products found</p>';
}
function completeSale() {
  if (!V.cart.length) return toast('Cart is empty', 'err');
  const c = calc();
  if (c.cash + 0.001 < c.total) return toast('Cash received is less than the total', 'err');
  for (const i of V.cart) { const p = S.products.find(x => x.id === i.id); if (!p || p.stock < i.qty) return toast(`Insufficient stock: ${i.name}`, 'err'); }
  const cost = V.cart.reduce((a, i) => a + i.cost * i.qty, 0);
  const sale = { id: uid(), invoice: S.settings.prefix + String(S.counter).padStart(5, '0'), ts: new Date().toISOString(), cashier: S.settings.cashier,
    items: V.cart.map(i => ({ ...i })), subtotal: r2(c.sub), discount: r2(c.disc), tax: r2(c.tax), taxRate: num(S.settings.tax),
    total: r2(c.total), cash: r2(c.cash), balance: r2(c.bal), profit: r2(c.sub - c.disc - cost) };
  V.cart.forEach(i => { S.products.find(x => x.id === i.id).stock -= i.qty; });
  S.sales.unshift(sale); S.invoices.unshift({ invoice: sale.invoice, saleId: sale.id, ts: sale.ts }); S.counter++;
  save('products', 'sales', 'invoices', 'counter');
  newSale(true); showReceipt(sale); toast(`Sale ${sale.invoice} completed`);
}
function newSale(silent) {
  V.cart = []; V.disc = 0; V.cash = ''; V.discType = 'amt';
  if (V.view === 'pos') { render(); } if (!silent) toast('New sale started', 'info');
}

/* ============================ RECEIPT ============================ */
const C39 = { 0:'nnnwwnwnn',1:'wnnwnnnnw',2:'nnwwnnnnw',3:'wnwwnnnnn',4:'nnnwwnnnw',5:'wnnwwnnnn',6:'nnwwwnnnn',7:'nnnwnnwnw',8:'wnnwnnwnn',9:'nnwwnnwnn',
  A:'wnnnnwnnw',B:'nnwnnwnnw',C:'wnwnnwnnn',D:'nnnnwwnnw',E:'wnnnwwnnn',F:'nnwnwwnnn',G:'nnnnnwwnw',H:'wnnnnwwnn',I:'nnwnnwwnn',J:'nnnnwwwnn',
  K:'wnnnnnnww',L:'nnwnnnnww',M:'wnwnnnnwn',N:'nnnnwnnww',O:'wnnnwnnwn',P:'nnwnwnnwn',Q:'nnnnnnwww',R:'wnnnnnwwn',S:'nnwnnnwwn',T:'nnnnwnwwn',
  U:'wwnnnnnnw',V:'nwwnnnnnw',W:'wwwnnnnnn',X:'nwnnwnnnw',Y:'wwnnwnnnn',Z:'nwwnwnnnn','-':'nwnnnnwnw','*':'nwnnwnwnn' };
function barcodeSVG(text) {
  let x = 0, bars = '';
  for (const ch of `*${String(text).toUpperCase().replace(/[^0-9A-Z-]/g, '')}*`) {
    const p = C39[ch]; if (!p) continue;
    for (let k = 0; k < 9; k++) { const w = p[k] === 'w' ? 3 : 1; if (k % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="40" fill="#000"/>`; x += w; }
    x += 1;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 40" preserveAspectRatio="none" class="mx-auto h-10 w-full max-w-[220px]">${bars}</svg>`;
}
function receiptHTML(s, size) {
  const st = S.settings;
  const w = { '58mm': 'w-[58mm] p-2 text-[10px]', '80mm': 'w-[80mm] p-3 text-xs', 'A4': 'w-[210mm] p-12 text-sm' }[size] || 'w-[80mm] p-3 text-xs';
  const row = (a, b, bold) => `<div class="flex justify-between ${bold ? 'text-base font-bold' : ''}"><span>${a}</span><span>${b}</span></div>`;
  return `<div class="${w} mx-auto bg-white font-mono leading-snug text-black">
    <div class="text-center">${st.logo ? `<img src="${st.logo}" alt="" class="mx-auto mb-2 max-h-16 object-contain">` : ''}
      <p class="text-base font-bold uppercase">${esc(st.name)}</p><p>${esc(st.address)}</p><p>Tel: ${esc(st.phone)}</p></div>
    <div class="my-2 border-t border-dashed border-black"></div>
    ${row('Invoice', esc(s.invoice))}${row('Date', fDate(s.ts))}${row('Time', fTime(s.ts))}${row('Cashier', esc(s.cashier))}
    <div class="my-2 border-t border-dashed border-black"></div>
    <table class="w-full"><thead><tr class="text-left"><th>Item</th><th class="text-center">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>
    ${s.items.map(i => `<tr class="align-top"><td class="pr-1">${esc(i.name)}</td><td class="text-center">${i.qty}</td><td class="text-right">${num(i.price).toFixed(2)}</td><td class="text-right">${(i.price * i.qty).toFixed(2)}</td></tr>`).join('')}
    </tbody></table>
    <div class="my-2 border-t border-dashed border-black"></div>
    ${row('Subtotal', money(s.subtotal))}${row('Discount', '- ' + money(s.discount))}${row(`Tax (${s.taxRate}%)`, money(s.tax))}
    <div class="my-1 border-t border-black"></div>${row('GRAND TOTAL', money(s.total), true)}
    ${row('Cash', money(s.cash))}${row('Balance', money(s.balance))}
    <div class="my-2 border-t border-dashed border-black"></div>
    <p class="mb-2 text-center">${esc(st.footer)}</p>${barcodeSVG(s.invoice)}<p class="text-center tracking-widest">${esc(s.invoice)}</p></div>`;
}
function showReceipt(s, size) {
  V.rc = { sale: s, size: size || S.settings.receiptSize };
  openModal(`<div class="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 class="text-lg font-bold">Receipt ${esc(s.invoice)}</h3>
    <div class="flex gap-1">${['58mm', '80mm', 'A4'].map(z => `<button data-a="rcSize" data-size="${z}" class="${z === V.rc.size ? UI.pri : UI.sec}">${z}</button>`).join('')}</div></div>
    <div id="rcBody" class="max-h-[60vh] overflow-auto rounded-xl bg-neutral-300 p-3">${receiptHTML(s, V.rc.size)}</div>
    <div class="mt-4 flex justify-end gap-2"><button data-a="closeModal" class="${UI.sec}">Close</button><button data-a="printRc" class="${UI.pri}">🖨️ Print</button></div>`, 'max-w-3xl');
}

/* ============================ VIEWS ============================ */
function vDashboard() {
  const T = stat(range('today')), M = stat(range('month'));
  const cards = [['Today\'s Sales', money(T.rev), '💰'], ['Today\'s Profit', money(T.profit), '📈'], ['Today\'s Orders', T.n, '🧾'], ['Monthly Revenue', money(M.rev), '🏦'],
    ['Monthly Profit', money(M.profit), '💹'], ['Monthly Orders', M.n, '📦'], ['Products', S.products.length, '🎨'], ['Low Stock', lowCount(), '⚠️']];
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(day0().getTime() - (6 - i) * 864e5);
    return { l: d.toLocaleDateString('en-US', { weekday: 'short' }), v: S.sales.filter(s => day0(new Date(s.ts)).getTime() === d.getTime()).reduce((a, s) => a + s.total, 0) }; });
  const mx = Math.max(...days.map(d => d.v));
  const top = soldMap(range('month')).sort((a, b) => b.qty - a.qty).slice(0, 5);
  return `<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${cards.map(c => `<div class="${UI.card} p-4"><div class="flex items-center justify-between"><p class="text-xs uppercase tracking-wider text-neutral-500">${c[0]}</p><span class="text-xl">${c[2]}</span></div><p class="mt-2 truncate text-xl font-bold md:text-2xl">${c[1]}</p></div>`).join('')}</div>
  <div class="mt-4 grid gap-4 lg:grid-cols-3">
    <div class="${UI.card} p-4 lg:col-span-2"><h3 class="mb-3 font-bold">Last 7 days revenue</h3>
      <div class="flex h-36 items-end gap-2">${days.map(d => `<div class="flex h-full flex-1 flex-col items-center justify-end gap-1"><div class="flex h-full w-full items-end"><div class="${bucket(H, d.v, mx)} w-full rounded-t-lg bg-gradient-to-t from-maroon-700 to-maroon-400 transition-all"></div></div><span class="text-[10px] text-neutral-500">${d.l}</span></div>`).join('')}</div></div>
    <div class="${UI.card} p-4"><h3 class="mb-3 font-bold">Top selling (this month)</h3>${top.length ? top.map((t, i) => `<div class="flex items-center justify-between border-b border-black/5 dark:border-white/5 py-2 text-sm"><span class="truncate"><b class="mr-2 text-maroon-400">${i + 1}</b>${esc(t.name)}</span><span class="font-semibold">${t.qty}</span></div>`).join('') : '<p class="text-sm text-neutral-500">No sales yet</p>'}</div></div>
  <div class="${UI.card} mt-4 overflow-x-auto p-4"><h3 class="mb-3 font-bold">Recent sales</h3>${salesTable(S.sales.slice(0, 8), false)}</div>`;
}
function salesTable(list, actions = true) {
  if (!list.length) return '<p class="py-6 text-center text-sm text-neutral-500">No sales found</p>';
  return `<table class="w-full text-sm"><thead><tr><th class="${UI.th}">Invoice</th><th class="${UI.th}">Date</th><th class="${UI.th}">Items</th><th class="${UI.th} text-right">Total</th>${actions ? `<th class="${UI.th} text-right">Actions</th>` : ''}</tr></thead><tbody>
  ${list.map(s => `<tr class="${UI.tr}"><td class="${UI.td} font-semibold">${esc(s.invoice)}</td><td class="${UI.td}">${fDate(s.ts)} ${fTime(s.ts)}</td><td class="${UI.td}">${s.items.reduce((a, i) => a + i.qty, 0)}</td><td class="${UI.td} text-right font-semibold">${money(s.total)}</td>
  ${actions ? `<td class="${UI.td} whitespace-nowrap text-right"><button data-a="viewSale" data-id="${s.id}" class="${UI.sm}">View</button> <button data-a="printSale" data-id="${s.id}" class="${UI.sm}">Print</button> <button data-a="delSale" data-id="${s.id}" class="${UI.sm}">Delete</button></td>` : ''}</tr>`).join('')}</tbody></table>`;
}
function vPos() {
  return `<div class="grid gap-4 lg:grid-cols-5">
  <div class="lg:col-span-3"><div class="mb-3 flex gap-2"><input id="posSearch" data-in="posSearch" placeholder="Search name / SKU / scan barcode (F2)" class="${UI.inp}" autocomplete="off"></div>
    <div class="mb-3 flex gap-2 overflow-x-auto pb-1">${['All', ...S.categories].map(c => `<button data-a="posCat" data-c="${esc(c)}" class="${c === V.cat ? UI.pri : UI.sec} shrink-0">${esc(c)}</button>`).join('')}</div>
    <div id="posGrid" class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"></div></div>
  <div class="${UI.card} flex flex-col p-4 lg:sticky lg:top-4 lg:col-span-2 lg:max-h-[calc(100vh-2rem)]">
    <div class="mb-2 flex items-center justify-between"><h3 class="font-bold">🛒 Current Sale</h3><span class="text-xs text-neutral-500">${esc(S.settings.cashier)}</span></div>
    <div id="cartItems" class="min-h-[120px] flex-1 overflow-y-auto"></div>
    <div class="mt-3 grid grid-cols-3 gap-2"><div class="col-span-2"><label class="${UI.lbl}">Discount</label><input id="disc" data-in="disc" type="number" min="0" step="0.01" value="${V.disc || ''}" placeholder="0" class="${UI.inp}"></div>
      <div><label class="${UI.lbl}">Type</label><select id="discType" data-ch="discType" class="${UI.inp}"><option value="amt" ${V.discType === 'amt' ? 'selected' : ''}>${esc(S.settings.currency)}</option><option value="pct" ${V.discType === 'pct' ? 'selected' : ''}>%</option></select></div></div>
    <div class="mt-3 space-y-1 text-sm"><div class="flex justify-between"><span>Subtotal</span><span id="tSub"></span></div><div class="flex justify-between"><span>Discount</span><span id="tDisc"></span></div>
      <div class="flex justify-between"><span>Tax (${num(S.settings.tax)}%)</span><span id="tTax"></span></div>
      <div class="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-xl font-extrabold text-maroon-400"><span>Grand Total</span><span id="tTotal"></span></div></div>
    <div class="mt-3 grid grid-cols-2 gap-2 text-sm"><div><label class="${UI.lbl}">Cash Received (F4)</label><input id="cash" data-in="cash" type="number" min="0" step="0.01" value="${V.cash}" placeholder="Exact" class="${UI.inp}"></div>
      <div class="flex flex-col justify-end"><label class="${UI.lbl}">Balance</label><p class="py-2"><span id="tBal"></span></p></div></div>
    <div class="mt-3 grid grid-cols-3 gap-2"><button data-a="cancelSale" class="${UI.sec}">Cancel</button><button data-a="newSale" class="${UI.sec}">New (F10)</button><button data-a="complete" class="${UI.pri}">Pay (F9)</button></div></div></div>`;
}
function vProducts() {
  return `<div class="mb-3 flex flex-wrap gap-2"><input data-in="prodQ" id="prodQ" placeholder="Search products..." class="${UI.inp} max-w-xs">
    <select data-ch="prodCat" id="prodCat" class="${UI.inp} max-w-[200px]"><option value="">All categories</option>${S.categories.map(c => `<option>${esc(c)}</option>`).join('')}</select>
    <button data-a="prodForm" class="${UI.pri} ml-auto">+ Add Product</button><button data-a="catForm" class="${UI.sec}">Categories</button></div>
    <div id="prodTable" class="${UI.card} overflow-x-auto"></div>`;
}
function updateProdTable() {
  const q = ($('#prodQ')?.value || '').toLowerCase(), c = $('#prodCat')?.value || '';
  const l = S.products.filter(p => (!c || p.category === c) && (!q || [p.name, p.sku, p.barcode, p.category].some(x => String(x || '').toLowerCase().includes(q))));
  $('#prodTable').innerHTML = l.length ? `<table class="w-full text-sm"><thead><tr><th class="${UI.th}">Product</th><th class="${UI.th}">SKU / Barcode</th><th class="${UI.th}">Category</th><th class="${UI.th} text-right">Buy</th><th class="${UI.th} text-right">Sell</th><th class="${UI.th} text-right">Stock</th><th class="${UI.th} text-right">Actions</th></tr></thead><tbody>
  ${l.map(p => `<tr class="${UI.tr}"><td class="${UI.td}"><div class="flex items-center gap-2"><div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-maroon-800 font-bold text-white/80">${p.img ? `<img src="${p.img}" alt="" class="h-full w-full object-cover">` : esc(p.name.charAt(0))}</div><span class="font-semibold">${esc(p.name)}</span></div></td>
  <td class="${UI.td} text-xs">${esc(p.sku)}<br><span class="text-neutral-500">${esc(p.barcode)}</span></td><td class="${UI.td}">${esc(p.category)}</td><td class="${UI.td} text-right">${money(p.cost)}</td><td class="${UI.td} text-right font-semibold">${money(p.price)}</td>
  <td class="${UI.td} text-right"><span class="rounded-md px-2 py-0.5 text-xs font-bold ${p.stock <= 0 ? 'bg-red-600 text-white' : p.stock <= p.low ? 'bg-amber-500 text-black' : 'bg-emerald-600/20 text-emerald-500'}">${p.stock}${p.stock <= p.low ? ' ⚠' : ''}</span></td>
  <td class="${UI.td} whitespace-nowrap text-right"><button data-a="prodForm" data-id="${p.id}" class="${UI.sm}">Edit</button> <button data-a="delProd" data-id="${p.id}" class="${UI.sm}">Delete</button></td></tr>`).join('')}</tbody></table>` : '<p class="py-8 text-center text-sm text-neutral-500">No products found</p>';
}
function prodForm(id) {
  const p = S.products.find(x => x.id === id) || { name: '', category: S.categories[0] || '', sku: '', barcode: '', cost: '', price: '', stock: '', low: 5, img: '' };
  V.tmpImg = p.img || ''; V.editId = id || null;
  const f = (l, i, v, t = 'text') => `<div><label class="${UI.lbl}">${l}</label><input id="${i}" type="${t}" ${t === 'number' ? 'min="0" step="0.01"' : ''} value="${esc(v)}" class="${UI.inp}"></div>`;
  openModal(`<h3 class="mb-4 text-lg font-bold">${id ? 'Edit' : 'Add'} Product</h3><div class="grid grid-cols-2 gap-3">
    <div class="col-span-2">${f('Name *', 'fName', p.name)}</div>
    <div><label class="${UI.lbl}">Category</label><select id="fCat" class="${UI.inp}">${S.categories.map(c => `<option ${c === p.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    ${f('SKU', 'fSku', p.sku)}${f('Barcode', 'fBar', p.barcode)}${f('Buying Price', 'fCost', p.cost, 'number')}${f('Selling Price *', 'fPrice', p.price, 'number')}${f('Stock', 'fStock', p.stock, 'number')}${f('Low Stock Alert at', 'fLow', p.low, 'number')}
    <div><label class="${UI.lbl}">Image</label><input id="fImg" data-ch="prodImg" type="file" accept="image/*" class="${UI.inp} text-xs"></div>
    <div class="col-span-2"><img id="fImgPrev" alt="" src="${p.img || ''}" class="${p.img ? '' : 'hidden'} h-24 rounded-xl object-cover"></div></div>
    <div class="mt-5 flex justify-end gap-2"><button data-a="closeModal" class="${UI.sec}">Cancel</button><button data-a="saveProd" class="${UI.pri}">Save</button></div>`);
}
function saveProd() {
  const g = i => $('#' + i).value.trim();
  const p = { name: g('fName'), category: g('fCat'), sku: g('fSku'), barcode: g('fBar'), cost: num(g('fCost')), price: num(g('fPrice')), stock: Math.floor(num(g('fStock'))), low: Math.floor(num(g('fLow'))), img: V.tmpImg };
  if (!p.name) return toast('Product name is required', 'err');
  if (p.barcode && S.products.some(x => x.barcode === p.barcode && x.id !== V.editId)) return toast('Barcode already used by another product', 'err');
  if (V.editId) Object.assign(S.products.find(x => x.id === V.editId), p); else S.products.unshift({ id: uid(), ...p });
  save('products'); closeModal(); render(); toast('Product saved');
}
function catForm() {
  openModal(`<h3 class="mb-4 text-lg font-bold">Categories</h3><div class="mb-3 flex gap-2"><input id="newCat" placeholder="New category" class="${UI.inp}"><button data-a="addCat" class="${UI.pri}">Add</button></div>
    <div class="space-y-1">${S.categories.map(c => `<div class="flex items-center justify-between rounded-lg bg-black/5 dark:bg-white/5 px-3 py-2 text-sm"><span>${esc(c)}</span><button data-a="delCat" data-c="${esc(c)}" class="text-red-500">✕</button></div>`).join('')}</div>
    <div class="mt-4 flex justify-end"><button data-a="closeModal" class="${UI.sec}">Done</button></div>`);
}
function vSales() {
  return `<div class="mb-3"><input id="salesQ" data-in="salesQ" placeholder="Search by invoice, date (DD/MM/YYYY) or product..." class="${UI.inp} max-w-md"></div><div id="salesBox" class="${UI.card} overflow-x-auto p-2"></div>`;
}
function updateSalesTable() {
  const q = ($('#salesQ')?.value || '').trim().toLowerCase();
  const l = !q ? S.sales : S.sales.filter(s => s.invoice.toLowerCase().includes(q) || fDate(s.ts).includes(q) || s.items.some(i => i.name.toLowerCase().includes(q)));
  $('#salesBox').innerHTML = salesTable(l);
}
function vReports() {
  const L = range(V.rep), T = stat(L), sold = soldMap(L).sort((a, b) => b.qty - a.qty);
  const sm = Object.fromEntries(soldMap(L).map(x => [x.id, x.qty]));
  const least = S.products.map(p => ({ name: p.name, qty: sm[p.id] || 0 })).sort((a, b) => a.qty - b.qty).slice(0, 5);
  const cats = {}; L.forEach(s => s.items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + i.price * i.qty; }));
  const cl = Object.entries(cats).sort((a, b) => b[1] - a[1]), cmx = cl.length ? cl[0][1] : 0;
  const hrs = Array.from({ length: 24 }, (_, h) => L.filter(s => new Date(s.ts).getHours() === h).reduce((a, s) => a + s.total, 0)), hmx = Math.max(...hrs);
  S.reports = { generatedAt: new Date().toISOString(), today: stat(range('today')), week: stat(range('week')), month: stat(range('month')) }; save('reports');
  const list = (arr, fn) => arr.length ? arr.map(fn).join('') : '<p class="text-sm text-neutral-500">No data</p>';
  return `<div class="mb-4 flex gap-2">${[['today', 'Today'], ['week', 'Weekly'], ['month', 'Monthly']].map(([k, l]) => `<button data-a="rep" data-k="${k}" class="${V.rep === k ? UI.pri : UI.sec}">${l}</button>`).join('')}</div>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${[['Revenue', money(T.rev)], ['Profit', money(T.profit)], ['Transactions', T.n], ['Average Sale', money(T.avg)]].map(c => `<div class="${UI.card} p-4"><p class="text-xs uppercase tracking-wider text-neutral-500">${c[0]}</p><p class="mt-2 truncate text-xl font-bold">${c[1]}</p></div>`).join('')}</div>
  <div class="mt-4 grid gap-4 lg:grid-cols-2">
   <div class="${UI.card} p-4"><h3 class="mb-3 font-bold">Most sold</h3>${list(sold.slice(0, 5), x => `<div class="flex justify-between border-b border-black/5 dark:border-white/5 py-2 text-sm"><span class="truncate">${esc(x.name)}</span><b>${x.qty}</b></div>`)}</div>
   <div class="${UI.card} p-4"><h3 class="mb-3 font-bold">Least sold</h3>${list(least, x => `<div class="flex justify-between border-b border-black/5 dark:border-white/5 py-2 text-sm"><span class="truncate">${esc(x.name)}</span><b>${x.qty}</b></div>`)}</div>
   <div class="${UI.card} p-4"><h3 class="mb-3 font-bold">Category sales</h3>${list(cl, ([c, v]) => `<div class="mb-2"><div class="flex justify-between text-sm"><span>${esc(c)}</span><b>${money(v)}</b></div><div class="mt-1 h-2 rounded-full bg-black/10 dark:bg-white/10"><div class="${bucket(W, v, cmx)} h-2 rounded-full bg-maroon-500"></div></div></div>`)}</div>
   <div class="${UI.card} p-4"><h3 class="mb-3 font-bold">Hourly sales</h3><div class="flex h-32 items-end gap-0.5">${hrs.map(v => `<div class="flex h-full flex-1 items-end"><div class="${bucket(H, v, hmx)} w-full rounded-t bg-maroon-500"></div></div>`).join('')}</div>
     <div class="mt-1 flex justify-between text-[10px] text-neutral-500"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span></div></div></div>`;
}
function vBackup() {
  const b = (a, t, s, cls = UI.sec) => `<button data-a="${a}" class="${cls} w-full text-left"><span class="block">${t}</span><span class="block text-xs font-normal opacity-70">${s}</span></button>`;
  return `<div class="grid gap-3 md:grid-cols-2">${b('expProducts', '⬇️ Export Products JSON', 'Download your product list')}
    <label class="${UI.sec} block cursor-pointer"><span class="block">⬆️ Import Products JSON</span><span class="block text-xs font-normal opacity-70">Merge products from a file</span><input type="file" accept=".json" data-ch="impProducts" class="hidden"></label>
    ${b('expSales', '⬇️ Export Sales JSON', 'Download all sales and invoices')}${b('expAll', '💾 Backup Complete System', 'Products, sales, settings and more')}
    <label class="${UI.sec} block cursor-pointer"><span class="block">♻️ Restore Backup</span><span class="block text-xs font-normal opacity-70">Replace everything with a backup file</span><input type="file" accept=".json" data-ch="impAll" class="hidden"></label>
    ${b('reset', '🗑️ Reset Everything', 'Permanently erase all data', UI.dng)}</div>
    <p class="mt-4 text-xs text-neutral-500">Data is stored in this browser only. Export a backup regularly.</p>`;
}
function vSettings() {
  const s = S.settings, f = (l, i, v, t = 'text') => `<div><label class="${UI.lbl}">${l}</label><input id="${i}" type="${t}" ${t === 'number' ? 'min="0" step="0.01"' : ''} value="${esc(v)}" class="${UI.inp}"></div>`;
  return `<div class="${UI.card} max-w-3xl p-5"><div class="grid gap-3 md:grid-cols-2">
    ${f('Company Name', 'sName', s.name)}${f('Phone', 'sPhone', s.phone)}<div class="md:col-span-2">${f('Address', 'sAddr', s.address)}</div>
    ${f('Currency Symbol', 'sCur', s.currency)}${f('Tax %', 'sTax', s.tax, 'number')}${f('Invoice Prefix', 'sPre', s.prefix)}${f('Next Invoice Number', 'sCnt', S.counter, 'number')}${f('Cashier Name', 'sCash', s.cashier)}
    <div><label class="${UI.lbl}">Receipt Size</label><select id="sSize" class="${UI.inp}">${['58mm', '80mm', 'A4'].map(z => `<option ${z === s.receiptSize ? 'selected' : ''}>${z}</option>`).join('')}</select></div>
    <div><label class="${UI.lbl}">Theme</label><select id="sTheme" class="${UI.inp}"><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>Light</option></select></div>
    <div><label class="${UI.lbl}">Company Logo</label><input type="file" accept="image/*" data-ch="logo" class="${UI.inp} text-xs"></div>
    <div class="md:col-span-2"><label class="${UI.lbl}">Receipt Footer</label><textarea id="sFoot" rows="2" class="${UI.inp}">${esc(s.footer)}</textarea></div>
    <div class="md:col-span-2"><img id="logoPrev" alt="" src="${s.logo}" class="${s.logo ? '' : 'hidden'} h-16 rounded-lg bg-white p-1 object-contain"></div></div>
    <div class="mt-5 flex justify-end"><button data-a="saveSettings" class="${UI.pri}">Save Settings</button></div></div>`;
}

/* ============================ SHELL / RENDER ============================ */
const TITLES = { dashboard: 'Dashboard', pos: 'Point of Sale', products: 'Products', sales: 'Sales History', reports: 'Reports', backup: 'Backup & Restore', settings: 'Settings' };
function render() {
  document.documentElement.classList.toggle('dark', S.theme === 'dark');
  const body = { dashboard: vDashboard, pos: vPos, products: vProducts, sales: vSales, reports: vReports, backup: vBackup, settings: vSettings }[V.view]();
  $('#app').innerHTML = `<div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-maroon-700/20 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-maroon-900/30 blur-3xl"></div>
  <div class="relative flex min-h-screen">
   <aside class="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r border-black/10 dark:border-white/10 bg-white/60 dark:bg-ink-900/70 p-4 backdrop-blur-xl md:flex">
     <div class="mb-5 flex items-center gap-2">${S.settings.logo ? `<img src="${S.settings.logo}" alt="" class="h-9 w-9 rounded-lg object-contain">` : '<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-maroon-600 font-extrabold text-white">S</div>'}
     <p class="text-sm font-extrabold leading-tight">${esc(S.settings.name)}</p></div>
     ${NAV.map(n => `<button data-a="nav" data-v="${n[0]}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${V.view === n[0] ? 'bg-maroon-600 text-white shadow-lg shadow-maroon-900/40' : 'hover:bg-black/5 dark:hover:bg-white/10'}"><span>${n[1]}</span>${n[2]}</button>`).join('')}
     <p class="mt-auto text-[10px] text-neutral-500">F1 POS · F2 Search · F4 Cash · F9 Pay · F10 New</p></aside>
   <main class="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">
     <header class="mb-5 flex items-center justify-between"><div><h1 class="text-2xl font-extrabold">${TITLES[V.view]}</h1><p class="text-xs text-neutral-500">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
     <button data-a="theme" class="${UI.sec}">${S.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button></header>
     <div class="animate-fade-up">${body}</div></main></div>
   <nav class="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-ink-900/90 p-1 backdrop-blur-xl md:hidden">
     ${NAV.map(n => `<button data-a="nav" data-v="${n[0]}" class="flex flex-col items-center rounded-lg px-1.5 py-1 text-[10px] ${V.view === n[0] ? 'text-maroon-400 font-bold' : 'text-neutral-500'}"><span class="text-lg">${n[1]}</span>${n[2]}</button>`).join('')}</nav>`;
  if (V.view === 'pos') { updatePosGrid(); updateCart(); }
  if (V.view === 'products') updateProdTable();
  if (V.view === 'sales') updateSalesTable();
}

/* ============================ IMPORT / EXPORT ============================ */
function download(name, data) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const stamp = () => new Date().toISOString().slice(0, 10);
function readJSON(file, cb) {
  const r = new FileReader();
  r.onload = () => { try { cb(JSON.parse(r.result)); } catch { toast('Invalid JSON file', 'err'); } };
  r.readAsText(file);
}
function readImage(file, max, type, cb) {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => {
    const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
    c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL(type, 0.85)); };
    im.src = r.result; };
  r.readAsDataURL(file);
}
const fullBackup = () => ({ app: 'sash-art-pos', version: 1, exportedAt: new Date().toISOString(),
  data: Object.fromEntries(Object.keys(KEYS).map(k => [KEYS[k], S[k]])) });

/* ============================ ACTIONS ============================ */
const A = {
  nav: el => { V.view = el.dataset.v; render(); if (V.view === 'pos') $('#posSearch').focus(); },
  theme: () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save('theme'); render(); },
  closeModal, confirmYes: () => { const cb = V.confirmCb; closeModal(); if (cb) cb(); },
  add: el => { const p = S.products.find(x => x.id === el.dataset.id); if (p) addToCart(p); updatePosGrid(); },
  qty: el => {
    const i = V.cart.find(x => x.id === el.dataset.id), p = S.products.find(x => x.id === el.dataset.id), d = +el.dataset.d;
    if (d > 0 && i.qty + 1 > p.stock) return toast(`Only ${p.stock} in stock`, 'err');
    i.qty += d; if (i.qty <= 0) V.cart = V.cart.filter(x => x !== i); updateCart();
  },
  rm: el => { V.cart = V.cart.filter(x => x.id !== el.dataset.id); updateCart(); },
  posCat: el => { V.cat = el.dataset.c; render(); },
  complete: completeSale, newSale: () => newSale(false),
  cancelSale: () => { if (!V.cart.length) return toast('Nothing to cancel', 'info'); confirmBox('Cancel the current sale and clear the cart?', () => newSale(false), 'Cancel Sale'); },
  prodForm: el => prodForm(el.dataset.id), saveProd, catForm,
  delProd: el => confirmBox('Delete this product?', () => {
    const i = S.products.findIndex(x => x.id === el.dataset.id); V.undo = { t: 'prod', d: S.products[i], i };
    S.products.splice(i, 1); save('products'); render(); toast('Product deleted', 'info', 'Undo');
  }),
  addCat: () => { const v = $('#newCat').value.trim(); if (!v) return; if (S.categories.includes(v)) return toast('Category exists', 'err'); S.categories.push(v); save('categories'); catForm(); },
  delCat: el => { const c = el.dataset.c; S.categories = S.categories.filter(x => x !== c); S.products.forEach(p => { if (p.category === c) p.category = 'Uncategorized'; });
    if (S.products.some(p => p.category === 'Uncategorized') && !S.categories.includes('Uncategorized')) S.categories.push('Uncategorized');
    save('categories', 'products'); catForm(); },
  viewSale: el => showReceipt(S.sales.find(x => x.id === el.dataset.id)),
  printSale: el => { V.rc = { sale: S.sales.find(x => x.id === el.dataset.id), size: S.settings.receiptSize }; A.printRc(); },
  delSale: el => confirmBox('Delete this sale? Stock will be restored.', () => {
    const i = S.sales.findIndex(x => x.id === el.dataset.id), s = S.sales[i];
    s.items.forEach(it => { const p = S.products.find(x => x.id === it.id); if (p) p.stock += it.qty; });
    V.undo = { t: 'sale', d: s, i }; S.sales.splice(i, 1); S.invoices = S.invoices.filter(x => x.saleId !== s.id);
    save('sales', 'invoices', 'products'); render(); toast('Sale deleted', 'info', 'Undo');
  }),
  undo: () => {
    const u = V.undo; if (!u) return;
    if (u.t === 'prod') { S.products.splice(u.i, 0, u.d); save('products'); }
    else { u.d.items.forEach(it => { const p = S.products.find(x => x.id === it.id); if (p) p.stock -= it.qty; });
      S.sales.splice(u.i, 0, u.d); S.invoices.unshift({ invoice: u.d.invoice, saleId: u.d.id, ts: u.d.ts }); save('sales', 'invoices', 'products'); }
    V.undo = null; render(); toast('Restored');
  },
  rcSize: el => { V.rc.size = el.dataset.size; showReceipt(V.rc.sale, V.rc.size); },
  printRc: () => { $('#printArea').innerHTML = receiptHTML(V.rc.sale, V.rc.size); setTimeout(() => window.print(), 100); },
  rep: el => { V.rep = el.dataset.k; render(); },
  saveSettings: () => {
    const g = i => $('#' + i).value.trim();
    if (!g('sName')) return toast('Company name is required', 'err');
    Object.assign(S.settings, { name: g('sName'), phone: g('sPhone'), address: g('sAddr'), currency: g('sCur') || 'LKR', tax: Math.max(0, num(g('sTax'))),
      prefix: g('sPre'), cashier: g('sCash') || 'Admin', receiptSize: g('sSize'), footer: g('sFoot') });
    if (V.tmpLogo !== null) S.settings.logo = V.tmpLogo;
    S.counter = Math.max(1, Math.floor(num(g('sCnt')))); S.theme = g('sTheme'); V.tmpLogo = null;
    save('settings', 'counter', 'theme'); render(); toast('Settings saved');
  },
  expProducts: () => download(`products-${stamp()}.json`, { products: S.products, categories: S.categories }),
  expSales: () => download(`sales-${stamp()}.json`, { sales: S.sales, invoices: S.invoices }),
  expAll: () => download(`sash-pos-backup-${stamp()}.json`, fullBackup()),
  reset: () => openModal(`<h3 class="mb-2 text-lg font-bold text-red-500">Reset Everything</h3><p class="mb-3 text-sm text-neutral-500">This permanently deletes all products, sales and settings. Type <b>RESET</b> to continue.</p>
    <input id="rstConf" class="${UI.inp}" autocomplete="off"><div class="mt-4 flex justify-end gap-2"><button data-a="closeModal" class="${UI.sec}">Cancel</button><button data-a="doReset" class="${UI.dng}">Erase All</button></div>`, 'max-w-sm'),
  doReset: () => { if ($('#rstConf').value.trim() !== 'RESET') return toast('Type RESET to confirm', 'err'); Object.values(KEYS).forEach(k => localStorage.removeItem(k)); location.reload(); }
};

/* ============================ EVENTS ============================ */
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el); });
document.addEventListener('input', e => {
  const k = e.target.dataset.in; if (!k) return;
  if (k === 'posSearch') updatePosGrid();
  else if (k === 'disc') { V.disc = e.target.value; updateCart(); }
  else if (k === 'cash') { V.cash = e.target.value; updateCart(); }
  else if (k === 'prodQ') updateProdTable();
  else if (k === 'salesQ') updateSalesTable();
});
document.addEventListener('change', e => {
  const k = e.target.dataset.ch; if (!k) return; const f = e.target.files && e.target.files[0];
  if (k === 'discType') { V.discType = e.target.value; updateCart(); }
  else if (k === 'prodCat') updateProdTable();
  else if (k === 'prodImg' && f) readImage(f, 400, 'image/jpeg', d => { V.tmpImg = d; const i = $('#fImgPrev'); i.src = d; i.classList.remove('hidden'); });
  else if (k === 'logo' && f) readImage(f, 300, 'image/png', d => { V.tmpLogo = d; const i = $('#logoPrev'); i.src = d; i.classList.remove('hidden'); });
  else if (k === 'impProducts' && f) readJSON(f, j => {
    const list = Array.isArray(j) ? j : j.products; if (!Array.isArray(list)) return toast('No products found in file', 'err');
    let n = 0; list.forEach(p => { if (!p || !p.name) return; const np = { id: p.id || uid(), name: String(p.name), category: p.category || 'Uncategorized', sku: p.sku || '', barcode: p.barcode || '',
      cost: num(p.cost), price: num(p.price), stock: Math.floor(num(p.stock)), low: Math.floor(num(p.low ?? 5)), img: p.img || '' };
      const i = S.products.findIndex(x => x.id === np.id); if (i >= 0) S.products[i] = np; else S.products.push(np);
      if (!S.categories.includes(np.category)) S.categories.push(np.category); n++; });
    save('products', 'categories'); toast(`${n} products imported`);
  });
  else if (k === 'impAll' && f) readJSON(f, j => {
    if (!j || !j.data || !Array.isArray(j.data.products)) return toast('Not a valid backup file', 'err');
    confirmBox('Restore this backup? All current data will be replaced.', () => {
      Object.values(KEYS).forEach(k2 => { if (j.data[k2] !== undefined) localStorage.setItem(k2, JSON.stringify(j.data[k2])); }); location.reload();
    }, 'Restore');
  });
  if (e.target.type === 'file') e.target.value = '';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Enter' && e.target.id === 'posSearch') {
    const q = e.target.value.trim().toLowerCase(); if (!q) return;
    const hit = S.products.find(p => (p.barcode && p.barcode.toLowerCase() === q) || (p.sku && p.sku.toLowerCase() === q)) || (posList().length === 1 ? posList()[0] : null);
    if (hit) { addToCart(hit); e.target.value = ''; updatePosGrid(); } else toast('No matching product', 'err');
    return;
  }
  const map = { F1: () => A.nav({ dataset: { v: 'pos' } }), F2: () => { if (V.view !== 'pos') A.nav({ dataset: { v: 'pos' } }); $('#posSearch').focus(); },
    F4: () => { if (V.view === 'pos') $('#cash').focus(); }, F9: () => { if (V.view === 'pos') completeSale(); }, F10: () => { if (V.view === 'pos') newSale(false); } };
  if (map[e.key]) { e.preventDefault(); map[e.key](); }
});

/* ============================ BOOT ============================ */
render();
setTimeout(() => { const s = $('#splash'); s.classList.add('opacity-0'); setTimeout(() => s.remove(), 500); }, 500);
})();
