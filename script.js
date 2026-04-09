(function() {
    const SERVERS = [
        { id: 0, name: 'Mirraby Stream', url: 'https://web.mswott.net/p?url=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__src=https%3A%2F%2Fmirraby.mswott.top%2FMSW%2FNai%2Fkhai%2Ffaka.php&__type=document', icon: 'fa-play-circle', quality: 'HD 1080p' },
        { id: 1, name: 'Ash TV Bangladesh', url: 'https://web.mswott.net/p?url=http%3A%2F%2F103.144.89.251%2F&__src=http%3A%2F%2F103.144.89.251%2F&__type=document', icon: 'fa-tower-broadcast', quality: 'HD Live' }
    ];

    let activeServerId = 0;
    let isFullscreen = false;
    let currentTheme = 'default';
    let snowInterval = null;
    let randomEffectInterval = null;
    let starsInterval = null;
    let windInterval = null;
    let partyInterval = null;
    let cookiePreferences = { functional: true, analytics: true, advertising: true, essential: true };
    let selectedAmount = null;
    let selectedMethod = null;

    const playerFrame = document.getElementById('livePlayerIframe');
    const channelsGrid = document.getElementById('channelsGrid');
    const currentChannelNameSpan = document.getElementById('currentChannelName');
    const heroServerBtns = document.querySelectorAll('#heroServerSelector .server-btn-hero');
    const playerSection = document.getElementById('playerSection');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const datetimeBar = document.getElementById('datetimeBar');
    const iconsBg = document.getElementById('animatedIconsBg');

    const CURRENT_YEAR = 2026;
    
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
        international: [{ name: "New Year's Day", date: "2026-01-01", type: "international", icon: "fa-glass-cheers", theme: "newyear", message: "Happy New Year! 🎆", bgIcon: "🎆" }],
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

    function showDonationToast() {
        const toast = document.getElementById('donationToast');
        if (toast) { toast.style.display = 'block'; setTimeout(() => { toast.style.display = 'none'; }, 3000); }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : m === '>' ? '&gt;' : m);
    }

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

    function applyTheme(themeName, holidayMessage = null, bgIcon = null) {
        currentTheme = themeName;
        document.body.classList.remove('theme-eid', 'theme-pohela', 'theme-buddha', 'theme-durga', 'theme-newyear', 'theme-independence', 'theme-victory', 'theme-default');
        if (themeName !== 'default') document.body.classList.add(`theme-${themeName}`);
        else document.body.classList.add('theme-default');
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
        showToast(`${getThemeName(themeName)} theme activated!`, 'success');
    }

    function getThemeName(theme) {
        const themes = { eid: 'Eid', pohela: 'Pohela Boishakh', buddha: 'Buddha Purnima', durga: 'Durga Puja', newyear: 'New Year', independence: 'Independence Day', victory: 'Victory Day', default: 'Default' };
        return themes[theme] || 'Default';
    }

    function triggerConfetti() {
        canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        canvasConfetti({ particleCount: 100, spread: 100, origin: { y: 0.5, x: 0.3 }, startVelocity: 25 });
        canvasConfetti({ particleCount: 100, spread: 100, origin: { y: 0.5, x: 0.7 }, startVelocity: 25 });
        showToast('🎉 Confetti! Celebration effect triggered!', 'success');
    }

    function triggerFireworks() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            canvasConfetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() - 0.2 } });
        }, 250);
        showToast('🎆 Fireworks! Celebration effect triggered!', 'success');
    }

    function startSnowEffect() { if (snowInterval) clearInterval(snowInterval); snowInterval = setInterval(() => createSnowEffect(15), 500); showToast('❄️ Snow Effect Activated!', 'success'); }
    function startPartyMode() { if (partyInterval) clearInterval(partyInterval); partyInterval = setInterval(() => createPartyEffect(12), 2000); showToast('🎊 Party Mode Activated! 🎊', 'success'); }
    function startWindEffect() { if (windInterval) clearInterval(windInterval); windInterval = setInterval(() => createWindEffect(), 3000); showToast('💨 Wind Effect Activated!', 'success'); }
    function startStarsEffect() { if (starsInterval) clearInterval(starsInterval); starsInterval = setInterval(() => createStarsEffect(8), 2000); showToast('⭐ Stars Effect Activated!', 'success'); }

    // Reviews System
    let reviews = [];
    let reviewIdCounter = 0;

    function loadReviews() {
        const savedReviews = localStorage.getItem('chalung_reviews');
        if (savedReviews) {
            reviews = JSON.parse(savedReviews);
            reviewIdCounter = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 0;
        } else {
            reviews = [
                { id: 0, name: "Md. Rahim", rating: 5, text: "Excellent streaming quality! The HD channels are crystal clear and there's no buffering at all. Highly recommended!", date: "2024-03-15", recommend: "yes", helpful: 12 },
                { id: 1, name: "Sadia Akter", rating: 4, text: "Great service! Love the variety of channels. The holiday themes are beautiful. Sometimes the server switches but overall good experience.", date: "2024-03-10", recommend: "yes", helpful: 8 },
                { id: 2, name: "Karim from Chittagong", rating: 5, text: "Best free live TV platform in Bangladesh! The Pohela Boishakh theme was amazing. Keep up the good work!", date: "2024-03-05", recommend: "yes", helpful: 15 }
            ];
            saveReviews();
            reviewIdCounter = 3;
        }
        displayReviews();
        updateReviewStats();
    }

    function saveReviews() { localStorage.setItem('chalung_reviews', JSON.stringify(reviews)); }

    function displayReviews() {
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (!reviewsGrid) return;
        if (reviews.length === 0) {
            reviewsGrid.innerHTML = `<div class="empty-reviews"><i class="fas fa-star"></i><p>No reviews yet. Be the first to share your experience!</p></div>`;
            return;
        }
        reviewsGrid.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header"><div class="reviewer-info"><div class="reviewer-avatar">${review.name.charAt(0).toUpperCase()}</div><div><div class="reviewer-name">${escapeHtml(review.name)}</div><div class="review-date">${new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div></div></div><div class="review-stars">${generateStarHTML(review.rating)}</div></div>
                <div class="review-text">${escapeHtml(review.text)}</div>
                <div class="review-footer"><span class="recommend-badge ${review.recommend}">${review.recommend === 'yes' ? '✅ Would recommend' : review.recommend === 'maybe' ? '🤔 Might recommend' : '❌ Would not recommend'}</span><button class="helpful-btn" data-id="${review.id}"><i class="far fa-thumbs-up"></i> Helpful (${review.helpful || 0})</button></div>
            </div>
        `).join('');
        document.querySelectorAll('.helpful-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const review = reviews.find(r => r.id === id);
                if (review) { review.helpful = (review.helpful || 0) + 1; saveReviews(); displayReviews(); showToast('Thanks for your feedback!', 'success'); }
            });
        });
    }

    function generateStarHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        return stars;
    }

    function updateReviewStats() {
        const total = reviews.length;
        const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
        const recommendCount = reviews.filter(r => r.recommend === 'yes').length;
        const satisfaction = total > 0 ? Math.round((recommendCount / total) * 100) : 0;
        document.getElementById('avgRating').textContent = avg;
        document.getElementById('totalReviews').textContent = total;
        document.getElementById('satisfactionRate').textContent = satisfaction;
        const starsDisplay = document.getElementById('avgStarsDisplay');
        if (starsDisplay) {
            starsDisplay.innerHTML = '';
            for (let i = 1; i <= 5; i++) starsDisplay.innerHTML += i <= Math.round(avg) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }
    }

    // Hire & Donate Modals
    function initHireDonateModals() {
        const hireBtn = document.getElementById('hireBtn'), donateBtn = document.getElementById('donateBtn');
        const hireModal = document.getElementById('hireModal'), donateModal = document.getElementById('donateModal');
        const closeHire = document.getElementById('closeHireModal'), closeHireBtn = document.getElementById('hireModalCloseBtn');
        const closeDonate = document.getElementById('closeDonateModal'), closeDonateBtn = document.getElementById('donateModalCloseBtn');
        
        if (hireBtn && hireModal) hireBtn.addEventListener('click', () => hireModal.classList.add('show'));
        if (donateBtn && donateModal) donateBtn.addEventListener('click', () => { donateModal.classList.add('show'); resetDonationSelection(); });
        const closeHireModal = () => hireModal.classList.remove('show');
        const closeDonateModal = () => donateModal.classList.remove('show');
        if (closeHire) closeHire.addEventListener('click', closeHireModal);
        if (closeHireBtn) closeHireBtn.addEventListener('click', closeHireModal);
        if (closeDonate) closeDonate.addEventListener('click', closeDonateModal);
        if (closeDonateBtn) closeDonateBtn.addEventListener('click', closeDonateModal);
        window.addEventListener('click', (e) => { if (e.target === hireModal) hireModal.classList.remove('show'); if (e.target === donateModal) donateModal.classList.remove('show'); });
        
        const amountBtns = document.querySelectorAll('.amount-btn');
        const customAmountInput = document.getElementById('customAmountInput');
        const customAmountField = document.getElementById('customAmount');
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                amountBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const amount = btn.dataset.amount;
                if (amount === 'custom') { customAmountInput.style.display = 'block'; selectedAmount = null; }
                else { customAmountInput.style.display = 'none'; selectedAmount = parseInt(amount); }
                updateDonationSummary();
            });
        });
        if (customAmountField) {
            customAmountField.addEventListener('input', () => {
                const val = parseInt(customAmountField.value);
                selectedAmount = (!isNaN(val) && val > 0) ? val : null;
                updateDonationSummary();
            });
        }
        
        const paymentBtns = document.querySelectorAll('.payment-btn');
        const bankInfo = document.getElementById('bankInfo');
        const mobileInfo = document.getElementById('mobileInfo');
        paymentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                paymentBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedMethod = btn.dataset.method;
                if (bankInfo) bankInfo.style.display = 'none';
                if (mobileInfo) mobileInfo.style.display = 'none';
                if (selectedMethod === 'bkash' || selectedMethod === 'nagad' || selectedMethod === 'rocket') { if (mobileInfo) mobileInfo.style.display = 'block'; }
                else if (selectedMethod === 'card') { if (bankInfo) bankInfo.style.display = 'block'; }
                updateDonationSummary();
            });
        });
        
        const confirmBtn = document.getElementById('confirmDonateBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (selectedAmount && selectedMethod) { showDonationToast(); showToast(`Thank you for your ${selectedAmount} ৳ donation! ❤️`, 'success'); setTimeout(() => { donateModal.classList.remove('show'); resetDonationSelection(); }, 2000); }
                else { showToast('Please select amount and payment method', 'info'); }
            });
        }
    }

    function resetDonationSelection() {
        selectedAmount = null; selectedMethod = null;
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        const customInput = document.getElementById('customAmountInput');
        if (customInput) customInput.style.display = 'none';
        const customField = document.getElementById('customAmount');
        if (customField) customField.value = '';
        document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
        const bankInfo = document.getElementById('bankInfo');
        const mobileInfo = document.getElementById('mobileInfo');
        if (bankInfo) bankInfo.style.display = 'none';
        if (mobileInfo) mobileInfo.style.display = 'none';
        const summary = document.getElementById('donationSummary');
        if (summary) summary.style.display = 'none';
    }

    function updateDonationSummary() {
        const summary = document.getElementById('donationSummary');
        const displayAmount = document.getElementById('displayAmount');
        const displayMethod = document.getElementById('displayMethod');
        if (summary && displayAmount && displayMethod) {
            if (selectedAmount && selectedMethod) {
                displayAmount.textContent = selectedAmount;
                let methodName = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'Credit/Debit Card' }[selectedMethod] || selectedMethod;
                displayMethod.textContent = methodName;
                summary.style.display = 'block';
            } else { summary.style.display = 'none'; }
        }
    }

    // Review Modal
    function initReviewModal() {
        const writeReviewBtn = document.getElementById('writeReviewBtn');
        const reviewsLinkBtn = document.getElementById('reviewsLinkBtn');
        const reviewsFooterBtn = document.getElementById('reviewsFooterBtn');
        const reviewModal = document.getElementById('reviewModal');
        const closeReviewModal = document.getElementById('closeReviewModal');
        const cancelReviewBtn = document.getElementById('cancelReviewBtn');
        const submitReviewBtn = document.getElementById('submitReviewBtn');
        const starRatingDiv = document.getElementById('starRating');
        const selectedRatingInput = document.getElementById('selectedRating');
        let currentRating = 0;
        
        const openReviewModal = () => {
            reviewModal.classList.add('show');
            document.getElementById('reviewerName').value = '';
            document.getElementById('reviewText').value = '';
            document.querySelectorAll('input[name="recommend"]').forEach(radio => radio.checked = false);
            currentRating = 0; selectedRatingInput.value = 0;
            document.querySelectorAll('#starRating i').forEach(star => { star.classList.remove('active', 'fas'); star.classList.add('far'); });
        };
        if (writeReviewBtn) writeReviewBtn.addEventListener('click', openReviewModal);
        if (reviewsLinkBtn) reviewsLinkBtn.addEventListener('click', () => document.getElementById('reviewsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        if (reviewsFooterBtn) reviewsFooterBtn.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('reviewsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        
        const closeModal = () => reviewModal.classList.remove('show');
        if (closeReviewModal) closeReviewModal.addEventListener('click', closeModal);
        if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeModal);
        
        if (starRatingDiv) {
            const stars = starRatingDiv.querySelectorAll('i');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    currentRating = rating;
                    selectedRatingInput.value = rating;
                    stars.forEach((s, idx) => {
                        if (idx < rating) { s.classList.remove('far'); s.classList.add('fas', 'active'); }
                        else { s.classList.remove('fas', 'active'); s.classList.add('far'); }
                    });
                });
                star.addEventListener('mouseenter', () => {
                    const rating = parseInt(star.dataset.rating);
                    stars.forEach((s, idx) => {
                        if (idx < rating) { s.classList.remove('far'); s.classList.add('fas'); }
                        else { s.classList.remove('fas'); s.classList.add('far'); }
                    });
                });
                star.addEventListener('mouseleave', () => {
                    stars.forEach((s, idx) => {
                        if (idx < currentRating) { s.classList.remove('far'); s.classList.add('fas'); }
                        else { s.classList.remove('fas'); s.classList.add('far'); }
                    });
                });
            });
        }
        
        if (submitReviewBtn) {
            submitReviewBtn.addEventListener('click', () => {
                const name = document.getElementById('reviewerName').value.trim();
                const reviewText = document.getElementById('reviewText').value.trim();
                const recommend = document.querySelector('input[name="recommend"]:checked')?.value;
                if (currentRating === 0) { showToast('Please select a rating', 'info'); return; }
                if (!reviewText) { showToast('Please write your review', 'info'); return; }
                const newReview = { id: reviewIdCounter++, name: name || 'Anonymous User', rating: currentRating, text: reviewText, date: new Date().toISOString().split('T')[0], recommend: recommend || 'maybe', helpful: 0 };
                reviews.unshift(newReview);
                saveReviews();
                displayReviews();
                updateReviewStats();
                closeModal();
                showToast('Thank you for your review! ❤️', 'success');
                triggerConfetti();
            });
        }
    }

    // Date & Time
    function initFloatingDateTimeBar() {
        if (!datetimeBar) return;
        const originalOffset = datetimeBar.offsetTop;
        function checkScroll() {
            if (window.scrollY > originalOffset + 50) { datetimeBar.classList.add('floating'); document.body.classList.add('has-floating-datetime'); }
            else { datetimeBar.classList.remove('floating'); document.body.classList.remove('has-floating-datetime'); }
        }
        window.addEventListener('scroll', checkScroll); checkScroll();
    }

    function updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        document.getElementById('timezone').textContent = timezone.split('/').pop().replace('_', ' ');
        updateNextHolidayInfo();
        updateCountdownTimer();
    }

    function getAllHolidays() { return [...HOLIDAYS.bangladesh, ...HOLIDAYS.international, ...HOLIDAYS.islamic]; }
    function checkTodayHoliday() { const todayStr = new Date().toISOString().split('T')[0]; return getAllHolidays().find(h => h.date === todayStr) || null; }
    function getNextUpcomingHoliday() { const todayStr = new Date().toISOString().split('T')[0]; const future = getAllHolidays().filter(h => h.date > todayStr).sort((a,b) => new Date(a.date) - new Date(b.date)); return future[0] || null; }
    function formatShortDate(dateStr) { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    function getDaysRemaining(targetDate) { return Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)); }
    function getTimeRemaining(targetDate) {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
    }
    function updateCountdownTimer() {
        const next = getNextUpcomingHoliday();
        if (next) {
            const r = getTimeRemaining(next.date);
            document.getElementById('countdownDaysValue').textContent = String(r.days).padStart(2,'0');
            document.getElementById('countdownHoursValue').textContent = String(r.hours).padStart(2,'0');
            document.getElementById('countdownMinutesValue').textContent = String(r.minutes).padStart(2,'0');
            document.getElementById('countdownSecondsValue').textContent = String(r.seconds).padStart(2,'0');
            document.getElementById('countdownHolidayName').textContent = next.name;
        }
    }
    function updateNextHolidayInfo() {
        const next = getNextUpcomingHoliday();
        const el = document.getElementById('nextHolidayInfo');
        if (next && el) {
            const days = getDaysRemaining(next.date);
            if (days === 1) el.innerHTML = `Next: ${next.name} (Tomorrow)`;
            else if (days === 0) el.innerHTML = `${next.name} - TODAY! 🎉`;
            else el.innerHTML = `Next: ${next.name} (${formatShortDate(next.date)}) - ${days} days left`;
        } else if (el) el.innerHTML = `No more holidays in ${CURRENT_YEAR}`;
    }
    function displayCurrentHoliday() {
        const holiday = checkTodayHoliday();
        const displayDiv = document.getElementById('currentHolidayDisplay');
        if (holiday && displayDiv) {
            document.getElementById('currentHolidayName').innerHTML = holiday.name;
            document.getElementById('currentHolidayType').textContent = holiday.type === 'govt' ? 'Bangladesh Government Holiday' : holiday.type === 'international' ? 'International Holiday' : 'Islamic Holiday';
            displayDiv.style.display = 'block';
            if (holiday.theme && holiday.theme !== 'default') applyTheme(holiday.theme, holiday.message, holiday.bgIcon);
        } else if (displayDiv) displayDiv.style.display = 'none';
    }

    // Streaming Functions
    function scrollToPlayer() { playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    function loadStream(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (server && playerFrame) { playerFrame.src = server.url; currentChannelNameSpan.innerText = server.name; showToast(`Now playing: ${server.name}`, 'success'); }
    }
    function switchServer(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) return;
        activeServerId = serverId;
        loadStream(serverId);
        scrollToPlayer();
        heroServerBtns.forEach(btn => { const id = parseInt(btn.dataset.server); btn.classList.toggle('active', id === serverId); });
        document.querySelectorAll('.channel-item').forEach(card => { const id = parseInt(card.dataset.serverId); card.classList.toggle('active', id === serverId); });
        if (cookiePreferences.functional) localStorage.setItem('last_selected_server', serverId);
    }
    function buildChannels() {
        if (!channelsGrid) return;
        channelsGrid.innerHTML = '';
        SERVERS.forEach(server => {
            const card = document.createElement('div');
            card.className = `channel-item ${server.id === activeServerId ? 'active' : ''}`;
            card.dataset.serverId = server.id;
            card.innerHTML = `<div class="channel-icon-lg"><i class="fas ${server.icon}"></i></div><div class="channel-name">${escapeHtml(server.name)}</div><div class="channel-quality"><i class="fas fa-circle" style="font-size:6px; color:#30E3A0;"></i> ${server.quality}</div>`;
            card.addEventListener('click', () => switchServer(server.id));
            channelsGrid.appendChild(card);
        });
    }

    // UI Functions
    function initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const playerWrapper = document.querySelector('.player-wrapper');
        if (fullscreenBtn && playerWrapper) fullscreenBtn.addEventListener('click', () => { const iframe = document.getElementById('livePlayerIframe'); if (iframe.requestFullscreen) iframe.requestFullscreen(); else if (playerWrapper.requestFullscreen) playerWrapper.requestFullscreen(); });
        document.addEventListener('fullscreenchange', () => { isFullscreen = !!document.fullscreenElement; if (backToTopBtn) backToTopBtn.style.display = isFullscreen ? 'none' : 'flex'; });
    }
    function initBackToTop() {
        if (!backToTopBtn) return;
        window.addEventListener('scroll', () => backToTopBtn.classList.toggle('show', window.scrollY > 300));
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    function initViewerCounter() {
        const viewerSpan = document.getElementById('liveViewers');
        if (viewerSpan) setInterval(() => { let curr = parseInt(viewerSpan.innerText.replace(/,/g,'')) || 1284; viewerSpan.innerText = Math.max(800, curr + Math.floor(Math.random() * 15) - 5).toLocaleString(); }, 25000);
    }

    // Social Icons
    function initFloatingSocialIcons() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Watch CHALUNG Live TV - Premium HD Streaming!");
        const shareActions = [
            { id: 'floatingFb', link: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
            { id: 'floatingTw', link: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
            { id: 'floatingWa', link: `https://wa.me/?text=${text}%20${url}` }
        ];
        shareActions.forEach(a => { const btn = document.getElementById(a.id); if (btn) btn.addEventListener('click', () => { window.open(a.link, '_blank'); showToast(`Sharing on ${a.id.replace('floating', '')}`, 'info'); }); });
        const floatingLink = document.getElementById('floatingLink');
        if (floatingLink) floatingLink.addEventListener('click', () => { navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied to clipboard!', 'success')).catch(() => showToast('Failed to copy link', 'error')); });
        const floatingShare = document.getElementById('floatingShare');
        if (floatingShare) floatingShare.addEventListener('click', () => { if (navigator.share) navigator.share({ title: 'CHALUNG Live TV', text: 'Watch premium HD live TV for free!', url: window.location.href }).catch(()=>{}); else showToast('Share feature supported on mobile devices', 'info'); });
        ['shareFbFooter', 'shareTwFooter', 'shareWaFooter'].forEach((id,i) => { const btn = document.getElementById(id); if(btn) btn.addEventListener('click',(e)=>{ e.preventDefault(); window.open(shareActions[i].link,'_blank'); }); });
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
    function initHeroButtons() { heroServerBtns.forEach(btn => btn.addEventListener('click', () => { const id = parseInt(btn.dataset.server); if (!isNaN(id)) switchServer(id); })); }

    // Modals
    function initModals() {
        const holidaysBtn = document.getElementById('holidaysLinkBtn'), holidaysFooterBtn = document.getElementById('holidaysFooterBtn'), holidaysModal = document.getElementById('holidaysModal');
        const closeHolidaysModal = document.getElementById('closeHolidaysModal'), closeHolidaysBtn = document.getElementById('closeHolidaysBtn');
        const openHolidaysModal = () => { buildHolidaysModalContent(); holidaysModal.classList.add('show'); };
        if (holidaysBtn) holidaysBtn.addEventListener('click', openHolidaysModal);
        if (holidaysFooterBtn) holidaysFooterBtn.addEventListener('click', openHolidaysModal);
        if (closeHolidaysModal) closeHolidaysModal.addEventListener('click', () => holidaysModal.classList.remove('show'));
        if (closeHolidaysBtn) closeHolidaysBtn.addEventListener('click', () => holidaysModal.classList.remove('show'));
        
        const privacyFooterBtn = document.getElementById('privacyFooterBtn'), privacyModal = document.getElementById('privacyModal'), closePrivacy = document.getElementById('closePrivacyModal'), closePrivacyBtn = document.getElementById('closePrivacyBtn');
        if (privacyFooterBtn) privacyFooterBtn.addEventListener('click', () => privacyModal.classList.add('show'));
        if (closePrivacy) closePrivacy.addEventListener('click', () => privacyModal.classList.remove('show'));
        if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.classList.remove('show'));
        
        const legalFooterBtn = document.getElementById('legalFooterBtn'), legalModal = document.getElementById('legalModal'), closeLegal = document.getElementById('closeLegalModal'), closeLegalBtn = document.getElementById('closeLegalBtn');
        if (legalFooterBtn) legalFooterBtn.addEventListener('click', () => legalModal.classList.add('show'));
        if (closeLegal) closeLegal.addEventListener('click', () => legalModal.classList.remove('show'));
        if (closeLegalBtn) closeLegalBtn.addEventListener('click', () => legalModal.classList.remove('show'));
        
        window.addEventListener('click', (e) => { if (e.target === holidaysModal) holidaysModal.classList.remove('show'); if (e.target === privacyModal) privacyModal.classList.remove('show'); if (e.target === legalModal) legalModal.classList.remove('show'); });
    }

    function buildHolidaysModalContent() {
        const bangladeshContainer = document.getElementById('bangladeshHolidays'), internationalContainer = document.getElementById('internationalHolidays'), islamicContainer = document.getElementById('islamicHolidays'), currentHighlight = document.getElementById('currentHolidayHighlight');
        const today = new Date(), todayStr = today.toISOString().split('T')[0], currentHoliday = checkTodayHoliday(), nextHoliday = getNextUpcomingHoliday();
        if (currentHoliday && currentHighlight) currentHighlight.innerHTML = `<i class="fas ${currentHoliday.icon}"></i><h3>${currentHoliday.name}</h3><p>Today is ${currentHoliday.type === 'govt' ? 'Bangladesh Government Holiday' : currentHoliday.type === 'international' ? 'International Holiday' : 'Islamic Holiday'}</p><p style="margin-top:8px;">Enjoy your day!</p>`;
        else if (currentHighlight && nextHoliday) currentHighlight.innerHTML = `<i class="fas fa-calendar-day"></i><h3>Upcoming Holiday</h3><p><strong>${nextHoliday.name}</strong> on ${formatShortDate(nextHoliday.date)}</p><p style="margin-top:8px;">${getDaysRemaining(nextHoliday.date)} days to go!</p>`;
        else if (currentHighlight) currentHighlight.innerHTML = `<i class="fas fa-calendar-check"></i><h3>No More Holidays</h3><p>All holidays for ${CURRENT_YEAR} have passed.</p>`;
        
        const buildList = (container, holidays, typeLabel, typeClass) => {
            if (!container) return;
            container.innerHTML = '';
            holidays.forEach(holiday => {
                const isToday = holiday.date === todayStr;
                const item = document.createElement('div');
                item.className = 'holiday-item';
                if (isToday) item.style.background = 'rgba(0,196,180,0.1)';
                item.innerHTML = `<div class="holiday-name"><i class="fas ${holiday.icon}"></i><span>${holiday.name} ${isToday ? '<span style="color:#00C4B4;">(Today!)</span>' : ''}</span></div><div class="holiday-date">${formatShortDate(holiday.date)}</div><span class="holiday-type ${typeClass}">${typeLabel}</span>`;
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
        if (!savedConsent && cookieBanner) setTimeout(() => cookieBanner.classList.add('show'), 500);
        const acceptBtn = document.getElementById('cookieAcceptBtn');
        if (acceptBtn) acceptBtn.addEventListener('click', () => { localStorage.setItem('cookie_consent_given', 'true'); cookieBanner.classList.remove('show'); showToast('Cookies accepted!', 'success'); });
        const denyBtn = document.getElementById('cookieDenyBtn');
        if (denyBtn) denyBtn.addEventListener('click', () => { localStorage.setItem('cookie_consent_given', 'true'); cookieBanner.classList.remove('show'); showToast('Only essential cookies enabled', 'info'); });
        const settingsBtn = document.getElementById('cookieSettingsBtn'), settingsModal = document.getElementById('cookieSettingsModal'), closeSettingsModal = document.getElementById('closeSettingsModal'), savePrefsBtn = document.getElementById('saveCookiePreferencesBtn');
        if (settingsBtn && settingsModal) settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
        if (closeSettingsModal && settingsModal) closeSettingsModal.addEventListener('click', () => settingsModal.classList.remove('show'));
        if (savePrefsBtn && settingsModal) savePrefsBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
        const cookieSettingsFooter = document.getElementById('cookieSettingsFooter');
        if (cookieSettingsFooter && settingsModal) cookieSettingsFooter.addEventListener('click', (e) => { e.preventDefault(); settingsModal.classList.add('show'); });
    }

    // Initialization
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
        initHireDonateModals();
        initReviewModal();
        loadReviews();
        if (playerFrame && SERVERS[0]) { playerFrame.src = SERVERS[0].url; currentChannelNameSpan.innerText = SERVERS[0].name; }
        showToast('Welcome to CHALUNG! 🎬', 'success');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();