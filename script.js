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

    // Analytics tracking
    let analyticsEnabled = false;

    // Toast notification
    function showToast(message) {
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // Analytics tracking function
    function trackEvent(eventName, eventData = {}) {
        if (analyticsEnabled) {
            console.log(`[Analytics] ${eventName}:`, eventData);
            // You can send to Google Analytics or other analytics service here
        }
    }

    // Scroll to player smoothly
    function scrollToPlayer() {
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        trackEvent('scroll_to_player', { timestamp: new Date().toISOString() });
    }

    // Load stream
    function loadStream(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (server && playerFrame) {
            playerFrame.src = server.url;
            currentChannelNameSpan.innerText = server.name;
            showToast(`Now playing: ${server.name}`);
            trackEvent('stream_started', { server: server.name, serverId: serverId });
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
        
        trackEvent('server_switched', { server: server.name, serverId: serverId });
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
                trackEvent('channel_clicked', { channel: server.name });
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

    // Fullscreen functionality
    function initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const playerWrapper = document.querySelector('.player-wrapper');
        
        if (fullscreenBtn && playerWrapper) {
            fullscreenBtn.addEventListener('click', () => {
                const iframe = document.getElementById('livePlayerIframe');
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                    trackEvent('fullscreen_entered', {});
                } else if (playerWrapper.requestFullscreen) {
                    playerWrapper.requestFullscreen();
                    trackEvent('fullscreen_entered', {});
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
        if (!isFullscreen) {
            trackEvent('fullscreen_exited', {});
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
            trackEvent('back_to_top_clicked', { scrollY: window.scrollY });
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

    // Social sharing with tracking
    function initSocialShare() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Watch CHALUNG Live TV - Premium HD Streaming!");
        
        document.getElementById('shareFb')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            trackEvent('social_share', { platform: 'facebook' });
        });
        document.getElementById('shareTw')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
            trackEvent('social_share', { platform: 'twitter' });
        });
        document.getElementById('shareWa')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
            trackEvent('social_share', { platform: 'whatsapp' });
        });
    }

    // Navigation links
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.nav;
                if (target === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    trackEvent('nav_click', { target: 'home' });
                } else if (target === 'channels') {
                    document.getElementById('channelsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    trackEvent('nav_click', { target: 'channels' });
                } else if (target === 'features') {
                    document.getElementById('featuresSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    trackEvent('nav_click', { target: 'features' });
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

    // Modal Functions
    function initModals() {
        // Privacy Modal
        const privacyBtn = document.getElementById('privacyLinkBtn');
        const privacyFooterBtn = document.getElementById('privacyFooterBtn');
        const privacyModal = document.getElementById('privacyModal');
        const closePrivacy = document.getElementById('closePrivacyModal');
        const closePrivacyBtn = document.getElementById('closePrivacyBtn');
        
        // Legal Modal
        const legalBtn = document.getElementById('legalLinkBtn');
        const legalFooterBtn = document.getElementById('legalFooterBtn');
        const legalModal = document.getElementById('legalModal');
        const closeLegal = document.getElementById('closeLegalModal');
        const closeLegalBtn = document.getElementById('closeLegalBtn');
        
        // Open Privacy Modal
        const openPrivacy = () => {
            privacyModal.classList.add('show');
            trackEvent('modal_opened', { modal: 'privacy_policy' });
        };
        
        if (privacyBtn) privacyBtn.addEventListener('click', openPrivacy);
        if (privacyFooterBtn) privacyFooterBtn.addEventListener('click', openPrivacy);
        
        // Close Privacy Modal
        const closePrivacyModal = () => {
            privacyModal.classList.remove('show');
        };
        if (closePrivacy) closePrivacy.addEventListener('click', closePrivacyModal);
        if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacyModal);
        
        // Open Legal Modal
        const openLegal = () => {
            legalModal.classList.add('show');
            trackEvent('modal_opened', { modal: 'legal_safety' });
        };
        if (legalBtn) legalBtn.addEventListener('click', openLegal);
        if (legalFooterBtn) legalFooterBtn.addEventListener('click', openLegal);
        
        // Close Legal Modal
        const closeLegalModal = () => {
            legalModal.classList.remove('show');
        };
        if (closeLegal) closeLegal.addEventListener('click', closeLegalModal);
        if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegalModal);
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === privacyModal) privacyModal.classList.remove('show');
            if (e.target === legalModal) legalModal.classList.remove('show');
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
        const cookieSettingsFooter = document.getElementById('cookieSettingsFooter');
        
        const consentGiven = localStorage.getItem('cookie_consent_given');
        const savedPreferences = localStorage.getItem('cookie_preferences');
        
        if (savedPreferences) {
            cookiePreferences = JSON.parse(savedPreferences);
        }
        
        if (!consentGiven) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
                trackEvent('cookie_banner_shown', {});
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
                trackEvent('cookie_consent', { action: 'accept_all' });
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
                trackEvent('cookie_consent', { action: 'deny_all' });
            });
        }
        
        // Open settings modal
        const openSettings = () => {
            document.getElementById('functionalCookies').checked = cookiePreferences.functional;
            document.getElementById('analyticsCookies').checked = cookiePreferences.analytics;
            document.getElementById('advertisingCookies').checked = cookiePreferences.advertising;
            modal.classList.add('show');
            trackEvent('cookie_settings_opened', {});
        };
        
        if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
        if (cookieSettingsFooter) cookieSettingsFooter.addEventListener('click', openSettings);
        
        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }
        
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
                trackEvent('cookie_consent', { action: 'save_preferences', preferences: cookiePreferences });
            });
        }
    }
    
    function saveCookiePreferences(type) {
        localStorage.setItem('cookie_consent_given', 'true');
        localStorage.setItem('cookie_consent_type', type);
        localStorage.setItem('cookie_preferences', JSON.stringify(cookiePreferences));
        
        console.log('Cookie preferences saved:', {
            type: type,
            preferences: cookiePreferences,
            timestamp: new Date().toISOString()
        });
    }
    
    function applyCookiePreferences() {
        // Apply analytics
        analyticsEnabled = cookiePreferences.analytics === true;
        if (analyticsEnabled) {
            console.log('Analytics tracking enabled');
            trackEvent('analytics_enabled', { timestamp: new Date().toISOString() });
        } else {
            console.log('Analytics tracking disabled');
        }
        
        // Apply advertising
        if (cookiePreferences.advertising) {
            console.log('Advertising cookies enabled');
            initializeAdsterra();
        } else {
            console.log('Advertising cookies disabled');
        }
        
        // Apply functional
        if (cookiePreferences.functional) {
            console.log('Functional cookies enabled');
            restoreUserPreferences();
        }
    }
    
    function initializeAdsterra() {
        // Adsterra initialization - Add your Adsterra code here
        console.log('Adsterra ads initialized');
        // Example: Load Adsterra script dynamically
        // const script = document.createElement('script');
        // script.src = '//YOUR_ADSTERRA_SCRIPT_URL.js';
        // document.head.appendChild(script);
    }
    
    function restoreUserPreferences() {
        const lastServer = localStorage.getItem('last_selected_server');
        if (lastServer && !isNaN(parseInt(lastServer))) {
            switchServer(parseInt(lastServer));
        }
    }
    
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
    
    // Page view tracking
    function trackPageView() {
        trackEvent('page_view', {
            page: window.location.pathname,
            title: document.title,
            timestamp: new Date().toISOString()
        });
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
        initModals();
        
        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
            currentChannelNameSpan.innerText = SERVERS[0].name;
        }
        
        trackPageView();
        showToast('Welcome to CHALUNG! Tap any channel to play');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();