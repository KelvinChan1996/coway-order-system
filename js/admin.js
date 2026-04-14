// ==================== 配置 ====================
const ADMIN_ID = "coway_admin";
const ADMIN_PASSWORD = "Coway2026!";
const UPLOAD_WORKER = 'https://coway-github-upload.recky1314.workers.dev';

// ==================== 全局数据 ====================
let productsData = [], carouselData = [], noticeData = [], agentsData = [], locationsData = [];

// ==================== 初始化 & 事件绑定 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 登录相关
    document.getElementById('loginBtn').addEventListener('click', doLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 弹窗相关
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('saveItemBtn').addEventListener('click', saveItem);
    
    // 新增按钮
    document.getElementById('addProductBtn').addEventListener('click', openProductModal);
    document.getElementById('addCarouselBtn').addEventListener('click', openCarouselModal);
    document.getElementById('addNoticeBtn').addEventListener('click', openNoticeModal);
    document.getElementById('addAgentBtn').addEventListener('click', openAgentModal);
    document.getElementById('addLocationBtn').addEventListener('click', openLocationModal);
    
    // Tab 切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${tab}Panel`).classList.add('active');
        });
    });
    
    // 检查是否已登录（可选）
    // if (localStorage.getItem('admin_logged_in') === 'true') { ... }
});

// ==================== 登录/登出 ====================
function doLogin() {
    const id = document.getElementById('adminId').value;
    const pwd = document.getElementById('adminPassword').value;
    if (id === ADMIN_ID && pwd === ADMIN_PASSWORD) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        loadAllData();
    } else {
        document.getElementById('loginError').innerText = 'Invalid ID or Password';
    }
}

function logout() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('adminId').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').innerText = '';
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
    
    renderProducts();
    renderCarousel();
    renderNotices();
    renderAgents();
    renderLocations();
}

// ==================== 图片上传 (核心) ====================
async function uploadImage(file, statusElementId = null) {
    const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
    
    const updateStatus = (message, type) => {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `upload-status ${type}`;
        }
    };
    
    try {
        updateStatus('⏳ 上传中...', 'uploading');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(UPLOAD_WORKER, {
            method: 'POST',
            body: formData,
            // 关键: 使用 FormData 时，不要手动设置 Content-Type
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }
        
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
        if (statusEl) {
            statusEl.textContent = `⏳ 上传中 (${i + 1}/${files.length})...`;
            statusEl.className = 'upload-status uploading';
        }
        
        try {
            const url = await uploadImage(files[i], null);
            urls.push(url);
        } catch (error) {
            if (statusEl) {
                statusEl.textContent = `❌ 第 ${i + 1} 张上传失败`;
                statusEl.className = 'upload-status error';
            }
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

// ==================== 辅助函数 ====================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

// ==================== 弹窗管理 ====================
function closeModal() { 
    document.getElementById('editModal').classList.remove('active'); 
}

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
    
    ['product', 'agent', 'carousel', 'notice', 'location'].forEach(t => {
        document.getElementById(`${t}Fields`).style.display = 'none';
    });
    
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
        previewDiv.innerHTML = '';
        statusDiv.innerHTML = '';
        if (item && item.images && item.images.length) {
            item.images.forEach(img => {
                const imgEl = document.createElement('img');
                imgEl.src = img;
                previewDiv.appendChild(imgEl);
            });
            infoDiv.innerHTML = `当前有 ${item.images.length} 张图片，重新上传将替换`;
        } else {
            infoDiv.innerHTML = '暂无图片，请上传';
        }
        setupImagePreview('productImagesInput', 'productImagesPreview', true);
    }
    // 为简洁起见，其他类型的 openModal 逻辑类似，这里省略，你原有代码中的这部分保持不变即可。
    // 实际使用时，请将原有 openModal 中其他类型的处理逻辑完整复制过来。
    
    document.getElementById('editModal').classList.add('active');
}

// 打开弹窗的快捷方法
function openProductModal() { openModal('product', null); }
function openCarouselModal() { openModal('carousel', null); }
function openNoticeModal() { openModal('notice', null); }
function openAgentModal() { openModal('agent', null); }
function openLocationModal() { openModal('location', null); }

// ==================== 渲染函数 ====================
function renderProducts() {
    const container = document.getElementById('productsList');
    if (!productsData.length) { container.innerHTML = '<div class="empty-msg">暂无商品</div>'; return; }
    container.innerHTML = '';
    productsData.forEach(p => {
        const div = document.createElement('div');
        div.className = 'item-row';
        const firstImage = p.images && p.images[0] ? `<img class="preview-img" src="${p.images[0]}">` : '<div class="preview-img" style="background:#ddd; display:flex;align-items:center;justify-content:center;">无图</div>';
        div.innerHTML = `
            ${firstImage}
            <div class="info"><h4>${escapeHtml(p.name)}</h4><p>${p.price}</p><small>${p.category}</small></div>
            <div class="actions">
                <button class="btn-edit" data-id="${p.id}" data-type="product">编辑</button>
                <button class="btn-delete" data-id="${p.id}" data-type="product">删除</button>
            </div>
        `;
        container.appendChild(div);
    });
    // 事件委托：编辑和删除
    container.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editProduct(btn.dataset.id)));
    container.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
}

// 类似的，为其他渲染函数添加事件委托。这里仅以 product 为例，carousel, notice, agent, location 的渲染和事件绑定方式相同。

function editProduct(id) { openModal('product', productsData.find(i => i.id == id)); }
function deleteProduct(id) { 
    if(confirm('确定删除？')){ 
        productsData = productsData.filter(i => i.id != id); 
        localStorage.setItem('coway_products', JSON.stringify(productsData)); 
        renderProducts(); 
    } 
}

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
            
            if (imageInput.files.length > 0) {
                images = await uploadMultipleImages(imageInput.files, 'productUploadStatus');
            } else if (isEdit) {
                const existing = productsData.find(i => i.id == id);
                images = existing ? existing.images : [];
            }
            
            const newItem = {
                id: isEdit ? parseInt(id) : Date.now(),
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                price: document.getElementById('productPrice').value,
                desc_zh: document.getElementById('productDescZh').value,
                desc_en: document.getElementById('productDescEn').value,
                images: images
            };
            if (isEdit) {
                const index = productsData.findIndex(i => i.id == id);
                if (index !== -1) productsData[index] = newItem;
            } else productsData.push(newItem);
            localStorage.setItem('coway_products', JSON.stringify(productsData));
            renderProducts();
        }
        // 其他类型的保存逻辑类似，此处省略，请将原有 saveItem 中的逻辑完整复制过来。
        
        closeModal();
    } catch (error) {
        alert('保存失败: ' + error.message);
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}
