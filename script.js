document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Enhanced 3D Card Logic ---
    const cardScene = document.getElementById('business-card');
    const cardObject = cardScene.querySelector('.card-object');
    const shine = cardScene.querySelector('.shine');
    const shadow = cardScene.querySelector('.card-shadow');
    
    // Better detection: devices that primarily use a fine pointer (mouse)
    const canHover = window.matchMedia('(hover: hover)').matches;

    // --- PC (Mouse) Logic ---
    if (canHover) {
        const maxTilt = 15; 

        const handleMove = (x, y, rect) => {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -1;
            const rotateY = (x - centerX) / centerX;

            const isFlipped = cardObject.classList.contains('is-flipped');
            const baseRotateY = isFlipped ? 180 : 0;
            const tiltY = isFlipped ? -rotateY : rotateY; 

            // Using inline styles for smooth tilt following mouse
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
            // Only tilt if not mid-click on non-touch (rare edge case)
            cardObject.classList.add('is-interacting');
            const rect = cardScene.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            window.requestAnimationFrame(() => handleMove(x, y, rect));
        });

        cardScene.addEventListener('mouseleave', () => {
            cardObject.classList.remove('is-interacting'); 
            const isFlipped = cardObject.classList.contains('is-flipped');
            
            // Return to base state
            cardObject.style.transform = `perspective(1000px) rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg) scale3d(1, 1, 1)`;
            shine.style.opacity = 0;
            shadow.style.opacity = 0;
            shadow.style.transform = `translate(0px, 0px) scale(1)`;
        });
    }

    // --- Universal Click/Tap Logic (Fix for Mobile Freeze) ---
    cardScene.addEventListener('click', (e) => {
        // Prevent if clicking a link/button inside
        if(e.target.closest('a')) return;

        // CRITICAL FIX FOR MOBILE LAG:
        // 1. Stop any "interacting" transition speed adjustments
        cardObject.classList.remove('is-interacting'); 

        // 2. Clear inline styles immediately. 
        // On mobile, the "tilt" scripts might not run, but clearing this ensures 
        // the CSS class rule is the *only* thing controlling the transform.
        // This stops the JS coordinates from fighting the CSS class.
        cardObject.style.transform = ''; 
        
        // 3. Reset effects
        shine.style.opacity = '0';
        shadow.style.opacity = '0';
        shadow.style.transform = '';

        // 4. Force a reflow (optional, usually not needed if simply toggling class, but helps reset browser paint)
        void cardObject.offsetWidth; 

        // 5. Toggle class
        cardObject.classList.toggle('is-flipped');
    });


    // --- 2. Automated Map Tooltips ---
    const mapPoints = document.querySelectorAll('.map-point');
    
    if (mapPoints.length > 0) {
        let activePointIndex = -1;
        
        const cycleMapPoints = () => {
            if (activePointIndex >= 0) {
                mapPoints[activePointIndex].classList.remove('is-active');
            }

            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * mapPoints.length);
            } while (nextIndex === activePointIndex && mapPoints.length > 1);

            activePointIndex = nextIndex;
            mapPoints[activePointIndex].classList.add('is-active');
        };

        setInterval(cycleMapPoints, 1500); // Slightly slower for better readability
        cycleMapPoints(); 
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