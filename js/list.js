// ========== 加载 Agent（无默认数据） ==========
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

// ========== 加载产品（无默认数据） ==========
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

// ========== 加载轮播（无默认数据） ==========
function loadCarousel() {
    const saved = localStorage.getItem('coway_carousel');
    carouselData = saved ? JSON.parse(saved) : [];
    renderCarousel();
}
