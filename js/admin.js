// admin.js - 完整极简版

// ========== 全局数据 ==========
let productsData = [], carouselData = [], noticesData = [], agentsData = [], locationsData = [], aboutData = { sections: [] };
let currentEditItem = null;
let currentEditType = null;

// ========== 工具函数 ==========
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]); }

function showToast(msg, type = 'info') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:40px;color:#fff;z-index:10001;opacity:0;transition:0.3s';
        document.body.appendChild(toast);
    }
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#80abce' };
    toast.style.background = colors[type];
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}

function showProgress(title) {
    const modal = document.getElementById('progressModal');
    document.getElementById('progressTitle').innerText = title;
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').innerText = '0%';
    modal.classList.add('active');
}
function updateProgress(percent) {
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').innerText = percent + '%';
}
function hideProgress() {
    document.getElementById('progressModal').classList.remove('active');
}

// 图片上传
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('https://coway-api.recky1314.workers.dev/upload', {
        method: 'POST',
        headers: { 'X-Admin-Token': 'coway_admin_168888' },
        body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.url;
}

// ========== 渲染表格 ==========
function renderProducts() {
    const container = document.getElementById('productsList');
    if (!productsData.length) { container.innerHTML = '<div class="empty-row">暂无商品，点击"新增商品"添加</div>'; return; }
    let html = '<table><thead><tr><th>图片</th><th>名称</th><th>分类</th><th>价格</th><th>操作</th></tr></thead><tbody>';
    productsData.forEach(p => {
        html += `<tr>
            <td><img class="preview-img" src="${p.images?.[0] || 'https://placehold.co/50x50/80abce/white?text=No'}"></td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${p.category || '-'}</td>
            <td>${p.price || '-'}</td>
            <td><button class="btn-edit" data-id="${p.id}" data-type="product">编辑</button><button class="btn-delete" data-id="${p.id}" data-type="product">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

function renderCarousel() {
    const container = document.getElementById('carouselList');
    if (!carouselData.length) { container.innerHTML = '<div class="empty-row">暂无轮播，点击"新增轮播"添加</div>'; return; }
    let html = '<table><thead><tr><th>图片</th><th>标题</th><th>描述</th><th>操作</th></tr></thead><tbody>';
    carouselData.forEach(c => {
        html += `<tr>
            <td><img class="preview-img" src="${c.image || 'https://placehold.co/50x50/80abce/white?text=No'}"></td>
            <td><strong>${escapeHtml(c.title)}</strong></td>
            <td>${escapeHtml(c.desc?.substring(0, 50))}</td>
            <td><button class="btn-edit" data-id="${c.id}" data-type="carousel">编辑</button><button class="btn-delete" data-id="${c.id}" data-type="carousel">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

function renderNotices() {
    const container = document.getElementById('noticeList');
    if (!noticesData.length) { container.innerHTML = '<div class="empty-row">暂无公告，点击"新增公告"添加</div>'; return; }
    let html = '<table><thead><tr><th>图片</th><th>标题</th><th>日期</th><th>操作</th></tr></thead><tbody>';
    noticesData.forEach(n => {
        html += `<tr>
            <td><img class="preview-img" src="${n.image || 'https://placehold.co/50x50/80abce/white?text=No'}"></td>
            <td><strong>${escapeHtml(n.title)}</strong></td>
            <td>${n.date || '-'}</td>
            <td><button class="btn-edit" data-id="${n.id}" data-type="notice">编辑</button><button class="btn-delete" data-id="${n.id}" data-type="notice">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

function renderAgents() {
    const container = document.getElementById('agentsList');
    if (!agentsData.length) { container.innerHTML = '<div class="empty-row">暂无Agent，点击"新增Agent"添加</div>'; return; }
    let html = '<table><thead><tr><th>姓名</th><th>HP Code</th><th>电话</th><th>单数</th><th>操作</th></tr></thead><tbody>';
    agentsData.forEach(a => {
        html += `<tr>
            <td><strong>${escapeHtml(a.name)}</strong></td>
            <td>${escapeHtml(a.hp_code) || '-'}</td>
            <td>${a.contact || '-'}</td>
            <td>${a.receipt || 0}</td>
            <td><button class="btn-edit" data-id="${a.id}" data-type="agent">编辑</button><button class="btn-delete" data-id="${a.id}" data-type="agent">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

function renderLocations() {
    const container = document.getElementById('locationsList');
    if (!locationsData.length) { container.innerHTML = '<div class="empty-row">暂无门店，点击"新增门店"添加</div>'; return; }
    let html = '<table><thead><tr><th>图片</th><th>名称</th><th>地址</th><th>操作</th></tr></thead><tbody>';
    locationsData.forEach(l => {
        html += `<tr>
            <td><img class="preview-img" src="${l.image || 'https://placehold.co/50x50/80abce/white?text=No'}"></td>
            <td><strong>${escapeHtml(l.name)}</strong></td>
            <td>${escapeHtml(l.address?.substring(0, 40))}</td>
            <td><button class="btn-edit" data-id="${l.id}" data-type="location">编辑</button><button class="btn-delete" data-id="${l.id}" data-type="location">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

function renderAbout() {
    const container = document.getElementById('aboutList');
    if (!aboutData.sections || !aboutData.sections.length) { container.innerHTML = '<div class="empty-row">暂无区块，点击"新增区块"添加</div>'; return; }
    let html = '<table><thead><tr><th>标题</th><th>类型</th><th>操作</th></tr></thead><tbody>';
    aboutData.sections.forEach((s, i) => {
        html += `<tr>
            <td><strong>${escapeHtml(s.title || '未命名')}</strong></td>
            <td>${s.type || 'text'}</td>
            <td><button class="btn-edit" data-index="${i}" data-type="about">编辑</button><button class="btn-delete" data-index="${i}" data-type="about">删除</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    bindTableEvents();
}

// ========== 表格事件绑定 ==========
function bindTableEvents() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            const index = btn.dataset.index;
            if (type === 'product') openEditModal('product', productsData.find(i => i.id == id));
            else if (type === 'carousel') openEditModal('carousel', carouselData.find(i => i.id == id));
            else if (type === 'notice') openEditModal('notice', noticesData.find(i => i.id == id));
            else if (type === 'agent') openEditModal('agent', agentsData.find(i => i.id == id));
            else if (type === 'location') openEditModal('location', locationsData.find(i => i.id == id));
            else if (type === 'about') openAboutModal(parseInt(index));
        };
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = async () => {
            if (!confirm('确定删除？')) return;
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            if (type === 'product') { productsData = productsData.filter(i => i.id != id); await saveProducts(productsData); renderProducts(); showToast('删除成功'); }
            else if (type === 'carousel') { carouselData = carouselData.filter(i => i.id != id); await saveCarousel(carouselData); renderCarousel(); showToast('删除成功'); }
            else if (type === 'notice') { noticesData = noticesData.filter(i => i.id != id); await saveNotices(noticesData); renderNotices(); showToast('删除成功'); }
            else if (type === 'agent') { agentsData = agentsData.filter(i => i.id != id); await saveAgents(agentsData); renderAgents(); showToast('删除成功'); }
            else if (type === 'location') { locationsData = locationsData.filter(i => i.id != id); await saveLocations(locationsData); renderLocations(); showToast('删除成功'); }
        };
    });
}

// ========== 编辑弹窗 ==========
function openEditModal(type, item) {
    currentEditType = type;
    currentEditItem = item;
    document.getElementById('editType').value = type;
    document.getElementById('editId').value = item ? item.id : '';
    document.getElementById('modalTitle').innerText = item ? '编辑' : '新增';
    
    const container = document.getElementById('editFields');
    
    if (type === 'product') {
        container.innerHTML = `
            <input type="text" id="pName" placeholder="商品名称" value="${escapeHtml(item?.name || '')}">
            <select id="pCategory">
                <option value="water" ${item?.category === 'water' ? 'selected' : ''}>水机</option>
                <option value="air" ${item?.category === 'air' ? 'selected' : ''}>空气净化器</option>
                <option value="ac" ${item?.category === 'ac' ? 'selected' : ''}>冷气机</option>
                <option value="washer" ${item?.category === 'washer' ? 'selected' : ''}>洗衣机</option>
                <option value="toilet" ${item?.category === 'toilet' ? 'selected' : ''}>马桶</option>
                <option value="massageChair" ${item?.category === 'massageChair' ? 'selected' : ''}>按摩椅</option>
                <option value="massageBed" ${item?.category === 'massageBed' ? 'selected' : ''}>按摩床</option>
                <option value="bed" ${item?.category === 'bed' ? 'selected' : ''}>床</option>
            </select>
            <input type="text" id="pPrice" placeholder="价格" value="${escapeHtml(item?.price || '')}">
            <textarea id="pDescZh" placeholder="中文描述" rows="3">${escapeHtml(item?.desc_zh || '')}</textarea>
            <textarea id="pDescEn" placeholder="英文描述" rows="3">${escapeHtml(item?.desc_en || '')}</textarea>
            <div class="image-upload-area">
                <label>商品图片</label>
                <input type="file" id="pImages" accept="image/*" multiple>
                <div id="pImagesPreview" class="image-preview"></div>
            </div>
        `;
        if (item?.images?.length) {
            const preview = document.getElementById('pImagesPreview');
            item.images.forEach(img => { const i = document.createElement('img'); i.src = img; preview.appendChild(i); });
        }
    } else if (type === 'carousel') {
        container.innerHTML = `
            <input type="text" id="cTitle" placeholder="标题" value="${escapeHtml(item?.title || '')}">
            <textarea id="cDesc" placeholder="描述" rows="2">${escapeHtml(item?.desc || '')}</textarea>
            <input type="text" id="cLink" placeholder="链接" value="${escapeHtml(item?.link || '')}">
            <div class="image-upload-area">
                <label>轮播图片</label>
                <input type="file" id="cImage" accept="image/*">
                <div id="cImagePreview" class="image-preview"></div>
            </div>
        `;
        if (item?.image) { const img = document.createElement('img'); img.src = item.image; document.getElementById('cImagePreview').appendChild(img); }
    } else if (type === 'notice') {
        container.innerHTML = `
            <input type="text" id="nTitle" placeholder="标题" value="${escapeHtml(item?.title || '')}">
            <textarea id="nDesc" placeholder="内容" rows="3">${escapeHtml(item?.description || '')}</textarea>
            <input type="date" id="nDate" value="${item?.date || new Date().toISOString().split('T')[0]}">
            <div class="image-upload-area">
                <label>公告图片</label>
                <input type="file" id="nImage" accept="image/*">
                <div id="nImagePreview" class="image-preview"></div>
            </div>
        `;
        if (item?.image) { const img = document.createElement('img'); img.src = item.image; document.getElementById('nImagePreview').appendChild(img); }
    } else if (type === 'agent') {
        container.innerHTML = `
            <input type="text" id="aName" placeholder="姓名" value="${escapeHtml(item?.name || '')}">
            <input type="text" id="aHpCode" placeholder="HP CODE" value="${escapeHtml(item?.hp_code || '')}">
            <input type="text" id="aContact" placeholder="手机号码" value="${escapeHtml(item?.contact || '')}">
            <select id="aPosition"><option value="HP" ${item?.position === 'HP' ? 'selected' : ''}>HP</option><option value="SM" ${item?.position === 'SM' ? 'selected' : ''}>SM</option><option value="GSM" ${item?.position === 'GSM' ? 'selected' : ''}>GSM</option></select>
            <input type="number" id="aReceipt" placeholder="当前单数" value="${item?.receipt || 0}">
            <input type="email" id="aEmail" placeholder="Email" value="${escapeHtml(item?.email || '')}">
        `;
    } else if (type === 'location') {
        container.innerHTML = `
            <input type="text" id="lName" placeholder="门店名称" value="${escapeHtml(item?.name || '')}">
            <textarea id="lAddress" placeholder="地址" rows="2">${escapeHtml(item?.address || '')}</textarea>
            <input type="text" id="lHours" placeholder="营业时间" value="${escapeHtml(item?.hours || '')}">
            <input type="text" id="lPhone" placeholder="电话" value="${escapeHtml(item?.phone || '')}">
            <input type="text" id="lWaze" placeholder="Waze链接" value="${escapeHtml(item?.wazeLink || '')}">
            <div class="image-upload-area">
                <label>门店图片</label>
                <input type="file" id="lImage" accept="image/*">
                <div id="lImagePreview" class="image-preview"></div>
            </div>
        `;
        if (item?.image) { const img = document.createElement('img'); img.src = item.image; document.getElementById('lImagePreview').appendChild(img); }
    }
    
    document.getElementById('editModal').classList.add('active');
}

// 保存通用
async function saveCurrentItem() {
    const type = currentEditType;
    const isEdit = document.getElementById('editId').value !== '';
    
    showProgress('保存中...');
    updateProgress(30);
    
    try {
        if (type === 'product') {
            const images = [];
            const fileInput = document.getElementById('pImages');
            if (fileInput.files.length) {
                for (let f of fileInput.files) {
                    const url = await uploadImage(f);
                    images.push(url);
                }
            } else if (currentEditItem?.images) { images.push(...currentEditItem.images); }
            
            const newItem = {
                id: isEdit ? parseInt(document.getElementById('editId').value) : Date.now(),
                name: document.getElementById('pName').value,
                category: document.getElementById('pCategory').value,
                price: document.getElementById('pPrice').value,
                desc_zh: document.getElementById('pDescZh').value,
                desc_en: document.getElementById('pDescEn').value,
                images
            };
            if (isEdit) { const idx = productsData.findIndex(i => i.id == newItem.id); if (idx !== -1) productsData[idx] = newItem; }
            else productsData.push(newItem);
            await saveProducts(productsData);
            renderProducts();
        } else if (type === 'carousel') {
            let image = currentEditItem?.image || '';
            const fileInput = document.getElementById('cImage');
            if (fileInput.files.length) image = await uploadImage(fileInput.files[0]);
            
            const newItem = {
                id: isEdit ? parseInt(document.getElementById('editId').value) : Date.now(),
                title: document.getElementById('cTitle').value,
                desc: document.getElementById('cDesc').value,
                link: document.getElementById('cLink').value,
                image
            };
            if (isEdit) { const idx = carouselData.findIndex(i => i.id == newItem.id); if (idx !== -1) carouselData[idx] = newItem; }
            else carouselData.push(newItem);
            await saveCarousel(carouselData);
            renderCarousel();
        } else if (type === 'notice') {
            let image = currentEditItem?.image || '';
            const fileInput = document.getElementById('nImage');
            if (fileInput.files.length) image = await uploadImage(fileInput.files[0]);
            
            const newItem = {
                id: isEdit ? parseInt(document.getElementById('editId').value) : Date.now(),
                title: document.getElementById('nTitle').value,
                description: document.getElementById('nDesc').value,
                date: document.getElementById('nDate').value,
                image
            };
            if (isEdit) { const idx = noticesData.findIndex(i => i.id == newItem.id); if (idx !== -1) noticesData[idx] = newItem; }
            else noticesData.unshift(newItem);
            await saveNotices(noticesData);
            renderNotices();
        } else if (type === 'agent') {
            const newItem = {
                id: isEdit ? parseInt(document.getElementById('editId').value) : Date.now(),
                name: document.getElementById('aName').value,
                hp_code: document.getElementById('aHpCode').value,
                contact: document.getElementById('aContact').value,
                position: document.getElementById('aPosition').value,
                receipt: parseInt(document.getElementById('aReceipt').value) || 0,
                email: document.getElementById('aEmail').value
            };
            if (isEdit) { const idx = agentsData.findIndex(i => i.id == newItem.id); if (idx !== -1) agentsData[idx] = newItem; }
            else agentsData.push(newItem);
            await saveAgents(agentsData);
            renderAgents();
        } else if (type === 'location') {
            let image = currentEditItem?.image || '';
            const fileInput = document.getElementById('lImage');
            if (fileInput.files.length) image = await uploadImage(fileInput.files[0]);
            
            const newItem = {
                id: isEdit ? parseInt(document.getElementById('editId').value) : Date.now(),
                name: document.getElementById('lName').value,
                address: document.getElementById('lAddress').value,
                hours: document.getElementById('lHours').value,
                phone: document.getElementById('lPhone').value,
                wazeLink: document.getElementById('lWaze').value,
                image
            };
            if (isEdit) { const idx = locationsData.findIndex(i => i.id == newItem.id); if (idx !== -1) locationsData[idx] = newItem; }
            else locationsData.push(newItem);
            await saveLocations(locationsData);
            renderLocations();
        }
        updateProgress(100);
        setTimeout(() => hideProgress(), 500);
        showToast('保存成功', 'success');
        document.getElementById('editModal').classList.remove('active');
    } catch (err) {
        hideProgress();
        showToast('保存失败: ' + err.message, 'error');
    }
}

// 关于我们模块
function openAboutModal(index) {
    currentEditType = 'about';
    const isEdit = index >= 0;
    const section = isEdit ? aboutData.sections[index] : null;
    document.getElementById('modalTitle').innerText = isEdit ? '编辑区块' : '新增区块';
    const container = document.getElementById('editFields');
    container.innerHTML = `
        <input type="text" id="abTitle" placeholder="区块标题" value="${escapeHtml(section?.title || '')}">
        <select id="abType">
            <option value="text" ${section?.type === 'text' ? 'selected' : ''}>文本</option>
            <option value="stats" ${section?.type === 'stats' ? 'selected' : ''}>统计</option>
            <option value="team" ${section?.type === 'team' ? 'selected' : ''}>团队</option>
            <option value="timeline" ${section?.type === 'timeline' ? 'selected' : ''}>时间线</option>
            <option value="image" ${section?.type === 'image' ? 'selected' : ''}>图片</option>
        </select>
        <textarea id="abContent" placeholder="内容" rows="5">${escapeHtml(section?.content || '')}</textarea>
    `;
    window.currentAboutIndex = index;
    document.getElementById('editModal').classList.add('active');
}

async function saveAboutItem() {
    const isEdit = window.currentAboutIndex >= 0;
    const newSection = {
        title: document.getElementById('abTitle').value,
        type: document.getElementById('abType').value,
        content: document.getElementById('abContent').value
    };
    if (isEdit) aboutData.sections[window.currentAboutIndex] = newSection;
    else aboutData.sections.push(newSection);
    await saveAbout(aboutData);
    renderAbout();
    showToast('保存成功', 'success');
    document.getElementById('editModal').classList.remove('active');
}

// ========== 加载数据 ==========
async function loadAllData() {
    showProgress('加载中...');
    try {
        const data = await getAllData();
        productsData = data.products || [];
        carouselData = data.carousel || [];
        noticesData = data.notices || [];
        agentsData = data.agents || [];
        locationsData = data.locations || [];
        aboutData = data.about || { sections: [] };
        renderProducts(); renderCarousel(); renderNotices(); renderAgents(); renderLocations(); renderAbout();
        updateProgress(100);
        setTimeout(() => hideProgress(), 300);
    } catch (e) {
        hideProgress();
        showToast('加载失败', 'error');
    }
}

// ========== 登录验证 ==========
const VALID_ID = "coway", VALID_PASS = "A888888", VALID_PIN = "168888";

function showPinStep() {
    document.getElementById('stepAccount').style.display = 'none';
    document.getElementById('stepPin').style.display = 'block';
    document.querySelector('.pin-input')?.focus();
}
function validateAccount() {
    if (document.getElementById('loginId').value === VALID_ID && document.getElementById('loginPass').value === VALID_PASS) showPinStep();
    else document.getElementById('loginError').innerText = '账号或密码错误';
}
function setupPinInputs() {
    document.querySelectorAll('.pin-input').forEach((inp, i, arr) => {
        inp.oninput = () => { if (inp.value.length === 1 && i < 5) arr[i+1].focus(); checkPin(); };
        inp.onkeydown = (e) => { if (e.key === 'Backspace' && !inp.value && i > 0) arr[i-1].focus(); };
    });
}
function checkPin() {
    let pin = Array.from(document.querySelectorAll('.pin-input')).map(i => i.value).join('');
    document.getElementById('loginWithPinBtn').disabled = pin.length !== 6;
}
function validatePin() {
    let pin = Array.from(document.querySelectorAll('.pin-input')).map(i => i.value).join('');
    if (pin === VALID_PIN) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        loadAllData();
    } else {
        document.getElementById('pinError').innerText = '安全码错误';
        document.querySelectorAll('.pin-input').forEach(i => i.value = '');
        document.querySelector('.pin-input').focus();
    }
}
function logout() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('loginId').value = 'coway';
    document.getElementById('loginPass').value = 'A888888';
    document.querySelectorAll('.pin-input').forEach(i => i.value = '');
    document.getElementById('stepAccount').style.display = 'block';
    document.getElementById('stepPin').style.display = 'none';
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goToPinBtn').onclick = validateAccount;
    document.getElementById('loginWithPinBtn').onclick = validatePin;
    document.getElementById('backToAccountBtn').onclick = () => {
        document.getElementById('stepAccount').style.display = 'block';
        document.getElementById('stepPin').style.display = 'none';
    };
    setupPinInputs();
    document.getElementById('logoutBtn').onclick = logout;
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('editModal').classList.remove('active');
    document.getElementById('cancelModalBtn').onclick = () => document.getElementById('editModal').classList.remove('active');
    document.getElementById('saveBtn').onclick = () => { if (currentEditType === 'about') saveAboutItem(); else saveCurrentItem(); };
    
    // 面板切换
    document.querySelectorAll('.admin-menu button[data-tab]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.admin-menu button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.tab + 'Panel').classList.add('active');
        };
    });
    
    // 新增按钮
    document.getElementById('addProductBtn').onclick = () => openEditModal('product', null);
    document.getElementById('addCarouselBtn').onclick = () => openEditModal('carousel', null);
    document.getElementById('addNoticeBtn').onclick = () => openEditModal('notice', null);
    document.getElementById('addAgentBtn').onclick = () => openEditModal('agent', null);
    document.getElementById('addLocationBtn').onclick = () => openEditModal('location', null);
    document.getElementById('addAboutBtn').onclick = () => openAboutModal(-1);
});
