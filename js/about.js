// about.js - 关于我们页面（从 Cloudflare Worker API 读取）

let aboutData = { sections: [] };

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
}

async function loadAboutData() {
    try {
        const data = await getAbout();
        aboutData = data && data.sections ? data : { sections: [] };
    } catch (e) {
        console.error('加载关于我们数据失败:', e);
        aboutData = { sections: [] };
    }
    renderAboutPage();
}

function renderAboutPage() {
    const container = document.getElementById('aboutContainer');
    if (!container) return;
    
    if (!aboutData.sections || aboutData.sections.length === 0) {
        container.innerHTML = `
            <div class="empty-about">
                <h3 data-i18n="about.empty.title">内容正在筹备中</h3>
                <p data-i18n="about.empty.desc">我们的团队正在准备精彩的内容，请稍后再来。</p>
            </div>
        `;
        I18N.updatePage();
        return;
    }
    
    let html = '';
    aboutData.sections.forEach((section) => {
        switch (section.type) {
            case 'text':
                html += renderTextSection(section);
                break;
            case 'team':
                html += renderTeamSection(section);
                break;
            case 'timeline':
                html += renderTimelineSection(section);
                break;
            case 'stats':
                html += renderStatsSection(section);
                break;
            case 'image':
                html += renderImageSection(section);
                break;
        }
    });
    
    container.innerHTML = html;
    I18N.updatePage();
}

function renderTextSection(section) {
    return `
        <div class="about-section">
            <div class="section-title">
                ${section.icon ? `<i>${escapeHtml(section.icon)}</i>` : ''}
                <span>${escapeHtml(section.title || '')}</span>
            </div>
            <div class="section-content">
                ${escapeHtml(section.content || '').replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
}

function renderTeamSection(section) {
    let membersHtml = '';
    if (section.members && section.members.length) {
        section.members.forEach(member => {
            membersHtml += `
                <div class="team-card">
                    <div class="team-avatar">
                        ${member.avatar ? `<img src="${member.avatar}" alt="${escapeHtml(member.name)}">` : '👤'}
                    </div>
                    <div class="team-name">${escapeHtml(member.name || '')}</div>
                    <div class="team-role">${escapeHtml(member.role || '')}</div>
                    <div class="team-bio">${escapeHtml(member.bio || '')}</div>
                </div>
            `;
        });
    }
    
    return `
        <div class="about-section">
            <div class="section-title">
                ${section.icon ? `<i>${escapeHtml(section.icon)}</i>` : ''}
                <span>${escapeHtml(section.title || '团队介绍')}</span>
            </div>
            <div class="team-grid">
                ${membersHtml}
            </div>
        </div>
    `;
}

function renderTimelineSection(section) {
    let itemsHtml = '';
    if (section.items && section.items.length) {
        section.items.forEach(item => {
            itemsHtml += `
                <div class="timeline-item">
                    <div class="timeline-year">${escapeHtml(item.year || '')}</div>
                    <div class="timeline-title">${escapeHtml(item.title || '')}</div>
                    <div class="timeline-desc">${escapeHtml(item.desc || '')}</div>
                </div>
            `;
        });
    }
    
    return `
        <div class="about-section">
            <div class="section-title">
                ${section.icon ? `<i>${escapeHtml(section.icon)}</i>` : ''}
                <span>${escapeHtml(section.title || '发展历程')}</span>
            </div>
            <div class="timeline">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function renderStatsSection(section) {
    let statsHtml = '';
    if (section.stats && section.stats.length) {
        section.stats.forEach(stat => {
            statsHtml += `
                <div class="stat-card">
                    <div class="stat-number">${escapeHtml(stat.number || '0')}</div>
                    <div class="stat-label">${escapeHtml(stat.label || '')}</div>
                </div>
            `;
        });
    }
    
    return `
        <div class="about-section">
            <div class="section-title">
                ${section.icon ? `<i>${escapeHtml(section.icon)}</i>` : ''}
                <span>${escapeHtml(section.title || '数据统计')}</span>
            </div>
            <div class="stats-grid">
                ${statsHtml}
            </div>
        </div>
    `;
}

function renderImageSection(section) {
    return `
        <div class="about-section">
            ${section.title ? `
                <div class="section-title">
                    ${section.icon ? `<i>${escapeHtml(section.icon)}</i>` : ''}
                    <span>${escapeHtml(section.title)}</span>
                </div>
            ` : ''}
            <div class="section-content">
                ${section.image ? `<img src="${section.image}" alt="${escapeHtml(section.title || '')}" onerror="this.src='https://placehold.co/800x400/cccccc/white?text=No+Image'">` : ''}
                ${section.caption ? `<p style="text-align:center; color:#888; margin-top:10px;">${escapeHtml(section.caption)}</p>` : ''}
            </div>
        </div>
    `;
}

// 语言切换时重新渲染
window.addEventListener('languageChanged', () => {
    renderAboutPage();
});

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    loadAboutData();
});
