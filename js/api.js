// js/api.js - 统一 API 调用
const API_BASE = 'https://coway-api.recky1314.workers.dev/api';

// 管理员密钥（必须与 admin 登录密码一致）
const ADMIN_TOKEN = 'coway_admin_168888';

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

// ========== 产品 API ==========
async function getProducts() { return await apiRequest('products'); }
async function saveProducts(products) { return await apiRequest('products', 'POST', products, true); }

// ========== 轮播 API ==========
async function getCarousel() { return await apiRequest('carousel'); }
async function saveCarousel(carousel) { return await apiRequest('carousel', 'POST', carousel, true); }

// ========== 公告 API ==========
async function getNotices() { return await apiRequest('notices'); }
async function saveNotices(notices) { return await apiRequest('notices', 'POST', notices, true); }

// ========== 门店 API ==========
async function getLocations() { return await apiRequest('locations'); }
async function saveLocations(locations) { return await apiRequest('locations', 'POST', locations, true); }

// ========== Agent API ==========
async function getAgents() { return await apiRequest('agents'); }
async function saveAgents(agents) { return await apiRequest('agents', 'POST', agents, true); }

// ========== 关于我们 API ==========
async function getAbout() { return await apiRequest('about'); }
async function saveAbout(about) { return await apiRequest('about', 'POST', about, true); }

// ========== 反馈 API ==========
async function getFeedbacks() { return await apiRequest('feedbacks'); }
async function saveFeedback(feedback) { return await apiRequest('feedbacks', 'POST', feedback, false); }

// ========== 获取所有数据 ==========
async function getAllData() { 
    const response = await fetch('https://coway-api.recky1314.workers.dev/api/all');
    return response.json();
}