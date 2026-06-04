(function() {
    
    // --- 1. HANDLE INDEX PAGE FORM (#contactForm) ---
    const indexForm = document.getElementById('contactForm');
    
    if (indexForm) {
        indexForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const submitBtn = indexForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            setLoading(submitBtn, true);

            // Gather Data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('services').value,
                message: document.getElementById('message').value,
                source_page: 'Home Page'
            };

            sendToServer(formData, indexForm, submitBtn, originalText);
        });
    }

    // --- 2. HANDLE CONTACT PAGE FORM (#cup-contactForm) ---
    const contactPageForm = document.getElementById('cup-contactForm');
    
    if (contactPageForm) {
        contactPageForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const submitBtn = contactPageForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            setLoading(submitBtn, true);

            // Gather Data (Using FormData API)
            const rawData = new FormData(contactPageForm);
            const formData = {
                name: rawData.get('name'),
                email: rawData.get('email'),
                phone: rawData.get('phone'),
                service: rawData.get('service'),
                message: rawData.get('message'),
                source_page: 'Contact Page'
            };

            sendToServer(formData, contactPageForm, submitBtn, originalText);
        });
    }

    // --- HELPER: SEND DATA TO BACKEND ---
    function sendToServer(data, form, btn, originalText) {
        fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Success
                alert('Message Sent Successfully!');
                form.reset();
                btn.innerText = 'Sent!';
                btn.style.backgroundColor = '#28a745'; // Green
                
                setTimeout(() => {
                    setLoading(btn, false, originalText);
                    btn.style.backgroundColor = ''; // Reset color
                }, 3000);
            } else {
                throw new Error(result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send message. Please try again later.');
            setLoading(btn, false, originalText);
        });
    }

    // --- HELPER: BUTTON STATE ---
    function setLoading(btn, isLoading, originalText = '') {
        if (isLoading) {
            btn.innerText = 'Sending...';
            btn.disabled = true;
        } else {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }

})();