// ========== 通用布局（list/location/support/about/privacy/terms） ==========
const LAYOUT = {
    navbar: `
        <nav class="navbar">
            <div class="nav-container">
                <a href="index.html" class="logo"><i>💧</i><span>Coway</span></a>
                <div class="nav-menu" id="navMenu"></div>
                <a href="admin.html" class="admin-icon" title="管理员登录">👤</a>
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
            <div><a href="terms.html">使用条款</a> • <a href="privacy.html">隐私政策</a> • <a href="support.html">支持</a></div>
            <div class="footer-divider"></div>
            <div>COWAY (MALAYSIA) © 2026. All Rights Reserved.</div>
        </footer>
    `,
    menuItems: [
        { href: 'index.html', text: '首页' },
        { href: 'list.html', text: '立即订购', isOrder: true },
        { href: 'location.html', text: '门店位置' },
        { href: 'support.html', text: '支持' },
        { href: 'about.html', text: '关于我们' }
    ]
};

function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

function generateMenu(isMobile) {
    const current = getCurrentPage();
    return LAYOUT.menuItems.map(item => {
        const active = current === item.href ? 'active' : '';
        if (item.isOrder && !isMobile) return `<a href="${item.href}" class="btn-order-nav ${active}">${item.text}</a>`;
        return `<a href="${item.href}" class="${active}">${item.text}</a>`;
    }).join('');
}

function injectLayout() {
    // 导航栏
    const header = document.createElement('header');
    header.innerHTML = LAYOUT.navbar;
    document.body.insertBefore(header, document.body.firstChild);
    document.getElementById('navMenu').innerHTML = generateMenu(false);
    
    // 侧边栏
    const sidebarDiv = document.createElement('div');
    sidebarDiv.innerHTML = LAYOUT.sidebar;
    document.body.appendChild(sidebarDiv);
    document.getElementById('sidebar').innerHTML = generateMenu(true);
    
    // 页脚
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = LAYOUT.footer;
    document.body.appendChild(footerDiv);
    
    // 移动端菜单事件
    document.getElementById('menuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('overlay').classList.add('show');
    });
    document.getElementById('overlay')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('show');
    });
}

document.addEventListener('DOMContentLoaded', injectLayout);
