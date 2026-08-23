document.addEventListener('DOMContentLoaded', () => {
    // --- Testimonial Carousel Auto-Scroll Logic ---
    const track = document.getElementById('testimonialTrack');
    
    if (track) {
        // Clone items to create an infinite loop effect
        const cards = Array.from(track.children);
        
        // Clone twice for safety in wide screens
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });
        
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        let currentX = 0;
        let animationId;
        const speed = 1; // Pixels per frame

        function animate() {
            currentX -= speed;
            
            // Check if we've scrolled past the first set of items
            // Assuming all cards have the same width + gap
            const firstCard = track.children[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 32; // 2rem = 32px
            
            // The total width of the original set of cards
            const originalSetWidth = (cardWidth + gap) * cards.length;

            if (Math.abs(currentX) >= originalSetWidth) {
                // Reset position to create seamless loop
                currentX += originalSetWidth;
            }

            track.style.transform = `translateX(${currentX}px)`;
            animationId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Optional: Pause on hover
        track.addEventListener('mouseenter', () => cancelAnimationFrame(animationId));
        track.addEventListener('mouseleave', () => animate());
    }

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Dark Mode Toggle ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.setAttribute('data-theme', 'dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            }
        });
    }

    // --- Form Submission Logic ---
    const demoForm = document.getElementById('demoForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (demoForm) {
        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formStatus.style.display = 'none';

            // Collect form data
            const formData = new FormData(demoForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    formStatus.textContent = 'Demo request sent successfully! We will contact you soon.';
                    formStatus.style.color = '#155724';
                    formStatus.style.backgroundColor = '#d4edda';
                    formStatus.style.display = 'block';
                    demoForm.reset();
                } else {
                    throw new Error(result.message || 'Failed to send');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                formStatus.textContent = 'Error: ' + error.message;
                formStatus.style.color = '#721c24';
                formStatus.style.backgroundColor = '#f8d7da';
                formStatus.style.display = 'block';
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Book a Demo';
            }
        });
    }
});
