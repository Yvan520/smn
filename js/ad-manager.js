/**
 * 广告管理器
 * @description 管理Google AdSense和百度联盟广告
 */

'use strict';

class AdManager {
    constructor() {
        this.config = {
            google: {
                clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // 替换为你的Google AdSense ID
                slots: {
                    'ad-slot-1': 'XXXXXXXXXX', // 横幅广告
                    'ad-slot-2': 'XXXXXXXXXX'  // 侧边栏广告
                }
            },
            baidu: {
                siteId: 'XXXXXXXX', // 替换为你的百度联盟ID
                slots: {
                    'ad-slot-baidu-1': 'XXXXXXXXXX',
                    'ad-slot-baidu-2': 'XXXXXXXXXX'
                }
            }
        };

        this.init();
    }

    init() {
        // 检查Cookie同意
        if (this.hasConsent()) {
            this.loadAds();
        } else {
            // 监听同意事件
            document.addEventListener('cookieAccepted', () => {
                this.loadAds();
            });
        }
    }

    hasConsent() {
        const consent = document.cookie.split('; ')
            .find(row => row.startsWith('cookie_consent='));
        return consent && consent.split('=')[1] === 'accepted';
    }

    loadAds() {
        this.loadGoogleAds();
        this.loadBaiduAds();
    }

    loadGoogleAds() {
        // 加载Google AdSense脚本
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.google.clientId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        script.onload = () => {
            // 初始化广告位
            Object.keys(this.config.google.slots).forEach(slotId => {
                const container = document.getElementById(slotId);
                if (container) {
                    this.createGoogleAd(container, this.config.google.slots[slotId]);
                }
            });
        };
    }

    createGoogleAd(container, slotId) {
        container.innerHTML = `
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="${this.config.google.clientId}"
                data-ad-slot="${slotId}"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        `;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Google AdSense加载失败:', e);
        }
    }

    loadBaiduAds() {
        // 百度联盟广告代码
        Object.keys(this.config.baidu.slots).forEach(slotId => {
            const container = document.getElementById(slotId);
            if (container) {
                this.createBaiduAd(container, this.config.baidu.slots[slotId]);
            }
        });
    }

    createBaiduAd(container, cpro_id) {
        container.innerHTML = `
            <script>
                (window.slotbydup = window.slotbydup || []).push({
                    id: "${cpro_id}",
                    container: "${container.id}",
                    async: true
                });
            </script>
            <script src="//dup.baidustatic.com/js/os.js"></script>
        `;
    }

    // 广告拦截检测
    detectAdBlock() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);

        window.setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.handleAdBlock();
            }
            testAd.remove();
        }, 100);
    }

    handleAdBlock() {
        console.log('检测到广告拦截器');
        // 可以显示友好提示
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: #fff3cd;
            color: #856404;
            padding: 1rem;
            text-align: center;
            border-radius: 8px;
            margin: 1rem;
        `;
        notice.innerHTML = `
            <p>❤️ 检测到您使用了广告拦截器</p>
            <p>广告收入是我们维持网站运营的主要来源，请考虑将本站加入白名单 🙏</p>
        `;
        document.querySelector('.main-content')?.prepend(notice);
    }
}

// 初始化广告管理器
const adManager = new AdManager();
adManager.detectAdBlock();
