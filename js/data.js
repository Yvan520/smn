// ==================== 角色数据 ====================
window.charactersData = [
    {
        id: "special-week",
        name_cn: "特别周",
        name_jp: "スペシャルウィーク",
        rarity: 3,
        type: "逃げ",
        distance: ["短距離", "マイル", "中距離"],
        ground: ["芝"],
        stats: {
            speed: "A",
            stamina: "B",
            power: "A",
            guts: "B",
            wisdom: "C"
        },
        recommended_skills: ["suenomi", "senkou-chokusen", "corner-kaifuku"],
        recommended_factors: ["スピード", "パワー", "短距離"],
        breeding_tips: "特别周是典型的短距离逃马，推荐优先堆速度和力量属性。育成重点：1) 前期快速提升速度到800+，力量到600+；2) 学习逃马核心技能如'末脚'、'先行直线'等；3) 因子继承优先选择速度因子；4) 适合参加短距离和マイル赛事，中距离也能胜任。育成难度较低，适合新手训练员。",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f8bbd0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='60' fill='%23c2185b'%3E特别周%3C/text%3E%3C/svg%3E",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f8bbd0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='%23c2185b'%3E特别周%3C/text%3E%3C/svg%3E"
    }
];

// ==================== 技能数据 ====================
window.skillsData = [
    {
        id: "suenomi",
        name_cn: "末脚",
        name_jp: "末脚",
        type: "速度",
        rarity: "normal",
        condition: "最終直線で発動",
        effect: "直线加速度上升",
        effect_value: "速度+0.15",
        recommended_for: ["逃げ", "先行"],
        how_to_get: "特别周固有技能/继承因子",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ff6b6b' width='100' height='100' rx='10'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='white'%3E⚡%3C/text%3E%3C/svg%3E"
    }
];

// ==================== 赛事数据 ====================
window.racesData = [
    {
        id: "japan-cup",
        name_cn: "日本杯",
        name_jp: "ジャパンカップ",
        grade: "G1",
        distance: 2400,
        ground: "芝",
        direction: "左",
        season: "秋",
        difficulty: "S",
        recommended_characters: ["special-week"],
        recommended_skills: ["suenomi"],
        tips: "日本杯是2400m的中距离G1赛事，难度极高。推荐配置：1) 耐力至少800+，最好900+；2) 速度700+保证不会太慢；3) 推荐差马或先行马，可以在后半段发力；4) 必备技能：末脚、耐力大师、差马切入等；5) 赛道为东京竞马场，左回，直线较长适合后程发力。建议在育成后期挑战，属性不够容易翻车。",
        map: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23e8f5e9' width='800' height='400'/%3E%3Ctext x='400' y='200' text-anchor='middle' font-size='40' fill='%232e7d32'%3E日本杯 2400m%3C/text%3E%3C/svg%3E"
    }
];
