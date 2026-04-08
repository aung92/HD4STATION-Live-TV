(function() {
    // Server Configuration
    const SERVERS = [
        {
            id: 0,
            name: 'Mirraby Stream',
            url: 'https://web.mswott.net/p?url=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__src=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__type=document',
            icon: 'fa-play-circle',
            quality: 'HD 1080p'
        },
        {
            id: 1,
            name: 'Ash TV Bangladesh',
            url: 'https://web.mswott.net/p?url=http%3A%2F%2F103.144.89.251%2F&__src=http%3A%2F%2F103.144.89.251%2F&__type=document',
            icon: 'fa-tower-broadcast',
            quality: 'HD Live'
        }
    ];

    let activeServerId = 0;
    let isFullscreen = false;
    const playerFrame = document.getElementById('livePlayerIframe');
    const channelsGrid = document.getElementById('channelsGrid');
    const currentChannelNameSpan = document.getElementById('currentChannelName');
    const heroServerBtns = document.querySelectorAll('#heroServerSelector .server-btn-hero');
    const playerSection = document.getElementById('playerSection');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Toast notification
    function showToast(message) {
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // Scroll to player smoothly
    function scrollToPlayer() {
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Load stream
    function loadStream(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (server && playerFrame) {
            playerFrame.src = server.url;
            currentChannelNameSpan.innerText = server.name;
            showToast(`Now playing: ${server.name}`);
        }
    }

    // Switch server with auto-scroll to player
    function switchServer(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) return;
        
        activeServerId = serverId;
        loadStream(serverId);
        
        // Scroll to player on mobile and desktop for better UX
        scrollToPlayer();
        
        // Update UI
        heroServerBtns.forEach(btn => {
            const btnId = parseInt(btn.dataset.server);
            btn.classList.toggle('active', btnId === serverId);
        });
        
        document.querySelectorAll('.channel-item').forEach(card => {
            const cardId = parseInt(card.dataset.serverId);
            card.classList.toggle('active', cardId === serverId);
        });
    }

    // Build channels grid
    function buildChannels() {
        if (!channelsGrid) return;
        channelsGrid.innerHTML = '';
        SERVERS.forEach(server => {
            const card = document.createElement('div');
            card.className = `channel-item ${server.id === activeServerId ? 'active' : ''}`;
            card.dataset.serverId = server.id;
            card.innerHTML = `
                <div class="channel-icon-lg">
                    <i class="fas ${server.icon}"></i>
                </div>
                <div class="channel-name">${escapeHtml(server.name)}</div>
                <div class="channel-quality">
                    <i class="fas fa-circle" style="font-size: 6px; color:#30E3A0;"></i> ${server.quality}
                </div>
            `;
            card.addEventListener('click', () => {
                switchServer(server.id);
            });
            channelsGrid.appendChild(card);
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

    // Fullscreen functionality with back-to-top visibility
    function initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const playerWrapper = document.querySelector('.player-wrapper');
        
        if (fullscreenBtn && playerWrapper) {
            fullscreenBtn.addEventListener('click', () => {
                const iframe = document.getElementById('livePlayerIframe');
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (playerWrapper.requestFullscreen) {
                    playerWrapper.requestFullscreen();
                }
            });
        }
        
        // Listen for fullscreen change to adjust back-to-top visibility
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    
    function handleFullscreenChange() {
        isFullscreen = !!document.fullscreenElement;
        const backToTop = document.getElementById('backToTopBtn');
        if (backToTop) {
            if (isFullscreen) {
                backToTop.style.display = 'none';
            } else {
                backToTop.style.display = 'flex';
            }
        }
    }

    // Back to Top functionality
    function initBackToTop() {
        if (!backToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Live viewers counter (dynamic)
    function initViewerCounter() {
        const viewerSpan = document.getElementById('liveViewers');
        if (viewerSpan) {
            setInterval(() => {
                let curr = parseInt(viewerSpan.innerText.replace(/,/g, '')) || 1284;
                let change = Math.floor(Math.random() * 15) - 5;
                let newVal = Math.max(800, curr + change);
                viewerSpan.innerText = newVal.toLocaleString();
            }, 25000);
        }
    }

    // Social sharing
    function initSocialShare() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Watch HD4STATION Live TV - Premium HD Streaming!");
        
        document.getElementById('shareFb')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        });
        document.getElementById('shareTw')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        });
        document.getElementById('shareWa')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        });
    }

    // Navigation links
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.nav;
                if (target === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (target === 'channels') {
                    document.getElementById('channelsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (target === 'features') {
                    document.getElementById('featuresSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Hero server buttons
    function initHeroButtons() {
        heroServerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const serverId = parseInt(btn.dataset.server);
                if (!isNaN(serverId)) switchServer(serverId);
            });
        });
    }

    // Initialize ads
    function initAds() {
        console.log("Ad network scripts loaded - ads will appear in designated containers");
    }

    // Initialize everything
    function init() {
        buildChannels();
        initHeroButtons();
        initFullscreen();
        initBackToTop();
        initViewerCounter();
        initSocialShare();
        initNavigation();
        initAds();
        
        // Load default server
        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
            currentChannelNameSpan.innerText = SERVERS[0].name;
        }
        
        showToast('Welcome to HD4STATION! Tap any channel to play');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();