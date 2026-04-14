// ========== 多语言配置 ==========
const I18N = {
    current: 'zh',
    
    dict: {
        zh: {
            // 导航栏
            'nav.home': '首页',
            'nav.order': '立即订购',
            'nav.locations': '门店位置',
            'nav.support': '支持',
            'nav.about': '关于我们',
            'nav.admin': '管理员登录',
            
            // 首页
            'home.carousel1.title': '纯净空气，健康生活',
            'home.carousel1.desc': 'Coway 空气净化器，为您的家庭提供最纯净的空气',
            'home.carousel2.title': '健康饮水，从Coway开始',
            'home.carousel2.desc': '荣获国际设计大奖的净水器系列',
            'home.carousel3.title': 'Coway 虚拟展厅',
            'home.carousel3.desc': '360° 体验我们的创新产品',
            'home.carousel.learnMore': '了解更多 →',
            'home.notice.title': '🎉 最新优惠与公告',
            'home.stats.title': 'Coway 健康生活',
            'home.stats.desc': '为全球数百万家庭提供纯净空气与健康饮水',
            'home.stats.users': '全球用户',
            'home.stats.countries': '国家和地区',
            'home.stats.experience': '行业经验',
            'home.notice.raya': '🎊 开斋节特别优惠！',
            'home.notice.raya.desc': '购买任何水机/空气净化器，可获免费滤芯一套 + 延长保修1年。',
            'home.notice.tradein': '💧 水机以旧换新计划',
            'home.notice.tradein.desc': '任何品牌旧水机，换购Coway水机可享RM200折扣。',
            'home.notice.trial': '🌬️ 空气净化器免费试用',
            'home.notice.trial.desc': '30天免费试用，不满意全额退款。',
            'home.emptyNotice': '📢 暂无公告，请稍后再来',
            
            // 产品页
            'products.all': '全部产品',
            'products.water': '水机',
            'products.air': '空气净化器',
            'products.ac': '冷气机',
            'products.washer': '洗衣机',
            'products.toilet': '马桶',
            'products.massageChair': '按摩椅',
            'products.massageBed': '按摩床',
            'products.bed': '床',
            'products.category': '产品分类',
            'products.orderNow': '立即订购',
            'products.contactAgent': '联系代理',
            'products.translate': '切换英文',
            'products.noProducts': '暂无产品',
            'products.price': '价格',
            
            // 订单表单
            'order.title': '填写订单信息',
            'order.thankYou': '感谢您的订购！请填写以下信息完成注册。',
            'order.icPhoto': 'IC 照片 (正面) *',
            'order.contact1': '联系电话 #1 *',
            'order.contact2': '联系电话 #2',
            'order.address': '安装地址 *',
            'order.deliveryDiff': '送货地址与安装地址不同',
            'order.deliveryAddr': '送货地址',
            'order.email': '电子邮箱 *',
            'order.cardFirst6': '银行卡 (前6位)',
            'order.cardLast4': '银行卡 (后4位)',
            'order.submit': '提交订单',
            'order.success.title': '订单提交成功！',
            'order.success.msg': '感谢您提交的详细信息。<br><br>我们将尽快处理您的订单，并将PDF文件发送给您签署。',
            'order.success.ok': '确定',
            'order.agent.unavailable': '暂无可用的代理，请稍后再试。',
            'order.selectProduct': '请先选择产品',
            'order.fillRequired': '请填写必填字段',
            
            // 门店页
            'locations.title': '📍 我们的门店',
            'locations.subtitle': '寻找您附近的 Coway 体验中心',
            'locations.navigate': '使用 Waze 导航',
            'locations.noLocations': '暂无门店信息，请稍后再来',
            'locations.monFri': '周一至周五',
            'locations.sat': '周六',
            'locations.sun': '周日',
            'locations.closed': '休息',
            
            // 支持页
            'support.title': '💬 客户支持中心',
            'support.subtitle': '我们致力于为您提供最优质的服务。如有任何疑问，请随时联系我们或填写以下表格，我们的客服团队会尽快回复您。',
            'support.feedback.title': '📝 意见反馈',
            'support.feedback.subtitle': '告诉我们您的问题或建议，我们会尽快回复',
            'support.phone': '手机号码 *',
            'support.phone.placeholder': '例如: 0123456789',
            'support.product': '选择产品 *',
            'support.selectProduct': '请选择产品',
            'support.product.water': '💧 水机',
            'support.product.air': '🌬️ 空气净化器',
            'support.product.ac': '❄️ 冷气机',
            'support.product.washer': '🧺 洗衣机',
            'support.product.toilet': '🚽 马桶',
            'support.product.massageChair': '💆 按摩椅',
            'support.product.massageBed': '🛏️ 按摩床',
            'support.product.bed': '🛌 床',
            'support.product.other': '其他',
            'support.message': '您的反馈/问题 *',
            'support.message.placeholder': '请详细描述您的问题或建议...',
            'support.submit': '提交反馈',
            'support.success': '✅ 反馈已提交，我们会尽快回复您！',
            'support.fillRequired': '请填写所有必填字段',
            
            // 关于我们
            'about.title': '关于 Coway',
            'about.subtitle': '健康生活的领导者 · 改变生活的创新',
            'about.empty.title': '内容正在筹备中',
            'about.empty.desc': '我们的团队正在准备精彩的内容，请稍后再来。',
            'about.adminEdit': '🔐 管理员编辑',
            'about.ourStory': '我们的故事',
            'about.achievements': '我们的成就',
            'about.coreTeam': '核心团队',
            'about.milestones': '发展历程',
            
            // 页脚
            'footer.terms': '使用条款',
            'footer.privacy': '隐私政策',
            'footer.support': '支持',
            'footer.copyright': 'COWAY (MALAYSIA) © 2026. All Rights Reserved.',
            
            // 通用
            'common.loading': '加载中...',
            'common.save': '保存',
            'common.cancel': '取消',
            'common.edit': '编辑',
            'common.delete': '删除',
            'common.confirmDelete': '确定删除？',
            'common.back': '返回',
            'common.submit': '提交',
            'common.close': '关闭',
        },
        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.order': 'Order Now',
            'nav.locations': 'Locations',
            'nav.support': 'Support',
            'nav.about': 'About Us',
            'nav.admin': 'Admin Login',
            
            // Home
            'home.carousel1.title': 'Pure Air, Healthy Life',
            'home.carousel1.desc': 'Coway air purifiers provide the purest air for your home',
            'home.carousel2.title': 'Healthy Water, Start with Coway',
            'home.carousel2.desc': 'Award-winning water purifier series',
            'home.carousel3.title': 'Coway Virtual Showroom',
            'home.carousel3.desc': '360° experience our innovative products',
            'home.carousel.learnMore': 'Learn More →',
            'home.notice.title': '🎉 Latest Offers & Announcements',
            'home.stats.title': 'Coway Healthy Living',
            'home.stats.desc': 'Providing pure air and healthy water to millions of families worldwide',
            'home.stats.users': 'Users Worldwide',
            'home.stats.countries': 'Countries & Regions',
            'home.stats.experience': 'Years Experience',
            'home.notice.raya': '🎊 Raya Special Offer!',
            'home.notice.raya.desc': 'Purchase any water/air purifier and get a free filter set + 1 year extended warranty.',
            'home.notice.tradein': '💧 Water Purifier Trade-In',
            'home.notice.tradein.desc': 'Trade in any brand old water purifier and enjoy RM200 off Coway water purifiers.',
            'home.notice.trial': '🌬️ Air Purifier Free Trial',
            'home.notice.trial.desc': '30-day free trial, full refund if not satisfied.',
            'home.emptyNotice': '📢 No announcements, please check back later',
            
            // Products
            'products.all': 'All Products',
            'products.water': 'Water Purifier',
            'products.air': 'Air Purifier',
            'products.ac': 'Air Conditioner',
            'products.washer': 'Washing Machine',
            'products.toilet': 'Bidet',
            'products.massageChair': 'Massage Chair',
            'products.massageBed': 'Massage Bed',
            'products.bed': 'Bed',
            'products.category': 'Product Categories',
            'products.orderNow': 'Order Now',
            'products.contactAgent': 'Contact Agent',
            'products.translate': 'Switch to Chinese',
            'products.noProducts': 'No products available',
            'products.price': 'Price',
            
            // Order Form
            'order.title': 'Complete Your Order',
            'order.thankYou': 'Thank you for your order! Please fill in the details below to complete registration.',
            'order.icPhoto': 'IC Photo (Front) *',
            'order.contact1': 'Contact Number #1 *',
            'order.contact2': 'Contact Number #2',
            'order.address': 'Installation Address *',
            'order.deliveryDiff': 'Delivery address different from installation address',
            'order.deliveryAddr': 'Delivery Address',
            'order.email': 'Email Address *',
            'order.cardFirst6': 'Card (First 6 digits)',
            'order.cardLast4': 'Card (Last 4 digits)',
            'order.submit': 'Submit Order',
            'order.success.title': 'Order Submitted!',
            'order.success.msg': 'Thank you for submitting your details.<br><br>We will process your order and send you a PDF for signature.',
            'order.success.ok': 'OK',
            'order.agent.unavailable': 'No agents available, please try again later.',
            'order.selectProduct': 'Please select a product first',
            'order.fillRequired': 'Please fill in required fields',
            
            // Locations
            'locations.title': '📍 Our Locations',
            'locations.subtitle': 'Find the nearest Coway experience centre near you',
            'locations.navigate': 'Navigate with Waze',
            'locations.noLocations': 'No locations available, please check back later',
            'locations.monFri': 'Mon-Fri',
            'locations.sat': 'Sat',
            'locations.sun': 'Sun',
            'locations.closed': 'Closed',
            
            // Support
            'support.title': '💬 Customer Support',
            'support.subtitle': 'We are committed to providing you with the best service. If you have any questions, please contact us or fill out the form below.',
            'support.feedback.title': '📝 Feedback',
            'support.feedback.subtitle': 'Tell us your questions or suggestions, we will reply as soon as possible',
            'support.phone': 'Phone Number *',
            'support.phone.placeholder': 'e.g. 0123456789',
            'support.product': 'Select Product *',
            'support.selectProduct': 'Please select a product',
            'support.product.water': '💧 Water Purifier',
            'support.product.air': '🌬️ Air Purifier',
            'support.product.ac': '❄️ Air Conditioner',
            'support.product.washer': '🧺 Washing Machine',
            'support.product.toilet': '🚽 Bidet',
            'support.product.massageChair': '💆 Massage Chair',
            'support.product.massageBed': '🛏️ Massage Bed',
            'support.product.bed': '🛌 Bed',
            'support.product.other': 'Other',
            'support.message': 'Your Feedback / Question *',
            'support.message.placeholder': 'Please describe your issue or suggestion in detail...',
            'support.submit': 'Submit Feedback',
            'support.success': '✅ Feedback submitted, we will reply soon!',
            'support.fillRequired': 'Please fill in all required fields',
            
            // About
            'about.title': 'About Coway',
            'about.subtitle': 'Leader in Healthy Living · Innovation that Changes Lives',
            'about.empty.title': 'Content in Preparation',
            'about.empty.desc': 'Our team is preparing exciting content. Please check back later.',
            'about.adminEdit': '🔐 Admin Edit',
            'about.ourStory': 'Our Story',
            'about.achievements': 'Our Achievements',
            'about.coreTeam': 'Core Team',
            'about.milestones': 'Milestones',
            
            // Footer
            'footer.terms': 'Terms of Use',
            'footer.privacy': 'Privacy Notice',
            'footer.support': 'Support',
            'footer.copyright': 'COWAY (MALAYSIA) © 2026. All Rights Reserved.',
            
            // Common
            'common.loading': 'Loading...',
            'common.save': 'Save',
            'common.cancel': 'Cancel',
            'common.edit': 'Edit',
            'common.delete': 'Delete',
            'common.confirmDelete': 'Confirm delete?',
            'common.back': 'Back',
            'common.submit': 'Submit',
            'common.close': 'Close',
        }
    },
    
    t: function(key) {
        return this.dict[this.current] && this.dict[this.current][key] ? this.dict[this.current][key] : key;
    },
    
    switch: function(lang) {
        this.current = lang;
        localStorage.setItem('coway_lang', lang);
        this.updatePage();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.current } }));
    },
    
    updatePage: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            el.value = this.t(key);
        });
    },
    
    init: function() {
        const saved = localStorage.getItem('coway_lang') || 'zh';
        this.current = saved;
        this.updatePage();
    }
};

window.switchLanguage = function(lang) {
    I18N.switch(lang);
};

document.addEventListener('DOMContentLoaded', () => {
    I18N.init();
});
