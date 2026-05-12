// layout.js - 导航栏和页脚布局
const LAYOUT = {
    navbar: `
        <nav class="navbar">
            <div class="nav-container">
                <a href="index.html" class="logo">
                    <img src="img/coway-malaysia-logo.png" alt="Coway Malaysia">
                </a>
                <div class="nav-menu" id="navMenu"></div>
                <div class="lang-switch">
                    <button onclick="switchLanguage('zh')" class="lang-btn" data-lang="zh">中</button>
                    <span>|</span>
                    <button onclick="switchLanguage('en')" class="lang-btn" data-lang="en">EN</button>
                </div>
                <a href="admin.html" class="admin-icon" title="管理员登录" data-i18n-title="nav.admin">👤</a>
                <button class="mobile-menu-btn" id="menuBtn">☰</button>
            </div>
        </nav>
    `,
    sidebar: `
        <div class="mobile-sidebar" id="sidebar"></div>
        <div class="overlay" id="overlay"></div>
    `,
    footer: `
        <footer>
            <div>
                <a href="terms.html" data-i18n="footer.terms">使用条款</a> •
                <a href="privacy.html" data-i18n="footer.privacy">隐私政策</a> •
                <a href="support.html" data-i18n="footer.support">支持</a>
            </div>
            <div class="footer-divider"></div>
            <div data-i18n="footer.copyright">COWAY (MALAYSIA) © 2026. All Rights Reserved.</div>
        </footer>
    `,
    menuItems: [
        { href: 'index.html', key: 'nav.home' },
        { href: 'list.html', key: 'nav.order', isOrder: true },
        { href: 'location.html', key: 'nav.locations' },
        { href: 'support.html', key: 'nav.support' },
        { href: 'about.html', key: 'nav.about' }
    ]
};

function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

function generateMenu(isMobile) {
    const current = getCurrentPage();
    return LAYOUT.menuItems.map(function(item) {
        const active = (current === item.href || (current === '' && item.href === 'index.html')) ? 'active' : '';
        const text = I18N.t(item.key);
        if (item.isOrder && !isMobile) {
            return '<a href="' + item.href + '" class="btn-product-nav ' + active + '">' + text + '</a>';
        }
        return '<a href="' + item.href + '" class="' + active + '">' + text + '</a>';
    }).join('');
}

function injectLayout() {
    var header = document.createElement('header');
    header.innerHTML = LAYOUT.navbar;
    document.body.insertBefore(header, document.body.firstChild);
    document.getElementById('navMenu').innerHTML = generateMenu(false);
    
    var sidebarDiv = document.createElement('div');
    sidebarDiv.innerHTML = LAYOUT.sidebar;
    document.body.appendChild(sidebarDiv);
    document.getElementById('sidebar').innerHTML = generateMenu(true);
    
    var footerDiv = document.createElement('div');
    footerDiv.innerHTML = LAYOUT.footer;
    document.body.appendChild(footerDiv);
    
    var menuBtn = document.getElementById('menuBtn');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            sidebar.classList.add('open');
            overlay.classList.add('show');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
    
    updateLangButtonState();
}

function updateLangButtonState() {
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        if (btn.dataset.lang === I18N.current) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

window.addEventListener('languageChanged', function() {
    document.getElementById('navMenu').innerHTML = generateMenu(false);
    document.getElementById('sidebar').innerHTML = generateMenu(true);
    updateLangButtonState();
    I18N.updatePage();
});

document.addEventListener('DOMContentLoaded', injectLayout);
