document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Enhanced 3D Card Logic ---
    const cardScene = document.getElementById('business-card');
    const cardObject = cardScene.querySelector('.card-object');
    const shine = cardScene.querySelector('.shine');
    const shadow = cardScene.querySelector('.card-shadow');
    
    // Check if device supports hover (desktop) vs touch (mobile)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        // Desktop: Tilt Effect
        const maxTilt = 15; 

        const handleMove = (x, y, rect) => {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -1;
            const rotateY = (x - centerX) / centerX;

            const isFlipped = cardObject.classList.contains('is-flipped');
            const baseRotateY = isFlipped ? 180 : 0;
            const tiltY = isFlipped ? -rotateY : rotateY; 

            cardObject.style.transform = `perspective(1000px) rotateX(${rotateX * maxTilt}deg) rotateY(${baseRotateY + (tiltY * maxTilt)}deg) scale3d(1.05, 1.05, 1.05)`;
            
            const shineOpacity = Math.min(Math.abs(rotateX) + Math.abs(rotateY), 0.5);
            const shineX = ((x / rect.width) * 100);
            const shineY = ((y / rect.height) * 100);
            
            shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15), transparent 50%)`;
            shine.style.opacity = shineOpacity;

            shadow.style.opacity = 0.6;
            shadow.style.transform = `translate(${rotateY * -20}px, ${rotateX * 20}px) scale(1.05)`;
        };

        cardScene.addEventListener('mousemove', (e) => {
            cardObject.classList.add('is-interacting');
            const rect = cardScene.getBoundingClientRect();
            // Prevent jerky movement on edges
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            window.requestAnimationFrame(() => handleMove(x, y, rect));
        });

        cardScene.addEventListener('mouseleave', () => {
            cardObject.classList.remove('is-interacting'); 
            const isFlipped = cardObject.classList.contains('is-flipped');
            
            cardObject.style.transform = `perspective(1000px) rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg) scale3d(1, 1, 1)`;
            shine.style.opacity = 0;
            shadow.style.opacity = 0;
            shadow.style.transform = `translate(0px, 0px) scale(1)`;
        });
    }

    // Universal: Flip on Click (Desktop & Mobile)
    // Note: This remains active as requested (option to see verso), 
    // even though map/carousel clicks are disabled.
    cardScene.addEventListener('click', (e) => {
        // Prevent default only if necessary, but allow links inside card back to work
        if(e.target.closest('a')) return;

        cardObject.classList.remove('is-interacting'); 
        cardObject.classList.toggle('is-flipped');
        
        const isFlipped = cardObject.classList.contains('is-flipped');
        
        // Simple rotation reset for mobile to ensure clean state
        cardObject.style.transform = `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`;
        
        // Reset effects if active
        shine.style.opacity = 0;
        shadow.style.opacity = 0;
    });


    // --- 2. Automated Map Tooltips (Faster & Random & No Stop) ---
    const mapPoints = document.querySelectorAll('.map-point');
    
    if (mapPoints.length > 0) {
        let activePointIndex = -1;
        
        // Function to shuffle through points
        const cycleMapPoints = () => {
            // Remove active class from current
            if (activePointIndex >= 0) {
                mapPoints[activePointIndex].classList.remove('is-active');
            }

            // Ensure random next point, distinct from current
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * mapPoints.length);
            } while (nextIndex === activePointIndex && mapPoints.length > 1);

            activePointIndex = nextIndex;
            mapPoints[activePointIndex].classList.add('is-active');
        };

        // Start Loop - Faster (800ms) and no clearInterval logic so it never stops
        setInterval(cycleMapPoints, 800); 
        cycleMapPoints(); // Immediate start
    }


    // --- 3. Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Blur
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            header.classList.add('bg-brand-dark/95', 'backdrop-blur-lg', 'shadow-xl', 'py-3');
            header.classList.remove('py-6');
        } else {
            header.classList.remove('bg-brand-dark/95', 'backdrop-blur-lg', 'shadow-xl', 'py-3');
            header.classList.add('py-6');
        }
    });

    // Animate elements on scroll
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                }
            }
        );
    });

    // Map Points Stagger Appearance
    gsap.from('.map-point', {
        scrollTrigger: {
            trigger: '#international',
            start: "top 75%"
        },
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
    });

});