// ==================== 全局变量 ====================
let currentFilters = {
    rarity: 'all',
    type: 'all',
    distance: 'all'
};

// ==================== DOM 加载完成后执行 ==================== 
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSearch();
    loadPopularCharacters();
});

// ==================== 导航栏功能 ==================== 
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// ==================== 搜索功能 ==================== 
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

function performSearch(query) {
    const results = [];
    
    if (!window.charactersData && !window.skillsData && !window.racesData) {
        displaySearchResults([]);
        return;
    }
    
    if (window.charactersData && Array.isArray(window.charactersData)) {
        window.charactersData.forEach(char => {
            if (char.name_cn && char.name_cn.toLowerCase().includes(query) || 
                char.name_jp && char.name_jp.toLowerCase().includes(query)) {
                results.push({
                    type: 'character',
                    data: char,
                    title: char.name_cn || '未知角色',
                    subtitle: char.name_jp || '',
                    url: `character-detail.html?id=${char.id}`
                });
            }
        });
    }
    
    if (window.skillsData && Array.isArray(window.skillsData)) {
        window.skillsData.forEach(skill => {
            if (skill.name_cn && skill.name_cn.toLowerCase().includes(query) || 
                skill.name_jp && skill.name_jp.toLowerCase().includes(query)) {
                results.push({
                    type: 'skill',
                    data: skill,
                    title: skill.name_cn || '未知技能',
                    subtitle: skill.effect || '',
                    url: `skill-detail.html?id=${skill.id}`
                });
            }
        });
    }
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">😢 没有找到相关结果</div>';
        searchResults.classList.add('active');
        return;
    }
    
    const typeIcons = {
        'character': '🏇',
        'skill': '⚡',
        'race': '🏆'
    };
    
    searchResults.innerHTML = results.slice(0, 8).map(result => `
        <a href="${result.url}" class="search-result-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 2rem; flex-shrink: 0;">${typeIcons[result.type] || '📄'}</span>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${result.title}</div>
                    <div style="font-size: 0.875rem; color: #666;">${result.subtitle}</div>
                </div>
            </div>
        </a>
    `).join('');
    
    searchResults.classList.add('active');
}

// ==================== 首页热门角色 ==================== 
function loadPopularCharacters() {
    const container = document.getElementById('popularCharacters');
    if (!container) return;
    
    if (!window.charactersData || !Array.isArray(window.charactersData)) {
        container.innerHTML = '<div class="no-results">角色数据加载中...</div>';
        return;
    }
    
    const popular = window.charactersData.slice(0, 6);
    
    if (popular.length === 0) {
        container.innerHTML = '<div class="no-results">暂无角色数据</div>';
        return;
    }
    
    container.innerHTML = popular.map(char => `
        <a href="character-detail.html?id=${char.id}" class="character-card fade-in">
            <div class="character-image">
                <img src="${char.icon}" alt="${char.name_cn}" loading="lazy">
                <div class="character-rarity">${'★'.repeat(char.rarity)}</div>
            </div>
            <div class="character-info">
                <h3 class="character-name">${char.name_cn}</h3>
                <p class="character-name-jp">${char.name_jp}</p>
                <div class="character-tags">
                    <span class="tag tag-type">${char.type}</span>
                </div>
            </div>
        </a>
    `).join('');
}

console.log('🏇 UmaGuide 已加载完成');
