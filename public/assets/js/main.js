document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================================
       1. GLOBAL SETUP & LIBRARY CHECKS
       ========================================================================== */
    const hasGSAP = typeof gsap !== 'undefined';
    
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else if (hasGSAP) {
        console.warn("GSAP loaded, but ScrollTrigger is missing.");
    } else {
        console.warn("GSAP is not loaded. Animations will not run.");
    }

    /* ==========================================================================
       2. HERO SECTION ANIMATION
       ========================================================================== */
    function initHero() {
        if (!hasGSAP || !document.querySelector('.mep-hero__title')) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".mep-hero__title", {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2
        })
        .from(".mep-hero__description", {
            y: 30,
            opacity: 0,
            duration: 0.8
        }, "-=0.4")
        .from(".mep-hero__btn", {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
        }, "-=0.2");
    }

    /* ==========================================================================
       3. ABOUT SECTION ANIMATION (#au-about-section)
       ========================================================================== */
    function initAbout() {
        const aboutSection = document.querySelector('#au-about-section');
        if (!hasGSAP || !aboutSection) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#au-about-section",
                start: "top 80%",
                end: "bottom 20%",
                // CHANGED: "play none none none" ensures it plays once and never reverses/replays
                toggleActions: "play none none none" 
            }
        });

        tl.to(".au-content-card", {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power3.out"
        })
        .from(".au-heading, .au-text, .au-btn-wrapper", {
            duration: 0.8,
            y: 20,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=0.5");
    }

    /* ==========================================================================
       4. WHY CHOOSE US ANIMATION
       ========================================================================== */
    function initWhyChooseUs() {
        const section = document.querySelector('#why-choose-us');
        if (!section) return;

        const heading = section.querySelector('.wcu-main-heading');
        const imageFrame = section.querySelector('.wcu-image-frame');
        const featureCards = section.querySelectorAll('.wcu-feature-card');

        if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 78%',
                    toggleActions: 'play none none none'
                }
            });

            tl.from(heading, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out'
            })
            .from(imageFrame, {
                x: -45,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.2')
            .from(featureCards, {
                y: 28,
                opacity: 0,
                duration: 0.55,
                stagger: 0.12,
                ease: 'back.out(1.3)'
            }, '-=0.45');

            return;
        }

        section.classList.add('wcu-animate-ready');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                section.classList.add('wcu-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        observer.observe(section);
    }



    /* ==========================================================================
       5. QUICK CONNECT ANIMATION
       ========================================================================== */
    function initQuickConnect() {
        const section = document.querySelector('.connect-section');
        const form = document.querySelector('.connect-form');
        if (!section || !form) return;

        const fields = form.querySelectorAll('h2, input, select, textarea, button');

        if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                }
            });

            tl.from(form, {
                y: 48,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out'
            })
            .from(fields, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out'
            }, '-=0.45');

            return;
        }

        section.classList.add('qc-animate-ready');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                section.classList.add('qc-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.35,
            rootMargin: '0px 0px -10% 0px'
        });

        observer.observe(section);
    }


    /* ==========================================================================
       6. HOME PAGE SERVICES (Reads "homeServices" from JSON)
       ========================================================================== */
    function initHomeServices() {
        const track = document.querySelector('#services-track');
        // Stop if we are not on the home page (or wherever the carousel is)
        if (!track) return;

        const dotsContainer = document.querySelector('.srv-carousel-dots');
        const nextBtn = document.querySelector('.srv-carousel-btn.next');
        const prevBtn = document.querySelector('.srv-carousel-btn.prev');

        let servicesData = [];
        let currentIndex = 0;
        let sliderInterval = null;
        
        // Touch/swipe variables
        let touchStartX = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = null;

        // Fetch Data
        fetch('assets/data/services.json')
            .then(res => res.json())
            .then(data => {
                if (data.homeServices) {
                    servicesData = data.homeServices;
                    renderHomeCards();
                    // Initial Layout Check
                    updateCarouselLayout();
                    setupCarouselEvents();
                } else {
                    console.error("JSON is missing 'homeServices' key.");
                }
            })
            .catch(err => console.error("Home Services Load Error:", err));

        function renderHomeCards() {
            track.innerHTML = ''; 
            if(dotsContainer) dotsContainer.innerHTML = '';

            servicesData.forEach((service, index) => {
                const card = document.createElement('article');
                card.className = 'srv-card'; 
                card.innerHTML = `
                    <div class="srv-icon-box">
                        <i class="${service.icon || 'fa-solid fa-layer-group'}"></i>
                    </div>
                    <h3 class="srv-card-title">${service.title}</h3>
                    <p class="srv-card-desc">${service.homePageDescription}</p>
                    <a href="services.html" class="srv-btn">
                        Read More <i class="fa-solid fa-arrow-right" style="margin-left:5px; font-size:12px;"></i>
                    </a>
                `;
                track.appendChild(card);

                if (dotsContainer) {
                    const dot = document.createElement('span');
                    dot.className = `srv-dot ${index === 0 ? 'active' : ''}`;
                    dot.dataset.index = index;
                    dotsContainer.appendChild(dot);
                }
            });
        }

        function updateCarouselLayout() {
            // STRICT CHECK: Use matchMedia to align exactly with CSS.
            // (max-width: 767px) means Tablets (768px+) are NOT mobile.
            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            const cards = document.querySelectorAll('#services-track .srv-card');
            
            if (!isMobile) {
                /* --- DESKTOP / TABLET (GRID MODE) --- */
                
                // 1. Kill the slider interval immediately
                if (sliderInterval) {
                    clearInterval(sliderInterval);
                    sliderInterval = null;
                }

                // 2. Reset Track Styles to Grid
                track.style.display = 'grid';
                track.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
                track.style.gap = '20px';
                track.style.transform = 'none';
                track.style.transition = 'none';
                track.style.cursor = 'default';
                
                // 3. CLEANUP: Remove widths added by the slider logic
                if (cards.length > 0) {
                    cards.forEach(card => {
                        card.style.minWidth = '';     // Remove fixed width
                        card.style.marginRight = '';  // Remove margins
                    });
                }
                
                // 4. Remove Touch Listeners
                track.removeEventListener('touchstart', handleTouchStart);
                track.removeEventListener('touchmove', handleTouchMove);
                track.removeEventListener('touchend', handleTouchEnd);
                track.removeEventListener('mousedown', handleTouchStart);
                track.removeEventListener('mousemove', handleTouchMove);
                track.removeEventListener('mouseup', handleTouchEnd);
                track.removeEventListener('mouseleave', handleTouchEnd);
                
                // 5. Trigger Desktop Entrance Animation (once)
                if (hasGSAP && !track.classList.contains('animated-in')) {
                    gsap.from("#services-track .srv-card", {
                        scrollTrigger: {
                            trigger: "#services-track",
                            start: "top 80%",
                            // CHANGED: "play none none none" ensures it plays once and never reverses
                            toggleActions: "play none none none"
                        },
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "power2.out",
                        onComplete: () => track.classList.add('animated-in')
                    });
                }

            } else {
                /* --- MOBILE (SLIDER MODE) --- */
                track.style.display = 'flex';
                track.style.gap = '0';
                track.style.transition = 'transform 0.5s ease';
                track.style.cursor = 'grab';
                
                // Re-initialize slider
                setupMobileCarousel();
            }
        }

        function setupMobileCarousel() {
            const cards = document.querySelectorAll('#services-track .srv-card');
            if(cards.length === 0) return;
            
            const wrapper = document.querySelector('.srv-carousel-wrapper');
            const width = wrapper.offsetWidth;
            
            // Force cards to take full width of wrapper
            cards.forEach(card => {
                card.style.minWidth = `${width}px`;
                card.style.marginRight = '0px'; 
            });
            
            // Reset position
            track.style.transform = `translateX(-${currentIndex * width}px)`;
            currentTranslate = -currentIndex * width;
            prevTranslate = currentTranslate;
            
            // Add listeners
            track.addEventListener('touchstart', handleTouchStart, { passive: false });
            track.addEventListener('touchmove', handleTouchMove, { passive: false });
            track.addEventListener('touchend', handleTouchEnd);
            
            // Mouse events for testing
            track.addEventListener('mousedown', handleTouchStart);
            track.addEventListener('mousemove', handleTouchMove);
            track.addEventListener('mouseup', handleTouchEnd);
            track.addEventListener('mouseleave', handleTouchEnd);
            
            startAutoplay();
        }

        // --- Touch/Swipe Handlers ---
        function handleTouchStart(event) {
            if (sliderInterval) {
                clearInterval(sliderInterval);
                sliderInterval = null;
            }
            
            if (event.type === 'touchstart') {
                touchStartX = event.touches[0].clientX;
            } else {
                touchStartX = event.clientX;
                track.style.cursor = 'grabbing';
            }
            
            startPos = getPositionX(event);
            isDragging = true;
            
            if (animationID) cancelAnimationFrame(animationID);
        }

        function handleTouchMove(event) {
            if (!isDragging) return;
            event.preventDefault(); // Stop scroll while swiping
            
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
            
            track.style.transform = `translateX(${currentTranslate}px)`;
            track.style.transition = 'none';
        }

        function handleTouchEnd() {
            isDragging = false;
            track.style.cursor = 'grab';
            
            const wrapper = document.querySelector('.srv-carousel-wrapper');
            const width = wrapper.offsetWidth;
            const movedBy = currentTranslate - prevTranslate;
            
            // Swipe threshold
            if (Math.abs(movedBy) > width * 0.3) {
                if (movedBy > 0) currentIndex = Math.max(currentIndex - 1, 0);
                else currentIndex = Math.min(currentIndex + 1, servicesData.length - 1);
            }
            
            currentTranslate = -currentIndex * width;
            prevTranslate = currentTranslate;
            
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            track.style.transform = `translateX(${currentTranslate}px)`;
            
            updateDots();
            startAutoplay();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
        }

        function startAutoplay() {
            if(sliderInterval) clearInterval(sliderInterval);
            sliderInterval = setInterval(() => moveCarousel(1), 3000);
        }

        function moveCarousel(direction) {
            const cards = document.querySelectorAll('#services-track .srv-card');
            if(cards.length === 0) return;

            currentIndex += direction;
            if (currentIndex >= cards.length) currentIndex = 0;
            if (currentIndex < 0) currentIndex = cards.length - 1;

            const wrapper = document.querySelector('.srv-carousel-wrapper');
            // If wrapper is hidden or 0 width, stop
            if (!wrapper || wrapper.offsetWidth === 0) return;
            
            const width = wrapper.offsetWidth;
            
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = `translateX(-${currentIndex * width}px)`;
            
            currentTranslate = -currentIndex * width;
            prevTranslate = currentTranslate;

            updateDots();
        }

        function updateDots() {
            document.querySelectorAll('.srv-dot').forEach(d => d.classList.remove('active'));
            const activeDot = document.querySelector(`.srv-dot[data-index="${currentIndex}"]`);
            if(activeDot) activeDot.classList.add('active');
        }

        function setupCarouselEvents() {
            if(nextBtn) nextBtn.onclick = () => { 
                moveCarousel(1); 
                if (sliderInterval) { clearInterval(sliderInterval); startAutoplay(); }
            };
            
            if(prevBtn) prevBtn.onclick = () => { 
                moveCarousel(-1); 
                if (sliderInterval) { clearInterval(sliderInterval); startAutoplay(); }
            };
            
            if(dotsContainer) {
                dotsContainer.addEventListener('click', (e) => {
                    if(e.target.classList.contains('srv-dot')) {
                        currentIndex = parseInt(e.target.dataset.index);
                        moveCarousel(0);
                        if (sliderInterval) { clearInterval(sliderInterval); startAutoplay(); }
                    }
                });
            }
            
            // Listen for window resize to switch between Grid/Slider
            window.addEventListener('resize', () => {
                updateCarouselLayout();
                // Reset index on resize to prevent awkward offsets
                currentIndex = 0;
            });
        }
    }

    /* ==========================================================================
       5. SERVICES PAGE CONTENT
       ========================================================================== */
    function initServicesPage() {
        const container = document.querySelector('.srv-container');
        if (!container) return;
        if (document.querySelector('#services-track')) return; 

        fetch('assets/data/services.json')
            .then(res => res.json())
            .then(data => {
                if (data.servicesPage) {
                    const pageData = data.servicesPage;
                    container.innerHTML = '';

                    pageData.forEach((service, index) => {
                        const card = document.createElement('article');
                        const bgClass = (index % 3 === 2) ? 'srv-bg-purple' : 'srv-bg-pink'; 
                        card.className = `srv-card ${bgClass}`;
                        
                        card.innerHTML = `
                            <div class="srv-text-content">
                                <h3>${service.title}</h3>
                                <p>${service.description}</p>
                            </div>
                            <div class="srv-img-wrapper">
                                <img src="${service.image}" alt="${service.title}">
                            </div>
                        `;
                        container.appendChild(card);
                    });
                    
                    animateServicesPage();
                }
            })
            .catch(err => console.error("Services Page Load Error:", err));
    }

    function animateServicesPage() {
        if (!hasGSAP) return;
        gsap.from(".srv-main-title", { duration: 1.2, y: -50, opacity: 0, ease: "power3.out" });

        const cards = document.querySelectorAll(".srv-container .srv-card");
        cards.forEach((card, index) => {
            let xValue = index % 2 === 0 ? -50 : 50;
            gsap.fromTo(card, 
                { opacity: 0, x: xValue, y: 30 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        // CHANGED: "play none none none" ensures it plays once and never reverses
                        toggleActions: "play none none none"
                    },
                    opacity: 1, x: 0, y: 0, duration: 1, ease: "power3.out"
                }
            );
        });
    }

    /* ==========================================================================
       6. TESTIMONIALS & CLIENTS
       ========================================================================== */
    function initTestimonials() {
        if (!hasGSAP) return;
        if (document.querySelector(".section-title-unique")) {
            gsap.from(".section-title-unique", {
                scrollTrigger: { 
                    trigger: ".section-title-unique", 
                    start: "top 85%",
                    // CHANGED
                    toggleActions: "play none none none"
                },
                opacity: 0, y: -50, duration: 1, ease: "power3.out"
            });
        }
        const cards = document.querySelectorAll(".testimonial-card-unique");
        if (cards.length > 0) {
            gsap.from(cards, {
                scrollTrigger: { 
                    trigger: cards[0], 
                    start: "top 85%",
                    // CHANGED
                    toggleActions: "play none none none"
                },
                opacity: 0, y: 50, duration: 0.8, ease: "power2.out", stagger: 0.2
            });
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.02, duration: 0.2 }));
                card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.2 }));
            });
        }
    }

    function initClients() {
        const logos = document.querySelectorAll('.slide img');
        logos.forEach(logo => {
            logo.addEventListener('click', () => {
                const clientName = logo.alt.replace(' Logo', '');
                console.log(`Clicked client: ${clientName}`);
            });
        });
    }

    /* ==========================================================================
       9. QUOTE ANIMATION
       ========================================================================== */
    function initQuote() {
        const quoteTextElement = document.querySelector('.quote-text');
        if (!quoteTextElement) return;

        const text = quoteTextElement.textContent;
        quoteTextElement.textContent = ''; 
        
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            quoteTextElement.appendChild(span);
        });

        const startAnimation = () => {
            const charSpans = quoteTextElement.querySelectorAll('span');
            charSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('visible');
                }, index * 30);
            });
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(quoteTextElement);
    }

    /* ==========================================================================
       10. LEGACY SCROLL
       ========================================================================== */
    function initLegacyScroll() {
        const boxes = document.querySelectorAll('.service-box');
        if (boxes.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        boxes.forEach(box => observer.observe(box));
    }

    /* ==========================================================================
       11. ABOUT PAGE CONTENT
       ========================================================================== */
    function initAboutPageContent() {
        if (!hasGSAP || !document.querySelector('#about-hero')) return;
        
        gsap.from(".about-hero__title", { duration: 1.2, y: 50, opacity: 0, ease: "power3.out" });

        gsap.from("#who-we-are .section-title, #who-we-are .section-desc", {
            scrollTrigger: { 
                trigger: "#who-we-are", 
                start: "top 80%", 
                // CHANGED
                toggleActions: "play none none none" 
            },
            y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
        });

        const mvTimeline = gsap.timeline({ 
            scrollTrigger: { 
                trigger: "#mission-vision", 
                start: "top 75%",
                // CHANGED
                toggleActions: "play none none none"
            }
        });
        mvTimeline.from(".mission-card", { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" })
                  .from(".vision-card", { x: 50, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");

        gsap.from(".offer-item", {
            scrollTrigger: { 
                trigger: "#what-we-offer", 
                start: "top 80%",
                // CHANGED
                toggleActions: "play none none none"
            },
            y: 40, opacity: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.7)"
        });
    }

    /* ==========================================================================
       INITIALIZE ALL
       ========================================================================== */
    initHero();
    initAbout();
    initWhyChooseUs();
    initQuickConnect();
    initHomeServices();
    initServicesPage();
    initTestimonials();
    initClients();
    initQuote();
    initLegacyScroll();
    initAboutPageContent();
});
