// admin.js - 使用 Cloudflare Worker API 存储（含进度条）

// ========== 全局数据 ==========
let productsData = [], carouselData = [], noticeData = [], agentsData = [], locationsData = [], aboutData = { sections: [] };
let currentAboutSectionType = 'text';

// ========== 加载数据 ==========
async function loadAllData() {
    try {
        const data = await getAllData();
        productsData = data.products || [];
        carouselData = data.carousel || [];
        noticeData = data.notices || [];
        agentsData = data.agents || [];
        locationsData = data.locations || [];
        aboutData = data.about || { sections: [] };
        showToast('数据加载成功', 'success');
    } catch (e) {
        console.error('加载数据失败:', e);
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
            z-index: 10000; opacity: 0; transition: opacity 0.3s; pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#80abce' };
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ========== 进度条弹窗 ==========
let progressModal = null;

function showProgressModal(title) {
    if (!progressModal) {
        progressModal = document.createElement('div');
        progressModal.id = 'progressModal';
        progressModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 10001; display: flex;
            justify-content: center; align-items: center; visibility: hidden;
        `;
        progressModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 16px; min-width: 300px; text-align: center;">
                <h3 id="progressTitle" style="margin-bottom: 20px; color: #2c3e50;">上传中</h3>
                <div style="background: #e0e0e0; border-radius: 10px; overflow: hidden; height: 12px; margin: 20px 0;">
                    <div id="progressBar" style="width: 0%; height: 100%; background: #80abce; transition: width 0.3s;"></div>
                </div>
                <div id="progressText" style="color: #666; font-size: 14px;">0%</div>
                <div id="progressDetail" style="color: #999; font-size: 12px; margin-top: 10px;"></div>
            </div>
        `;
        document.body.appendChild(progressModal);
    }
    
    document.getElementById('progressTitle').textContent = title;
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
    document.getElementById('progressDetail').textContent = '';
    progressModal.style.visibility = 'visible';
}

function updateProgress(percent, detail = '') {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    const detailEl = document.getElementById('progressDetail');
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}%`;
    if (detailEl && detail) detailEl.textContent = detail;
}

function hideProgressModal() {
    if (progressModal) progressModal.style.visibility = 'hidden';
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

// ========== 渲染函数 ==========
function renderProducts() {
    const container = document.getElementById('productsList');
    if (!productsData.length) { container.innerHTML = '<div class="empty-msg">暂无商品</div>'; return; }
    container.innerHTML = '';
    productsData.forEach(p => {
        const div = document.createElement('div');
        div.className = 'item-row';
        const firstImage = p.images && p.images[0] ? `<img class="preview-img" src="${p.images[0]}">` : '<div class="preview-img" style="background:#ddd; display:flex;align-items:center;justify-content:center;">无图</div>';
        div.innerHTML = `${firstImage}<div class="info"><h4>${escapeHtml(p.name)}</h4><p>${p.price}</p><small>${p.category}</small></div><div class="actions"><button class="btn-edit" data-id="${p.id}" data-type="product">编辑</button><button class="btn-delete" data-id="${p.id}" data-type="product">删除</button></div>`;
        container.appendChild(div);
    });
    bindItemEvents(container);
}

function renderCarousel() {
    const container = document.getElementById('carouselList');
    if (!carouselData.length) { container.innerHTML = '<div class="empty-msg">暂无广告</div>'; return; }
    container.innerHTML = '';
    carouselData.forEach(c => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `${c.image ? `<img class="preview-img" src="${c.image}">` : '<div class="preview-img" style="background:#ddd;">无图</div>'}<div class="info"><h4>${escapeHtml(c.title)}</h4><p>${escapeHtml(c.desc)}</p></div><div class="actions"><button class="btn-edit" data-id="${c.id}" data-type="carousel">编辑</button><button class="btn-delete" data-id="${c.id}" data-type="carousel">删除</button></div>`;
        container.appendChild(div);
    });
    bindItemEvents(container);
}

function renderNotices() {
    const container = document.getElementById('noticeList');
    if (!noticeData.length) { container.innerHTML = '<div class="empty-msg">暂无公告</div>'; return; }
    container.innerHTML = '';
    noticeData.forEach(n => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `${n.image ? `<img class="preview-img" src="${n.image}">` : '<div class="preview-img" style="background:#ddd;">无图</div>'}<div class="info"><h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.description)}</p><small>${n.date}</small></div><div class="actions"><button class="btn-edit" data-id="${n.id}" data-type="notice">编辑</button><button class="btn-delete" data-id="${n.id}" data-type="notice">删除</button></div>`;
        container.appendChild(div);
    });
    bindItemEvents(container);
}

function renderAgents() {
    const container = document.getElementById('agentsList');
    if (!agentsData.length) { container.innerHTML = '<div class="empty-msg">暂无 Agent</div>'; return; }
    container.innerHTML = '';
    agentsData.forEach(a => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `<div class="info"><h4>${escapeHtml(a.name)} (${escapeHtml(a.hp_code)})</h4><p>${a.contact} | ${a.email || '-'}</p><p>${a.position} | DO: ${a.receipt}</p></div><div class="actions"><button class="btn-edit" data-id="${a.id}" data-type="agent">编辑</button><button class="btn-delete" data-id="${a.id}" data-type="agent">删除</button></div>`;
        container.appendChild(div);
    });
    bindItemEvents(container);
}

function renderLocations() {
    const container = document.getElementById('locationsList');
    if (!locationsData.length) { container.innerHTML = '<div class="empty-msg">暂无门店</div>'; return; }
    container.innerHTML = '';
    locationsData.forEach(l => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `${l.image ? `<img class="preview-img" src="${l.image}">` : '<div class="preview-img" style="background:#ddd;">无图</div>'}<div class="info"><h4>${escapeHtml(l.name)}</h4><p>${escapeHtml(l.address)}</p><small>${l.hours}</small></div><div class="actions"><button class="btn-edit" data-id="${l.id}" data-type="location">编辑</button><button class="btn-delete" data-id="${l.id}" data-type="location">删除</button></div>`;
        container.appendChild(div);
    });
    bindItemEvents(container);
}

function renderAboutSections() {
    const container = document.getElementById('aboutSectionsList');
    if (!aboutData.sections || !aboutData.sections.length) {
        container.innerHTML = '<div class="empty-msg">暂无区块，点击"新增区块"开始编辑</div>';
        return;
    }
    container.innerHTML = '';
    aboutData.sections.forEach((section, index) => {
        const div = document.createElement('div');
        div.className = 'item-row';
        const typeNames = { text: '文本', stats: '统计', team: '团队', timeline: '时间线', image: '图片' };
        const typeName = typeNames[section.type] || section.type;
        div.innerHTML = `<div class="info"><h4>${section.icon || ''} ${escapeHtml(section.title || '未命名区块')}</h4><p>类型: ${typeName}</p>${section.type === 'text' ? `<small>${escapeHtml((section.content || '').substring(0, 50))}...</small>` : ''}</div><div class="actions"><button class="btn-edit" data-index="${index}">编辑</button><button class="btn-delete" data-index="${index}">删除</button></div>`;
        container.appendChild(div);
    });
    bindAboutEvents(container);
}

function bindItemEvents(container) {
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            if (type === 'product') openModal('product', productsData.find(i => i.id == id));
            else if (type === 'carousel') openModal('carousel', carouselData.find(i => i.id == id));
            else if (type === 'notice') openModal('notice', noticeData.find(i => i.id == id));
            else if (type === 'agent') openModal('agent', agentsData.find(i => i.id == id));
            else if (type === 'location') openModal('location', locationsData.find(i => i.id == id));
        });
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            if (!confirm('确定删除？')) return;
            if (type === 'product') { productsData = productsData.filter(i => i.id != id); await saveAllData('products', productsData); renderProducts(); }
            else if (type === 'carousel') { carouselData = carouselData.filter(i => i.id != id); await saveAllData('carousel', carouselData); renderCarousel(); }
            else if (type === 'notice') { noticeData = noticeData.filter(i => i.id != id); await saveAllData('notices', noticeData); renderNotices(); }
            else if (type === 'agent') { agentsData = agentsData.filter(i => i.id != id); await saveAllData('agents', agentsData); renderAgents(); }
            else if (type === 'location') { locationsData = locationsData.filter(i => i.id != id); await saveAllData('locations', locationsData); renderLocations(); }
        });
    });
}

function bindAboutEvents(container) {
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openAboutModal(parseInt(btn.dataset.index)));
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
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
                showProgressModal('正在上传商品图片...');
                images = await uploadMultipleImagesToWorker(
                    Array.from(imageInput.files),
                    (current, total, percent) => {
                        updateProgress(Math.round(((current - 1) / total) * 100 + percent / total), `正在上传第 ${current}/${total} 张图片...`);
                    },
                    (percent) => updateProgress(percent),
                    'productUploadStatus'
                );
                hideProgressModal();
            } else if (isEdit) { 
                const existing = productsData.find(i => i.id == id); 
                images = existing ? existing.images : []; 
            }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('productName').value, category: document.getElementById('productCategory').value, price: document.getElementById('productPrice').value, desc_zh: document.getElementById('productDescZh').value, desc_en: document.getElementById('productDescEn').value, images };
            if (isEdit) { const index = productsData.findIndex(i => i.id == id); if (index !== -1) productsData[index] = newItem; }
            else productsData.push(newItem);
            await saveAllData('products', productsData);
            renderProducts();
            showToast('商品保存成功', 'success');
        } else if (type === 'agent') {
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('agentName').value, hp_code: document.getElementById('agentHpCode').value, contact: document.getElementById('agentContact').value, position: document.getElementById('agentPosition').value, receipt: parseInt(document.getElementById('agentReceipt').value) || 0, email: document.getElementById('agentEmail').value };
            if (isEdit) { const index = agentsData.findIndex(i => i.id == id); if (index !== -1) agentsData[index] = newItem; }
            else agentsData.push(newItem);
            await saveAllData('agents', agentsData);
            renderAgents();
            showToast('Agent保存成功', 'success');
        } else if (type === 'carousel') {
            const imageInput = document.getElementById('carouselImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgressModal('正在上传轮播图片...');
                image = await uploadImageToWorker(imageInput.files[0], (percent) => updateProgress(percent), 'carouselUploadStatus');
                hideProgressModal();
            } else if (isEdit) { const existing = carouselData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('carouselTitle').value, desc: document.getElementById('carouselDesc').value, image, link: document.getElementById('carouselLink').value };
            if (isEdit) { const index = carouselData.findIndex(i => i.id == id); if (index !== -1) carouselData[index] = newItem; }
            else carouselData.push(newItem);
            await saveAllData('carousel', carouselData);
            renderCarousel();
            showToast('轮播保存成功', 'success');
        } else if (type === 'notice') {
            const imageInput = document.getElementById('noticeImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgressModal('正在上传公告图片...');
                image = await uploadImageToWorker(imageInput.files[0], (percent) => updateProgress(percent), 'noticeUploadStatus');
                hideProgressModal();
            } else if (isEdit) { const existing = noticeData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('noticeTitle').value, description: document.getElementById('noticeDesc').value, image, date: document.getElementById('noticeDate').value };
            if (isEdit) { const index = noticeData.findIndex(i => i.id == id); if (index !== -1) noticeData[index] = newItem; }
            else noticeData.unshift(newItem);
            await saveAllData('notices', noticeData);
            renderNotices();
            showToast('公告保存成功', 'success');
        } else if (type === 'location') {
            const imageInput = document.getElementById('locationImageInput');
            let image = '';
            if (imageInput.files.length > 0) {
                showProgressModal('正在上传门店图片...');
                image = await uploadImageToWorker(imageInput.files[0], (percent) => updateProgress(percent), 'locationUploadStatus');
                hideProgressModal();
            } else if (isEdit) { const existing = locationsData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('locationName').value, image, address: document.getElementById('locationAddress').value, hours: document.getElementById('locationHours').value, phone: document.getElementById('locationPhone').value, wazeLink: document.getElementById('locationWaze').value };
            if (isEdit) { const index = locationsData.findIndex(i => i.id == id); if (index !== -1) locationsData[index] = newItem; }
            else locationsData.push(newItem);
            await saveAllData('locations', locationsData);
            renderLocations();
            showToast('门店保存成功', 'success');
        }
        closeModal();
    } catch (error) {
        showToast('保存失败: ' + error.message, 'error');
        hideProgressModal();
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
            showProgressModal('正在上传图片...');
            section.image = await uploadImageToWorker(imageInput.files[0], (percent) => updateProgress(percent), 'aboutImageUploadStatus');
            hideProgressModal();
        } else section.image = document.getElementById('aboutImageUrl').value;
        section.caption = document.getElementById('aboutImageCaption').value;
    }
    
    if (isEdit) aboutData.sections[parseInt(index)] = section;
    else aboutData.sections.push(section);
    
    await saveAllData('about', aboutData);
    renderAboutSections();
    closeAboutModal();
    showToast('区块保存成功', 'success');
}

function resetAboutData() {
    if (!confirm('确定重置？')) return;
    aboutData = { sections: [] };
    saveAllData('about', aboutData).then(() => renderAboutSections());
    showToast('已重置', 'success');
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
        showToast('登录成功', 'success');
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
    document.getElementById('addProductBtn')?.addEventListener('click', () => openModal('product', null));
    document.getElementById('addCarouselBtn')?.addEventListener('click', () => openModal('carousel', null));
    document.getElementById('addNoticeBtn')?.addEventListener('click', () => openModal('notice', null));
    document.getElementById('addAgentBtn')?.addEventListener('click', () => openModal('agent', null));
    document.getElementById('addLocationBtn')?.addEventListener('click', () => openModal('location', null));
    document.getElementById('addAboutSectionBtn')?.addEventListener('click', () => openAboutModal(-1));
    document.getElementById('resetAboutBtn')?.addEventListener('click', resetAboutData);
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
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${tab}Panel`).classList.add('active');
        });
    });
});
