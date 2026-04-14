// ========== 全局变量 ==========
let productsData = { all: [], water: [], air: [], ac: [], washer: [], toilet: [], massageChair: [], massageBed: [], bed: [] };
let carouselData = [];
let currentCategory = "all";
let currentProduct = null;
let currentLang = 'zh';
let currentCarouselSlide = 0;
let carouselInterval = null;
let agentList = [];

const categories = [
    { id: "all", name: "全部产品", icon: "🛍️" },
    { id: "water", name: "水机", icon: "💧" },
    { id: "air", name: "空气净化器", icon: "🌬️" },
    { id: "ac", name: "冷气机", icon: "❄️" },
    { id: "washer", name: "洗衣机", icon: "🧺" },
    { id: "toilet", name: "马桶", icon: "🚽" },
    { id: "massageChair", name: "按摩椅", icon: "💆" },
    { id: "massageBed", name: "按摩床", icon: "🛏️" },
    { id: "bed", name: "床", icon: "🛌" }
];

// ========== 辅助函数 ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
}

// ========== 加载 Agent ==========
async function loadAgents() {
    try {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/1uYkUTabIRRDhVh_eDfBOZUjwe8Qlv-L6eTwN2FroIAY/export?format=csv';
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        rows[0].split(',').map(h => h.replace(/"/g, '').trim());
        agentList = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            const values = rows[i].split(',').map(v => v.replace(/"/g, '').trim());
            agentList.push({
                id: parseInt(values[0]) || i, name: values[1] || '', hp_code: values[2] || '',
                contact: values[3] || '', position: values[4] || 'HP', receipt: parseInt(values[5]) || 0, email: values[6] || ''
            });
        }
        localStorage.setItem('coway_agents', JSON.stringify(agentList));
    } catch {
        const cached = localStorage.getItem('coway_agents');
        agentList = cached ? JSON.parse(cached) : [
            { id: 1, name: "Ali Rehman", hp_code: "HP001", contact: "60123456789", position: "HP", receipt: 0, email: "ali@coway.com" },
            { id: 2, name: "Siti Nuraini", hp_code: "HP002", contact: "60129876543", position: "SM", receipt: 0, email: "siti@coway.com" },
            { id: 3, name: "Chong Wei", hp_code: "HP003", contact: "60115551234", position: "GSM", receipt: 1, email: "chong@coway.com" }
        ];
    }
}

function getLeastBusyAgent() {
    if (!agentList.length) return null;
    const min = Math.min(...agentList.map(a => a.receipt));
    return agentList.find(a => a.receipt === min);
}

function incrementAgentReceipt(agent) {
    if (agent) { agent.receipt++; localStorage.setItem('coway_agents', JSON.stringify(agentList)); }
}

// ========== 加载产品 ==========
function loadProducts() {
    const saved = localStorage.getItem('coway_products');
    if (saved) {
        const arr = JSON.parse(saved);
        productsData = { all: arr, water: [], air: [], ac: [], washer: [], toilet: [], massageChair: [], massageBed: [], bed: [] };
        arr.forEach(p => { if (productsData[p.category]) productsData[p.category].push(p); });
    } else {
        const defaults = [
            { id: 1, name: "Coway Omba", category: "water", desc_zh: "淨水與冰水一體，現代廚房首選。", desc_en: "Integrated water purifier with cold water.", price: "RM 3,999", images: ["https://placehold.co/800x400/80abce/white?text=Omba"] },
            { id: 2, name: "Coway Neon", category: "water", desc_zh: "時尚設計，過濾重金屬。", desc_en: "Stylish design, removes heavy metals.", price: "RM 2,899", images: ["https://placehold.co/800x400/80abce/white?text=Neon"] },
            { id: 3, name: "Coway Storm", category: "air", desc_zh: "強力淨化PM2.5與過敏原。", desc_en: "Powerful purification for PM2.5.", price: "RM 2,499", images: ["https://placehold.co/800x400/80abce/white?text=Storm"] },
            { id: 4, name: "Coway Arctic", category: "ac", desc_zh: "節能冷氣，快速製冷。", desc_en: "Energy-saving AC, fast cooling.", price: "RM 2,199", images: ["https://placehold.co/800x400/80abce/white?text=Arctic"] },
            { id: 5, name: "Coway Relax Pro", category: "massageChair", desc_zh: "全身按摩，緩解疲勞。", desc_en: "Full body massage, relieve fatigue.", price: "RM 8,999", images: ["https://placehold.co/800x400/80abce/white?text=RelaxPro"] }
        ];
        productsData.all = defaults;
        defaults.forEach(p => { if (productsData[p.category]) productsData[p.category].push(p); });
        localStorage.setItem('coway_products', JSON.stringify(defaults));
    }
}

// ========== 轮播 ==========
function loadCarousel() {
    const saved = localStorage.getItem('coway_carousel');
    carouselData = saved ? JSON.parse(saved) : [
        { id: 1, image: "https://www.coway.com.my/files/Banner/coway-air-purifier-for-every-space.jpg", title: "纯净空气，健康生活", desc: "Coway 空气净化器", link: "list.html" },
        { id: 2, image: "https://www.coway.com.my/files/Banner/coway-water-purifier-banner.jpg", title: "健康饮水，从Coway开始", desc: "净水器系列", link: "list.html" },
        { id: 3, image: "https://www.coway.com.my/img/home/coway-virtual-showroom-tour.jpg", title: "Coway 虚拟展厅", desc: "360° 体验", link: "list.html" }
    ];
    if (!saved) localStorage.setItem('coway_carousel', JSON.stringify(carouselData));
    renderCarousel();
}

function renderCarousel() {
    const container = document.getElementById('carouselSlides');
    const dots = document.getElementById('carouselDots');
    if (!container) return;
    container.innerHTML = '';
    carouselData.forEach((item, i) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${i === currentCarouselSlide ? 'active' : ''}`;
        slide.style.backgroundImage = `url(${item.image})`;
        slide.innerHTML = `<div class="carousel-content"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.desc)}</p><a href="${item.link || '#'}">了解更多 →</a></div>`;
        container.appendChild(slide);
    });
    dots.innerHTML = '';
    carouselData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${i === currentCarouselSlide ? 'active' : ''}`;
        dot.onclick = () => { currentCarouselSlide = i; updateCarouselDisplay(); resetAutoPlay(); };
        dots.appendChild(dot);
    });
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function updateCarouselDisplay() {
    document.querySelectorAll('.carousel-slide').forEach((s, i) => s.classList.toggle('active', i === currentCarouselSlide));
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === currentCarouselSlide));
}

function nextSlide() { currentCarouselSlide = (currentCarouselSlide + 1) % carouselData.length; updateCarouselDisplay(); }
function prevSlide() { currentCarouselSlide = (currentCarouselSlide - 1 + carouselData.length) % carouselData.length; updateCarouselDisplay(); }
function resetAutoPlay() { if (carouselInterval) clearInterval(carouselInterval); carouselInterval = setInterval(nextSlide, 5000); }

// ========== 渲染分类和产品 ==========
function renderCategoryList() {
    const container = document.getElementById('categoryList');
    container.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = `category-item ${currentCategory === cat.id ? 'active' : ''}`;
        li.innerHTML = `<i>${cat.icon}</i>${cat.name}`;
        li.onclick = () => {
            currentCategory = cat.id;
            renderCategoryList();
            renderProducts();
            document.getElementById('currentCategory').innerHTML = `<i>${cat.icon}</i>${cat.name}`;
        };
        container.appendChild(li);
    });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const list = productsData[currentCategory] || [];
    if (!list.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px; background:#fff; border-radius:20px;"><i style="font-size:48px;">📦</i><p>暂无产品</p></div>';
        return;
    }
    grid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img src="${p.images?.[0] || 'https://placehold.co/800x400/80abce/white?text=Product'}"><div class="info"><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.desc_zh?.substring(0, 60))}...</p><div class="price"><i>💰</i> ${p.price}</div></div>`;
        card.onclick = () => openDetailModal(p);
        grid.appendChild(card);
    });
}

// ========== 详情弹窗 ==========
function openDetailModal(p) {
    currentProduct = p;
    document.getElementById('detailTitle').innerText = p.name;
    document.getElementById('detailPrice').innerHTML = `<i>💰</i> ${p.price}`;
    document.getElementById('detailDesc').innerText = p.desc_zh;
    currentLang = 'zh';
    const carousel = document.getElementById('detailCarousel');
    carousel.innerHTML = '';
    (p.images?.length ? p.images : ['https://placehold.co/800x400/80abce/white?text=Product']).forEach(img => carousel.innerHTML += `<div><img src="${img}"></div>`);
    if ($('#detailCarousel').hasClass('slick-initialized')) $('#detailCarousel').slick('unslick');
    $('#detailCarousel').slick({ dots: true, infinite: true, speed: 300, slidesToShow: 1, autoplay: true, autoplaySpeed: 3000 });
    document.getElementById('detailModal').classList.add('active');
}

window.closeDetailModal = () => { document.getElementById('detailModal').classList.remove('active'); $('#detailCarousel').slick('unslick'); };
window.closeOrderModal = () => { document.getElementById('orderModal').classList.remove('active'); document.getElementById('orderForm').reset(); document.getElementById('differentDelivery').checked = false; document.getElementById('deliveryAddressGroup').classList.remove('show'); };
window.closeSuccessModal = () => document.getElementById('successModal').classList.remove('active');

document.getElementById('translateBtn')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const el = document.getElementById('detailDesc');
    if (currentLang === 'zh') { el.innerText = currentProduct.desc_en; currentLang = 'en'; }
    else { el.innerText = currentProduct.desc_zh; currentLang = 'zh'; }
});

document.getElementById('orderFromDetailBtn')?.addEventListener('click', () => {
    closeDetailModal();
    document.getElementById('selectedProductInfo').innerHTML = `<span><strong>${currentProduct.name}</strong></span><span style="color:#80abce; font-weight:700;">${currentProduct.price}</span>`;
    document.getElementById('orderModal').classList.add('active');
});

document.getElementById('contactFromDetailBtn')?.addEventListener('click', () => {
    const agent = getLeastBusyAgent();
    if (agent) window.open(`https://wa.me/${agent.contact}?text=${encodeURIComponent(`Hello ${agent.name}, I am interested in ${currentProduct?.name}.`)}`, '_blank');
    else alert('暂无可用的代理');
});

// ========== 订单提交 ==========
document.getElementById('differentDelivery')?.addEventListener('change', function() {
    document.getElementById('deliveryAddressGroup').classList.toggle('show', this.checked);
});

document.getElementById('orderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentProduct) return alert("请先选择产品");
    const contact1 = document.getElementById('contact1').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    if (!contact1 || !address || !email) return alert("请填写必填字段");
    
    const formatPhone = p => { let c = p.replace(/\D/g, ''); if (c.startsWith('0')) c = '60' + c.substring(1); if (!c.startsWith('60')) c = '60' + c; return c; };
    const agent = getLeastBusyAgent();
    if (!agent) return alert('暂无可用的代理');
    
    const btn = e.target.querySelector('.btn-submit');
    btn.innerText = '⏳ 处理中...'; btn.disabled = true;
    
    try {
        const BOT_TOKEN = '8386407941:AAF0W9XaG1tZNdwovITL2wrM-7L3uwQJfso';
        const CHAT_ID = '-1003696449169';
        const orderId = 'COW' + Date.now();
        const msg = `🧾 *新订单*\n\n*产品:* ${currentProduct.name}\n*电话1:* ${formatPhone(contact1)}\n*地址:* ${address}\n*代理:* ${agent.hp_code}\n*订单号:* ${orderId}`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' }) });
        
        const ic = document.getElementById('icUpload').files[0];
        if (ic) { const fd = new FormData(); fd.append('chat_id', CHAT_ID); fd.append('photo', ic); await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd }); }
        
        const orders = JSON.parse(localStorage.getItem('coway_orders') || '[]');
        orders.unshift({ orderId, date: new Date().toISOString(), product: currentProduct.name, status: 'pending' });
        localStorage.setItem('coway_orders', JSON.stringify(orders));
        incrementAgentReceipt(agent);
        
        closeOrderModal();
        document.getElementById('successModal').classList.add('active');
    } catch { alert('提交失败'); } finally { btn.innerText = '✅ 提交订单'; btn.disabled = false; }
});

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); loadCarousel(); loadAgents(); renderCategoryList(); renderProducts();
    document.getElementById('carouselPrev')?.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    document.getElementById('carouselNext')?.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
});
