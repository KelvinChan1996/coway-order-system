// order-modal.js - 订单弹窗逻辑（含日期选择器）

let currentProduct = null;
let currentLang = 'zh';

// ========== 产品详情弹窗 ==========
function openDetailModal(product) {
    currentProduct = product;
    document.getElementById('detailTitle').innerText = product.name;
    document.getElementById('detailDesc').innerText = product.desc_zh;
    currentLang = 'zh';
    
    let carouselHtml = '';
    product.images.forEach(img => {
        carouselHtml += `<div><img src="${img}" alt="" style="width:100%; border-radius:8px;"></div>`;
    });
    document.getElementById('detailCarousel').innerHTML = carouselHtml;
    
    // 初始化 Slick 轮播图
    if ($('#detailCarousel').hasClass('slick-initialized')) {
        $('#detailCarousel').slick('unslick');
    }
    $('#detailCarousel').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true,
        autoplay: true,
        autoplaySpeed: 3000
    });
    
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    if ($('#detailCarousel').hasClass('slick-initialized')) {
        $('#detailCarousel').slick('unslick');
    }
}

// ========== 订单表单弹窗 ==========
function openOrderModal() {
    closeDetailModal();
    document.getElementById('orderModal').classList.add('active');
    
    // 初始化日期选择器（每次打开弹窗时重新初始化）
    setTimeout(function() {
        if ($('#dateRange').length) {
            $('#dateRange').daterangepicker({
                opens: 'center',
                locale: {
                    format: 'DD-MM-YYYY',
                    separator: ' to ',
                    applyLabel: 'Apply',
                    cancelLabel: 'Cancel',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1
                },
                autoUpdateInput: false,
                singleDatePicker: false,
                showDropdowns: true,
                minDate: moment().add(1, 'days'),
                startDate: moment().add(3, 'days'),
                endDate: moment().add(5, 'days')
            }, function(start, end, label) {
                $('#dateRange').val(start.format('DD-MM-YYYY') + ' to ' + end.format('DD-MM-YYYY'));
            });
        }
    }, 100);
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    // 重置日期选择器输入框
    if ($('#dateRange').length) {
        $('#dateRange').val('');
    }
}

// ========== 成功弹窗 ==========
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

// ========== 翻译功能 ==========
document.getElementById('translateBtn')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const descElem = document.getElementById('detailDesc');
    if (currentLang === 'zh') {
        descElem.innerText = currentProduct.desc_en;
        currentLang = 'en';
    } else {
        descElem.innerText = currentProduct.desc_zh;
        currentLang = 'zh';
    }
});

// ========== Order 按钮 ==========
document.getElementById('orderFromDetailBtn')?.addEventListener('click', openOrderModal);

// ========== Contact 按钮 ==========
document.getElementById('contactFromDetailBtn')?.addEventListener('click', () => {
    const agent = getLeastBusyAgent();
    if (agent) {
        const msg = `Hello ${agent.name}, I am interested in ${currentProduct?.name}. Please advise.`;
        window.open(`https://wa.me/${agent.contact}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
        alert('No agent available.');
    }
});

// ========== 订单提交 ==========
document.getElementById('orderForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 验证必填字段
    const contact1 = document.getElementById('contact1').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    
    if (!contact1) {
        alert("Contact Number #1 is required");
        return;
    }
    if (!address) {
        alert("Installation Address is required");
        return;
    }
    if (!email) {
        alert("Email Address is required");
        return;
    }
    
    // 获取日期选择器的值（可选）
    const preferredDate = document.getElementById('dateRange')?.value || 'Not specified';
    
    // 分配 Agent 并增加单数
    const agent = getLeastBusyAgent();
    if (agent) {
        incrementAgentReceipt(agent);
        console.log(`Order assigned to ${agent.name}. Preferred date: ${preferredDate}`);
    }
    
    // 关闭订单弹窗，显示成功弹窗
    closeOrderModal();
    showSuccessModal();
    
    // 重置表单
    document.getElementById('orderForm').reset();
    if ($('#dateRange').length) {
        $('#dateRange').val('');
    }
    
    // 可选：这里可以添加 AJAX 提交到后端的代码
    // 收集表单数据
    const formData = {
        contact1: contact1,
        contact2: document.getElementById('contact2')?.value || '',
        address: address,
        email: email,
        cardInfo: document.getElementById('cardInfo')?.value || '',
        preferredDate: preferredDate,
        product: currentProduct?.name || 'Unknown',
        assignedAgent: agent?.name || 'Unknown',
        timestamp: new Date().toISOString()
    };
    console.log('Order submitted:', formData);
});

// ========== 图片上传预览（可选） ==========
document.getElementById('icUpload')?.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('IC image loaded:', event.target.result.substring(0, 100) + '...');
            // 可以在这里添加图片预览功能
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});