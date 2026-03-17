document.addEventListener("DOMContentLoaded", () => {
    // Hide loading screen
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
    }, 500);

    // Elements
    const cursorGlow = document.getElementById('cursor-glow');
    const globeContainer = document.querySelector('.mars-globe-container');
    const rightCard = document.querySelector('.interface-card');

    // Mouse movement variables for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Window dimensions
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
    });

    // Cursor Glow follow & Parallax targets
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';

        // Normalized mouse coordinates from -1 to 1
        mouseX = (e.clientX / winWidth) * 2 - 1;
        mouseY = -(e.clientY / winHeight) * 2 + 1;
    });

    // Animation Loop using requestAnimationFrame
    function animate() {
        // Parallax easing
        targetX += (mouseX - targetX) * 0.1;
        targetY += (mouseY - targetY) * 0.1;

        // Apply slight parallax to the fixed assets
        if(globeContainer) {
            globeContainer.style.transform = `translate(${targetX * 20}px, ${targetY * 20}px)`;
        }
        if(rightCard) {
            rightCard.style.transform = `translate(${targetX * -10}px, ${targetY * -10}px)`;
        }

        // Scroll calculations for main text scaling down
        const scrollY = window.scrollY;
        const scrollProgress = Math.min(scrollY / (winHeight * 0.5), 1); 
        const heroText = document.querySelector('.mars-text-wrapper');
        
        if (heroText) {
            const scale = 1 - (scrollProgress * 0.1);
            const opacity = 1 - (scrollProgress * 1.5);
            heroText.style.transform = `translateY(-5vh) scale(${scale})`;
            heroText.style.opacity = Math.max(0, opacity).toString();
        }
    }

    // Start animation loop
    animate();

    // Intersection Observer to fade in elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Apply observer to text reveals if needed later
    // Currently using CSS animation delays for Hero

    // Interactive 3D Card Logic
    const cardContainers = document.querySelectorAll('.card-container');
    cardContainers.forEach(container => {
        const cardBody = container.querySelector('.card-body');
        const items = cardBody.querySelectorAll('.card-item');

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Limit rotation to ~20 degrees
            const rotX = ((e.clientY - centerY) / (rect.height / 2)) * -20;
            const rotY = ((e.clientX - centerX) / (rect.width / 2)) * 20;

            cardBody.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            cardBody.style.transition = 'none';
        });

        container.addEventListener('mouseenter', () => {
            items.forEach(item => {
                const z = item.getAttribute('data-translatez');
                if(z) {
                    item.style.transform = `translateZ(${z}px)`;
                }
            });
        });

        container.addEventListener('mouseleave', () => {
            cardBody.style.transition = 'transform 0.5s ease-out';
            cardBody.style.transform = `rotateX(0deg) rotateY(0deg)`;
            
            items.forEach(item => {
                item.style.transform = `translateZ(0px)`;
            });
        });
    });

    // Background Boxes Grid
    (function buildBoxesGrid() {
        const container = document.getElementById('boxes-container');
        if (!container) return;

        const COLORS = [
            'rgb(209,70,30)',   // mars-orange
            'rgb(230,106,53)',  // mars-orange-light
            'rgb(255,140,66)',  // lighter orange
            'rgb(160,40,10)',   // deep red-orange
            'rgb(255,200,100)', // warm amber
        ];
        const ROWS = 150, COLS = 100;
        const plusSVG = `<svg class="plus" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 6v12m6-6H6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        const fragment = document.createDocumentFragment();
        for (let col = 0; col < COLS; col++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'box-row';
            for (let r = 0; r < ROWS; r++) {
                const cell = document.createElement('div');
                cell.className = 'box-cell';
                if (col % 2 === 0 && r % 2 === 0) cell.innerHTML = plusSVG;
                cell.addEventListener('mouseenter', () => {
                    cell.classList.add('hovered');
                    cell.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                });
                cell.addEventListener('mouseleave', () => {
                    cell.classList.remove('hovered');
                    cell.style.backgroundColor = '';
                });
                rowEl.appendChild(cell);
            }
            fragment.appendChild(rowEl);
        }
        container.appendChild(fragment);
    })();
});
