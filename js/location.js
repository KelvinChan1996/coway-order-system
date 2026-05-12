// location.js - 门店列表（从 Cloudflare Worker API 读取）

let locationsData = [];

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
}

async function loadLocations() {
    const container = document.getElementById('locationsContainer');
    if (!container) return;
    
    try {
        // 从 Worker API 获取门店数据
        locationsData = await getLocations();
        renderLocationCards();
    } catch (e) {
        console.error('加载门店失败:', e);
        locationsData = [];
        renderLocationCards();
    }
}

function renderLocationCards() {
    const container = document.getElementById('locationsContainer');
    if (!container) return;
    
    if (!locationsData.length) {
        container.innerHTML = '<div class="empty-locations" data-i18n="locations.noLocations">暂无门店信息，请稍后再来</div>';
        I18N.updatePage();
        return;
    }
    
    container.innerHTML = '';
    locationsData.forEach(loc => {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <img class="location-image" src="${loc.image || 'https://placehold.co/600x400/cccccc/white?text=No+Image'}" alt="${escapeHtml(loc.name)}" onerror="this.src='https://placehold.co/600x400/cccccc/white?text=No+Image'">
            <div class="location-info">
                <div class="location-name">${escapeHtml(loc.name)}</div>
                <div class="location-address">${escapeHtml(loc.address)}</div>
                <div class="location-hours">${escapeHtml(loc.hours)}</div>
                <div class="location-phone"><a href="tel:${loc.phone}">${loc.phone}</a></div>
                <a href="${loc.wazeLink || '#'}" target="_blank" class="waze-link"><span data-i18n="locations.navigate">使用 Waze 导航</span></a>
            </div>
        `;
        container.appendChild(card);
    });
    I18N.updatePage();
}

// 语言切换时刷新国际化
window.addEventListener('languageChanged', () => {
    I18N.updatePage();
});

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    loadLocations();
});
