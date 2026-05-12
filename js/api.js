// js/api.js - 统一 API 调用（含进度条支持）
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

// ========== 带进度条的图片上传 ==========
async function uploadImageToWorker(file, onProgress, statusElementId = null) {
    const statusEl = statusElementId ? document.getElementById(statusElementId) : null;
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // 上传进度
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
                if (statusEl) {
                    statusEl.textContent = `上传中 ${percent}%...`;
                    statusEl.className = 'upload-status uploading';
                }
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (statusEl) {
                        statusEl.textContent = '上传成功';
                        statusEl.className = 'upload-status success';
                        setTimeout(() => statusEl.textContent = '', 3000);
                    }
                    resolve(result.url);
                } catch (e) {
                    reject(new Error('解析响应失败'));
                }
            } else {
                reject(new Error(`上传失败: ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('网络错误'));
        });
        
        xhr.open('POST', UPLOAD_WORKER);
        xhr.setRequestHeader('X-Admin-Token', ADMIN_TOKEN);
        
        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
    });
}

// 多图片上传（带总体进度）
async function uploadMultipleImagesToWorker(files, onFileProgress, onOverallProgress, statusElementId = null) {
    const urls = [];
    const total = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileIndex = i + 1;
        
        // 单文件进度
        const url = await uploadImageToWorker(file, (percent) => {
            if (onFileProgress) {
                onFileProgress(fileIndex, total, percent);
            }
        }, statusElementId);
        
        urls.push(url);
        
        // 总体进度
        if (onOverallProgress) {
            onOverallProgress(Math.round((fileIndex / total) * 100));
        }
    }
    
    return urls;
}
