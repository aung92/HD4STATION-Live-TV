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
    let currentTheme = 'default';
    let snowInterval = null;
    let rippleInterval = null;
    let randomEffectInterval = null;
    let starsInterval = null;
    let windInterval = null;
    let partyInterval = null;
    
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
    const iconsBg = document.getElementById('animatedIconsBg');

    const CURRENT_YEAR = 2026;
    
    // Holiday Icon Sets for different themes
    const HOLIDAY_ICONS = {
        pohela: ['🎨', '🥁', '🎭', '🌸', '🌼', '🎪', '🪘', '🎋', '🏵️', '🌺', '🪔', '🎊'],
        eid: ['🕌', '🌙', '⭐', '🐑', '🐄', '🕋', '📿', '🌟', '✨', '🎇', '🕊️', '🤲'],
        buddha: ['🪷', '🧘', '🙏', '🌸', '🕉️', '☸️', '🏯', '🔔', '📿', '🍃', '🌿', '✨'],
        durga: ['🔱', '🪔', '👁️', '🌸', '🎭', '🕉️', '🔔', '🌺', '🪶', '🎨', '🪘', '🎊'],
        newyear: ['🎆', '🎇', '✨', '🎉', '🎊', '🍾', '🥂', '🕛', '🎈', '🎶', '💫', '🌟'],
        independence: ['🇧🇩', '🟥', '🟢', '⭐', '🏛️', '📜', '🎖️', '🏅', '🌙', '☀️', '🕊️', '🎈'],
        victory: ['🏆', '🇧🇩', '✌️', '🎖️', '🏅', '🎉', '🕊️', '⭐', '🌟', '🏛️', '📜', '🎊'],
        default: ['✨', '⭐', '🌟', '💫', '⚡', '🌀', '🌈', '🎵', '🎶', '💎', '🔮', '🌸']
    };

    const HOLIDAYS = {
        bangladesh: [
            { name: "Pohela Boishakh", date: "2026-04-14", type: "govt", icon: "fa-calendar-alt", theme: "pohela", message: "Shubho Noboborsho! ❤️", bgIcon: "🌸" },
            { name: "International Mother Language Day", date: "2026-02-21", type: "govt", icon: "fa-language", theme: "default", message: "সব ভাষার জন্য ভালোবাসা", bgIcon: "📚" },
            { name: "Independence Day", date: "2026-03-26", type: "govt", icon: "fa-flag", theme: "independence", message: "স্বাধীনতা দিবসের শুভেচ্ছা! 🇧🇩", bgIcon: "🇧🇩" },
            { name: "Victory Day", date: "2026-12-16", type: "govt", icon: "fa-trophy", theme: "victory", message: "বিজয় দিবসের শুভেচ্ছা! 🎉", bgIcon: "🏆" },
            { name: "Buddha Purnima", date: "2026-05-05", type: "govt", icon: "fa-pray", theme: "buddha", message: "Buddha Purnima er Shubhechha! 🪷", bgIcon: "🪷" },
            { name: "Durga Puja", date: "2026-10-20", type: "govt", icon: "fa-pray", theme: "durga", message: "Shubho Durga Puja! 🔱", bgIcon: "🔱" }
        ],
        international: [
            { name: "New Year's Day", date: "2026-01-01", type: "international", icon: "fa-glass-cheers", theme: "newyear", message: "Happy New Year! 🎆", bgIcon: "🎆" }
        ],
        islamic: [
            { name: "Eid-ul-Fitr", date: "2026-04-20", type: "islamic", icon: "fa-star-and-crescent", theme: "eid", message: "Eid Mubarak! 🕌", bgIcon: "🕌" },
            { name: "Eid-ul-Azha", date: "2026-06-27", type: "islamic", icon: "fa-star-and-crescent", theme: "eid", message: "Eid Mubarak! 🕌", bgIcon: "🕌" }
        ]
    };

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

    function updateDevStatus(message) {
        const statusSpan = document.getElementById('devStatusMsg');
        if (statusSpan) {
            statusSpan.innerHTML = message;
            setTimeout(() => {
                if (statusSpan.innerHTML === message) {
                    statusSpan.innerHTML = 'Ready for testing';
                }
            }, 3000);
        }
    }

    // ========== ANIMATED BACKGROUND ICONS ==========
    function generateFloatingIcons(theme) {
        if (!iconsBg) return;
        iconsBg.innerHTML = '';
        
        const icons = HOLIDAY_ICONS[theme] || HOLIDAY_ICONS.default;
        const iconCount = window.innerWidth < 768 ? 30 : 60;
        
        for (let i = 0; i < iconCount; i++) {
            const icon = document.createElement('div');
            icon.className = 'floating-icon';
            icon.innerHTML = icons[Math.floor(Math.random() * icons.length)];
            icon.style.left = Math.random() * 100 + '%';
            icon.style.fontSize = (Math.random() * 30 + 15) + 'px';
            icon.style.animationDelay = Math.random() * 20 + 's';
            icon.style.animationDuration = (Math.random() * 15 + 10) + 's';
            icon.style.opacity = Math.random() * 0.15 + 0.05;
            iconsBg.appendChild(icon);
        }
    }

    // ========== RANDOM CELEBRATION EFFECTS ==========
    function startRandomEffects() {
        if (randomEffectInterval) clearInterval(randomEffectInterval);
        
        const effects = ['snow', 'stars', 'wind', 'party'];
        
        randomEffectInterval = setInterval(() => {
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            if (randomEffect === 'snow') createSnowEffect(5);
            else if (randomEffect === 'stars') createStarsEffect(3);
            else if (randomEffect === 'wind') createWindEffect();
            else if (randomEffect === 'party') createPartyEffect(5);
        }, 8000);
    }

    function createSnowEffect(count = 10) {
        const container = document.getElementById('celebrationEffects');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const snow = document.createElement('div');
            snow.className = 'snow-particle';
            snow.style.left = Math.random() * 100 + '%';
            snow.style.width = Math.random() * 5 + 2 + 'px';
            snow.style.height = snow.style.width;
            snow.style.animationDuration = Math.random() * 3 + 2 + 's';
            snow.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(snow);
            setTimeout(() => snow.remove(), 5000);
        }
    }

    function createStarsEffect(count = 5) {
        const container = document.getElementById('celebrationEffects');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 30 + 15 + 'px';
            star.style.height = star.style.width;
            star.style.animationDuration = Math.random() * 1 + 1 + 's';
            container.appendChild(star);
            setTimeout(() => star.remove(), 2000);
        }
    }

    function createWindEffect() {
        const container = document.getElementById('celebrationEffects');
        if (!container) return;
        
        for (let i = 0; i < 3; i++) {
            const wind = document.createElement('div');
            wind.className = 'wind-particle';
            wind.style.top = Math.random() * 100 + '%';
            wind.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(wind);
            setTimeout(() => wind.remove(), 4000);
        }
    }

    function createPartyEffect(count = 8) {
        const container = document.getElementById('celebrationEffects');
        if (!container) return;
        
        const partyIcons = ['🎉', '🎊', '✨', '⭐', '💫', '🎈', '🎆', '🎇'];
        
        for (let i = 0; i < count; i++) {
            const party = document.createElement('div');
            party.className = 'party-particle';
            party.innerHTML = partyIcons[Math.floor(Math.random() * partyIcons.length)];
            party.style.left = Math.random() * 100 + '%';
            party.style.top = Math.random() * 100 + '%';
            party.style.fontSize = Math.random() * 20 + 15 + 'px';
            party.style.animationDuration = Math.random() * 1.5 + 1 + 's';
            container.appendChild(party);
            setTimeout(() => party.remove(), 2000);
        }
    }

    function createRippleEffect(x, y) {
        const container = document.getElementById('celebrationEffects');
        if (!container) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple-particle';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 2000);
    }

    // ========== THEME MANAGEMENT ==========
    function applyTheme(themeName, holidayMessage = null, bgIcon = null) {
        currentTheme = themeName;
        
        document.body.classList.remove('theme-eid', 'theme-pohela', 'theme-buddha', 'theme-durga', 'theme-newyear', 'theme-independence', 'theme-victory', 'theme-default');
        
        if (themeName !== 'default') {
            document.body.classList.add(`theme-${themeName}`);
        } else {
            document.body.classList.add('theme-default');
        }
        
        generateFloatingIcons(themeName);
        
        if (holidayMessage && bgIcon) {
            const banner = document.getElementById('celebrationBanner');
            const titleEl = document.getElementById('celebrationTitle');
            const msgEl = document.getElementById('celebrationMessage');
            const iconEl = document.getElementById('celebrationIcon');
            if (banner && titleEl && msgEl && iconEl) {
                titleEl.innerHTML = `${bgIcon} ${holidayMessage} ${bgIcon}`;
                msgEl.innerHTML = `Wishing you and your family a wonderful celebration from CHALUNG family!`;
                iconEl.innerHTML = bgIcon;
                banner.style.display = 'block';
                triggerConfetti();
                createPartyEffect(20);
            }
        }
        
        updateDevStatus(`Theme changed to: ${themeName}`);
        showToast(`${getThemeName(themeName)} theme activated!`, 'success');
    }
    
    function getThemeName(theme) {
        const themes = {
            eid: 'Eid',
            pohela: 'Pohela Boishakh',
            buddha: 'Buddha Purnima',
            durga: 'Durga Puja',
            newyear: 'New Year',
            independence: 'Independence Day',
            victory: 'Victory Day',
            default: 'Default'
        };
        return themes[theme] || 'Default';
    }

    // ========== ANIMATION EFFECTS ==========
    function triggerConfetti() {
        canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        canvasConfetti({ particleCount: 100, spread: 100, origin: { y: 0.5, x: 0.3 }, startVelocity: 25 });
        canvasConfetti({ particleCount: 100, spread: 100, origin: { y: 0.5, x: 0.7 }, startVelocity: 25 });
        showToast('🎉 Confetti! Celebration effect triggered!', 'success');
        updateDevStatus('Confetti effect played');
    }
    
    function triggerFireworks() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
        
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            
            const particleCount = 50 * (timeLeft / duration);
            canvasConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
        
        showToast('🎆 Fireworks! Celebration effect triggered!', 'success');
        updateDevStatus('Fireworks effect played');
    }
    
    function startSnowEffect() {
        if (snowInterval) clearInterval(snowInterval);
        snowInterval = setInterval(() => createSnowEffect(15), 500);
        showToast('❄️ Snow Effect Activated!', 'success');
        updateDevStatus('Snow effect started');
    }
    
    function stopSnowEffect() {
        if (snowInterval) {
            clearInterval(snowInterval);
            snowInterval = null;
        }
        updateDevStatus('Snow effect stopped');
    }
    
    function startRippleEffect() {
        document.addEventListener('click', (e) => {
            createRippleEffect(e.clientX, e.clientY);
        });
        showToast('💧 Ripple Effect Activated! Click anywhere!', 'success');
        updateDevStatus('Ripple effect started');
    }
    
    function startPartyMode() {
        if (partyInterval) clearInterval(partyInterval);
        partyInterval = setInterval(() => createPartyEffect(12), 2000);
        showToast('🎊 Party Mode Activated! 🎊', 'success');
        updateDevStatus('Party mode started');
    }
    
    function stopPartyMode() {
        if (partyInterval) {
            clearInterval(partyInterval);
            partyInterval = null;
        }
        updateDevStatus('Party mode stopped');
    }
    
    function startWindEffect() {
        if (windInterval) clearInterval(windInterval);
        windInterval = setInterval(() => createWindEffect(), 3000);
        showToast('💨 Wind Effect Activated!', 'success');
        updateDevStatus('Wind effect started');
    }
    
    function stopWindEffect() {
        if (windInterval) {
            clearInterval(windInterval);
            windInterval = null;
        }
        updateDevStatus('Wind effect stopped');
    }
    
    function startStarsEffect() {
        if (starsInterval) clearInterval(starsInterval);
        starsInterval = setInterval(() => createStarsEffect(8), 2000);
        showToast('⭐ Stars Effect Activated!', 'success');
        updateDevStatus('Stars effect started');
    }
    
    function stopStarsEffect() {
        if (starsInterval) {
            clearInterval(starsInterval);
            starsInterval = null;
        }
        updateDevStatus('Stars effect stopped');
    }

    // ========== DEVELOPER SECTION ==========
    function initDeveloperSection() {
        const devToggleBtn = document.getElementById('devToggleBtn');
        const devPanel = document.getElementById('devPanel');
        const devCloseBtn = document.getElementById('devCloseBtn');
        
        if (devToggleBtn && devPanel) {
            devToggleBtn.addEventListener('click', () => {
                devPanel.classList.toggle('show');
            });
        }
        
        if (devCloseBtn && devPanel) {
            devCloseBtn.addEventListener('click', () => {
                devPanel.classList.remove('show');
            });
        }
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
                if (devPanel) devPanel.classList.remove('show');
            });
        });
        
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const effect = btn.dataset.effect;
                if (effect === 'confetti') triggerConfetti();
                else if (effect === 'fireworks') triggerFireworks();
                else if (effect === 'snow') startSnowEffect();
                else if (effect === 'ripple') startRippleEffect();
                else if (effect === 'party') startPartyMode();
                else if (effect === 'wind') startWindEffect();
                else if (effect === 'stars') startStarsEffect();
                if (devPanel) devPanel.classList.remove('show');
            });
        });
        
        const resetThemeBtn = document.getElementById('resetThemeBtn');
        if (resetThemeBtn) {
            resetThemeBtn.addEventListener('click', () => {
                applyTheme('default');
                if (snowInterval) clearInterval(snowInterval);
                if (partyInterval) clearInterval(partyInterval);
                if (windInterval) clearInterval(windInterval);
                if (starsInterval) clearInterval(starsInterval);
                updateDevStatus('All settings reset to default');
                if (devPanel) devPanel.classList.remove('show');
                showToast('All themes and effects reset!', 'success');
            });
        }
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

    // Date & Time Functions
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
        updateCountdownTimer();
    }

    function getAllHolidays() {
        return [...HOLIDAYS.bangladesh, ...HOLIDAYS.international, ...HOLIDAYS.islamic];
    }

    function checkTodayHoliday() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        for (const holiday of getAllHolidays()) {
            if (holiday.date === todayStr) {
                return holiday;
            }
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

    function getTimeRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;
        
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    }

    function updateCountdownTimer() {
        const nextHoliday = getNextUpcomingHoliday();
        if (nextHoliday) {
            const remaining = getTimeRemaining(nextHoliday.date);
            const daysEl = document.getElementById('countdownDaysValue');
            const hoursEl = document.getElementById('countdownHoursValue');
            const minsEl = document.getElementById('countdownMinutesValue');
            const secsEl = document.getElementById('countdownSecondsValue');
            const nameEl = document.getElementById('countdownHolidayName');
            
            if (daysEl) daysEl.textContent = String(remaining.days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(remaining.hours).padStart(2, '0');
            if (minsEl) minsEl.textContent = String(remaining.minutes).padStart(2, '0');
            if (secsEl) secsEl.textContent = String(remaining.seconds).padStart(2, '0');
            if (nameEl) nameEl.textContent = nextHoliday.name;
        }
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
        const celebrationBanner = document.getElementById('celebrationBanner');
        
        if (holiday && displayDiv) {
            let typeLabel = "";
            if (holiday.type === "govt") typeLabel = "Bangladesh Government Holiday";
            else if (holiday.type === "international") typeLabel = "International Holiday";
            else if (holiday.type === "islamic") typeLabel = "Islamic Holiday";
            
            const nameEl = document.getElementById('currentHolidayName');
            const typeEl = document.getElementById('currentHolidayType');
            if (nameEl) nameEl.innerHTML = holiday.name;
            if (typeEl) typeEl.textContent = typeLabel;
            displayDiv.style.display = 'block';
            
            if (holiday.theme && holiday.theme !== 'default') {
                applyTheme(holiday.theme, holiday.message, holiday.bgIcon);
            }
            
            if (celebrationBanner) {
                const titleEl = document.getElementById('celebrationTitle');
                const msgEl = document.getElementById('celebrationMessage');
                const iconEl = document.getElementById('celebrationIcon');
                if (titleEl) titleEl.innerHTML = `${holiday.bgIcon || '🎉'} ${holiday.message || `Happy ${holiday.name}!`} ${holiday.bgIcon || '🎉'}`;
                if (msgEl) msgEl.innerHTML = `Wishing you and your family a wonderful celebration from CHALUNG family!`;
                if (iconEl) iconEl.innerHTML = holiday.bgIcon || '🎉';
                celebrationBanner.style.display = 'block';
                triggerConfetti();
                createPartyEffect(20);
            }
        } else if (displayDiv) {
            displayDiv.style.display = 'none';
        }
    }

    const closeCelebration = document.getElementById('closeCelebration');
    if (closeCelebration) {
        closeCelebration.addEventListener('click', () => {
            const banner = document.getElementById('celebrationBanner');
            if (banner) banner.style.display = 'none';
        });
    }

    // Streaming Functions
    function scrollToPlayer() {
        if (playerSection) playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function loadStream(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (server && playerFrame) {
            playerFrame.src = server.url;
            if (currentChannelNameSpan) currentChannelNameSpan.innerText = server.name;
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
            if (btnId === serverId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.channel-item').forEach(card => {
            const cardId = parseInt(card.dataset.serverId);
            if (cardId === serverId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        if (cookiePreferences.functional) {
            localStorage.setItem('last_selected_server', serverId);
        }
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

    // Social Icons
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

    // Modals
    function initModals() {
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
        
        const privacyFooterBtn = document.getElementById('privacyFooterBtn');
        const privacyModal = document.getElementById('privacyModal');
        const closePrivacy = document.getElementById('closePrivacyModal');
        const closePrivacyBtn = document.getElementById('closePrivacyBtn');
        
        const openPrivacy = () => { if (privacyModal) privacyModal.classList.add('show'); };
        if (privacyFooterBtn) privacyFooterBtn.addEventListener('click', openPrivacy);
        if (closePrivacy) closePrivacy.addEventListener('click', () => privacyModal.classList.remove('show'));
        if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.classList.remove('show'));
        
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

    // Cookie Consent
    function initCookieConsent() {
        const savedConsent = localStorage.getItem('cookie_consent_given');
        const cookieBanner = document.getElementById('cookieConsent');
        
        if (!savedConsent && cookieBanner) {
            setTimeout(() => cookieBanner.classList.add('show'), 500);
        }
        
        const acceptBtn = document.getElementById('cookieAcceptBtn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookie_consent_given', 'true');
                if (cookieBanner) cookieBanner.classList.remove('show');
                showToast('Cookies accepted!', 'success');
            });
        }
        
        const denyBtn = document.getElementById('cookieDenyBtn');
        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                localStorage.setItem('cookie_consent_given', 'true');
                if (cookieBanner) cookieBanner.classList.remove('show');
                showToast('Only essential cookies enabled', 'info');
            });
        }
        
        const settingsBtn = document.getElementById('cookieSettingsBtn');
        const settingsModal = document.getElementById('cookieSettingsModal');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const savePrefsBtn = document.getElementById('saveCookiePreferencesBtn');
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
        }
        if (closeSettingsModal && settingsModal) {
            closeSettingsModal.addEventListener('click', () => settingsModal.classList.remove('show'));
        }
        if (savePrefsBtn && settingsModal) {
            savePrefsBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
        }
        
        const cookieSettingsFooter = document.getElementById('cookieSettingsFooter');
        if (cookieSettingsFooter && settingsModal) {
            cookieSettingsFooter.addEventListener('click', (e) => {
                e.preventDefault();
                settingsModal.classList.add('show');
            });
        }
    }

    // ========== INITIALIZATION ==========
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        setInterval(updateCountdownTimer, 1000);
        
        displayCurrentHoliday();
        generateFloatingIcons('default');
        startRandomEffects();
        
        buildChannels();
        initHeroButtons();
        initFullscreen();
        initBackToTop();
        initViewerCounter();
        initFloatingSocialIcons();
        initNavigation();
        initCookieConsent();
        initModals();
        initFloatingDateTimeBar();
        initDeveloperSection();
        
        if (playerFrame && SERVERS[0]) {
            playerFrame.src = SERVERS[0].url;
            if (currentChannelNameSpan) currentChannelNameSpan.innerText = SERVERS[0].name;
        }
        
        showToast('Welcome to CHALUNG! 🎬', 'success');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();