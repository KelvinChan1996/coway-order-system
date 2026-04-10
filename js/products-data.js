// 产品数据 - 后续只需修改这个文件
const products = {
    water: [
        { name: "Coway Omba", desc_zh: "淨水與冰水一體，現代廚房首選。", desc_en: "Integrated water purifier with cold water.", images: ["https://placehold.co/800x400/80abce/white?text=Omba+1", "https://placehold.co/800x400/80abce/white?text=Omba+2"] },
        { name: "Coway Neon", desc_zh: "時尚設計，過濾重金屬。", desc_en: "Stylish design, removes heavy metals.", images: ["https://placehold.co/800x400/80abce/white?text=Neon"] },
        { name: "Coway Inline", desc_zh: "櫥下式節省空間。", desc_en: "Under-sink space saving.", images: ["https://placehold.co/800x400/80abce/white?text=Inline"] }
    ],
    air: [
        { name: "Coway Storm", desc_zh: "強力淨化PM2.5與過敏原。", desc_en: "Powerful purification for PM2.5.", images: ["https://placehold.co/800x400/80abce/white?text=Storm"] },
        { name: "Coway Breeze", desc_zh: "靜音節能，適合臥室。", desc_en: "Silent energy saving for bedroom.", images: ["https://placehold.co/800x400/80abce/white?text=Breeze"] }
    ],
    ac: [
        { name: "Coway Arctic", desc_zh: "節能冷氣，快速製冷。", desc_en: "Energy-saving AC, fast cooling.", images: ["https://placehold.co/800x400/80abce/white?text=Arctic"] }
    ],
    washer: [
        { name: "Coway Washing Mate", desc_zh: "智能洗衣，呵護衣物。", desc_en: "Smart washing, fabric care.", images: ["https://placehold.co/800x400/80abce/white?text=WashingMate"] }
    ],
    toilet: [
        { name: "Coway Bidet Plus", desc_zh: "智能馬桶蓋，潔淨舒適。", desc_en: "Smart bidet, clean & comfortable.", images: ["https://placehold.co/800x400/80abce/white?text=Bidet"] }
    ],
    massageChair: [
        { name: "Coway Relax Pro", desc_zh: "全身按摩，緩解疲勞。", desc_en: "Full body massage, relieve fatigue.", images: ["https://placehold.co/800x400/80abce/white?text=RelaxPro"] }
    ],
    massageBed: [
        { name: "Coway Dream Massage", desc_zh: "睡眠與按摩結合。", desc_en: "Sleep & massage combined.", images: ["https://placehold.co/800x400/80abce/white?text=DreamMassage"] }
    ],
    bed: [
        { name: "Coway Ergo Bed", desc_zh: "人體工學電動床。", desc_en: "Ergonomic electric bed.", images: ["https://placehold.co/800x400/80abce/white?text=ErgoBed"] }
    ]
};

const categories = [
    { id: "water", name: "💧 水机" },
    { id: "air", name: "🌬️ 空气净化器" },
    { id: "ac", name: "❄️ 冷气机" },
    { id: "washer", name: "🧺 洗衣机" },
    { id: "toilet", name: "🚽 马桶" },
    { id: "massageChair", name: "💆 按摩椅" },
    { id: "massageBed", name: "🛏️ 按摩床" },
    { id: "bed", name: "🛌 床" }
];