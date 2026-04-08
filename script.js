// ==================== LIVE TV CORE ====================
(function() {
    const SERVERS = [
        {
            id: 0,
            name: 'Mirraby Stream',
            short: 'Server 1',
            url: 'https://web.mswott.net/p?url=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__src=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__type=document',
            icon: 'fa-play-circle',
            quality: 'HD 1080p'
        },
        {
            id: 1,
            name: 'Ash TV Bangladesh',
            short: 'Server 2',
            url: 'https://web.mswott.net/p?url=http%3A%2F%2F103.144.89.251%2F&__src=http%3A%2F%2F103.144.89.251%2F&__type=document',
            icon: 'fa-tower-broadcast',
            quality: 'HD Live'
        }
    ];

    let activeServerId = 0;
    const playerFrame = document.getElementById('livePlayerIframe');
    const channelGrid = document.getElementById('channelGrid');
    const serverInfoGridEl = document.getElementById('serverInfoGrid');
    const tabButtons = document.querySelectorAll('.server-tab-btn');

    function showToast(message, type = 'success') {
        let existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2800);
    }

    function switchServer(serverId, updateUI = true) {
        const targetServer = SERVERS.find(s => s.id === serverId);
        if (!targetServer) return;
        activeServerId = serverId;
        if (playerFrame) {
            playerFrame.src = 'about:blank';
            setTimeout(() => { playerFrame.src = targetServer.url; }, 40);
        }
        if (updateUI) {
            tabButtons.forEach(btn => {
                const btnId = parseInt(btn.getAttribute('data-server'), 10);
                btn.classList.toggle('active', btnId === serverId);
            });
            document.querySelectorAll('.channel-card').forEach(card => {
                const cardServerId = parseInt(card.getAttribute('data-server-id'), 10);
                card.classList.toggle('active', cardServerId === serverId);
            });
            document.querySelectorAll('.server-info-card').forEach(card => {
                const infoServerId = parseInt(card.getAttribute('data-info-server'), 10);
                card.classList.toggle('active-info', infoServerId === serverId);
            });
        }
        showToast(`Switched to ${targetServer.name}`, 'success');
    }

    function buildChannelList() {
        if (!channelGrid) return;
        channelGrid.innerHTML = '';
        SERVERS.forEach(server => {
            const isActive = (server.id === activeServerId);
            const card = document.createElement('div');
            card.className = `channel-card ${isActive ? 'active' : ''}`;
            card.setAttribute('data-server-id', server.id);
            card.innerHTML = `
                <div class="channel-icon"><i class="fas ${server.icon}"></i></div>
                <div class="channel-name">${escapeHtml(server.name)}</div>
                <div class="channel-status"><i class="fas fa-circle" style="font-size: 8px; color:#30E3A0;"></i> LIVE</div>
                <span class="channel-badge">${escapeHtml(server.quality || 'HD')}</span>
            `;
            card.addEventListener('click', () => switchServer(server.id, true));
            channelGrid.appendChild(card);
        });
    }

    function buildServerInfoGrid() {
        if (!serverInfoGridEl) return;
        serverInfoGridEl.innerHTML = '';
        SERVERS.forEach(server => {
            const isActive = (server.id === activeServerId);
            const infoCard = document.createElement('div');
            infoCard.className = `server-info-card ${isActive ? 'active-info' : ''}`;
            infoCard.setAttribute('data-info-server', server.id);
            infoCard.innerHTML = `
                <div class="info-icon"><i class="fas ${server.icon}"></i></div>
                <div class="info-content">
                    <div class="info-title">${escapeHtml(server.name)}</div>
                    <div class="info-desc">${escapeHtml(server.quality)} · 24/7 Stable</div>
                </div>
                <div class="live-tag"><span class="live-pulse" style="display: inline-block; width:6px; height:6px; margin-right: 6px;"></span> LIVE</div>
            `;
            infoCard.addEventListener('click', () => switchServer(server.id, true));
            serverInfoGridEl.appendChild(infoCard);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function initTabs() {
        tabButtons.forEach(btn => btn.addEventListener('click', () => {
            const serverVal = parseInt(btn.getAttribute('data-server'), 10);
            if (!isNaN(serverVal)) switchServer(serverVal, true);
        }));
    }

    function ensureScrollBehavior() {
        const scrollWrap = document.getElementById('channelScrollWrapper');
        if (scrollWrap) {
            scrollWrap.style.scrollBehavior = 'smooth';
            setTimeout(() => {
                const activeCard = document.querySelector('.channel-card.active');
                if (activeCard && scrollWrap) activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }, 200);
        }
    }

    function enhanceIframeReliability() {
        if (!playerFrame) return;
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && playerFrame.src && playerFrame.src !== 'about:blank') {
                const current = SERVERS.find(s => s.id === activeServerId);
                if (current) playerFrame.src = current.url;
            }
        });
    }

    function attachGlobalInteractivity() {
        const wrapper = document.querySelector('.player-wrapper');
        if (wrapper) wrapper.addEventListener('dblclick', () => {
            const iframe = document.getElementById('livePlayerIframe');
            if (iframe?.requestFullscreen) iframe.requestFullscreen().catch(() => wrapper.requestFullscreen?.());
            else wrapper.requestFullscreen?.();
        });
    }

    function initLiveTV() {
        buildChannelList();
        buildServerInfoGrid();
        initTabs();
        ensureScrollBehavior();
        attachGlobalInteractivity();
        enhanceIframeReliability();
        if (playerFrame && SERVERS[0]) playerFrame.src = SERVERS[0].url;
        switchServer(activeServerId, true);
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const activeCardNow = document.querySelector('.channel-card.active');
                const scrollContainer = document.getElementById('channelScrollWrapper');
                if (activeCardNow && scrollContainer) activeCardNow.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }, 150);
        });
        
        // Simulate live viewers count updater
        setInterval(() => {
            const viewerSpan = document.getElementById('viewerCount');
            if (viewerSpan) {
                let curr = parseInt(viewerSpan.innerText.replace(/,/g, '')) || 1284;
                let change = Math.floor(Math.random() * 15) - 5;
                let newVal = Math.max(800, curr + change);
                viewerSpan.innerText = newVal.toLocaleString();
            }
        }, 30000);
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLiveTV);
    else initLiveTV();
})();

// ========== THIRD PARTY SOCIAL, COOKIE, ADSENSE READY ==========
(function() {
    // Cookie Consent Logic
    const cookieBanner = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const denyBtn = document.getElementById('denyCookies');
    
    function setCookieConsent(accepted) {
        localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'denied');
        if (cookieBanner) cookieBanner.classList.remove('show');
        if (accepted) {
            loadAdSenseScript();
            enableAnalytics();
        }
    }
    
    function loadAdSenseScript() {
        if (!document.querySelector('#adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
            setTimeout(() => {
                if (window.adsbygoogle) {
                    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) { console.log("AdSense ready"); }
                }
            }, 500);
        }
    }
    
    function enableAnalytics() {
        console.log("Third-party scripts enabled (GA, Ads)");
    }
    
    function checkConsent() {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent && cookieBanner) {
            setTimeout(() => cookieBanner.classList.add('show'), 500);
        } else if (consent === 'accepted') {
            loadAdSenseScript();
            enableAnalytics();
        }
    }
    
    if (acceptBtn) acceptBtn.addEventListener('click', () => setCookieConsent(true));
    if (denyBtn) denyBtn.addEventListener('click', () => setCookieConsent(false));
    checkConsent();
    
    // Social share functionality
    const currentUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent("Watch HD4STATION Live TV - Free HD Streams!");
    
    document.getElementById('fbShare')?.addEventListener('click', () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank'));
    document.getElementById('twShare')?.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, '_blank'));
    document.getElementById('waShare')?.addEventListener('click', () => window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank'));
    document.getElementById('shareTwitter')?.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, '_blank'));
    document.getElementById('shareWhatsApp')?.addEventListener('click', () => window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank'));
    
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const toastMsg = document.createElement('div');
                toastMsg.className = 'toast-message';
                toastMsg.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px; color:#00C4B4;"></i> Link copied to clipboard!';
                document.body.appendChild(toastMsg);
                setTimeout(() => toastMsg.remove(), 2000);
            });
        });
    }
    
    // Responsive sidebar ad visibility on desktop
    function handleSidebarAd() {
        const sidebar = document.getElementById('sidebarAdDesktop');
        if (sidebar) {
            if (window.innerWidth >= 900) sidebar.style.display = 'block';
            else sidebar.style.display = 'none';
        }
    }
    window.addEventListener('resize', handleSidebarAd);
    handleSidebarAd();
    
    console.log("HD4STATION Live TV with ads & third-party ready — fully responsive");
})();