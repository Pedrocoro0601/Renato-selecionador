document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Enhanced 3D Card Logic (More Realistic) ---
    const cardScene = document.getElementById('business-card');
    const cardObject = cardScene.querySelector('.card-object');
    const shine = cardScene.querySelector('.shine');
    const shadow = cardScene.querySelector('.card-shadow');
    
    // Increased tilt for more dramatic 3D effect
    const maxTilt = 18; 

    const handleMove = (x, y, rect) => {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (-1 to 1 range relative to center)
        const rotateX = ((y - centerY) / centerY) * -1; // Invert Y
        const rotateY = (x - centerX) / centerX;

        const isFlipped = cardObject.classList.contains('is-flipped');
        const baseRotateY = isFlipped ? 180 : 0;
        
        // When flipped, invert interaction
        const tiltY = isFlipped ? -rotateY : rotateY; 

        // Apply Transform with scale for "lift" feel
        cardObject.style.transform = `perspective(1000px) rotateX(${rotateX * maxTilt}deg) rotateY(${baseRotateY + (tiltY * maxTilt)}deg) scale3d(1.05, 1.05, 1.05)`;
        
        // Realistic Shine/Glare
        const shineOpacity = Math.min(Math.abs(rotateX) + Math.abs(rotateY), 0.6);
        const shineX = ((x / rect.width) * 100);
        const shineY = ((y / rect.height) * 100);
        
        // Dynamic gradient moves with mouse
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.2), transparent 50%)`;
        shine.style.opacity = shineOpacity;

        // Dynamic Shadow logic (moves opposite to card, expands)
        shadow.style.opacity = 0.7;
        shadow.style.transform = `translate(${rotateY * -25}px, ${rotateX * 25}px) scale(1.1)`;
    };

    // Mouse Interaction
    cardScene.addEventListener('mousemove', (e) => {
        cardObject.classList.add('is-interacting');
        const rect = cardScene.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        window.requestAnimationFrame(() => handleMove(x, y, rect));
    });

    // Reset on Leave
    cardScene.addEventListener('mouseleave', () => {
        cardObject.classList.remove('is-interacting'); 
        const isFlipped = cardObject.classList.contains('is-flipped');
        
        cardObject.style.transform = `perspective(1000px) rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg) scale3d(1, 1, 1)`;
        shine.style.opacity = 0;
        shadow.style.opacity = 0;
        shadow.style.transform = `translate(0px, 0px) scale(1)`;
    });

    // Flip on Click
    cardScene.addEventListener('click', () => {
        cardObject.classList.remove('is-interacting'); 
        cardObject.classList.toggle('is-flipped');
        
        const isFlipped = cardObject.classList.contains('is-flipped');
        cardObject.style.transform = `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`;
    });


    // --- 2. Automated Map Tooltips (Faster Looping) ---
    const mapPoints = document.querySelectorAll('.map-point');
    
    if (mapPoints.length > 0) {
        let activePointIndex = -1;

        // Function to show a random point
        const cycleMapPoints = () => {
            // Remove active class from current
            if (activePointIndex >= 0) {
                mapPoints[activePointIndex].classList.remove('is-active');
            }

            // Pick a new random index, ensuring it's not the same as before
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * mapPoints.length);
            } while (nextIndex === activePointIndex && mapPoints.length > 1);

            activePointIndex = nextIndex;
            mapPoints[activePointIndex].classList.add('is-active');
        };

        // Initialize Loop - Significantly Faster (1.2s)
        setInterval(cycleMapPoints, 1200); 
        cycleMapPoints(); // Run once immediately
    }


    // --- 3. Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Blur
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            header.classList.add('bg-brand-dark/90', 'backdrop-blur-md', 'shadow-lg', 'py-4');
            header.classList.remove('py-6');
        } else {
            header.classList.remove('bg-brand-dark/90', 'backdrop-blur-md', 'shadow-lg', 'py-4');
            header.classList.add('py-6');
        }
    });

    // Map Points Stagger Entry
    gsap.from('.map-point', {
        scrollTrigger: {
            trigger: '#international',
            start: "top 70%"
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "elastic.out(1, 0.5)"
    });

});