document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch Global Content
    fetch('/api/content')
        .then(res => res.json())
        .then(data => {
            // --- Update Footer Info ---
            // Footer Item 1: Mobile
            updateText('.footer-contact li:nth-child(1) span', data.global.phone); 
            // Footer Item 2: Landline (Use data.global.landline if it exists, else keep static or fallback)
            if (data.global.landline) {
                updateText('.footer-contact li:nth-child(2) span', data.global.landline);
            }

            // Footer Email & Address
            updateText('.footer-contact li:nth-child(3) a', data.global.email);
            updateText('.footer-contact li:nth-child(4) span', data.global.address);


            // --- Update Contact Page Info ---
            // Mobile
            updateText('.cup-detail-row:nth-child(1) .cup-highlight', data.global.phone); 
            
            // Landline
            if (data.global.landline) {
                // The structure in contact.html is <p><strong>Land:</strong> <span>...</span></p>
                // We target the span inside the second paragraph
                updateText('.cup-detail-row:nth-child(2) span', data.global.landline);
            }

            // Email & Address
            updateText('.cup-detail-row:nth-child(3) span', data.global.email);
            updateText('.cup-address-block p', data.global.address);

            
            // --- Update Home Hero ---
            updateText('.mep-hero__title', data.home.heroTitle);
            updateText('.mep-hero__description', data.home.heroDesc);
            updateText('.mep-hero__btn', data.home.heroBtnText);
        })
        .catch(err => console.error("Error loading dynamic content:", err));

    // Helper to safely update text
    function updateText(selector, text) {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
            if(el) el.innerText = text;
        });
    }
});