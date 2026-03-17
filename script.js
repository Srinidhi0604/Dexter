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

    // Interactive 3D Typography Logic
    const textContainer = document.getElementById('interactive-text-container');
    if (textContainer) {
        document.addEventListener('mousemove', (e) => {
            // Calculate normalized mouse position from -1 to 1 based on viewport
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            // Update CSS variables for the 3D tilt and shadows
            textContainer.style.setProperty('--x', x.toFixed(3));
            textContainer.style.setProperty('--y', y.toFixed(3));
        });
    }

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
        
        const svgIcons = [
            '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>',
            '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661zm1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83.458 0 .83-.381.83-.83a.831.831 0 0 0-1.66 0z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.992l.537-2.503 1.738.382a.83.83 0 1 0 .83-.767l-1.974-.43a.2.2 0 0 0-.244.15l-.604 2.81c-1.248.037-2.369.418-3.181.996a1.1 1.1 0 0 0-.811-.326c-.614 0-1.114.5-1.114 1.112 0 .426.236.801.583.99A4.6 4.6 0 0 0 4 9.479c0 2.052 1.79 3.71 4 3.71s4-1.658 4-3.71c0-.119-.01-.235-.025-.353a1.1 1.1 0 0 0 .584-.99c0-.612-.5-1.112-1.112-1.112z"/></svg>',
            '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032a.04.04 0 0 0 .014.028 13.3 13.3 0 0 0 4.011 2.02.05.05 0 0 0 .059-.018c.31-.426.586-.874.825-1.343a.05.05 0 0 0-.026-.066 9.3 9.3 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.02.066 9.3 9.3 0 0 1-1.249.595.05.05 0 0 0-.026.066c.24.47.518.918.827 1.343a.05.05 0 0 0 .059.018 13.3 13.3 0 0 0 4.011-2.02.04.04 0 0 0 .014-.028c.314-3.179-.575-6.19-2.243-9.088a.04.04 0 0 0-.021-.018zM5.898 10.05c-.9 0-1.64-.816-1.64-1.81s.723-1.81 1.64-1.81c.928 0 1.652.822 1.64 1.81 0 .994-.723 1.81-1.64 1.81zm4.204 0c-.9 0-1.64-.816-1.64-1.81s.723-1.81 1.64-1.81c.928 0 1.652.822 1.64 1.81 0 .994-.723 1.81-1.64 1.81z"/></svg>',
            '<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>'
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
                    
                    // Inject random icon if it doesn't have one
                    if (!cell.dataset.hasIcon) {
                        const iconHtml = svgIcons[Math.floor(Math.random() * svgIcons.length)];
                        cell.insertAdjacentHTML('beforeend', `<div class="cell-icon">${iconHtml}</div>`);
                        cell.dataset.hasIcon = 'true';
                    }
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

    // --- 3D Image Carousel ---
    (function initCarousel() {
        const carousel = document.getElementById('image-carousel');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        
        if (!carousel || !prevBtn || !nextBtn) return;

        let rotationAngle = 0;
        let autoRotateInterval;

        const updateCarousel = () => {
            carousel.style.transform = `rotateY(${rotationAngle}deg)`;
        };

        const startAutoRotate = () => {
            autoRotateInterval = setInterval(() => {
                rotationAngle -= 45; // 8 items = 360 / 8 = 45deg steps
                updateCarousel();
            }, 3000);
        };

        const resetAutoRotate = () => {
            clearInterval(autoRotateInterval);
            startAutoRotate();
        };

        prevBtn.addEventListener('click', () => {
            rotationAngle += 45;
            updateCarousel();
            resetAutoRotate();
        });

        nextBtn.addEventListener('click', () => {
            rotationAngle -= 45;
            updateCarousel();
            resetAutoRotate();
        });

        // Pause on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
        carousel.addEventListener('mouseleave', startAutoRotate);

        startAutoRotate();
    })();
});
