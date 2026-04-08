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

    // Cookie preferences
    let cookiePreferences = {
        functional: true,
        analytics: true,
        advertising: true
    };

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
        scrollToPlayer();
        
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
            card.addEventListener('click', () => switchServer(server.id));
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

    // Fullscreen functionality
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
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    
    function handleFullscreenChange() {
        isFullscreen = !!document.fullscreenElement;
        const backToTop = document.getElementById('backToTopBtn');
        if (backToTop) {
            backToTop.style.display = isFullscreen ? 'none' : 'flex';
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

    // Live viewers counter
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
        const text = encodeURIComponent("Watch CHALUNG Live TV - Premium HD Streaming!");
        
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

    // ========== COOKIE CONSENT SYSTEM ==========
    function initCookieConsent() {
        const cookieBanner = document.getElementById('cookieConsent');
        const acceptBtn = document.getElementById('cookieAccept');
        const denyBtn = document.getElementById('cookieDeny');
        const settingsBtn = document.getElementById('cookieSettings');
        const modal = document.getElementById('cookieModal');
        const closeModal = document.getElementById('closeModal');
        const savePreferences = document.getElementById('savePreferences');
        
        // Check if user has already made a choice
        const consentGiven = localStorage.getItem('cookie_consent_given');
        const savedPreferences = localStorage.getItem('cookie_preferences');
        
        if (savedPreferences) {
            cookiePreferences = JSON.parse(savedPreferences);
        }
        
        if (!consentGiven) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        } else {
            applyCookiePreferences();
        }
        
        // Accept all cookies
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                cookiePreferences = {
                    functional: true,
                    analytics: true,
                    advertising: true
                };
                saveCookiePreferences('all');
                cookieBanner.classList.remove('show');
                showToast('Cookies accepted! Thank you for your preference.');
                applyCookiePreferences();
            });
        }
        
        // Deny all non-essential cookies
        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                cookiePreferences = {
                    functional: false,
                    analytics: false,
                    advertising: false
                };
                saveCookiePreferences('deny');
                cookieBanner.classList.remove('show');
                showToast('You have denied non-essential cookies.');
                applyCookiePreferences();
            });
        }
        
        // Open settings modal
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                // Load current preferences into modal
                document.getElementById('functionalCookies').checked = cookiePreferences.functional;
                document.getElementById('analyticsCookies').checked = cookiePreferences.analytics;
                document.getElementById('advertisingCookies').checked = cookiePreferences.advertising;
                modal.classList.add('show');
            });
        }
        
        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        
        // Save preferences
        if (savePreferences) {
            savePreferences.addEventListener('click', () => {
                cookiePreferences = {
                    functional: document.getElementById('functionalCookies').checked,
                    analytics: document.getElementById('analyticsCookies').checked,
                    advertising: document.getElementById('advertisingCookies').checked
                };
                saveCookiePreferences('custom');
                modal.classList.remove('show');
                cookieBanner.classList.remove('show');
                showToast('Your cookie preferences have been saved.');
                applyCookiePreferences();
            });
        }
    }
    
    function saveCookiePreferences(type) {
        localStorage.setItem('cookie_consent_given', 'true');
        localStorage.setItem('cookie_consent_type', type);
        localStorage.setItem('cookie_preferences', JSON.stringify(cookiePreferences));
        
        // Log consent for GDPR compliance
        console.log('Cookie preferences saved:', {
            type: type,
            preferences: cookiePreferences,
            timestamp: new Date().toISOString()
        });
    }
    
    function applyCookiePreferences() {
        // Apply analytics cookies (Google Analytics, etc.)
        if (cookiePreferences.analytics) {
            console.log('Analytics cookies enabled');
            // You can initialize Google Analytics here
        } else {
            console.log('Analytics cookies disabled');
        }
        
        // Apply advertising cookies
        if (cookiePreferences.advertising) {
            console.log('Advertising cookies enabled');
            // You can initialize ad networks here
        } else {
            console.log('Advertising cookies disabled');
            // Block ad scripts if needed
        }
        
        // Apply functional cookies
        if (cookiePreferences.functional) {
            console.log('Functional cookies enabled');
            // Restore user preferences
            restoreUserPreferences();
        }
    }
    
    function restoreUserPreferences() {
        // Restore any saved user preferences (like last selected server)
        const lastServer = localStorage.getItem('last_selected_server');
        if (lastServer && !isNaN(parseInt(lastServer))) {
            switchServer(parseInt(lastServer));
        }
    }
    
    // Save last selected server
    function saveLastServer(serverId) {
        if (localStorage.getItem('cookie_consent_given') === 'true') {
            const prefs = JSON.parse(localStorage.getItem('cookie_preferences') || '{}');
            if (prefs.functional !== false) {
                localStorage.setItem('last_selected_server', serverId);
            }
        }
    }
    
    // Override switchServer to save preference
    const originalSwitchServer = switchServer;
    window.switchServer = function(serverId) {
        originalSwitchServer(serverId);
        saveLastServer(serverId);
    };
    
    // Initialize ads
    function initAds() {
        console.log("Ad network scripts loaded");
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
        initCookieConsent();
        initAds();
        
        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
            currentChannelNameSpan.innerText = SERVERS[0].name;
        }
        
        showToast('Welcome to CHALUNG Live TV! Tap any channel to play');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();