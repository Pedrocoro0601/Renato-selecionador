document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Enhanced 3D Card Logic (Business Card) ---
    const cardScene = document.getElementById('business-card');
    const cardObject = cardScene.querySelector('.card-object');
    const shines = cardScene.querySelectorAll('.shine');
    
    // Better detection: devices that primarily use a fine pointer (mouse)
    const canHover = window.matchMedia('(hover: hover)').matches;

    // --- PC (Mouse) Logic ---
    if (canHover) {
        const maxTilt = 22; // More pronounced tilt for dramatic 3D effect
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        let animationFrameId = null;
        let isHovering = false;
        
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateCard = () => {
            // Stop animation loop if returned to center and not hovering
            if (!isHovering && Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001) {
                cardObject.classList.remove('is-interacting');
                cardObject.style.transform = '';
                shines.forEach(shine => shine.style.opacity = 0);
                animationFrameId = null;
                return;
            }

            // Smooth interpolation
            currentX = lerp(currentX, targetX, 0.08); 
            currentY = lerp(currentY, targetY, 0.08);
            
            const rotateX = currentY * maxTilt;
            const rotateY = currentX * maxTilt;

            const isFlipped = cardObject.classList.contains('is-flipped');
            const baseRotateY = isFlipped ? 180 : 0;
            const tiltY = isFlipped ? -rotateY : rotateY; 
            
            // Apply transform
            cardObject.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${baseRotateY + tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
            
            // Realistic Glare (Linear Sweep) calculation
            // Map tilt (-1 to 1) to a background position (0% to 100%)
            // The light moves opposite to the tilt to simulate environmental reflection
            const bgPosX = 50 + (currentX * -150); 
            const bgPosY = 50 + (currentY * -150);
            const shineOpacity = isHovering ? 0.8 : Math.max(0, Math.abs(currentX)); // Fade out smoothly when leaving
            
            shines.forEach(shine => {
                // Background image is set once below, here we only animate the position
                shine.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
                shine.style.opacity = shineOpacity;
            });
            
            animationFrameId = requestAnimationFrame(updateCard);
        };

        // Initialize realistic glare pattern on shines
        shines.forEach(shine => {
            shine.style.backgroundImage = `linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.05) 50%, transparent 60%, transparent 75%, rgba(255,255,255,0.15) 80%, transparent 85%)`;
            shine.style.backgroundSize = '300% 300%';
            shine.style.backgroundPosition = '50% 50%';
        });

        cardScene.addEventListener('mousemove', (e) => {
            const rect = cardScene.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            targetX = (x - centerX) / centerX;
            targetY = ((y - centerY) / centerY) * -1;
            
            if (!isHovering) {
                isHovering = true;
                cardObject.classList.add('is-interacting');
                if (!animationFrameId) updateCard();
            }
        });

        cardScene.addEventListener('mouseleave', () => {
            isHovering = false;
            targetX = 0;
            targetY = 0;
            // The animation loop will naturally handle the return to center and cleanup
        });
    }

    // --- Universal Click/Tap Logic ---
    cardScene.addEventListener('click', (e) => {
        if(e.target.closest('a')) return;

        // Reset inline styles to allow CSS transition to handle the flip smoothly
        cardObject.style.transform = ''; 
        cardObject.classList.remove('is-interacting'); 
        
        shines.forEach(shine => shine.style.opacity = '0');

        void cardObject.offsetWidth; // Force reflow

        cardObject.classList.toggle('is-flipped');
    });

    // --- 2. Automated Map Tooltips ---
    // Select all map points including the new Brazil ones
    const mapPoints = document.querySelectorAll('.map-point');
    
    if (mapPoints.length > 0) {
        let activePointIndex = -1;
        
        const cycleMapPoints = () => {
            if (activePointIndex >= 0 && mapPoints[activePointIndex]) {
                mapPoints[activePointIndex].classList.remove('is-active');
            }

            // Just check valid points exist
            if(mapPoints.length === 0) return;

            // Simple randomization logic
            let nextIndex;
            // Limit tries to avoid infinite loop if length is small
            let tries = 0;
            do {
                nextIndex = Math.floor(Math.random() * mapPoints.length);
                tries++;
            } while (nextIndex === activePointIndex && mapPoints.length > 1 && tries < 10);

            activePointIndex = nextIndex;
            
            // Safety check
            if(mapPoints[activePointIndex]) {
                mapPoints[activePointIndex].classList.add('is-active');
            }
        };

        setInterval(cycleMapPoints, 2000); // 2 seconds per blip
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
    
    // Animate map points when section comes into view
    gsap.from('.map-point', {
        scrollTrigger: {
            trigger: '.map-point', // Triggers when the first map point is somewhat visible
            start: "top 90%"
        },
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05, // Faster stagger for many points
        ease: "back.out(1.7)"
    });

    // --- NEW: Mask Reveal for Large Image (Markers logic removed) ---
    // Using a Timeline to sequence Image Reveal
    const revealImage = document.querySelector('.mask-reveal-image');
    
    if (revealImage) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: revealImage,
                start: "top 85%", // Trigger slightly earlier
                end: "bottom 80%",
                toggleActions: "play none none reverse" // Play on enter, reverse on leave up
            }
        });

        // 1. Reveal Image FASTER (duration 0.8s)
        tl.fromTo(revealImage,
            { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", scale: 1.15 }, 
            {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                scale: 1,
                duration: 0.9, 
                ease: "power2.inOut",
            }
        );
    }

});