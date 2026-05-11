/**
 * 赛马娘攻略站 - 主要JavaScript文件
 * @version 1.0.0
 * @description 商业级前端逻辑实现
 */

'use strict';

// ===========================
// 全局配置
// ===========================
const CONFIG = {
    apiEndpoint: '/data/content.json',
    searchDelay: 300,
    animationDuration: 600,
    cookieExpireDays: 365
};

// ===========================
// 工具函数
// ===========================
const Utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 获取Cookie
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },

    // 设置Cookie
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    // LocalStorage操作
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('LocalStorage设置失败:', e);
                return false;
            }
        },
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('LocalStorage获取失败:', e);
                return null;
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    },

    // 格式化数字
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // 错误处理
    handleError(error, context = '') {
        console.error(`[错误] ${context}:`, error);
        // 实际生产环境应该发送到错误追踪服务
    }
};

// ===========================
// 页面加载管理
// ===========================
class PageLoader {
    constructor() {
        this.loader = document.getElementById('pageLoader');
    }

    hide() {
        if (this.loader) {
            setTimeout(() => {
                this.loader.classList.add('hidden');
                setTimeout(() => {
                    this.loader.style.display = 'none';
                }, 500);
            }, 500);
        }
    }
}

// ===========================
// 导航栏管理
// ===========================
class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navLinks = document.getElementById('navLinks');
        this.links = document.querySelectorAll('.nav-link');
        
        this.init();
    }

    init() {
        // 滚动效果
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }, 100));

        // 移动端菜单
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // 导航链接激活状态
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        this.setActiveLink(link);
                        
                        // 关闭移动端菜单
                        if (window.innerWidth <= 768) {
                            this.toggleMobileMenu();
                        }
                    }
                }
            });
        });

        // 观察器 - 自动激活对应章节的导航
        this.setupIntersectionObserver();
    }

    toggleMobileMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        this.mobileMenuBtn.setAttribute(
            'aria-expanded',
            this.navLinks.classList.contains('active')
        );
    }

    setActiveLink(activeLink) {
        this.links.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const options = {
            root: null,
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (correspondingLink) {
                        this.setActiveLink(correspondingLink);
                    }
                }
            });
        }, options);

        sections.forEach(section => observer.observe(section));
    }
}

// ===========================
// 搜索功能
// ===========================
class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.suggestions = document.getElementById('searchSuggestions');
        this.data = [];
        
        this.init();
    }

    async init() {
        // 加载搜索数据
        await this.loadSearchData();

        // 搜索输入事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', 
                Utils.debounce((e) => this.handleSearch(e.target.value), CONFIG.searchDelay)
            );

            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(this.searchInput.value);
                }
            });

            // 失去焦点时隐藏建议
            this.searchInput.addEventListener('blur', () => {
                setTimeout(() => this.hideSuggestions(), 200);
            });
        }

        // 搜索按钮事件
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }
    }

    async loadSearchData() {
        try {
            const response = await fetch(CONFIG.apiEndpoint);
            const data = await response.json();
            this.data = [
                ...data.characters.map(c => ({ ...c, type: '角色' })),
                ...data.supports.map(s => ({ ...s, type: '支援卡' })),
                ...data.guides.map(g => ({ ...g, type: '攻略' }))
            ];
        } catch (error) {
            Utils.handleError(error, '加载搜索数据');
            // 使用本地备份数据
            this.data = this.getLocalSearchData();
        }
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const results = this.data.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            (item.tags && item.tags.some(tag => tag.includes(query)))
        ).slice(0, 5);

        this.showSuggestions(results);
    }

    showSuggestions(results) {
        if (!results.length) {
            this.hideSuggestions();
            return;
        }

        const html = results.map(item => `
            <div class="suggestion-item" data-id="${item.id}" data-type="${item.type}">
                <strong>${item.name}</strong>
                <span style="color: #999; margin-left: 10px;">${item.type}</span>
            </div>
        `).join('');

        this.suggestions.innerHTML = html;
        this.suggestions.style.display = 'block';

        // 添加点击事件
        this.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.id, item.dataset.type);
            });
        });
    }

    hideSuggestions() {
        if (this.suggestions) {
            this.suggestions.style.display = 'none';
        }
    }

    selectSuggestion(id, type) {
        console.log(`选择了 ${type}: ${id}`);
        // 跳转到详情页
        window.location.href = `/${type.toLowerCase()}/${id}`;
    }

    performSearch(query) {
        if (!query.trim()) return;

        console.log('执行搜索:', query);
        // GA追踪
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                search_term: query
            });
        }

        // 跳转到搜索结果页
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    getLocalSearchData() {
        // 本地备份数据
        return [
            { id: 1, name: '东海帝皇', type: '角色', tags: ['长距离', '逃马'] },
            { id: 2, name: '黄金船', type: '角色', tags: ['中距离', '差马'] },
            { id: 3, name: '育成计算器', type: '工具', tags: ['计算', '属性'] }
        ];
    }
}

// ===========================
// 内容加载器
// ===========================
class ContentLoader {
    constructor() {
        this.toolsGrid = document.getElementById('toolsGrid');
        this.guideGrid = document.getElementById('guideGrid');
        this.newsList = document.getElementById('newsList');
        this.friendLinks = document.getElementById('friendLinks');
    }

    async init() {
        try {
            const response = await fetch(CONFIG.apiEndpoint);
            const data = await response.json();
            
            this.renderTools(data.tools);
            this.renderGuides(data.guides);
            this.renderNews(data.news);
            this.renderFriendLinks(data.friendLinks);
            this.updateStats(data.stats);
        } catch (error) {
            Utils.handleError(error, '加载内容');
            this.loadLocalContent();
        }
    }

    renderTools(tools) {
        if (!this.toolsGrid || !tools) return;

        const html = tools.map(tool => `
            <a href="${tool.url}" class="tool-card">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-title">${tool.title}</div>
                <div class="tool-desc">${tool.description}</div>
            </a>
        `).join('');

        this.toolsGrid.innerHTML = html;
    }

    renderGuides(guides) {
        if (!this.guideGrid || !guides) return;

        const html = guides.map(guide => `
            <a href="/guide/${guide.id}" class="guide-card">
                <div class="guide-image">
                    ${guide.image ? `<img src="${guide.image}" alt="${guide.title}" loading="lazy">` : guide.icon || '📖'}
                </div>
                <div class="guide-content">
                    <div class="guide-title">${guide.title}</div>
                    <div class="guide-meta">
                        <span>👁️ ${Utils.formatNumber(guide.views)}</span>
                        <span>⏱️ ${guide.date}</span>
                    </div>
                    <div class="guide-excerpt">
                        ${guide.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${guide.excerpt}
                    </div>
                </div>
            </a>
        `).join('');

        this.guideGrid.innerHTML = html;
    }

    renderNews(news) {
        if (!this.newsList || !news) return;

        const html = news.map(item => {
            const date = new Date(item.date);
            return `
                <div class="news-item" onclick="window.location.href='/news/${item.id}'">
                    <div class="news-date">
                        <div class="news-day">${date.getDate()}</div>
                        <div class="news-month">${date.getMonth() + 1}月</div>
                    </div>
                    <div class="news-content-wrapper">
                        <div class="news-title">${item.title}</div>
                        <div class="news-excerpt">${item.excerpt}</div>
                    </div>
                </div>
            `;
        }).join('');

        this.newsList.innerHTML = html;
    }

    renderFriendLinks(links) {
        if (!this.friendLinks || !links) return;

        const html = links.map(link => `
            <li><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></li>
        `).join('');

        this.friendLinks.innerHTML = html;
    }

    updateStats(stats) {
        if (!stats) return;

        const elements = {
            userCount: document.getElementById('userCount'),
            characterCount: document.getElementById('characterCount'),
            supportCount: document.getElementById('supportCount'),
            guideCount: document.getElementById('guideCount')
        };

        Object.keys(stats).forEach(key => {
            if (elements[key]) {
                this.animateNumber(elements[key], stats[key]);
            }
        });
    }

    animateNumber(element, target) {
        const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (target - start) * progress);
            element.textContent = Utils.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    loadLocalContent() {
        // 本地备份数据
        const localData = {
            tools: [
                { icon: '🧮', title: '育成计算器', description: '实时计算属性成长', url: '#calculator' },
                { icon: '🎴', title: '配卡推荐器', description: '智能推荐支援卡组合', url: '/tools/deck-builder' },
                { icon: '⚡', title: '技能数据库', description: '全技能效果查询', url: '/skills' },
                { icon: '🧬', title: '因子计算', description: '继承概率计算', url: '/tools/inherit-calculator' }
            ],
            guides: [
                { 
                    id: 1, 
                    icon: '🏆', 
                    title: '新手入门完全指南', 
                    views: 15200, 
                    date: '2024-01-15',
                    tags: ['新手'],
                    excerpt: '从零开始，30分钟掌握赛马娘核心玩法...'
                },
                { 
                    id: 2, 
                    icon: '💎', 
                    title: '东海帝皇 URA 5星育成攻略', 
                    views: 23800, 
                    date: '2024-01-14',
                    tags: ['育成', '长距离'],
                    excerpt: '详细的回合规划、支援卡配置、技能选择...'
                },
                { 
                    id: 3, 
                    icon: '🎯', 
                    title: '竞技场S级上分卡组推荐', 
                    views: 18500, 
                    date: '2024-01-13',
                    tags: ['PVP', '竞技场'],
                    excerpt: '2024最新赛季，三大主流配置详解...'
                },
                { 
                    id: 4, 
                    icon: '📊', 
                    title: '支援卡性价比排行榜', 
                    views: 31200, 
                    date: '2024-01-12',
                    tags: ['支援卡', '推荐'],
                    excerpt: '数据分析156张支援卡，分级推荐...'
                }
            ],
            news: [
                { id: 1, title: '新角色「目白善信」实装预告', date: '2024-01-20', excerpt: '预计下周更新...' },
                { id: 2, title: '冬季竞技场赛季开启', date: '2024-01-18', excerpt: '全新赛季奖励...' },
                { id: 3, title: '限时活动「新春杯」开催', date: '2024-01-15', excerpt: '丰厚奖励等你来拿...' }
            ],
            friendLinks: [
                { name: 'NGA论坛', url: 'https://nga.178.com' },
                { name: 'TapTap', url: 'https://www.taptap.cn' },
                { name: 'Bilibili', url: 'https://www.bilibili.com' }
            ],
            stats: {
                userCount: 12458,
                characterCount: 89,
                supportCount: 156,
                guideCount: 320
            }
        };

        this.renderTools(localData.tools);
        this.renderGuides(localData.guides);
        this.renderNews(localData.news);
        this.renderFriendLinks(localData.friendLinks);
        this.updateStats(localData.stats);
    }
}

// ===========================
// 育成计算器
// ===========================
class Calculator {
    constructor() {
        this.stats = {
            speed: { input: null, slider: null, value: 800 },
            stamina: { input: null, slider: null, value: 600 },
            power: { input: null, slider: null, value: 700 },
            guts: { input: null, slider: null, value: 500 },
            intelligence: { input: null, slider: null, value: 650 }
        };
        
        this.totalScoreEl = document.getElementById('totalScore');
        this.ratingDisplayEl = document.getElementById('ratingDisplay');
        this.suggestionTextEl = document.getElementById('suggestionText');
        this.saveStatsBtn = document.getElementById('saveStatsBtn');
        
        this.init();
    }

    init() {
        // 初始化所有输入元素
        Object.keys(this.stats).forEach(key => {
            this.stats[key].input = document.getElementById(key);
            this.stats[key].slider = document.getElementById(`${key}Range`);
            
            if (this.stats[key].input && this.stats[key].slider) {
                // 输入框变化
                this.stats[key].input.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value) || 0;
                    this.stats[key].value = Math.max(0, Math.min(1200, value));
                    this.stats[key].slider.value = this.stats[key].value;
                    this.calculate();
                });

                // 滑块变化
                this.stats[key].slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.stats[key].value = value;
                    this.stats[key].input.value = value;
                    this.calculate();
                });
            }
        });

        // 保存按钮
        if (this.saveStatsBtn) {
            this.saveStatsBtn.addEventListener('click', () => this.saveStats());
        }

        // 加载保存的配置
        this.loadSavedStats();

        // 初始计算
        this.calculate();
    }

    calculate() {
        const total = Object.values(this.stats).reduce((sum, stat) => sum + stat.value, 0);
        
        // 更新总分
        if (this.totalScoreEl) {
            this.animateScore(total);
        }

        // 评级
        const rating = this.getRating(total);
        if (this.ratingDisplayEl) {
            this.ratingDisplayEl.innerHTML = `
                <div class="rating-stars">${rating.stars}</div>
                <div class="rating-text">${rating.grade}</div>
            `;
        }

        // 建议
        const suggestion = this.getSuggestion();
        if (this.suggestionTextEl) {
            this.suggestionTextEl.textContent = suggestion;
        }

        // GA追踪
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_use', {
                total_score: total,
                rating: rating.grade
            });
        }
    }

    animateScore(target) {
        const current = parseInt(this.totalScoreEl.textContent) || 0;
        const duration = 300;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const value = Math.floor(current + (target - current) * progress);
            this.totalScoreEl.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    getRating(total) {
        if (total >= 5000) return { stars: '⭐⭐⭐⭐⭐', grade: 'SS级评价' };
        if (total >= 4000) return { stars: '⭐⭐⭐⭐⭐', grade: 'S级评价' };
        if (total >= 3000) return { stars: '⭐⭐⭐⭐', grade: 'A级评价' };
        if (total >= 2000) return { stars: '⭐⭐⭐', grade: 'B级评价' };
        return { stars: '⭐⭐', grade: 'C级评价' };
    }

    getSuggestion() {
        const values = Object.entries(this.stats).map(([key, stat]) => ({
            name: key,
            value: stat.value
        })).sort((a, b) => a.value - b.value);

        const lowest = values[0];
        const suggestions = {
            speed: '速度是核心属性，建议优先提升',
            stamina: '耐力影响长距离表现，建议继续培养',
            power: '力量决定加速能力，需要加强',
            guts: '毅力影响终盘表现，可适当提升',
            intelligence: '智力影响技能发动率，建议重点培养'
        };

        return suggestions[lowest.name] || '继续均衡发展各项属性';
    }

    saveStats() {
        const config = {};
        Object.keys(this.stats).forEach(key => {
            config[key] = this.stats[key].value;
        });

        Utils.storage.set('calculator_stats', config);
        
        // 显示保存成功提示
        this.showNotification('配置已保存！');
        
        // GA追踪
        if (typeof gtag !== 'undefined') {
            gtag('event', 'save_stats', {
                total: Object.values(config).reduce((a, b) => a + b, 0)
            });
        }
    }

    loadSavedStats() {
        const saved = Utils.storage.get('calculator_stats');
        if (saved) {
            Object.keys(saved).forEach(key => {
                if (this.stats[key]) {
                    this.stats[key].value = saved[key];
                    if (this.stats[key].input) {
                        this.stats[key].input.value = saved[key];
                    }
                    if (this.stats[key].slider) {
                        this.stats[key].slider.value = saved[key];
                    }
                }
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===========================
// 返回顶部
// ===========================
class BackToTop {
    constructor() {
        this.btn = document.getElementById('backToTop');
        this.init();
    }

    init() {
        if (!this.btn) return;

        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 300) {
                this.btn.style.display = 'block';
            } else {
                this.btn.style.display = 'none';
            }
        }, 100));

        this.btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===========================
// Cookie同意
// ===========================
class CookieConsent {
    constructor() {
        this.banner = document.getElementById('cookieConsent');
        this.acceptBtn = document.getElementById('acceptCookies');
        this.init();
    }

    init() {
        if (!this.banner) return;

        // 检查是否已同意
        if (!Utils.getCookie('cookie_consent')) {
            this.banner.style.display = 'flex';
        }

        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', () => {
                Utils.setCookie('cookie_consent', 'accepted', CONFIG.cookieExpireDays);
                this.banner.style.display = 'none';
                
                // 启用追踪
                this.enableTracking();
            });
        }
    }

    enableTracking() {
        // 启用Google Analytics等追踪服务
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }
}

// ===========================
// 初始化应用
// ===========================
class App {
    constructor() {
        this.pageLoader = new PageLoader();
        this.navigation = null;
        this.search = null;
        this.contentLoader = null;
        this.calculator = null;
        this.backToTop = null;
        this.cookieConsent = null;
    }

    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initComponents());
            } else {
                await this.initComponents();
            }
        } catch (error) {
            Utils.handleError(error, '应用初始化');
        }
    }

    async initComponents() {
        // 初始化各个组件
        this.navigation = new Navigation();
        this.search = new Search();
        this.contentLoader = new ContentLoader();
        this.calculator = new Calculator();
        this.backToTop = new BackToTop();
        this.cookieConsent = new CookieConsent();

        // 加载内容
        await this.contentLoader.init();

        // 添加淡入动画
        this.addFadeInAnimations();

        // 隐藏加载动画
        this.pageLoader.hide();

        // 性能追踪
        this.trackPerformance();
    }

    addFadeInAnimations() {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    trackPerformance() {
        if (typeof gtag !== 'undefined' && window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            gtag('event', 'timing_complete', {
                name: 'page_load',
                value: pageLoadTime
            });
        }
    }
}

// ===========================
// 启动应用
// ===========================
const app = new App();
app.init();
