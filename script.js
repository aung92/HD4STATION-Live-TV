(function() {
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
    
    // Cookie preferences - Default values
    let cookiePreferences = {
        functional: true,
        analytics: true,
        advertising: true,
        essential: true
    };

    const playerFrame = document.getElementById('livePlayerIframe');
    const channelsGrid = document.getElementById('channelsGrid');
    const currentChannelNameSpan = document.getElementById('currentChannelName');
    const heroServerBtns = document.querySelectorAll('#heroServerSelector .server-btn-hero');
    const playerSection = document.getElementById('playerSection');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const datetimeBar = document.getElementById('datetimeBar');

    const CURRENT_YEAR = 2026;
    
    const HOLIDAYS = {
        bangladesh: [
            { name: "Bengali New Year (Pohela Boishakh)", date: "2026-04-14", type: "govt", icon: "fa-calendar-alt" },
            { name: "International Mother Language Day", date: "2026-02-21", type: "govt", icon: "fa-language" },
            { name: "Independence Day", date: "2026-03-26", type: "govt", icon: "fa-flag" },
            { name: "Victory Day", date: "2026-12-16", type: "govt", icon: "fa-trophy" },
            { name: "National Mourning Day", date: "2026-08-15", type: "govt", icon: "fa-heart" },
            { name: "Birthday of Sheikh Mujibur Rahman", date: "2026-03-17", type: "govt", icon: "fa-star" },
            { name: "May Day", date: "2026-05-01", type: "govt", icon: "fa-briefcase" },
            { name: "Christmas Day", date: "2026-12-25", type: "govt", icon: "fa-church" },
            { name: "Buddha Purnima", date: "2026-05-01", type: "govt", icon: "fa-pray" }
        ],
        international: [
            { name: "New Year's Day", date: "2026-01-01", type: "international", icon: "fa-glass-cheers" },
            { name: "International Women's Day", date: "2026-03-08", type: "international", icon: "fa-venus" },
            { name: "Earth Day", date: "2026-04-22", type: "international", icon: "fa-globe" },
            { name: "World Environment Day", date: "2026-06-05", type: "international", icon: "fa-leaf" },
            { name: "International Youth Day", date: "2026-08-12", type: "international", icon: "fa-users" },
            { name: "International Day of Peace", date: "2026-09-21", type: "international", icon: "fa-dove" },
            { name: "United Nations Day", date: "2026-10-24", type: "international", icon: "fa-un" },
            { name: "World Children's Day", date: "2026-11-20", type: "international", icon: "fa-child" },
            { name: "Human Rights Day", date: "2026-12-10", type: "international", icon: "fa-gavel" }
        ],
        islamic: [
            { name: "Shab-e-Barat", date: "2026-02-02", type: "islamic", icon: "fa-moon" },
            { name: "Laylatul Qadr", date: "2026-04-16", type: "islamic", icon: "fa-star-of-life" },
            { name: "Eid-ul-Fitr", date: "2026-04-20", type: "islamic", icon: "fa-star-and-crescent" },
            { name: "Eid-ul-Azha", date: "2026-06-27", type: "islamic", icon: "fa-star-and-crescent" },
            { name: "Ashura", date: "2026-07-26", type: "islamic", icon: "fa-hand-holding-heart" },
            { name: "Eid-e-Milad-un-Nabi", date: "2026-09-25", type: "islamic", icon: "fa-praying-hands" }
        ]
    };

    // Helper Functions
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}" style="margin-right: 8px; color: #00C4B4;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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

    function trackEvent(eventName, eventData = {}) {
        if (cookiePreferences.analytics) {
            console.log(`[Analytics] ${eventName}:`, eventData);
        }
    }

    // ========== COOKIE MANAGEMENT SYSTEM ==========
    function initCookieConsent() {
        const cookieBanner = document.getElementById('cookieConsent');
        const acceptBtn = document.getElementById('cookieAcceptBtn');
        const denyBtn = document.getElementById('cookieDenyBtn');
        const settingsBtn = document.getElementById('cookieSettingsBtn');
        const settingsModal = document.getElementById('cookieSettingsModal');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const savePreferencesBtn = document.getElementById('saveCookiePreferencesBtn');
        
        // Load saved preferences
        const savedConsent = localStorage.getItem('cookie_consent_given');
        const savedPreferences = localStorage.getItem('cookie_preferences');
        
        if (savedPreferences) {
            try {
                cookiePreferences = JSON.parse(savedPreferences);
            } catch(e) {
                console.log('Error parsing saved preferences');
            }
        }
        
        // Show banner only if no consent given
        if (!savedConsent) {
            setTimeout(() => {
                if (cookieBanner) cookieBanner.classList.add('show');
            }, 500);
        } else {
            applyCookiePreferences();
        }
        
        // Accept All Cookies
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                cookiePreferences = {
                    essential: true,
                    functional: true,
                    analytics: true,
                    advertising: true
                };
                saveCookiePreferences('all');
                if (cookieBanner) cookieBanner.classList.remove('show');
                showToast('All cookies accepted! Thank you for your preference.', 'success');
                applyCookiePreferences();
            });
        }
        
        // Deny Optional Cookies (only essential)
        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                cookiePreferences = {
                    essential: true,
                    functional: false,
                    analytics: false,
                    advertising: false
                };
                saveCookiePreferences('essential');
                if (cookieBanner) cookieBanner.classList.remove('show');
                showToast('Only essential cookies enabled. You can change this anytime in settings.', 'info');
                applyCookiePreferences();
            });
        }
        
        // Open Settings Modal
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                // Load current preferences into modal
                const functionalToggle = document.getElementById('functionalCookiesToggle');
                const analyticsToggle = document.getElementById('analyticsCookiesToggle');
                const advertisingToggle = document.getElementById('advertisingCookiesToggle');
                
                if (functionalToggle) functionalToggle.checked = cookiePreferences.functional;
                if (analyticsToggle) analyticsToggle.checked = cookiePreferences.analytics;
                if (advertisingToggle) advertisingToggle.checked = cookiePreferences.advertising;
                
                if (settingsModal) settingsModal.classList.add('show');
            });
        }
        
        // Close Settings Modal
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => {
                if (settingsModal) settingsModal.classList.remove('show');
            });
        }
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('show');
            }
        });
        
        // Save Preferences
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', () => {
                const functionalToggle = document.getElementById('functionalCookiesToggle');
                const analyticsToggle = document.getElementById('analyticsCookiesToggle');
                const advertisingToggle = document.getElementById('advertisingCookiesToggle');
                
                cookiePreferences = {
                    essential: true,
                    functional: functionalToggle ? functionalToggle.checked : false,
                    analytics: analyticsToggle ? analyticsToggle.checked : false,
                    advertising: advertisingToggle ? advertisingToggle.checked : false
                };
                
                saveCookiePreferences('custom');
                if (settingsModal) settingsModal.classList.remove('show');
                if (cookieBanner) cookieBanner.classList.remove('show');
                showToast('Your cookie preferences have been saved!', 'success');
                applyCookiePreferences();
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
        console.log('Applying cookie preferences:', cookiePreferences);
        
        // Apply Functional Cookies (remember user preferences)
        if (cookiePreferences.functional) {
            restoreUserPreferences();
        }
        
        // Apply Analytics Cookies
        if (cookiePreferences.analytics) {
            console.log('Analytics tracking enabled');
            initializeAnalytics();
        } else {
            console.log('Analytics tracking disabled');
        }
        
        // Apply Advertising Cookies
        if (cookiePreferences.advertising) {
            console.log('Advertising cookies enabled');
            initializeAdvertising();
        } else {
            console.log('Advertising cookies disabled');
        }
    }
    
    function initializeAnalytics() {
        trackEvent('page_view', { timestamp: new Date().toISOString() });
    }
    
    function initializeAdvertising() {
        console.log('[Advertising] Ads initialized');
    }
    
    function restoreUserPreferences() {
        const lastServer = localStorage.getItem('last_selected_server');
        if (lastServer && !isNaN(parseInt(lastServer))) {
            switchServer(parseInt(lastServer));
        }
    }
    
    function saveLastServer(serverId) {
        if (cookiePreferences.functional) {
            localStorage.setItem('last_selected_server', serverId);
        }
    }
    
    // Cookie Settings Footer Link
    function initCookieSettingsFooter() {
        const cookieSettingsFooter = document.getElementById('cookieSettingsFooter');
        const settingsModal = document.getElementById('cookieSettingsModal');
        
        if (cookieSettingsFooter) {
            cookieSettingsFooter.addEventListener('click', (e) => {
                e.preventDefault();
                // Load current preferences
                const functionalToggle = document.getElementById('functionalCookiesToggle');
                const analyticsToggle = document.getElementById('analyticsCookiesToggle');
                const advertisingToggle = document.getElementById('advertisingCookiesToggle');
                
                if (functionalToggle) functionalToggle.checked = cookiePreferences.functional;
                if (analyticsToggle) analyticsToggle.checked = cookiePreferences.analytics;
                if (advertisingToggle) advertisingToggle.checked = cookiePreferences.advertising;
                
                if (settingsModal) settingsModal.classList.add('show');
            });
        }
    }

    // ========== DATE & TIME FUNCTIONS ==========
    function initFloatingDateTimeBar() {
        if (!datetimeBar) return;
        const originalOffset = datetimeBar.offsetTop;
        
        function checkScroll() {
            if (window.scrollY > originalOffset + 50) {
                datetimeBar.classList.add('floating');
                document.body.classList.add('has-floating-datetime');
            } else {
                datetimeBar.classList.remove('floating');
                document.body.classList.remove('has-floating-datetime');
            }
        }
        
        window.addEventListener('scroll', checkScroll);
        checkScroll();
    }

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        
        if (dateElement) dateElement.textContent = now.toLocaleDateString('en-US', options);
        if (timeElement) timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timezoneElement = document.getElementById('timezone');
        if (timezoneElement) {
            const shortTimezone = timezone.split('/').pop().replace('_', ' ');
            timezoneElement.textContent = shortTimezone;
        }
        
        updateNextHolidayInfo();
    }

    // ========== HOLIDAY FUNCTIONS ==========
    function getAllHolidays() {
        return [...HOLIDAYS.bangladesh, ...HOLIDAYS.international, ...HOLIDAYS.islamic];
    }

    function checkTodayHoliday() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        for (const holiday of getAllHolidays()) {
            if (holiday.date === todayStr) return holiday;
        }
        return null;
    }

    function getNextUpcomingHoliday() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const futureHolidays = getAllHolidays().filter(h => h.date > todayStr);
        futureHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
        return futureHolidays[0] || null;
    }

    function formatShortDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function getDaysRemaining(targetDate) {
        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function updateNextHolidayInfo() {
        const nextHoliday = getNextUpcomingHoliday();
        const nextHolidayElement = document.getElementById('nextHolidayInfo');
        
        if (nextHoliday && nextHolidayElement) {
            const daysLeft = getDaysRemaining(nextHoliday.date);
            if (daysLeft === 1) {
                nextHolidayElement.innerHTML = `Next: ${nextHoliday.name} (Tomorrow)`;
            } else if (daysLeft === 0) {
                nextHolidayElement.innerHTML = `${nextHoliday.name} - TODAY! 🎉`;
            } else {
                nextHolidayElement.innerHTML = `Next: ${nextHoliday.name} (${formatShortDate(nextHoliday.date)}) - ${daysLeft} days left`;
            }
        } else if (nextHolidayElement) {
            nextHolidayElement.innerHTML = `No more holidays in ${CURRENT_YEAR}`;
        }
    }

    function displayCurrentHoliday() {
        const holiday = checkTodayHoliday();
        const displayDiv = document.getElementById('currentHolidayDisplay');
        
        if (holiday && displayDiv) {
            let typeLabel = "";
            if (holiday.type === "govt") typeLabel = "Bangladesh Government Holiday";
            else if (holiday.type === "international") typeLabel = "International Holiday";
            else if (holiday.type === "islamic") typeLabel = "Islamic Holiday";
            
            document.getElementById('currentHolidayName').innerHTML = `${holiday.name}`;
            document.getElementById('currentHolidayType').textContent = typeLabel;
            displayDiv.style.display = 'block';
        } else if (displayDiv) {
            displayDiv.style.display = 'none';
        }
    }

    // ========== STREAMING FUNCTIONS ==========
    function scrollToPlayer() {
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function loadStream(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (server && playerFrame) {
            playerFrame.src = server.url;
            currentChannelNameSpan.innerText = server.name;
            showToast(`Now playing: ${server.name}`, 'success');
        }
    }

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
        
        saveLastServer(serverId);
    }

    function buildChannels() {
        if (!channelsGrid) return;
        channelsGrid.innerHTML = '';
        SERVERS.forEach(server => {
            const card = document.createElement('div');
            card.className = `channel-item ${server.id === activeServerId ? 'active' : ''}`;
            card.dataset.serverId = server.id;
            card.innerHTML = `
                <div class="channel-icon-lg"><i class="fas ${server.icon}"></i></div>
                <div class="channel-name">${escapeHtml(server.name)}</div>
                <div class="channel-quality"><i class="fas fa-circle" style="font-size: 6px; color:#30E3A0;"></i> ${server.quality}</div>
            `;
            card.addEventListener('click', () => switchServer(server.id));
            channelsGrid.appendChild(card);
        });
    }

    // ========== UI FUNCTIONS ==========
    function initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const playerWrapper = document.querySelector('.player-wrapper');
        
        if (fullscreenBtn && playerWrapper) {
            fullscreenBtn.addEventListener('click', () => {
                const iframe = document.getElementById('livePlayerIframe');
                if (iframe.requestFullscreen) iframe.requestFullscreen();
                else if (playerWrapper.requestFullscreen) playerWrapper.requestFullscreen();
            });
        }
        
        document.addEventListener('fullscreenchange', () => {
            isFullscreen = !!document.fullscreenElement;
            const backToTop = document.getElementById('backToTopBtn');
            if (backToTop) backToTop.style.display = isFullscreen ? 'none' : 'flex';
        });
    }

    function initBackToTop() {
        if (!backToTopBtn) return;
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initViewerCounter() {
        const viewerSpan = document.getElementById('liveViewers');
        if (viewerSpan) {
            setInterval(() => {
                let curr = parseInt(viewerSpan.innerText.replace(/,/g, '')) || 1284;
                let change = Math.floor(Math.random() * 15) - 5;
                viewerSpan.innerText = Math.max(800, curr + change).toLocaleString();
            }, 25000);
        }
    }

    // ========== SOCIAL ICONS FUNCTIONALITY ==========
    function initFloatingSocialIcons() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Watch CHALUNG Live TV - Premium HD Streaming!");
        
        const floatingFb = document.getElementById('floatingFb');
        if (floatingFb) {
            floatingFb.addEventListener('click', () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                showToast('Sharing on Facebook', 'info');
            });
        }
        
        const floatingTw = document.getElementById('floatingTw');
        if (floatingTw) {
            floatingTw.addEventListener('click', () => {
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                showToast('Sharing on Twitter', 'info');
            });
        }
        
        const floatingWa = document.getElementById('floatingWa');
        if (floatingWa) {
            floatingWa.addEventListener('click', () => {
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                showToast('Sharing on WhatsApp', 'info');
            });
        }
        
        const floatingLink = document.getElementById('floatingLink');
        if (floatingLink) {
            floatingLink.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('Link copied to clipboard!', 'success');
                }).catch(() => {
                    showToast('Failed to copy link', 'error');
                });
            });
        }
        
        const floatingShare = document.getElementById('floatingShare');
        if (floatingShare) {
            floatingShare.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'CHALUNG Live TV',
                        text: 'Watch premium HD live TV for free!',
                        url: window.location.href
                    }).catch(() => {});
                } else {
                    showToast('Share feature supported on mobile devices', 'info');
                }
            });
        }
        
        const shareFbFooter = document.getElementById('shareFbFooter');
        if (shareFbFooter) {
            shareFbFooter.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            });
        }
        
        const shareTwFooter = document.getElementById('shareTwFooter');
        if (shareTwFooter) {
            shareTwFooter.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
            });
        }
        
        const shareWaFooter = document.getElementById('shareWaFooter');
        if (shareWaFooter) {
            shareWaFooter.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
            });
        }
    }

    function initNavigation() {
        document.querySelectorAll('.nav-links a[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.nav;
                if (target === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
                else if (target === 'channels') document.getElementById('channelsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else if (target === 'features') document.getElementById('featuresSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function initHeroButtons() {
        heroServerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const serverId = parseInt(btn.dataset.server);
                if (!isNaN(serverId)) switchServer(serverId);
            });
        });
    }

    // ========== MODAL FUNCTIONS ==========
    function initModals() {
        // Holidays Modal
        const holidaysBtn = document.getElementById('holidaysLinkBtn');
        const holidaysFooterBtn = document.getElementById('holidaysFooterBtn');
        const holidaysModal = document.getElementById('holidaysModal');
        const closeHolidaysModal = document.getElementById('closeHolidaysModal');
        const closeHolidaysBtn = document.getElementById('closeHolidaysBtn');
        
        const openHolidaysModal = () => {
            buildHolidaysModalContent();
            if (holidaysModal) holidaysModal.classList.add('show');
        };
        
        if (holidaysBtn) holidaysBtn.addEventListener('click', openHolidaysModal);
        if (holidaysFooterBtn) holidaysFooterBtn.addEventListener('click', openHolidaysModal);
        if (closeHolidaysModal) closeHolidaysModal.addEventListener('click', () => holidaysModal.classList.remove('show'));
        if (closeHolidaysBtn) closeHolidaysBtn.addEventListener('click', () => holidaysModal.classList.remove('show'));
        
        // Privacy Modal
        const privacyFooterBtn = document.getElementById('privacyFooterBtn');
        const privacyModal = document.getElementById('privacyModal');
        const closePrivacy = document.getElementById('closePrivacyModal');
        const closePrivacyBtn = document.getElementById('closePrivacyBtn');
        
        const openPrivacy = () => { if (privacyModal) privacyModal.classList.add('show'); };
        if (privacyFooterBtn) privacyFooterBtn.addEventListener('click', openPrivacy);
        if (closePrivacy) closePrivacy.addEventListener('click', () => privacyModal.classList.remove('show'));
        if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.classList.remove('show'));
        
        // Legal Modal
        const legalFooterBtn = document.getElementById('legalFooterBtn');
        const legalModal = document.getElementById('legalModal');
        const closeLegal = document.getElementById('closeLegalModal');
        const closeLegalBtn = document.getElementById('closeLegalBtn');
        
        const openLegal = () => { if (legalModal) legalModal.classList.add('show'); };
        if (legalFooterBtn) legalFooterBtn.addEventListener('click', openLegal);
        if (closeLegal) closeLegal.addEventListener('click', () => legalModal.classList.remove('show'));
        if (closeLegalBtn) closeLegalBtn.addEventListener('click', () => legalModal.classList.remove('show'));
        
        window.addEventListener('click', (e) => {
            if (e.target === holidaysModal) holidaysModal.classList.remove('show');
            if (e.target === privacyModal) privacyModal.classList.remove('show');
            if (e.target === legalModal) legalModal.classList.remove('show');
        });
    }

    function buildHolidaysModalContent() {
        const bangladeshContainer = document.getElementById('bangladeshHolidays');
        const internationalContainer = document.getElementById('internationalHolidays');
        const islamicContainer = document.getElementById('islamicHolidays');
        const currentHighlight = document.getElementById('currentHolidayHighlight');
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentHoliday = checkTodayHoliday();
        const nextHoliday = getNextUpcomingHoliday();
        
        if (currentHoliday && currentHighlight) {
            let holidayTypeLabel = "";
            if (currentHoliday.type === "govt") holidayTypeLabel = "Bangladesh Government Holiday";
            else if (currentHoliday.type === "international") holidayTypeLabel = "International Holiday";
            else if (currentHoliday.type === "islamic") holidayTypeLabel = "Islamic Holiday";
            
            currentHighlight.innerHTML = `
                <i class="fas ${currentHoliday.icon}"></i>
                <h3>${currentHoliday.name}</h3>
                <p>Today is ${holidayTypeLabel}</p>
                <p style="margin-top: 8px;">Enjoy your day!</p>
            `;
        } else if (currentHighlight) {
            if (nextHoliday) {
                const daysLeft = getDaysRemaining(nextHoliday.date);
                currentHighlight.innerHTML = `
                    <i class="fas fa-calendar-day"></i>
                    <h3>Upcoming Holiday</h3>
                    <p><strong>${nextHoliday.name}</strong> on ${formatShortDate(nextHoliday.date)}</p>
                    <p style="margin-top: 8px;">${daysLeft} days to go!</p>
                `;
            } else {
                currentHighlight.innerHTML = `
                    <i class="fas fa-calendar-check"></i>
                    <h3>No More Holidays</h3>
                    <p>All holidays for ${CURRENT_YEAR} have passed.</p>
                `;
            }
        }
        
        const buildList = (container, holidays, typeLabel, typeClass) => {
            if (!container) return;
            container.innerHTML = '';
            holidays.forEach(holiday => {
                const isToday = holiday.date === todayStr;
                const item = document.createElement('div');
                item.className = 'holiday-item';
                if (isToday) item.style.background = 'rgba(0,196,180,0.1)';
                item.innerHTML = `
                    <div class="holiday-name">
                        <i class="fas ${holiday.icon}"></i>
                        <span>${holiday.name} ${isToday ? '<span style="color:#00C4B4;">(Today!)</span>' : ''}</span>
                    </div>
                    <div class="holiday-date">${formatShortDate(holiday.date)}</div>
                    <span class="holiday-type ${typeClass}">${typeLabel}</span>
                `;
                container.appendChild(item);
            });
        };
        
        buildList(bangladeshContainer, HOLIDAYS.bangladesh, "Government", "govt");
        buildList(internationalContainer, HOLIDAYS.international, "International", "international");
        buildList(islamicContainer, HOLIDAYS.islamic, "Islamic", "islamic");
    }

    // ========== INITIALIZATION ==========
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        displayCurrentHoliday();
        
        buildChannels();
        initHeroButtons();
        initFullscreen();
        initBackToTop();
        initViewerCounter();
        initFloatingSocialIcons();
        initNavigation();
        initCookieConsent();
        initCookieSettingsFooter();
        initModals();
        initFloatingDateTimeBar();
        
        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
            currentChannelNameSpan.innerText = SERVERS[0].name;
        }
        
        showToast('Welcome to CHALUNG!', 'success');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();