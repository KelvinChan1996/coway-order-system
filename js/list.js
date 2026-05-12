// list.js - 使用 Cloudflare Worker API 存储数据

// ========== 全局变量 ==========
let productsData = [];
let carouselData = [];
let noticeData = [];
let agentsData = [];
let currentCategory = "all";
let currentProduct = null;
let currentLang = 'zh';
let currentCarouselSlide = 0;
let carouselInterval = null;

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

// ========== 加载数据 ==========
async function loadAllData() {
    try {
        const data = await getAllData();
        productsData = data.products || [];
        carouselData = data.carousel || [];
        noticeData = data.notices || [];
        agentsData = data.agents || [];
    } catch (e) {
        console.error('加载数据失败:', e);
        productsData = []; carouselData = []; noticeData = []; agentsData = [];
    }
}

// ========== 产品相关 ==========
function getProductsByCategory(category) {
    if (category === 'all') return productsData;
    return productsData.filter(p => p.category === category);
}

function renderCategoryList() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = `category-item ${currentCategory === cat.id ? 'active' : ''}`;
        li.innerHTML = I18N.t(cat.nameKey);
        li.onclick = () => {
            currentCategory = cat.id;
            renderCategoryList();
            renderProducts();
            document.getElementById('currentCategory').innerHTML = `<i>🛍️</i> <span>${I18N.t(cat.nameKey)}</span>`;
        };
        container.appendChild(li);
    });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    const list = getProductsByCategory(currentCategory);
    if (!list.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px; background:#fff; border-radius:20px;"><p data-i18n="products.noProducts">暂无产品</p></div>';
        I18N.updatePage();
        return;
    }
    grid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img src="${p.images?.[0] || 'https://placehold.co/800x400/80abce/white?text=Product'}"><div class="info"><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.desc_zh?.substring(0, 60))}...</p><div class="price">${p.price || 'RM 0'}</div></div>`;
        card.onclick = () => openDetailModal(p);
        grid.appendChild(card);
    });
}

// ========== 轮播图 ==========
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
        slide.innerHTML = `<div class="carousel-content"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.desc)}</p><a href="${item.link || '#'}">${I18N.t('home.carousel.learnMore')}</a></div>`;
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

// ========== 公告 ==========
function renderNotices() {
    const container = document.getElementById('noticeContainer');
    if (!container) return;
    if (!noticeData.length) {
        container.innerHTML = `<div class="empty-notice" data-i18n="home.emptyNotice">暂无公告，请稍后再来</div>`;
        I18N.updatePage();
        return;
    }
    container.innerHTML = '';
    noticeData.forEach(n => {
        const card = document.createElement('div');
        card.className = 'notice-card';
        card.innerHTML = `<img class="notice-img" src="${n.image}" onerror="this.src='https://placehold.co/600x400/cccccc/white?text=No+Image'"><div class="notice-content"><div class="notice-title">${escapeHtml(n.title)}</div><div class="notice-desc">${escapeHtml(n.description)}</div><div class="notice-date">${n.date}</div></div>`;
        container.appendChild(card);
    });
}

// ========== Agent ==========
function getLeastBusyAgent() {
    if (!agentsData.length) return null;
    const minReceipt = Math.min(...agentsData.map(a => a.receipt || 0));
    return agentsData.find(a => (a.receipt || 0) === minReceipt);
}

function incrementAgentReceipt(agent) {
    if (agent) {
        agent.receipt = (agent.receipt || 0) + 1;
        saveAgents(agentsData).catch(e => console.error('保存Agent失败:', e));
    }
}

// ========== 详情弹窗 ==========
function openDetailModal(p) {
    currentProduct = p;
    document.getElementById('detailTitle').innerText = p.name;
    document.getElementById('detailPrice').innerHTML = p.price || 'RM 0';
    document.getElementById('detailDesc').innerText = p.desc_zh;
    currentLang = 'zh';
    const carousel = document.getElementById('detailCarousel');
    carousel.innerHTML = '';
    (p.images?.length ? p.images : ['https://placehold.co/800x400/80abce/white?text=Product']).forEach(img => carousel.innerHTML += `<div><img src="${img}" style="width:100%; border-radius:8px;"></div>`);
    if ($('#detailCarousel').hasClass('slick-initialized')) $('#detailCarousel').slick('unslick');
    $('#detailCarousel').slick({ dots: true, infinite: true, speed: 300, slidesToShow: 1, autoplay: true, autoplaySpeed: 3000 });
    document.getElementById('detailModal').classList.add('active');
}

window.closeDetailModal = () => {
    document.getElementById('detailModal').classList.remove('active');
    $('#detailCarousel').slick('unslick');
};

window.closeOrderModal = () => {
    document.getElementById('orderModal').classList.remove('active');
    document.getElementById('orderForm').reset();
    document.getElementById('differentDelivery').checked = false;
    document.getElementById('deliveryAddressGroup').classList.remove('show');
};

window.closeSuccessModal = () => document.getElementById('successModal').classList.remove('active');

// 翻译按钮
document.getElementById('translateBtn')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const el = document.getElementById('detailDesc');
    if (currentLang === 'zh') {
        el.innerText = currentProduct.desc_en || currentProduct.desc_zh;
        currentLang = 'en';
    } else {
        el.innerText = currentProduct.desc_zh;
        currentLang = 'zh';
    }
});

// 订单按钮
document.getElementById('orderFromDetailBtn')?.addEventListener('click', () => {
    closeDetailModal();
    document.getElementById('selectedProductInfo').innerHTML = `<span><strong>${currentProduct?.name}</strong></span><span style="color:#80abce; font-weight:700;">${currentProduct?.price || 'RM 0'}</span>`;
    document.getElementById('orderModal').classList.add('active');
});

// 联系代理按钮
document.getElementById('contactFromDetailBtn')?.addEventListener('click', () => {
    const agent = getLeastBusyAgent();
    if (agent) {
        window.open(`https://wa.me/${agent.contact}?text=${encodeURIComponent(`Hello ${agent.name}, I am interested in ${currentProduct?.name}.`)}`, '_blank');
    } else {
        alert(I18N.t('order.agent.unavailable'));
    }
});

// ========== 订单表单 ==========
document.getElementById('differentDelivery')?.addEventListener('change', function() {
    document.getElementById('deliveryAddressGroup').classList.toggle('show', this.checked);
});

// Telegram 通知配置
const BOT_TOKEN = '8386407941:AAF0W9XaG1tZNdwovITL2wrM-7L3uwQJfso';
const CHAT_ID = '-1003696449169';

function formatPhone(p) {
    let c = p.replace(/\D/g, '');
    if (c.startsWith('0')) c = '60' + c.substring(1);
    if (!c.startsWith('60')) c = '60' + c;
    return c;
}

document.getElementById('orderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentProduct) return alert(I18N.t('order.selectProduct'));
    
    const contact1 = document.getElementById('contact1').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    if (!contact1 || !address || !email) return alert(I18N.t('order.fillRequired'));
    
    const agent = getLeastBusyAgent();
    if (!agent) return alert(I18N.t('order.agent.unavailable'));
    
    const btn = e.target.querySelector('.btn-submit');
    const originalText = btn.innerText;
    btn.innerText = '处理中...';
    btn.disabled = true;
    
    try {
        const orderId = 'COW' + Date.now();
        const msg = `新订单\n\n产品: ${currentProduct.name}\n价格: ${currentProduct.price}\n电话1: ${formatPhone(contact1)}\n电话2: ${document.getElementById('contact2')?.value || '-'}\n地址: ${address}\n代理: ${agent.name} (${agent.hp_code})\n订单号: ${orderId}`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
        });
        
        const ic = document.getElementById('icUpload').files[0];
        if (ic) {
            const fd = new FormData();
            fd.append('chat_id', CHAT_ID);
            fd.append('photo', ic);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
        }
        
        incrementAgentReceipt(agent);
        closeOrderModal();
        document.getElementById('successModal').classList.add('active');
    } catch (err) {
        console.error('提交失败:', err);
        alert('提交失败，请稍后重试');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    renderCategoryList();
    renderProducts();
    renderCarousel();
    renderNotices();
    
    document.getElementById('carouselPrev')?.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    document.getElementById('carouselNext')?.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
});

// 语言切换时重新渲染
window.addEventListener('languageChanged', () => {
    renderCategoryList();
    renderProducts();
    renderCarousel();
    renderNotices();
    const currentCat = categories.find(c => c.id === currentCategory);
    if (currentCat) document.getElementById('currentCategory').innerHTML = `<i>🛍️</i> <span>${I18N.t(currentCat.nameKey)}</span>`;
});
