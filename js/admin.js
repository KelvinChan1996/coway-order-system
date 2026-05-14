// admin.js - 使用 Cloudflare Worker API 存储（侧边栏版）

// ========== 全局数据 ==========
let productsData = [], carouselData = [], noticeData = [], agentsData = [], locationsData = [], aboutData = { sections: [] };
let currentAboutSectionType = 'text';

// ========== 加载数据 ==========
async function loadAllData() {
    showProgress('正在加载数据...');
    updateProgress(30, '连接服务器中...');
    try {
        const data = await getAllData();
        updateProgress(60, '解析数据中...');
        productsData = data.products || [];
        carouselData = data.carousel || [];
        noticeData = data.notices || [];
        agentsData = data.agents || [];
        locationsData = data.locations || [];
        aboutData = data.about || { sections: [] };
        updateProgress(100, '加载完成');
        await new Promise(r => setTimeout(r, 300));
        hideProgress();
    } catch (e) {
        console.error('加载数据失败:', e);
        hideProgress();
        showToast('加载数据失败: ' + e.message, 'error');
        productsData = []; carouselData = []; noticeData = []; agentsData = []; locationsData = []; aboutData = { sections: [] };
    }
    renderProducts(); renderCarousel(); renderNotices(); renderAgents(); renderLocations(); renderAboutSections();
}

// ========== 保存数据 ==========
async function saveAllData(type, data) {
    try {
        if (type === 'products') await saveProducts(data);
        else if (type === 'carousel') await saveCarousel(data);
        else if (type === 'notices') await saveNotices(data);
        else if (type === 'agents') await saveAgents(data);
        else if (type === 'locations') await saveLocations(data);
        else if (type === 'about') await saveAbout(data);
        showToast(`${type} 保存成功`, 'success');
    } catch (e) {
        console.error(`保存${type}失败:`, e);
        showToast(`保存失败: ${e.message}`, 'error');
        throw e;
    }
}

// ========== 提示框 ==========
function showToast(message, type = 'info') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 12px 24px; border-radius: 40px; color: white; font-weight: 500;
            z-index: 10001; opacity: 0; transition: opacity 0.3s; pointer-events: none;
            font-size: 14px; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#80abce' };
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// 进度条函数（由 HTML 中的全局函数提供）
function showProgress(title) {
    if (window.showProgressModal) window.showProgressModal(title);
    else console.log('进度:', title);
}
function updateProgress(percent, detail) {
    if (window.updateProgressBar) window.updateProgressBar(percent, detail);
    else console.log('进度:', percent + '%', detail);
}
function hideProgress() {
    if (window.hideProgressModal) window.hideProgressModal();
}

// ========== 辅助函数 ==========
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]); }

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// 图片上传（带进度）
async function uploadImageWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result.url);
                } catch (e) { reject(new Error('解析响应失败')); }
            } else { reject(new Error(`上传失败: ${xhr.status}`)); }
        });
        xhr.addEventListener('error', () => reject(new Error('网络错误')));
        xhr.open('POST', 'https://coway-api.recky1314.workers.dev/upload');
        xhr.setRequestHeader('X-Admin-Token', 'coway_admin_168888');
        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
    });
}

async function uploadImage(file, statusElementId = null) {
    const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
    try {
        if (statusEl) { statusEl.textContent = '上传中...'; statusEl.className = 'upload-status uploading'; }
        let lastPercent = 0;
        const url = await uploadImageWithProgress(file, (percent) => {
            if (statusEl) statusEl.textContent = `上传中 ${percent}%...`;
            if (window.updateProgressBar) window.updateProgressBar(percent);
        });
        if (statusEl) { statusEl.textContent = '上传成功'; statusEl.className = 'upload-status success'; setTimeout(() => statusEl.textContent = '', 3000); }
        return url;
    } catch (error) {
        if (statusEl) { statusEl.textContent = `上传失败: ${error.message}`; statusEl.className = 'upload-status error'; }
        throw error;
    }
}

async function uploadMultipleImages(files, statusElementId = null) {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
        const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
        if (statusEl) { statusEl.textContent = `上传中 (${i + 1}/${files.length})...`; statusEl.className = 'upload-status uploading'; }
        if (window.updateProgressBar) window.updateProgressBar(Math.round((i / files.length) * 100), `正在上传第 ${i+1}/${files.length} 张`);
        urls.push(await uploadImageWithProgress(files[i]));
    }
    if (statusElementId) {
        const statusEl = document.getElementById(statusElementId);
        statusEl.textContent = `全部上传成功 (${urls.length} 张)`;
        statusEl.className = 'upload-status success';
        setTimeout(() => statusEl.textContent = '', 3000);
    }
    return urls;
}

// ========== 表格渲染函数 ==========
function renderProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    if (!productsData.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无商品，点击右上角"新增"添加</div></div>';
        return;
    }
    let html = '<table class="data-table"><thead><table><th>图片</th><th>商品名称</th><th>分类</th><th>价格</th><th style="width:140px">操作</th></tr></thead><tbody>';
    productsData.forEach(p => {
        html += `<tr>
            <td><img class="preview-img-sm" src="${p.images?.[0] || 'https://placehold.co/50x50/80abce/white?text=No'}" onerror="this.src='https://placehold.co/50x50/80abce/white?text=No'"></td>
            <td><strong>${escapeHtml(p.name)}</strong><br><small style="color:#999;">${escapeHtml(p.desc_zh?.substring(0, 30))}...</small></td>
            <td>${p.category || '-'}</td>
            <td>${p.price || '-'}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-id="${p.id}" data-type="product">编辑</button>
                <button class="btn-delete-sm" data-id="${p.id}" data-type="product">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents(container);
}

function renderCarousel() {
    const container = document.getElementById('carouselList');
    if (!container) return;
    if (!carouselData.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无轮播广告，点击右上角"新增"添加</div></div>';
        return;
    }
    let html = '<table class="data-table"><thead><tr><th>图片</th><th>标题</th><th>描述</th><th style="width:140px">操作</th></tr></thead><tbody>';
    carouselData.forEach(c => {
        html += `<tr>
            <td><img class="preview-img-sm" src="${c.image || 'https://placehold.co/50x50/80abce/white?text=No'}" onerror="this.src='https://placehold.co/50x50/80abce/white?text=No'"></td>
            <td><strong>${escapeHtml(c.title)}</strong></td>
            <td>${escapeHtml(c.desc?.substring(0, 50))}${c.desc?.length > 50 ? '...' : ''}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-id="${c.id}" data-type="carousel">编辑</button>
                <button class="btn-delete-sm" data-id="${c.id}" data-type="carousel">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents(container);
}

function renderNotices() {
    const container = document.getElementById('noticeList');
    if (!container) return;
    if (!noticeData.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无公告，点击右上角"新增"添加</div></div>';
        return;
    }
    let html = '<table class="data-table"><thead><tr><th>图片</th><th>标题</th><th>内容</th><th>日期</th><th style="width:140px">操作</th></tr></thead><tbody>';
    noticeData.forEach(n => {
        html += `<tr>
            <td><img class="preview-img-sm" src="${n.image || 'https://placehold.co/50x50/80abce/white?text=No'}" onerror="this.src='https://placehold.co/50x50/80abce/white?text=No'"></td>
            <td><strong>${escapeHtml(n.title)}</strong></td>
            <td>${escapeHtml(n.description?.substring(0, 50))}${n.description?.length > 50 ? '...' : ''}</td>
            <td>${n.date || '-'}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-id="${n.id}" data-type="notice">编辑</button>
                <button class="btn-delete-sm" data-id="${n.id}" data-type="notice">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents(container);
}

function renderAgents() {
    const container = document.getElementById('agentsList');
    if (!container) return;
    if (!agentsData.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无 Agent，点击右上角"新增"添加</div></div>';
        return;
    }
    let html = '<table class="data-table"><thead><tr><th>姓名</th><th>HP Code</th><th>联系方式</th><th>职位</th><th>单数</th><th style="width:140px">操作</th></tr></thead><tbody>';
    agentsData.forEach(a => {
        html += `<tr>
            <td><strong>${escapeHtml(a.name)}</strong></td>
            <td>${escapeHtml(a.hp_code) || '-'}</td>
            <td>${a.contact || '-'}<br><small>${a.email || ''}</small></td>
            <td>${a.position || '-'}</td>
            <td>${a.receipt || 0}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-id="${a.id}" data-type="agent">编辑</button>
                <button class="btn-delete-sm" data-id="${a.id}" data-type="agent">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents(container);
}

function renderLocations() {
    const container = document.getElementById('locationsList');
    if (!container) return;
    if (!locationsData.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无门店，点击右上角"新增"添加</div></div>';
        return;
    }
    let html = '<table class="data-table"><thead><tr><th>图片</th><th>门店名称</th><th>地址</th><th>电话</th><th style="width:140px">操作</th></tr></thead><tbody>';
    locationsData.forEach(l => {
        html += `<tr>
            <td><img class="preview-img-sm" src="${l.image || 'https://placehold.co/50x50/80abce/white?text=No'}" onerror="this.src='https://placehold.co/50x50/80abce/white?text=No'"></td>
            <td><strong>${escapeHtml(l.name)}</strong></td>
            <td>${escapeHtml(l.address?.substring(0, 40))}${l.address?.length > 40 ? '...' : ''}</td>
            <td>${l.phone || '-'}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-id="${l.id}" data-type="location">编辑</button>
                <button class="btn-delete-sm" data-id="${l.id}" data-type="location">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents(container);
}

function renderAboutSections() {
    const container = document.getElementById('aboutSectionsList');
    if (!container) return;
    if (!aboutData.sections || !aboutData.sections.length) {
        container.innerHTML = '<div class="empty-row"><div style="padding:60px; text-align:center; color:#999;">暂无区块，点击右上角"新增"添加</div></div>';
        return;
    }
    const typeNames = { text: '文本', stats: '统计', team: '团队', timeline: '时间线', image: '图片' };
    let html = '<table class="data-table"><thead><tr><th>图标</th><th>标题</th><th>类型</th><th style="width:140px">操作</th></tr></thead><tbody>';
    aboutData.sections.forEach((section, index) => {
        html += `<tr>
            <td><span style="font-size:24px;">${section.icon || '📄'}</span></td>
            <td><strong>${escapeHtml(section.title || '未命名区块')}</strong></td>
            <td>${typeNames[section.type] || section.type}</td>
            <td class="action-btns">
                <button class="btn-edit-sm" data-index="${index}" data-type="about">编辑</button>
                <button class="btn-delete-sm" data-index="${index}" data-type="about">删除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindAboutTableEvents(container);
}

function bindTableEvents(container) {
    container.querySelectorAll('.btn-edit-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const type = btn.dataset.type;
            if (type === 'product') openModal('product', productsData.find(i => i.id === id));
            else if (type === 'carousel') openModal('carousel', carouselData.find(i => i.id === id));
            else if (type === 'notice') openModal('notice', noticeData.find(i => i.id === id));
            else if (type === 'agent') openModal('agent', agentsData.find(i => i.id === id));
            else if (type === 'location') openModal('location', locationsData.find(i => i.id === id));
        });
    });
    container.querySelectorAll('.btn-delete-sm').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('确定删除？')) return;
            const id = parseInt(btn.dataset.id);
            const type = btn.dataset.type;
            if (type === 'product') { productsData = productsData.filter(i => i.id !== id); await saveAllData('products', productsData); renderProducts(); }
            else if (type === 'carousel') { carouselData = carouselData.filter(i => i.id !== id); await saveAllData('carousel', carouselData); renderCarousel(); }
            else if (type === 'notice') { noticeData = noticeData.filter(i => i.id !== id); await saveAllData('notices', noticeData); renderNotices(); }
            else if (type === 'agent') { agentsData = agentsData.filter(i => i.id !== id); await saveAllData('agents', agentsData); renderAgents(); }
            else if (type === 'location') { locationsData = locationsData.filter(i => i.id !== id); await saveAllData('locations', locationsData); renderLocations(); }
        });
    });
}

function bindAboutTableEvents(container) {
    container.querySelectorAll('.btn-edit-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            openAboutModal(index);
        });
    });
    container.querySelectorAll('.btn-delete-sm').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('确定删除？')) return;
            const index = parseInt(btn.dataset.index);
            aboutData.sections.splice(index, 1);
            await saveAllData('about', aboutData);
            renderAboutSections();
        });
    });
}

// ========== 弹窗管理 ==========
function closeModal() { document.getElementById('editModal').classList.remove('active'); }

function setupImagePreview(fileInputId, previewId, isMultiple = false) {
    const input = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    if (!input) return;
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    newInput.addEventListener('change', async function() {
        preview.innerHTML = '';
        if (isMultiple) {
            for (let file of this.files) {
                const base64 = await fileToBase64(file);
                const img = document.createElement('img');
                img.src = base64;
                preview.appendChild(img);
            }
        } else if (this.files[0]) {
            const base64 = await fileToBase64(this.files[0]);
            const img = document.createElement('img');
            img.src = base64;
            preview.appendChild(img);
        }
    });
}

function openModal(type, item) {
    document.getElementById('editType').value = type;
    document.getElementById('editId').value = item ? item.id : '';
    ['product', 'agent', 'carousel', 'notice', 'location'].forEach(t => document.getElementById(`${t}Fields`).style.display = 'none');
    const modalTitle = document.getElementById('modalTitle');

    if (type === 'product') {
        document.getElementById('productFields').style.display = 'block';
        modalTitle.innerText = item ? '编辑商品' : '新增商品';
        document.getElementById('productName').value = item ? item.name : '';
        document.getElementById('productCategory').value = item ? item.category : 'water';
        document.getElementById('productPrice').value = item ? item.price : '';
        document.getElementById('productDescZh').value = item ? item.desc_zh : '';
        document.getElementById('productDescEn').value = item ? item.desc_en : '';
        const previewDiv = document.getElementById('productImagesPreview');
        const infoDiv = document.getElementById('productImagesInfo');
        const statusDiv = document.getElementById('productUploadStatus');
        previewDiv.innerHTML = ''; statusDiv.innerHTML = '';
        if (item && item.images && item.images.length) {
            item.images.forEach(img => { const imgEl = document.createElement('img'); imgEl.src = img; previewDiv.appendChild(imgEl); });
            infoDiv.innerHTML = `当前有 ${item.images.length} 张图片，重新上传将替换`;
        } else infoDiv.innerHTML = '暂无图片，请上传';
        setupImagePreview('productImagesInput', 'productImagesPreview', true);
    } else if (type === 'agent') {
        document.getElementById('agentFields').style.display = 'block';
        modalTitle.innerText = item ? '编辑 Agent' : '新增 Agent';
        document.getElementById('agentName').value = item ? item.name : '';
        document.getElementById('agentHpCode').value = item ? item.hp_code : '';
        document.getElementById('agentContact').value = item ? item.contact : '';
        document.getElementById('agentPosition').value = item ? item.position : 'HP';
        document.getElementById('agentReceipt').value = item ? item.receipt : 0;
        document.getElementById('agentEmail').value = item ? item.email : '';
    } else if (type === 'carousel') {
        document.getElementById('carouselFields').style.display = 'block';
        modalTitle.innerText = item ? '编辑广告' : '新增广告';
        document.getElementById('carouselTitle').value = item ? item.title : '';
        document.getElementById('carouselDesc').value = item ? item.desc : '';
        document.getElementById('carouselLink').value = item ? item.link : '';
        const previewDiv = document.getElementById('carouselImagePreview');
        const statusDiv = document.getElementById('carouselUploadStatus');
        previewDiv.innerHTML = ''; statusDiv.innerHTML = '';
        if (item && item.image) { const imgEl = document.createElement('img'); imgEl.src = item.image; previewDiv.appendChild(imgEl); }
        setupImagePreview('carouselImageInput', 'carouselImagePreview', false);
    } else if (type === 'notice') {
        document.getElementById('noticeFields').style.display = 'block';
        modalTitle.innerText = item ? '编辑公告' : '新增公告';
        document.getElementById('noticeTitle').value = item ? item.title : '';
        document.getElementById('noticeDesc').value = item ? item.description : '';
        document.getElementById('noticeDate').value = item ? item.date : new Date().toISOString().split('T')[0];
        const previewDiv = document.getElementById('noticeImagePreview');
        const statusDiv = document.getElementById('noticeUploadStatus');
        previewDiv.innerHTML = ''; statusDiv.innerHTML = '';
        if (item && item.image) { const imgEl = document.createElement('img'); imgEl.src = item.image; previewDiv.appendChild(imgEl); }
        setupImagePreview('noticeImageInput', 'noticeImagePreview', false);
    } else if (type === 'location') {
        document.getElementById('locationFields').style.display = 'block';
        modalTitle.innerText = item ? '编辑门店' : '新增门店';
        document.getElementById('locationName').value = item ? item.name : '';
        document.getElementById('locationAddress').value = item ? item.address : '';
        document.getElementById('locationHours').value = item ? item.hours : '';
        document.getElementById('locationPhone').value = item ? item.phone : '';
        document.getElementById('locationWaze').value = item ? item.wazeLink : '';
        const previewDiv = document.getElementById('locationImagePreview');
        const statusDiv = document.getElementById('locationUploadStatus');
        previewDiv.innerHTML = ''; statusDiv.innerHTML = '';
        if (item && item.image) { const imgEl = document.createElement('img'); imgEl.src = item.image; previewDiv.appendChild(imgEl); }
        setupImagePreview('locationImageInput', 'locationImagePreview', false);
    }
    document.getElementById('editModal').classList.add('active');
}

async function saveItem() {
    const type = document.getElementById('editType').value;
    const id = document.getElementById('editId').value;
    const isEdit = id !== '';
    const saveBtn = document.getElementById('saveItemBtn');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = '保存中...';
    saveBtn.disabled = true;

    try {
        if (type === 'product') {
            const imageInput = document.getElementById('productImagesInput');
            let images = [];
            if (imageInput.files.length > 0) {
                showProgress('正在上传商品图片...');
                images = await uploadMultipleImages(Array.from(imageInput.files), 'productUploadStatus');
                hideProgress();
            } else if (isEdit) { const existing = productsData.find(i => i.id == id); images = existing ? existing.images : []; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('productName').value, category: document.getElementById('productCategory').value, price: document.getElementById('productPrice').value, desc_zh: document.getElementById('productDescZh').value, desc_en: document.getElementById('productDescEn').value, images };
            if (isEdit) { const index = productsData.findIndex(i => i.id == id); if (index !== -1) productsData[index] = newItem; }
            else productsData.push(newItem);
            await saveAllData('products', productsData);
            renderProducts();
        } else if (type === 'agent') {
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('agentName').value, hp_code: document.getElementById('agentHpCode').value, contact: document.getElementById('agentContact').value, position: document.getElementById('agentPosition').value, receipt: parseInt(document.getElementById('agentReceipt').value) || 0, email: document.getElementById('agentEmail').value };
            if (isEdit) { const index = agentsData.findIndex(i => i.id == id); if (index !== -1) agentsData[index] = newItem; }
            else agentsData.push(newItem);
            await saveAllData('agents', agentsData);
            renderAgents();
        } else if (type === 'carousel') {
            const imageInput = document.getElementById('carouselImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgress('正在上传轮播图片...');
                image = await uploadImage(imageInput.files[0], 'carouselUploadStatus');
                hideProgress();
            } else if (isEdit) { const existing = carouselData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('carouselTitle').value, desc: document.getElementById('carouselDesc').value, image, link: document.getElementById('carouselLink').value };
            if (isEdit) { const index = carouselData.findIndex(i => i.id == id); if (index !== -1) carouselData[index] = newItem; }
            else carouselData.push(newItem);
            await saveAllData('carousel', carouselData);
            renderCarousel();
        } else if (type === 'notice') {
            const imageInput = document.getElementById('noticeImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgress('正在上传公告图片...');
                image = await uploadImage(imageInput.files[0], 'noticeUploadStatus');
                hideProgress();
            } else if (isEdit) { const existing = noticeData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('noticeTitle').value, description: document.getElementById('noticeDesc').value, image, date: document.getElementById('noticeDate').value };
            if (isEdit) { const index = noticeData.findIndex(i => i.id == id); if (index !== -1) noticeData[index] = newItem; }
            else noticeData.unshift(newItem);
            await saveAllData('notices', noticeData);
            renderNotices();
        } else if (type === 'location') {
            const imageInput = document.getElementById('locationImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgress('正在上传门店图片...');
                image = await uploadImage(imageInput.files[0], 'locationUploadStatus');
                hideProgress();
            } else if (isEdit) { const existing = locationsData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('locationName').value, image, address: document.getElementById('locationAddress').value, hours: document.getElementById('locationHours').value, phone: document.getElementById('locationPhone').value, wazeLink: document.getElementById('locationWaze').value };
            if (isEdit) { const index = locationsData.findIndex(i => i.id == id); if (index !== -1) locationsData[index] = newItem; }
            else locationsData.push(newItem);
            await saveAllData('locations', locationsData);
            renderLocations();
        }
        closeModal();
        showToast('保存成功', 'success');
    } catch (error) {
        showToast('保存失败: ' + error.message, 'error');
        hideProgress();
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}

// ========== 关于我们弹窗 ==========
function openAboutModal(index = -1) {
    currentAboutSectionType = 'text';
    const isEdit = index >= 0;
    document.getElementById('aboutEditIndex').value = index;
    document.getElementById('aboutModalTitle').innerText = isEdit ? '编辑区块' : '新增区块';
    
    document.getElementById('aboutSectionTitle').value = '';
    document.getElementById('aboutSectionIcon').value = '';
    document.getElementById('aboutTextContent').value = '';
    document.getElementById('aboutImageUrl').value = '';
    document.getElementById('aboutImageCaption').value = '';
    document.getElementById('aboutImagePreview').innerHTML = '';
    document.getElementById('aboutImageUploadStatus').innerHTML = '';
    document.getElementById('statsFieldsContainer').innerHTML = '';
    document.getElementById('teamFieldsContainer').innerHTML = '';
    document.getElementById('timelineFieldsContainer').innerHTML = '';
    
    if (isEdit) {
        const section = aboutData.sections[index];
        document.getElementById('aboutSectionTitle').value = section.title || '';
        document.getElementById('aboutSectionIcon').value = section.icon || '';
        currentAboutSectionType = section.type;
        if (section.type === 'text') document.getElementById('aboutTextContent').value = section.content || '';
        else if (section.type === 'stats' && section.stats) section.stats.forEach(stat => addStatField(stat.number, stat.label));
        else if (section.type === 'team' && section.members) section.members.forEach(m => addTeamMemberField(m.name, m.role, m.bio, m.avatar));
        else if (section.type === 'timeline' && section.items) section.items.forEach(item => addTimelineItemField(item.year, item.title, item.desc));
        else if (section.type === 'image') {
            document.getElementById('aboutImageUrl').value = section.image || '';
            document.getElementById('aboutImageCaption').value = section.caption || '';
            if (section.image) { const img = document.createElement('img'); img.src = section.image; document.getElementById('aboutImagePreview').appendChild(img); }
        }
    }
    updateAboutFieldsVisibility();
    document.querySelectorAll('.section-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === currentAboutSectionType));
    setupImagePreview('aboutImageInput', 'aboutImagePreview', false);
    document.getElementById('aboutSectionModal').classList.add('active');
}

function updateAboutFieldsVisibility() {
    document.getElementById('aboutTextFields').style.display = currentAboutSectionType === 'text' ? 'block' : 'none';
    document.getElementById('aboutStatsFields').style.display = currentAboutSectionType === 'stats' ? 'block' : 'none';
    document.getElementById('aboutTeamFields').style.display = currentAboutSectionType === 'team' ? 'block' : 'none';
    document.getElementById('aboutTimelineFields').style.display = currentAboutSectionType === 'timeline' ? 'block' : 'none';
    document.getElementById('aboutImageFields').style.display = currentAboutSectionType === 'image' ? 'block' : 'none';
}

function addStatField(number = '', label = '') {
    const container = document.getElementById('statsFieldsContainer');
    const div = document.createElement('div');
    div.className = 'field-item';
    div.innerHTML = `<div class="field-header"><h4>统计项</h4><button class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">移除</button></div><input type="text" class="stat-number" placeholder="数值" value="${escapeHtml(number)}" style="margin-bottom:10px;"><input type="text" class="stat-label" placeholder="标签" value="${escapeHtml(label)}">`;
    container.appendChild(div);
}

function addTeamMemberField(name = '', role = '', bio = '', avatar = '') {
    const container = document.getElementById('teamFieldsContainer');
    const div = document.createElement('div');
    div.className = 'field-item';
    div.innerHTML = `<div class="field-header"><h4>成员</h4><button class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">移除</button></div><input type="text" class="member-name" placeholder="姓名" value="${escapeHtml(name)}" style="margin-bottom:10px;"><input type="text" class="member-role" placeholder="职位" value="${escapeHtml(role)}" style="margin-bottom:10px;"><textarea class="member-bio" placeholder="简介" rows="2" style="margin-bottom:10px;">${escapeHtml(bio)}</textarea><input type="text" class="member-avatar" placeholder="头像 URL" value="${escapeHtml(avatar)}">`;
    container.appendChild(div);
}

function addTimelineItemField(year = '', title = '', desc = '') {
    const container = document.getElementById('timelineFieldsContainer');
    const div = document.createElement('div');
    div.className = 'field-item';
    div.innerHTML = `<div class="field-header"><h4>事件</h4><button class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">移除</button></div><input type="text" class="timeline-year" placeholder="年份" value="${escapeHtml(year)}" style="margin-bottom:10px;"><input type="text" class="timeline-title" placeholder="标题" value="${escapeHtml(title)}" style="margin-bottom:10px;"><textarea class="timeline-desc" placeholder="描述" rows="2">${escapeHtml(desc)}</textarea>`;
    container.appendChild(div);
}

function closeAboutModal() { document.getElementById('aboutSectionModal').classList.remove('active'); }

async function saveAboutSection() {
    const index = document.getElementById('aboutEditIndex').value;
    const isEdit = index !== '' && index !== '-1';
    const title = document.getElementById('aboutSectionTitle').value;
    const icon = document.getElementById('aboutSectionIcon').value;
    const type = currentAboutSectionType;
    let section = { type, title, icon };
    
    if (type === 'text') section.content = document.getElementById('aboutTextContent').value;
    else if (type === 'stats') {
        section.stats = [];
        document.querySelectorAll('#statsFieldsContainer .field-item').forEach(item => {
            section.stats.push({ number: item.querySelector('.stat-number').value, label: item.querySelector('.stat-label').value });
        });
    } else if (type === 'team') {
        section.members = [];
        document.querySelectorAll('#teamFieldsContainer .field-item').forEach(item => {
            section.members.push({ name: item.querySelector('.member-name').value, role: item.querySelector('.member-role').value, bio: item.querySelector('.member-bio').value, avatar: item.querySelector('.member-avatar').value });
        });
    } else if (type === 'timeline') {
        section.items = [];
        document.querySelectorAll('#timelineFieldsContainer .field-item').forEach(item => {
            section.items.push({ year: item.querySelector('.timeline-year').value, title: item.querySelector('.timeline-title').value, desc: item.querySelector('.timeline-desc').value });
        });
    } else if (type === 'image') {
        const imageInput = document.getElementById('aboutImageInput');
        if (imageInput.files.length > 0) {
            showProgress('正在上传图片...');
            section.image = await uploadImage(imageInput.files[0], 'aboutImageUploadStatus');
            hideProgress();
        } else section.image = document.getElementById('aboutImageUrl').value;
        section.caption = document.getElementById('aboutImageCaption').value;
    }
    
    if (isEdit) aboutData.sections[parseInt(index)] = section;
    else aboutData.sections.push(section);
    
    await saveAllData('about', aboutData);
    renderAboutSections();
    closeAboutModal();
}

function resetAboutData() {
    if (!confirm('确定重置？')) return;
    aboutData = { sections: [] };
    saveAllData('about', aboutData).then(() => renderAboutSections());
}

// ========== 登录验证 ==========
const VALID_ID = "coway";
const VALID_PASS = "A888888";
const VALID_PIN = "168888";

function showStep(step) {
    document.getElementById('stepAccount').classList.add('hidden');
    document.getElementById('stepPin').classList.add('hidden');
    document.getElementById(`step${step.charAt(0).toUpperCase() + step.slice(1)}`).classList.remove('hidden');
    document.getElementById('loginError').innerText = '';
    document.getElementById('pinError').innerText = '';
}

function validateAccount() {
    const id = document.getElementById('loginId').value;
    const pass = document.getElementById('loginPass').value;
    if (id === VALID_ID && pass === VALID_PASS) {
        showStep('pin');
        setTimeout(() => document.querySelector('.pin-input').focus(), 100);
    } else {
        document.getElementById('loginError').innerText = '账号或密码错误';
    }
}

function setupPinInputs() {
    const inputs = document.querySelectorAll('.pin-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < 5) inputs[index + 1].focus();
            checkPinComplete();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
        });
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (/^\d{6}$/.test(paste)) {
                paste.split('').forEach((char, i) => { if (inputs[i]) inputs[i].value = char; });
                checkPinComplete();
            }
        });
    });
}

function getPinValue() { return Array.from(document.querySelectorAll('.pin-input')).map(i => i.value).join(''); }
function checkPinComplete() { document.getElementById('loginWithPinBtn').disabled = getPinValue().length !== 6; }

function validatePin() {
    if (getPinValue() === VALID_PIN) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        loadAllData();
    } else {
        document.getElementById('pinError').innerText = '安全码错误';
        document.querySelectorAll('.pin-input').forEach(i => i.value = '');
        document.getElementById('loginWithPinBtn').disabled = true;
        document.querySelector('.pin-input').focus();
    }
}

function logout() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('loginId').value = '';
    document.getElementById('loginPass').value = '';
    document.querySelectorAll('.pin-input').forEach(i => i.value = '');
    document.getElementById('loginWithPinBtn').disabled = true;
    showStep('account');
}

// ========== 事件绑定 ==========
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goToPinBtn')?.addEventListener('click', validateAccount);
    document.getElementById('loginWithPinBtn')?.addEventListener('click', validatePin);
    document.getElementById('backToAccountBtn')?.addEventListener('click', () => showStep('account'));
    setupPinInputs();
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('saveItemBtn')?.addEventListener('click', saveItem);
    document.getElementById('closeAboutModalBtn')?.addEventListener('click', closeAboutModal);
    document.getElementById('cancelAboutModalBtn')?.addEventListener('click', closeAboutModal);
    document.getElementById('saveAboutSectionBtn')?.addEventListener('click', saveAboutSection);
    document.querySelectorAll('.section-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAboutSectionType = btn.dataset.type;
            updateAboutFieldsVisibility();
        });
    });
    document.getElementById('addStatFieldBtn')?.addEventListener('click', () => addStatField());
    document.getElementById('addTeamMemberBtn')?.addEventListener('click', () => addTeamMemberField());
    document.getElementById('addTimelineItemBtn')?.addEventListener('click', () => addTimelineItemField());
});
// ========== 暴露函数给全局作用域（供 HTML 调用）==========
window.openModal = openModal;
window.openAboutModal = openAboutModal;
window.closeModal = closeModal;
window.closeAboutModal = closeAboutModal;
window.saveItem = saveItem;
window.saveAboutSection = saveAboutSection;
window.renderProducts = renderProducts;
window.renderCarousel = renderCarousel;
window.renderNotices = renderNotices;
window.renderAgents = renderAgents;
window.renderLocations = renderLocations;
window.renderAboutSections = renderAboutSections;
window.addStatField = addStatField;
window.addTeamMemberField = addTeamMemberField;
window.addTimelineItemField = addTimelineItemField;
window.updateAboutFieldsVisibility = updateAboutFieldsVisibility;
window.logout = logout;
window.loadAllData = loadAllData;

console.log('admin.js 加载完成，所有函数已暴露');
