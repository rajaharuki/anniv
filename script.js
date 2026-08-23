
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.transition = 'opacity 1s ease';
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 1000);
    }, 2200);

    // ==================
    // CURSOR
    // ==================
    const cursor = document.getElementById('cursor');
    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        curX += (mouseX - curX) * 0.15;
        curY += (mouseY - curY) * 0.15;
        cursor.style.left = curX + 'px';
        cursor.style.top = curY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ==================
    // BG CANVAS - STARFIELD + DEPTH
    // ==================
    const bgCanvas = document.getElementById('bgCanvas');
    const bgCtx = bgCanvas.getContext('2d');

    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        noiseCanvas.width = window.innerWidth * 2;
        noiseCanvas.height = window.innerHeight * 2;
    });

    const stars = [];
    const numStars = 180;

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            z: Math.random() * bgCanvas.width,
            size: Math.random() * 1.5 + 0.3,
            speed: Math.random() * 0.3 + 0.05,
            opacity: Math.random() * 0.7 + 0.1,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }

    // Floating orbs
    const orbs = [];
    for (let i = 0; i < 4; i++) {
        orbs.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            r: Math.random() * 200 + 100,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.04 + 0.01
        });
    }

    let frameCount = 0;
    let mousePX = 0.5, mousePY = 0.5;

    document.addEventListener('mousemove', (e) => {
        mousePX = e.clientX / window.innerWidth;
        mousePY = e.clientY / window.innerHeight;
    });

    function drawBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        // Deep space gradient
        const grad = bgCtx.createRadialGradient(
            bgCanvas.width * 0.5 + (mousePX - 0.5) * 80,
            bgCanvas.height * 0.5 + (mousePY - 0.5) * 80,
            0,
            bgCanvas.width / 2, bgCanvas.height / 2,
            bgCanvas.width * 0.8
        );
        grad.addColorStop(0, 'rgba(15, 10, 30, 1)');
        grad.addColorStop(0.4, 'rgba(5, 3, 15, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

        // Floating orbs
        orbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;
            if (orb.x < -orb.r) orb.x = bgCanvas.width + orb.r;
            if (orb.x > bgCanvas.width + orb.r) orb.x = -orb.r;
            if (orb.y < -orb.r) orb.y = bgCanvas.height + orb.r;
            if (orb.y > bgCanvas.height + orb.r) orb.y = -orb.r;

            const orbGrad = bgCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
            orbGrad.addColorStop(0, `rgba(150, 100, 255, ${orb.opacity})`);
            orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
            bgCtx.fillStyle = orbGrad;
            bgCtx.beginPath();
            bgCtx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            bgCtx.fill();
        });

        // Stars with 3D parallax
        frameCount++;
        stars.forEach(star => {
            star.z -= star.speed;
            if (star.z <= 0) {
                star.z = bgCanvas.width;
                star.x = Math.random() * bgCanvas.width;
                star.y = Math.random() * bgCanvas.height;
            }

            const parallaxX = (mousePX - 0.5) * (300 / star.z) * 10;
            const parallaxY = (mousePY - 0.5) * (300 / star.z) * 10;

            const sx = (star.x - bgCanvas.width / 2) * (bgCanvas.width / star.z) + bgCanvas.width / 2 + parallaxX;
            const sy = (star.y - bgCanvas.height / 2) * (bgCanvas.width / star.z) + bgCanvas.height / 2 + parallaxY;
            const r = (bgCanvas.width / star.z) * star.size;

            const twinkle = 0.5 + 0.5 * Math.sin(frameCount * star.twinkleSpeed + star.twinkleOffset);
            const alpha = star.opacity * twinkle;

            if (sx < 0 || sx > bgCanvas.width || sy < 0 || sy > bgCanvas.height) return;

            bgCtx.beginPath();
            bgCtx.arc(sx, sy, Math.min(r, 2.5), 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            bgCtx.fill();

            // Glow for bright stars
            if (twinkle > 0.8 && r > 0.8) {
                const glow = bgCtx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
                glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.4})`);
                glow.addColorStop(1, 'rgba(0,0,0,0)');
                bgCtx.fillStyle = glow;
                bgCtx.beginPath();
                bgCtx.arc(sx, sy, r * 4, 0, Math.PI * 2);
                bgCtx.fill();
            }
        });

        requestAnimationFrame(drawBg);
    }
    drawBg();

    // ==================
    // NOISE CANVAS
    // ==================
    const noiseCanvas = document.getElementById('noiseCanvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    noiseCanvas.width = window.innerWidth * 2;
    noiseCanvas.height = window.innerHeight * 2;

    function generateNoise() {
        const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i+1] = val;
            data[i+2] = val;
            data[i+3] = 255;
        }
        noiseCtx.putImageData(imageData, 0, 0);
    }
    generateNoise();
    setInterval(generateNoise, 80);

    // ==================
    // FLOATING PARTICLES
    // ==================
    function createParticle() {
        const p = document.createElement('div');
        p.className = 'particle';
        const chars = ['✦', '·', '⋆', '°', '✧', '♡', '◦'];
        p.textContent = chars[Math.floor(Math.random() * chars.length)];
        p.style.cssText = `
            left: ${Math.random() * 100}vw;
            bottom: -20px;
            color: rgba(255,255,255,${Math.random() * 0.3 + 0.1});
            font-size: ${Math.random() * 14 + 8}px;
            --drift: ${(Math.random() - 0.5) * 100}px;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 5}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 25000);
    }

    setInterval(createParticle, 1500);
    for (let i = 0; i < 8; i++) setTimeout(createParticle, i * 300);

    // ==================
    // SCENE MANAGEMENT
    // ==================
    let currentScene = 0;
    const totalScenes = 4;
    const scenes = document.querySelectorAll('.scene');
    const progressDots = document.querySelectorAll('.progress-dot');
    const sceneNum = document.getElementById('sceneNum');
    const transitionEl = document.getElementById('transition');
    const scrollHint = document.getElementById('scrollHint');

    function goToScene(index) {
        if (index === currentScene || index < 0 || index >= totalScenes) return;

        // Transition
        transitionEl.style.transition = 'opacity 0.4s ease';
        transitionEl.style.opacity = '1';
        transitionEl.style.pointerEvents = 'all';

        setTimeout(() => {
            scenes[currentScene].classList.remove('active');
            currentScene = index;
            scenes[currentScene].classList.add('active');

            // Update dots
            progressDots.forEach((d, i) => {
                d.classList.toggle('active', i === currentScene);
            });

            // Update scene number
            sceneNum.textContent = `0${currentScene + 1} / 0${totalScenes}`;

            // Scroll hint
            scrollHint.style.opacity = currentScene < totalScenes - 1 ? '' : '0';

            transitionEl.style.opacity = '0';
            transitionEl.style.pointerEvents = 'none';

            // Animate timeline items in scene 2
            if (currentScene === 1) {
                animateTimeline();
            }

            // Animate message in scene 3
            if (currentScene === 2) {
                animateMessages();
            }

        }, 400);
    }

    function animateTimeline() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, i * 400 + 300);
        });
    }

    function animateMessages() {
        const spans = document.querySelectorAll('#msgText span');
        spans.forEach((span, i) => {
            setTimeout(() => {
                span.classList.add('show');
            }, i * 200 + 400);
        });
    }

    // Scroll / Wheel navigation
    let lastScroll = 0;
    let scrollCooldown = false;

    document.addEventListener('wheel', (e) => {
        if (scrollCooldown) return;
        scrollCooldown = true;
        setTimeout(() => scrollCooldown = false, 1200);

        if (e.deltaY > 0) {
            goToScene(currentScene + 1);
        } else {
            goToScene(currentScene - 1);
        }
    });

    // Touch support
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToScene(currentScene + 1);
            else goToScene(currentScene - 1);
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToScene(currentScene + 1);
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goToScene(currentScene - 1);
    });

    // Init transition state
    transitionEl.style.opacity = '0';
    transitionEl.style.pointerEvents = 'none';
