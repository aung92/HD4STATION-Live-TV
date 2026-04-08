(function() {
    // SERVER DEFINITIONS
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

    // DOM Elements
    const playerFrame = document.getElementById('livePlayerIframe');
    const channelGrid = document.getElementById('channelGrid');
    const serverInfoGridEl = document.getElementById('serverInfoGrid');
    const tabButtons = document.querySelectorAll('.server-tab-btn');

    // Toast notification
    function showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2800);
    }

    // Core switching logic
    function switchServer(serverId, updateUI = true) {
        const targetServer = SERVERS.find(s => s.id === serverId);
        if (!targetServer) return;

        activeServerId = serverId;

        if (playerFrame) {
            playerFrame.src = 'about:blank';
            setTimeout(() => {
                playerFrame.src = targetServer.url;
            }, 30);
        }

        if (updateUI) {
            tabButtons.forEach(btn => {
                const btnId = parseInt(btn.getAttribute('data-server'), 10);
                if (btnId === serverId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            const channelCards = document.querySelectorAll('.channel-card');
            channelCards.forEach(card => {
                const cardServerId = parseInt(card.getAttribute('data-server-id'), 10);
                if (cardServerId === serverId) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            const infoCards = document.querySelectorAll('.server-info-card');
            infoCards.forEach(card => {
                const infoServerId = parseInt(card.getAttribute('data-info-server'), 10);
                if (infoServerId === serverId) {
                    card.classList.add('active-info');
                } else {
                    card.classList.remove('active-info');
                }
            });
        }

        showToast(`Switched to ${targetServer.name}`, 'success');
    }

    // Build horizontal channel list
    function buildChannelList() {
        if (!channelGrid) return;
        channelGrid.innerHTML = '';
        SERVERS.forEach(server => {
            const isActive = (server.id === activeServerId);
            const card = document.createElement('div');
            card.className = `channel-card ${isActive ? 'active' : ''}`;
            card.setAttribute('data-server-id', server.id);
            card.innerHTML = `
                <div class="channel-icon">
                    <i class="fas ${server.icon}"></i>
                </div>
                <div class="channel-name">${escapeHtml(server.name)}</div>
                <div class="channel-status"><i class="fas fa-circle" style="font-size: 8px; color:#30E3A0;"></i> LIVE</div>
                <span class="channel-badge">${escapeHtml(server.quality || 'HD')}</span>
            `;
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                switchServer(server.id, true);
            });
            channelGrid.appendChild(card);
        });
    }

    // Build server info grid
    function buildServerInfoGrid() {
        if (!serverInfoGridEl) return;
        serverInfoGridEl.innerHTML = '';
        SERVERS.forEach(server => {
            const isActive = (server.id === activeServerId);
            const infoCard = document.createElement('div');
            infoCard.className = `server-info-card ${isActive ? 'active-info' : ''}`;
            infoCard.setAttribute('data-info-server', server.id);
            infoCard.innerHTML = `
                <div class="info-icon">
                    <i class="fas ${server.icon}"></i>
                </div>
                <div class="info-content">
                    <div class="info-title">${escapeHtml(server.name)}</div>
                    <div class="info-desc">${escapeHtml(server.quality)} · 24/7 Stable</div>
                </div>
                <div class="live-tag"><span class="live-pulse" style="display: inline-block; width:6px; height:6px; margin-right: 6px;"></span> LIVE</div>
            `;
            infoCard.addEventListener('click', () => {
                switchServer(server.id, true);
            });
            serverInfoGridEl.appendChild(infoCard);
        });
    }

    // Helper to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Initialize tabs
    function initTabs() {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serverVal = parseInt(btn.getAttribute('data-server'), 10);
                if (!isNaN(serverVal)) {
                    switchServer(serverVal, true);
                }
            });
        });
    }

    // Smooth scroll behavior
    function ensureScrollBehavior() {
        const scrollWrap = document.getElementById('channelScrollWrapper');
        if (scrollWrap) {
            scrollWrap.style.scrollBehavior = 'smooth';
            setTimeout(() => {
                const activeCard = document.querySelector('.channel-card.active');
                if (activeCard && scrollWrap) {
                    const cardRect = activeCard.getBoundingClientRect();
                    const containerRect = scrollWrap.getBoundingClientRect();
                    if (cardRect.left < containerRect.left || cardRect.right > containerRect.right) {
                        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            }, 200);
        }
    }

    // Iframe reliability
    function enhanceIframeReliability() {
        if (!playerFrame) return;
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && playerFrame && playerFrame.src && playerFrame.src !== 'about:blank') {
                const currentServer = SERVERS.find(s => s.id === activeServerId);
                if (currentServer) {
                    playerFrame.src = currentServer.url;
                }
            }
        });
    }

    // Fullscreen support
    function attachGlobalInteractivity() {
        const wrapper = document.querySelector('.player-wrapper');
        if (wrapper) {
            wrapper.addEventListener('dblclick', () => {
                const iframe = document.getElementById('livePlayerIframe');
                if (iframe && iframe.requestFullscreen) {
                    iframe.requestFullscreen().catch(err => {
                        wrapper.requestFullscreen?.();
                    });
                } else if (wrapper.requestFullscreen) {
                    wrapper.requestFullscreen();
                }
            });
        }
    }

    // Main initialization
    function initLiveTV() {
        buildChannelList();
        buildServerInfoGrid();
        initTabs();
        ensureScrollBehavior();
        attachGlobalInteractivity();
        enhanceIframeReliability();

        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
        }
        switchServer(activeServerId, true);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const activeCardNow = document.querySelector('.channel-card.active');
                const scrollContainer = document.getElementById('channelScrollWrapper');
                if (activeCardNow && scrollContainer) {
                    const cardRect = activeCardNow.getBoundingClientRect();
                    const containerRect = scrollContainer.getBoundingClientRect();
                    if (cardRect.left < containerRect.left || cardRect.right > containerRect.right) {
                        activeCardNow.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            }, 150);
        });

        console.log('HD4STATION Live TV — Fully ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiveTV);
    } else {
        initLiveTV();
    }
})();