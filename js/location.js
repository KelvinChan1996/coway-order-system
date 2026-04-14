// ========== 门店数据 ==========
let locationsData = [];

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
}

function loadLocations() {
    const container = document.getElementById('locationsContainer');
    let saved = localStorage.getItem('coway_locations');
    locationsData = saved ? JSON.parse(saved) : [];
    renderLocationCards();
}

function renderLocationCards() {
    const container = document.getElementById('locationsContainer');
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
            <img class="location-image" src="${loc.image}" alt="${escapeHtml(loc.name)}" onerror="this.src='https://placehold.co/600x400/cccccc/white?text=No+Image'">
            <div class="location-info">
                <div class="location-name">${escapeHtml(loc.name)}</div>
                <div class="location-address">${escapeHtml(loc.address)}</div>
                <div class="location-hours">${escapeHtml(loc.hours)}</div>
                <div class="location-phone"><a href="tel:${loc.phone}">${loc.phone}</a></div>
                <a href="${loc.wazeLink}" target="_blank" class="waze-link"><span data-i18n="locations.navigate">使用 Waze 导航</span></a>
            </div>
        `;
        container.appendChild(card);
    });
    I18N.updatePage();
}

window.addEventListener('languageChanged', () => {
    I18N.updatePage();
});

document.addEventListener('DOMContentLoaded', () => {
    loadLocations();
});
