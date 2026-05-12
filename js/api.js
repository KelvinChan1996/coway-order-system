// js/api.js - 统一 API 调用
const API_BASE = 'https://coway-api.recky1314.workers.dev/api';
const ADMIN_TOKEN = 'coway_admin_168888';
const UPLOAD_WORKER = 'https://coway-api.recky1314.workers.dev/upload';

// 通用请求函数
async function apiRequest(endpoint, method = 'GET', data = null, needAuth = false) {
    const options = { method, headers: {} };
    
    if (needAuth) {
        options.headers['X-Admin-Token'] = ADMIN_TOKEN;
    }
    
    if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}/${endpoint}`, options);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

// 获取所有数据
async function getAllData() { 
    const response = await fetch('https://coway-api.recky1314.workers.dev/api/all');
    return response.json();
}

// 产品 API
async function getProducts() { return await apiRequest('products'); }
async function saveProducts(products) { return await apiRequest('products', 'POST', products, true); }

// 轮播 API
async function getCarousel() { return await apiRequest('carousel'); }
async function saveCarousel(carousel) { return await apiRequest('carousel', 'POST', carousel, true); }

// 公告 API
async function getNotices() { return await apiRequest('notices'); }
async function saveNotices(notices) { return await apiRequest('notices', 'POST', notices, true); }

// 门店 API
async function getLocations() { return await apiRequest('locations'); }
async function saveLocations(locations) { return await apiRequest('locations', 'POST', locations, true); }

// Agent API
async function getAgents() { return await apiRequest('agents'); }
async function saveAgents(agents) { return await apiRequest('agents', 'POST', agents, true); }

// 关于我们 API
async function getAbout() { return await apiRequest('about'); }
async function saveAbout(about) { return await apiRequest('about', 'POST', about, true); }

// 反馈 API
async function getFeedbacks() { return await apiRequest('feedbacks'); }
async function saveFeedback(feedback) { return await apiRequest('feedbacks', 'POST', feedback, false); }

// 图片上传函数
async function uploadImageToWorker(file, statusElementId = null) {
    const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
    try {
        if (statusEl) { statusEl.textContent = '上传中...'; statusEl.className = 'upload-status uploading'; }
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(UPLOAD_WORKER, {
            method: 'POST',
            headers: {
                'X-Admin-Token': ADMIN_TOKEN,
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        if (statusEl) { statusEl.textContent = '上传成功'; statusEl.className = 'upload-status success'; setTimeout(() => statusEl.textContent = '', 3000); }
        return result.url;
    } catch (error) {
        if (statusEl) { statusEl.textContent = `上传失败: ${error.message}`; statusEl.className = 'upload-status error'; }
        throw error;
    }
}

async function uploadMultipleImagesToWorker(files, statusElementId = null) {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
        const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
        if (statusEl) { statusEl.textContent = `上传中 (${i + 1}/${files.length})...`; statusEl.className = 'upload-status uploading'; }
        urls.push(await uploadImageToWorker(files[i], null));
    }
    if (statusElementId) {
        const statusEl = document.getElementById(statusElementId);
        statusEl.textContent = `全部上传成功 (${urls.length} 张)`;
        statusEl.className = 'upload-status success';
        setTimeout(() => statusEl.textContent = '', 3000);
    }
    return urls;
}
