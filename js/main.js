// 页面初始化 + 产品渲染
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    for (const cat of categories) {
        const productList = products[cat.id] || [];
        if (productList.length === 0) continue;
        
        const sectionTitle = document.createElement('div');
        sectionTitle.style.gridColumn = '1 / -1';
        sectionTitle.style.marginTop = '20px';
        sectionTitle.style.marginBottom = '10px';
        sectionTitle.innerHTML = `<h3 style="color:#80abce; border-left:4px solid #80abce; padding-left:15px;">${cat.name}</h3>`;
        grid.appendChild(sectionTitle);
        
        productList.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="info">
                    <h4>${product.name}</h4>
                    <p>${product.desc_zh.substring(0, 60)}...</p>
                </div>
            `;
            card.onclick = () => openDetailModal(product);
            grid.appendChild(card);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});