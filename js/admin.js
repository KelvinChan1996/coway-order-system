// ==================== 登录验证配置 ====================
const VALID_ID = "coway";
const VALID_PASS = "A888888";
const VALID_PIN = "168888";

let currentStep = 'account';
let puzzleCompleted = false;
let sliderDragging = false;
let sliderStartX = 0;
let sliderMaxWidth = 0;

// ==================== 后台配置 ====================
const UPLOAD_WORKER = 'https://coway-github-upload.recky1314.workers.dev';

// ==================== 全局数据 ====================
let productsData = [], carouselData = [], noticeData = [], agentsData = [], locationsData = [];

// ==================== 登录流程控制 ====================
function showStep(step) {
    document.getElementById('stepAccount').classList.add('hidden');
    document.getElementById('stepPin').classList.add('hidden');
    document.getElementById('stepCaptcha').classList.add('hidden');
    document.getElementById(`step${step.charAt(0).toUpperCase() + step.slice(1)}`).classList.remove('hidden');
    currentStep = step;
    document.getElementById('loginError').innerText = '';
    document.getElementById('pinError').innerText = '';
    document.getElementById('captchaError').innerText = '';
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
            if (e.target.value.length === 1 && index < 5) {
                inputs[index + 1].focus();
            }
            checkPinComplete();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
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

function getPinValue() {
    return Array.from(document.querySelectorAll('.pin-input')).map(i => i.value).join('');
}

function checkPinComplete() {
    const pin = getPinValue();
    const btn = document.getElementById('goToCaptchaBtn');
    btn.disabled = pin.length !== 6;
}

function validatePin() {
    const pin = getPinValue();
    if (pin === VALID_PIN) {
        showStep('captcha');
        initCaptcha();
    } else {
        document.getElementById('pinError').innerText = '安全码错误';
        document.querySelectorAll('.pin-input').forEach(i => i.value = '');
        document.getElementById('goToCaptchaBtn').disabled = true;
        document.querySelector('.pin-input').focus();
    }
}

function initCaptcha() {
    puzzleCompleted = false;
    sliderDragging = false;
    document.getElementById('sliderTrack').style.width = '0%';
    document.getElementById('sliderThumb').style.left = '0px';
    document.getElementById('sliderText').innerText = '向右滑动完成验证';
    document.getElementById('verifyCaptchaBtn').disabled = true;
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
    
    const wrapper = document.querySelector('.slider-wrapper');
    const thumb = document.getElementById('sliderThumb');
    sliderMaxWidth = wrapper.clientWidth - thumb.clientWidth - 10;
    
    thumb.removeEventListener('mousedown', startDrag);
    thumb.removeEventListener('touchstart', startDrag);
    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag);
    
    document.querySelectorAll('.puzzle-piece').forEach(p => {
        p.removeEventListener('click', handlePuzzleClick);
        p.addEventListener('click', handlePuzzleClick);
    });
}

function handlePuzzleClick(e) {
    if (!puzzleCompleted) {
        e.target.classList.add('selected');
        checkPuzzleComplete();
    }
}

function startDrag(e) {
    e.preventDefault();
    sliderDragging = true;
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    sliderStartX = clientX - document.getElementById('sliderThumb').offsetLeft;
}

function onDrag(e) {
    if (!sliderDragging) return;
    e.preventDefault();
    const thumb = document.getElementById('sliderThumb');
    const track = document.getElementById('sliderTrack');
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    
    let left = clientX - sliderStartX;
    left = Math.max(0, Math.min(left, sliderMaxWidth));
    
    thumb.style.left = left + 'px';
    track.style.width = (left / sliderMaxWidth * 100) + '%';
    
    if (left >= sliderMaxWidth - 5) {
        stopDrag();
        document.getElementById('sliderText').innerText = '✓ 验证通过';
        checkPuzzleComplete();
    }
}

function stopDrag() {
    sliderDragging = false;
    const thumb = document.getElementById('sliderThumb');
    const track = document.getElementById('sliderTrack');
    if (thumb.offsetLeft < sliderMaxWidth - 5) {
        thumb.style.left = '0px';
        track.style.width = '0%';
    }
}

function checkPuzzleComplete() {
    const thumb = document.getElementById('sliderThumb');
    const selectedPieces = document.querySelectorAll('.puzzle-piece.selected').length;
    const sliderDone = thumb.offsetLeft >= sliderMaxWidth - 5;
    
    if (selectedPieces === 3 && sliderDone) {
        puzzleCompleted = true;
        document.getElementById('verifyCaptchaBtn').disabled = false;
        document.getElementById('captchaError').innerText = '';
    }
}

function finalLogin() {
    if (puzzleCompleted) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        loadAllData();
    } else {
        document.getElementById('captchaError').innerText = '请完成拼图验证';
    }
}

function logout() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('loginId').value = '';
    document.getElementById('loginPass').value = '';
    document.querySelectorAll('.pin-input').forEach(i => i.value = '');
    document.getElementById('goToCaptchaBtn').disabled = true;
    showStep('account');
}

// ==================== 辅助函数 ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// ==================== 图片上传 ====================
async function uploadImage(file, statusElementId = null) {
    const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
    const updateStatus = (msg, type) => {
        if (statusEl) { statusEl.textContent = msg; statusEl.className = `upload-status ${type}`; }
    };
    try {
        updateStatus('⏳ 上传中...', 'uploading');
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(UPLOAD_WORKER, { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');
        updateStatus('✅ 上传成功', 'success');
        setTimeout(() => updateStatus('', ''), 3000);
        return result.url;
    } catch (error) {
        console.error('Upload error:', error);
        updateStatus(`❌ 上传失败: ${error.message}`, 'error');
        throw error;
    }
}

async function uploadMultipleImages(files, statusElementId = null) {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
        const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
        if (statusEl) { statusEl.textContent = `⏳ 上传中 (${i + 1}/${files.length})...`; statusEl.className = 'upload-status uploading'; }
        try {
            urls.push(await uploadImage(files[i], null));
        } catch (error) {
            if (statusEl) { statusEl.textContent = `❌ 第 ${i + 1} 张上传失败`; statusEl.className = 'upload-status error'; }
            throw error;
        }
    }
    if (statusElementId) {
        const statusEl = document.getElementById(statusElementId);
        statusEl.textContent = `✅ 全部上传成功 (${urls.length} 张)`;
        statusEl.className = 'upload-status success';
        setTimeout(() => statusEl.textContent = '', 3000);
    }
    return urls;
}

// ==================== 数据加载 ====================
function loadAllData() {
    productsData = JSON.parse(localStorage.getItem('coway_products') || '[]');
    carouselData = JSON.parse(localStorage.getItem('coway_carousel') || '[]');
    noticeData = JSON.parse(localStorage.getItem('coway_notices') || '[]');
    agentsData = JSON.parse(localStorage.getItem('coway_agents') || JSON.stringify([
        { id: 1, name: "Ali Rehman", hp_code: "HP001", contact: "60123456789", position: "HP", receipt: 0, email: "ali@coway.com" },
        { id: 2, name: "Siti Nuraini", hp_code: "HP002", contact: "60129876543", position: "SM", receipt: 0, email: "siti@coway.com" },
        { id: 3, name: "Chong Wei", hp_code: "HP003", contact: "60115551234", position: "GSM", receipt: 1, email: "chong@coway.com" }
    ]));
    locationsData = JSON.parse(localStorage.getItem('coway_locations') || '[]');
    renderProducts(); renderCarousel(); renderNotices(); renderAgents(); renderLocations();
}

// ==================== 渲染函数 ====================
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
        div.innerHTML = `<div class="info"><h4>${escapeHtml(a.name)} (${escapeHtml(a.hp_code)})</h4><p>📞 ${a.contact} | 📧 ${a.email || '-'}</p><p>💼 ${a.position} | 📊 DO: ${a.receipt}</p></div><div class="actions"><button class="btn-edit" data-id="${a.id}" data-type="agent">编辑</button><button class="btn-delete" data-id="${a.id}" data-type="agent">删除</button></div>`;
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
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            if (!confirm('确定删除？')) return;
            if (type === 'product') { productsData = productsData.filter(i => i.id != id); localStorage.setItem('coway_products', JSON.stringify(productsData)); renderProducts(); }
            else if (type === 'carousel') { carouselData = carouselData.filter(i => i.id != id); localStorage.setItem('coway_carousel', JSON.stringify(carouselData)); renderCarousel(); }
            else if (type === 'notice') { noticeData = noticeData.filter(i => i.id != id); localStorage.setItem('coway_notices', JSON.stringify(noticeData)); renderNotices(); }
            else if (type === 'agent') { agentsData = agentsData.filter(i => i.id != id); localStorage.setItem('coway_agents', JSON.stringify(agentsData)); renderAgents(); }
            else if (type === 'location') { locationsData = locationsData.filter(i => i.id != id); localStorage.setItem('coway_locations', JSON.stringify(locationsData)); renderLocations(); }
        });
    });
}

// ==================== 弹窗管理 ====================
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

function openProductModal() { openModal('product', null); }
function openCarouselModal() { openModal('carousel', null); }
function openNoticeModal() { openModal('notice', null); }
function openAgentModal() { openModal('agent', null); }
function openLocationModal() { openModal('location', null); }

// ==================== 保存逻辑 ====================
async function saveItem() {
    const type = document.getElementById('editType').value;
    const id = document.getElementById('editId').value;
    const isEdit = id !== '';
    const saveBtn = document.getElementById('saveItemBtn');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = '⏳ 保存中...';
    saveBtn.disabled = true;

    try {
        if (type === 'product') {
            const imageInput = document.getElementById('productImagesInput');
            let images = [];
            if (imageInput.files.length > 0) images = await uploadMultipleImages(imageInput.files, 'productUploadStatus');
            else if (isEdit) { const existing = productsData.find(i => i.id == id); images = existing ? existing.images : []; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('productName').value, category: document.getElementById('productCategory').value, price: document.getElementById('productPrice').value, desc_zh: document.getElementById('productDescZh').value, desc_en: document.getElementById('productDescEn').value, images };
            if (isEdit) { const index = productsData.findIndex(i => i.id == id); if (index !== -1) productsData[index] = newItem; }
            else productsData.push(newItem);
            localStorage.setItem('coway_products', JSON.stringify(productsData));
            renderProducts();
        } else if (type === 'agent') {
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('agentName').value, hp_code: document.getElementById('agentHpCode').value, contact: document.getElementById('agentContact').value, position: document.getElementById('agentPosition').value, receipt: parseInt(document.getElementById('agentReceipt').value) || 0, email: document.getElementById('agentEmail').value };
            if (isEdit) { const index = agentsData.findIndex(i => i.id == id); if (index !== -1) agentsData[index] = newItem; }
            else agentsData.push(newItem);
            localStorage.setItem('coway_agents', JSON.stringify(agentsData));
            renderAgents();
        } else if (type === 'carousel') {
            const imageInput = document.getElementById('carouselImageInput');
            let image = '';
            if (imageInput.files.length > 0) image = await uploadImage(imageInput.files[0], 'carouselUploadStatus');
            else if (isEdit) { const existing = carouselData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('carouselTitle').value, desc: document.getElementById('carouselDesc').value, image, link: document.getElementById('carouselLink').value };
            if (isEdit) { const index = carouselData.findIndex(i => i.id == id); if (index !== -1) carouselData[index] = newItem; }
            else carouselData.push(newItem);
            localStorage.setItem('coway_carousel', JSON.stringify(carouselData));
            renderCarousel();
        } else if (type === 'notice') {
            const imageInput = document.getElementById('noticeImageInput');
            let image = '';
            if (imageInput.files.length > 0) image = await uploadImage(imageInput.files[0], 'noticeUploadStatus');
            else if (isEdit) { const existing = noticeData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), title: document.getElementById('noticeTitle').value, description: document.getElementById('noticeDesc').value, image, date: document.getElementById('noticeDate').value };
            if (isEdit) { const index = noticeData.findIndex(i => i.id == id); if (index !== -1) noticeData[index] = newItem; }
            else noticeData.unshift(newItem);
            localStorage.setItem('coway_notices', JSON.stringify(noticeData));
            renderNotices();
        } else if (type === 'location') {
            const imageInput = document.getElementById('locationImageInput');
            let image = '';
            if (imageInput.files.length > 0) image = await uploadImage(imageInput.files[0], 'locationUploadStatus');
            else if (isEdit) { const existing = locationsData.find(i => i.id == id); image = existing ? existing.image : ''; }
            const newItem = { id: isEdit ? parseInt(id) : Date.now(), name: document.getElementById('locationName').value, image, address: document.getElementById('locationAddress').value, hours: document.getElementById('locationHours').value, phone: document.getElementById('locationPhone').value, wazeLink: document.getElementById('locationWaze').value };
            if (isEdit) { const index = locationsData.findIndex(i => i.id == id); if (index !== -1) locationsData[index] = newItem; }
            else locationsData.push(newItem);
            localStorage.setItem('coway_locations', JSON.stringify(locationsData));
            renderLocations();
        }
        closeModal();
    } catch (error) {
        alert('保存失败: ' + error.message);
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}

// ==================== 事件绑定 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 登录流程
    document.getElementById('goToPinBtn').addEventListener('click', validateAccount);
    document.getElementById('goToCaptchaBtn').addEventListener('click', validatePin);
    document.getElementById('verifyCaptchaBtn').addEventListener('click', finalLogin);
    document.getElementById('backToAccountBtn').addEventListener('click', () => showStep('account'));
    document.getElementById('backToPinBtn').addEventListener('click', () => showStep('pin'));
    
    setupPinInputs();
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    
    // 管理功能
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('saveItemBtn').addEventListener('click', saveItem);
    document.getElementById('addProductBtn').addEventListener('click', openProductModal);
    document.getElementById('addCarouselBtn').addEventListener('click', openCarouselModal);
    document.getElementById('addNoticeBtn').addEventListener('click', openNoticeModal);
    document.getElementById('addAgentBtn').addEventListener('click', openAgentModal);
    document.getElementById('addLocationBtn').addEventListener('click', openLocationModal);
    
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
