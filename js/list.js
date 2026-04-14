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
    { id: "all", nameKey: "products.all" },
    { id: "water", nameKey: "products.water" },
    { id: "air", nameKey: "products.air" },
    { id: "ac", nameKey: "products.ac" },
    { id: "washer", nameKey: "products.washer" },
    { id: "toilet", nameKey: "products.toilet" },
    { id: "massageChair", nameKey: "products.massageChair" },
    { id: "massageBed", nameKey: "products.massageBed" },
    { id: "bed", nameKey: "products.bed" }
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
        agentList = cached ? JSON.parse(cached) : [];
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
        productsData = { all: [], water: [], air: [], ac: [], washer: [], toilet: [], massageChair: [], massageBed: [], bed: [] };
    }
}

// ========== 加载轮播 ==========
function loadCarousel() {
    const saved = localStorage.getItem('coway_carousel');
    carouselData = saved ? JSON.parse(saved) : [];
    renderCarousel();
}

function renderCarousel() {
    const container = document.getElementById('carouselSlides');
    const dots = document.getElementById('carouselDots');
    if (!container) return;
    container.innerHTML = '';
    if (!carouselData.length) {
        container.innerHTML = '<div class="carousel-slide active" style="background-image:url(https://placehold.co/1600x380/80abce/white?text=Coway);"><div class="carousel-content"><h2>Coway Malaysia</h2><p>健康生活领导者</p></div></div>';
        dots.innerHTML = '';
        return;
    }
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

function nextSlide() { if (carouselData.length) { currentCarouselSlide = (currentCarouselSlide + 1) % carouselData.length; updateCarouselDisplay(); } }
function prevSlide() { if (carouselData.length) { currentCarouselSlide = (currentCarouselSlide - 1 + carouselData.length) % carouselData.length; updateCarouselDisplay(); } }
function resetAutoPlay() { if (carouselInterval) clearInterval(carouselInterval); carouselInterval = setInterval(nextSlide, 5000); }

// ========== 渲染分类 ==========
function renderCategoryList() {
    const container = document.getElementById('categoryList');
    container.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = `category-item ${currentCategory === cat.id ? 'active' : ''}`;
        li.innerHTML = I18N.t(cat.nameKey);
        li.onclick = () => {
            currentCategory = cat.id;
            renderCategoryList();
            renderProducts();
            document.getElementById('currentCategory').innerHTML = I18N.t(cat.nameKey);
        };
        container.appendChild(li);
    });
}

// ========== 渲染产品 ==========
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const list = productsData[currentCategory] || [];
    if (!list.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px; background:#fff; border-radius:20px;"><p data-i18n="products.noProducts">暂无产品</p></div>';
        I18N.updatePage();
        return;
    }
    grid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img src="${p.images?.[0] || 'https://placehold.co/800x400/80abce/white?text=Product'}"><div class="info"><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.desc_zh?.substring(0, 60))}...</p><div class="price">${p.price}</div></div>`;
        card.onclick = () => openDetailModal(p);
        grid.appendChild(card);
    });
}

// ========== 详情弹窗 ==========
function openDetailModal(p) {
    currentProduct = p;
    document.getElementById('detailTitle').innerText = p.name;
    document.getElementById('detailPrice').innerHTML = p.price;
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
    else alert(I18N.t('order.agent.unavailable'));
});

// ========== 订单表单 ==========
document.getElementById('differentDelivery')?.addEventListener('change', function() {
    document.getElementById('deliveryAddressGroup').classList.toggle('show', this.checked);
});

document.getElementById('orderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentProduct) return alert(I18N.t('order.selectProduct'));
    const contact1 = document.getElementById('contact1').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    if (!contact1 || !address || !email) return alert(I18N.t('order.fillRequired'));
    
    const formatPhone = p => { let c = p.replace(/\D/g, ''); if (c.startsWith('0')) c = '60' + c.substring(1); if (!c.startsWith('60')) c = '60' + c; return c; };
    const agent = getLeastBusyAgent();
    if (!agent) return alert(I18N.t('order.agent.unavailable'));
    
    const btn = e.target.querySelector('.btn-submit');
    btn.innerText = '处理中...'; btn.disabled = true;
    
    try {
        const BOT_TOKEN = '8386407941:AAF0W9XaG1tZNdwovITL2wrM-7L3uwQJfso';
        const CHAT_ID = '-1003696449169';
        const orderId = 'COW' + Date.now();
        const msg = `新订单\n\n产品: ${currentProduct.name}\n电话1: ${formatPhone(contact1)}\n地址: ${address}\n代理: ${agent.hp_code}\n订单号: ${orderId}`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT_ID, text: msg }) });
        
        const ic = document.getElementById('icUpload').files[0];
        if (ic) { const fd = new FormData(); fd.append('chat_id', CHAT_ID); fd.append('photo', ic); await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd }); }
        
        const orders = JSON.parse(localStorage.getItem('coway_orders') || '[]');
        orders.unshift({ orderId, date: new Date().toISOString(), product: currentProduct.name, status: 'pending' });
        localStorage.setItem('coway_orders', JSON.stringify(orders));
        incrementAgentReceipt(agent);
        
        closeOrderModal();
        document.getElementById('successModal').classList.add('active');
    } catch { alert('提交失败'); } finally { btn.innerText = '提交订单'; btn.disabled = false; }
});

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); loadCarousel(); loadAgents(); renderCategoryList(); renderProducts();
    document.getElementById('carouselPrev')?.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    document.getElementById('carouselNext')?.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
});

window.addEventListener('languageChanged', () => {
    renderCategoryList();
    renderProducts();
    renderCarousel();
    document.getElementById('currentCategory').innerHTML = I18N.t(categories.find(c => c.id === currentCategory).nameKey);
});
