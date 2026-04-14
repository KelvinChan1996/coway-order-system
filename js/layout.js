// ========== 公共布局加载器 ==========
// 此文件负责将导航栏、页脚、移动端菜单注入到页面中

const LAYOUT = {
    // 导航栏 HTML
    navbar: `
        <nav class="navbar">
            <div class="nav-container">
                <a href="index.html" class="logo">
                    <i>💧</i>
                    <span>Coway</span>
                </a>
                <div class="nav-menu" id="navMenu">
                    <!-- 菜单项由 JS 根据当前页面动态生成 -->
                </div>
                <a href="admin.html" class="admin-icon" title="管理员登录">👤</a>
                <button class="mobile-menu-btn" id="menuBtn">☰</button>
            </div>
        </nav>
    `,
    
    // 移动端侧边栏 HTML
    sidebar: `
        <div class="mobile-sidebar" id="sidebar">
            <!-- 菜单项由 JS 动态生成 -->
        </div>
        <div class="overlay" id="overlay"></div>
    `,
    
    // 页脚 HTML
    footer: `
        <footer>
            <div>
                <a href="terms.html">使用条款</a> •
                <a href="privacy.html">隐私政策</a> •
                <a href="support.html">支持</a>
            </div>
            <div class="footer-divider"></div>
            <div>COWAY (MALAYSIA) © 2026. All Rights Reserved.</div>
        </footer>
    `,
    
    // 菜单配置
    menuItems: [
        { href: 'index.html', text: '首页' },
        { href: 'list.html', text: '立即订购', isOrder: true },
        { href: 'location.html', text: '门店位置' },
        { href: 'support.html', text: '支持' },
        { href: 'about.html', text: '关于我们' }
    ]
};

// 获取当前页面文件名
function getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';
    return fileName;
}

// 生成导航菜单 HTML
function generateMenuHtml(isMobile = false) {
    const currentPage = getCurrentPage();
    let html = '';
    
    LAYOUT.menuItems.forEach(item => {
        const isActive = currentPage === item.href || 
                        (currentPage === '' && item.href === 'index.html');
        const activeClass = isActive ? 'active' : '';
        
        if (item.isOrder && !isMobile) {
            html += `<a href="${item.href}" class="btn-order-nav ${activeClass}">${item.text}</a>`;
        } else {
            html += `<a href="${item.href}" class="${activeClass}">${item.text}</a>`;
        }
    });
    
    return html;
}

// 注入布局到页面
function injectLayout() {
    // 注入导航栏
    const header = document.createElement('header');
    header.innerHTML = LAYOUT.navbar;
    document.body.insertBefore(header, document.body.firstChild);
    
    // 填充桌面端菜单
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.innerHTML = generateMenuHtml(false);
    }
    
    // 注入侧边栏
    const sidebarContainer = document.createElement('div');
    sidebarContainer.innerHTML = LAYOUT.sidebar;
    document.body.appendChild(sidebarContainer);
    
    // 填充移动端菜单
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML = generateMenuHtml(true);
    }
    
    // 注入页脚
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = LAYOUT.footer;
    document.body.appendChild(footerContainer);
    
    // 绑定移动端菜单事件
    bindMobileMenuEvents();
}

// 绑定移动端菜单事件
function bindMobileMenuEvents() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('show');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', injectLayout);
