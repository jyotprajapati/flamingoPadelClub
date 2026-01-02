// ============================================
// FLAMINGO PADEL CLUB - MAIN JAVASCRIPT
// ============================================

// ============================================
// DEVICE & PERFORMANCE GUARDS
// ============================================
console.log('JS FILE LOADED');
const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

const isMobile = window.innerWidth <= 768;
const isLowPower = isTouchDevice || isMobile;

const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// 1. CUSTOM MAGNETIC CURSOR
// ============================================

if (!isTouchDevice && !prefersReducedMotion) {
    const cursor = document.querySelector('.cursor-ball');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    const cursorSpeed = 0.15;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const distX = mouseX - cursorX;
        const distY = mouseY - cursorY;
        cursorX += distX * cursorSpeed;
        cursorY += distY * cursorSpeed;

        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}

// Magnetic effect on interactive elements
const magneticElements = document.querySelectorAll('a, button, .court-hotspot');

if (!isTouchDevice) {
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor?.classList.add('hovering');
        });

        el.addEventListener('mouseleave', () => {
            cursor?.classList.remove('hovering');
        });
    });
}

// ============================================
// 2. MORPHING HERO TEXT
// ============================================

const morphingText = document.querySelector('.morphing-text');
if (morphingText) {
    const words = morphingText.querySelectorAll('.morph-word');
    let currentIndex = 0;

    // Set first word as active
    words[0]?.classList.add('active');

    function morphWords() {
        const currentWord = words[currentIndex];
        const nextIndex = (currentIndex + 1) % words.length;
        const nextWord = words[nextIndex];

        // Exit current word
        currentWord.classList.add('exiting');
        currentWord.classList.remove('active');

        // Enter next word
        setTimeout(() => {
            currentWord.classList.remove('exiting');
            nextWord.classList.add('active');
            currentIndex = nextIndex;
        }, 400);
    }

    // Change word every 3 seconds
    setInterval(morphWords, 3000);
}

// ============================================
// 3. CINEMATIC COURT EXPERIENCE - "Through The Glass"
// ============================================

// Initialize all canvases
const povCanvases = [
    { id: 'povCanvas1', scene: 'anticipation' },
    { id: 'povCanvas2', scene: 'rally' },
    { id: 'povCanvas3', scene: 'victory' }
];

povCanvases.forEach((canvasData, index) => {
    const canvas = document.getElementById(canvasData.id);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById(`progress${index + 1}`);

    // Resize canvas
    function resizeCanvas() {
        const scale = isLowPower ? 0.6 : 1;

        canvas.width = canvas.offsetWidth * scale;
        canvas.height = canvas.offsetHeight * scale;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation state
    let frame = 0;
    let scrollProgress = 0;

    // Ball physics
    const ball = {
        x: canvas.width * 0.7,
        y: canvas.height * 0.5,
        radius: 12,
        vx: -8,
        vy: -3,
        spin: 0.1,
        trail: []
    };

    // Particles
    const particles = [];

    // Court colors
    const courtColor = '#698778';
    const ballColor = '#FF007D';
    const accentColor = '#F5AFAF';

    // Chapter 1: Anticipation - Ball approaching slowly
    function drawAnticipation() {
        // Draw court gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#698778');
        gradient.addColorStop(1, '#4a6052');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Court lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5, 0);
        ctx.lineTo(canvas.width * 0.5, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glass reflection effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width * 0.3, canvas.height);
        ctx.fillRect(canvas.width * 0.7, 0, canvas.width * 0.3, canvas.height);

        // Animated ball approaching
        ball.x -= ball.vx * 0.3;
        ball.y += Math.sin(frame * 0.05) * 2;

        // Ball trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 20) ball.trail.shift();

        ctx.strokeStyle = 'rgba(255, 0, 125, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ball.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw ball with glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = ballColor;
        const ballGradient = ctx.createRadialGradient(
            ball.x - 5, ball.y - 5, 0,
            ball.x, ball.y, ball.radius
        );
        ballGradient.addColorStop(0, '#FFF0F0');
        ballGradient.addColorStop(0.6, accentColor);
        ballGradient.addColorStop(1, ballColor);
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reset if ball goes off screen
        if (ball.x < -50) {
            ball.x = canvas.width * 0.7;
            ball.y = canvas.height * 0.5;
            ball.trail = [];
        }
    }

    // Chapter 2: Rally - Fast back and forth action
    function drawRally() {
        // Court with more intensity
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#577060');
        gradient.addColorStop(1, '#698778');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Net in center
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.5, canvas.height * 0.2);
        ctx.lineTo(canvas.width * 0.5, canvas.height * 0.8);
        ctx.stroke();

        // Net mesh
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let y = canvas.height * 0.2; y < canvas.height * 0.8; y += 20) {
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.47, y);
            ctx.lineTo(canvas.width * 0.53, y);
            ctx.stroke();
        }

        // Fast moving ball
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.2; // Gravity

        // Bounce off walls
        if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
            ball.vx *= -0.9;
            createParticles(ball.x, ball.y, 10);
        }
        if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
            ball.vy *= -0.9;
            createParticles(ball.x, ball.y, 10);
        }

        // Trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 15) ball.trail.shift();

        ctx.strokeStyle = 'rgba(255, 0, 125, 0.5)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ball.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw ball
        ctx.shadowBlur = 40;
        ctx.shadowColor = ballColor;
        const ballGradient = ctx.createRadialGradient(
            ball.x - 6, ball.y - 6, 0,
            ball.x, ball.y, ball.radius
        );
        ballGradient.addColorStop(0, '#FFFFFF');
        ballGradient.addColorStop(0.5, accentColor);
        ballGradient.addColorStop(1, ballColor);
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw and update particles
        updateParticles();
    }

    // Chapter 3: Victory - Explosion of particles
    function drawVictory() {
        // Bright celebratory court
        const gradient = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.5, 0,
            canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.6
        );
        gradient.addColorStop(0, '#698778');
        gradient.addColorStop(1, '#3a4a42');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Radial lines
        ctx.strokeStyle = 'rgba(255, 0, 125, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.5, canvas.height * 0.5);
            ctx.lineTo(
                canvas.width * 0.5 + Math.cos(angle) * canvas.width,
                canvas.height * 0.5 + Math.sin(angle) * canvas.height
            );
            ctx.stroke();
        }

        // Continuous particle creation
        if (frame % 3 === 0) {
            createParticles(canvas.width * 0.5, canvas.height * 0.5, 5);
        }

        // Draw static ball at center with pulse
        const pulseScale = 1 + Math.sin(frame * 0.1) * 0.2;
        ctx.shadowBlur = 60;
        ctx.shadowColor = ballColor;
        const ballGradient = ctx.createRadialGradient(
            canvas.width * 0.5 - 8,
            canvas.height * 0.5 - 8,
            0,
            canvas.width * 0.5,
            canvas.height * 0.5,
            ball.radius * pulseScale
        );
        ballGradient.addColorStop(0, '#FFFFFF');
        ballGradient.addColorStop(0.4, accentColor);
        ballGradient.addColorStop(1, ballColor);
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(
            canvas.width * 0.5,
            canvas.height * 0.5,
            ball.radius * pulseScale,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw and update particles
        updateParticles();
    }

    // Particle system
    function createParticles(x, y, count) {
        const finalCount = isLowPower ? Math.floor(count * 0.4) : count;

        for (let i = 0; i < finalCount; i++) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                decay: isLowPower ? 0.03 : 0.015,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? ballColor : accentColor
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (canvasData.scene === 'anticipation') {
            drawAnticipation();
        } else if (canvasData.scene === 'rally') {
            drawRally();
        } else if (canvasData.scene === 'victory') {
            drawVictory();
        }

        frame++;
        requestAnimationFrame(animate);
    }

    animate();

    // Scroll-based progress bar
    const chapter = canvas.closest('.chapter');
    if (chapter && progressBar) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chapter.classList.add('in-view');

                    // Animate progress bar
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += 1;
                        progressBar.style.width = progress + '%';
                        if (progress >= 100) {
                            clearInterval(progressInterval);
                        }
                    }, 30);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(chapter);
    }
});

// ============================================
// 3b. SCROLL-DRIVEN RALLY EXPERIENCE
// ============================================

function initScrollRally() {
    const section = document.querySelector('.scroll-rally-section');
    const canvas = document.getElementById('rallyCanvas');
    const speedEl = document.getElementById('rallySpeed');
    const phaseEl = document.getElementById('rallyPhase');
    if (!section || !canvas || !speedEl || !phaseEl) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Court styling
    const courtColor = '#698778';
    const lineColor = 'rgba(255,255,255,0.6)';
    const ballColor = '#FF007D';
    const playerAColor = '#FFF0F0';
    const playerBColor = '#F5AFAF';

    // State
    let lastBall = { x: canvas.width * 0.25, y: canvas.height * 0.6 };
    let lastSpeed = 0;
    let currentPhase = 'serve'; // 'serve' | 'rally' | 'smash' | 'celebrate'

    function setPhase(key) {
        if (currentPhase === key) return;
        currentPhase = key;
        const map = {
            serve: { en: 'Serve', es: 'Saque' },
            rally: { en: 'Rally', es: 'Rally' },
            smash: { en: 'Smash', es: 'Remate' },
            celebrate: { en: 'Celebrate', es: 'Celebrar' }
        };
        const t = map[key];
        phaseEl.setAttribute('data-en', t.en);
        phaseEl.setAttribute('data-es', t.es);
        phaseEl.innerHTML = currentLanguage === 'es' ? t.es : t.en;
    }

    function getProgress() {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const totalScrollable = rect.height - viewportH;
        const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
        const p = totalScrollable > 0 ? scrolled / totalScrollable : 0;
        return Math.min(Math.max(p, 0), 1);
    }

    function drawCourt() {
        const { width: w, height: h } = canvas;

        // Background gradient court
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0a0f0c');
        g.addColorStop(1, courtColor);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // Court boundaries
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(w * 0.1, h * 0.15, w * 0.8, h * 0.7);

        // Net
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.15);
        ctx.lineTo(w * 0.5, h * 0.85);
        ctx.stroke();

        // Subtle glass reflection edges
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(0, 0, w * 0.15, h);
        ctx.fillRect(w * 0.85, 0, w * 0.15, h);
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function pingpong(t) { const f = Math.abs((t % 2) - 1); return f; }

    function drawPlayers(ax, ay, bx, by) {
        // Player A
        ctx.fillStyle = playerAColor;
        ctx.beginPath();
        ctx.arc(ax, ay, 16, 0, Math.PI * 2);
        ctx.fill();

        // Player B
        ctx.fillStyle = playerBColor;
        ctx.beginPath();
        ctx.arc(bx, by, 16, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawBall(x, y) {
        ctx.shadowColor = ballColor;
        ctx.shadowBlur = 20;
        const grad = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, 10);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.6, '#F5AFAF');
        grad.addColorStop(1, ballColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function updateHUD(speed) {
        const kmh = Math.round(Math.min(speed * 0.25, 120));
        speedEl.textContent = `${kmh} km/h`;
    }

    function animate() {
        const p = easeInOut(getProgress());
        const { width: w, height: h } = canvas;
        ctx.clearRect(0, 0, w, h);
        drawCourt();

        // Player base positions
        const aBase = { x: w * 0.3, y: h * 0.65 };
        const bBase = { x: w * 0.7, y: h * 0.35 };

        let ball = { x: aBase.x, y: aBase.y };

        if (p <= 0.25) {
            // Serve phase
            setPhase('serve');
            const t = p / 0.25;
            const tt = easeInOut(t);
            ball.x = lerp(aBase.x, bBase.x, tt);
            ball.y = h * 0.5 + Math.sin(tt * Math.PI) * h * 0.18;
            // Players adjust slightly
            const ax = aBase.x - Math.sin(tt * Math.PI) * 30;
            const ay = aBase.y;
            const bx = bBase.x;
            const by = bBase.y + Math.sin(tt * Math.PI) * 30;
            drawPlayers(ax, ay, bx, by);
        } else if (p <= 0.85) {
            // Rally phase
            setPhase('rally');
            const t = (p - 0.25) / 0.6; // 0..1
            const hits = 6; // number of exchanges
            const segT = t * hits; // 0..hits
            const idx = Math.floor(segT);
            const frac = segT - idx; // 0..1 within segment
            const dir = idx % 2 === 0 ? 0 : 1; // 0: A->B, 1: B->A
            const tt = easeInOut(frac);
            const from = dir === 0 ? aBase : bBase;
            const to = dir === 0 ? bBase : aBase;
            ball.x = lerp(from.x, to.x, tt);
            ball.y = h * 0.5 + Math.sin(tt * Math.PI * 1.2) * h * 0.22;
            const ax = aBase.x + Math.sin(segT * Math.PI * 0.5) * 40;
            const ay = aBase.y + Math.cos(segT * Math.PI * 0.5) * 20;
            const bx = bBase.x + Math.cos(segT * Math.PI * 0.5) * 40;
            const by = bBase.y + Math.sin(segT * Math.PI * 0.5) * 20;
            drawPlayers(ax, ay, bx, by);
        } else if (p <= 0.95) {
            // Smash phase
            setPhase('smash');
            const t = (p - 0.85) / 0.1;
            const tt = easeInOut(t);
            ball.x = lerp(bBase.x, w * 0.9, tt);
            ball.y = lerp(bBase.y, h * 0.8, tt);
            const ax = aBase.x - 20;
            const ay = aBase.y + 10;
            const bx = bBase.x + 40;
            const by = bBase.y - 10;
            drawPlayers(ax, ay, bx, by);
        } else {
            // Celebrate phase
            setPhase('celebrate');
            ball.x = w * 0.85 + Math.sin(p * 8) * 8;
            ball.y = h * 0.8 + Math.cos(p * 8) * 6;
            drawPlayers(aBase.x - 10, aBase.y, bBase.x + 20, bBase.y - 10);
        }

        // Compute speed from last frame
        const dx = ball.x - lastBall.x;
        const dy = ball.y - lastBall.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // approximate px per frame at ~60fps → px/s
        const pxPerSec = dist * 60;
        lastSpeed = pxPerSec;
        updateHUD(lastSpeed);

        drawBall(ball.x, ball.y);
        lastBall = ball;
        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================
// 4. SOUND DESIGN SYSTEM
// ============================================

let audioContext;
let isMuted = localStorage.getItem('soundMuted') === 'true';

const soundToggle = document.querySelector('.sound-toggle');
if (soundToggle) {
    if (isMuted) {
        soundToggle.classList.add('muted');
    }

    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.classList.toggle('muted');
        localStorage.setItem('soundMuted', isMuted);
    });
}

// Initialize audio context on first interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play padel ball hit sound
function playPadelSound() {
    if (isMuted || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Add sound to buttons and CTAs
document.addEventListener('click', (e) => {
    if (e.target.matches('button, .btn, .cta-btn')) {
        initAudio();
        playPadelSound();
    }
});

// ============================================
// 5. COMMUNITY FEED ANIMATIONS
// ============================================

const feedItems = document.querySelectorAll('.feed-item');
const statCards = document.querySelectorAll('.stat-card');

// Intersection observer for feed animations
const feedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.1 });

feedItems.forEach(item => {
    feedObserver.observe(item);
});

// Animate stat counters
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const value = entry.target.querySelector('.stat-value');
            const target = parseInt(value.textContent);
            animateCounter(value, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statCards.forEach(card => {
    statsObserver.observe(card);
});

// ============================================
// Language Translations
const translations = {
    en: {
        // Navigation
        "Home": "Home",
        "About": "About",
        "Courts": "Courts",
        "Stories": "Stories",
        "Contact": "Contact",
        "Book a Court": "Book a Court",

        // Hero Section
        "Elevate Your Game": "Elevate Your Game",
        "Where passion meets elegance on every court": "Where passion meets elegance on every court",
        "Growth in 5 years": "Growth in 5 years",
        "Women Players": "Women Players",
        "Times/Week": "Times/Week",
        "Book a Court Now": "Book a Court Now",
        "Book a Class": "Book a Class",
        "Start Your First Class": "Start Your First Class",

        // Features
        "Your Complete Padel Experience": "Your Complete Padel Experience",
        "Premium Courts": "Premium Courts",
        "State-of-the-art facilities with professional-grade surfaces designed for optimal play": "State-of-the-art facilities with professional-grade surfaces designed for optimal play",
        "Expert Coaching": "Expert Coaching",
        "Learn from certified professionals who elevate your technique and strategy": "Learn from certified professionals who elevate your technique and strategy",
        "Vibrant Community": "Vibrant Community",
        "Connect with fellow enthusiasts and build lasting friendships through sport": "Connect with fellow enthusiasts and build lasting friendships through sport",
        "Easy Booking": "Easy Booking",
        "Book your court or class in seconds with our streamlined reservation system": "Book your court or class in seconds with our streamlined reservation system",

        // Parallax
        "More Than Courts. A Lifestyle.": "More Than Courts. A Lifestyle.",
        "Join a community where sport meets social connection": "Join a community where sport meets social connection",

        // 3D Court Section
        "Experience Our Courts": "Experience Our Courts",
        "Explore our state-of-the-art facilities in immersive 3D": "Explore our state-of-the-art facilities in immersive 3D",
        "Reinforced Glass Walls": "Reinforced Glass Walls",
        "Crystal-clear panoramic views with professional-grade safety glass": "Crystal-clear panoramic views with professional-grade safety glass",
        "LED Court Lighting": "LED Court Lighting",
        "Advanced lighting system for perfect visibility during evening matches": "Advanced lighting system for perfect visibility during evening matches",
        "Professional Surface": "Professional Surface",
        "Premium synthetic turf with optimal grip and ball response": "Premium synthetic turf with optimal grip and ball response",
        "Climate Control": "Climate Control",
        "Regulated temperature and ventilation for year-round comfort": "Regulated temperature and ventilation for year-round comfort",

        // Community Feed
        "Live Community": "Live Community",
        "vs": "vs",
        "just won their match": "just won their match",
        "Epic rally! GG": "Epic rally! GG",
        "Court 2": "Court 2",
        "joined the club": "joined the club",
        "Ready to dominate 💪": "Ready to dominate 💪",
        "New Member": "New Member",
        "booked an evening session": "booked an evening session",
        "Can't wait for tonight's game!": "Can't wait for tonight's game!",
        "Court 1": "Court 1",
        "completed a lesson": "completed a lesson",
        "My backhand is getting better! 🎾": "My backhand is getting better! 🎾",
        "Advanced Class": "Advanced Class",
        "Active Players": "Active Players",
        "Today's Matches": "Today's Matches",
        "Court Utilization": "Court Utilization",

        // Stories
        "Game Changing Stories": "Game Changing Stories",
        "Flamingo": "Flamingo",

        // CTA
        "Ready to Elevate Your Game?": "Ready to Elevate Your Game?",
        "Join the Flamingo community today and experience padel like never before": "Join the Flamingo community today and experience padel like never before",

        // Footer
        "Elevating the padel experience": "Elevating the padel experience",
        "Quick Links": "Quick Links",
        "About Us": "About Us",
        "Location": "Location",
        "Flamingo Padel Club": "Flamingo Padel Club",
        "All Rights Reserved": "All Rights Reserved",

        // Booking Pages
        "Book Your Court": "Book Your Court",
        "Book Your Class": "Book Your Class",
        "Select your preferred date and time": "Select your preferred date and time",
        "Select your preferred training session": "Select your preferred training session",
        "Coming Soon": "Coming Soon",
        "We're working hard to bring you the best booking experience": "We're working hard to bring you the best booking experience",
        "Go Back Home": "Go Back Home",
        "Court Booking": "Court Booking",
        "Class Booking": "Class Booking"
    },
    es: {
        // Navigation
        "Home": "Inicio",
        "About": "Acerca",
        "Courts": "Canchas",
        "Stories": "Historias",
        "Contact": "Contacto",
        "Book a Court": "Reservar Cancha",

        // Hero Section
        "Elevate Your Game": "Eleva Tu Juego",
        "Where passion meets elegance on every court": "Donde la pasión encuentra la elegancia en cada cancha",
        "Growth in 5 years": "Crecimiento en 5 años",
        "Women Players": "Jugadoras",
        "Times/Week": "Veces/Semana",
        "Book a Court Now": "Reservar Cancha Ahora",
        "Book a Class": "Reservar Clase",
        "Start Your First Class": "Comenzar Tu Primera Clase",

        // Features
        "Your Complete Padel Experience": "Tu Experiencia Completa de Pádel",
        "Premium Courts": "Canchas Premium",
        "State-of-the-art facilities with professional-grade surfaces designed for optimal play": "Instalaciones de última generación con superficies de grado profesional diseñadas para juego óptimo",
        "Expert Coaching": "Entrenamiento Experto",
        "Learn from certified professionals who elevate your technique and strategy": "Aprende de profesionales certificados que elevan tu técnica y estrategia",
        "Vibrant Community": "Comunidad Vibrante",
        "Connect with fellow enthusiasts and build lasting friendships through sport": "Conecta con otros entusiastas y construye amistades duraderas a través del deporte",
        "Easy Booking": "Reservas Fáciles",
        "Book your court or class in seconds with our streamlined reservation system": "Reserva tu cancha o clase en segundos con nuestro sistema optimizado",

        // Parallax
        "More Than Courts. A Lifestyle.": "Más Que Canchas. Un Estilo de Vida.",
        "Join a community where sport meets social connection": "Únete a una comunidad donde el deporte encuentra la conexión social",

        // 3D Court Section
        "Experience Our Courts": "Experimenta Nuestras Canchas",
        "Explore our state-of-the-art facilities in immersive 3D": "Explora nuestras instalaciones de vanguardia en 3D inmersivo",
        "Reinforced Glass Walls": "Paredes de Cristal Reforzado",
        "Crystal-clear panoramic views with professional-grade safety glass": "Vistas panorámicas cristalinas con vidrio de seguridad de grado profesional",
        "LED Court Lighting": "Iluminación LED",
        "Advanced lighting system for perfect visibility during evening matches": "Sistema de iluminación avanzado para visibilidad perfecta en partidos nocturnos",
        "Professional Surface": "Superficie Profesional",
        "Premium synthetic turf with optimal grip and ball response": "Césped sintético premium con agarre óptimo y respuesta de pelota",
        "Climate Control": "Control Climático",
        "Regulated temperature and ventilation for year-round comfort": "Temperatura y ventilación reguladas para comodidad todo el año",

        // Community Feed
        "Live Community": "Comunidad en Vivo",
        "vs": "vs",
        "just won their match": "acaban de ganar su partido",
        "Epic rally! GG": "¡Rally épico! GG",
        "Court 2": "Cancha 2",
        "joined the club": "se unió al club",
        "Ready to dominate 💪": "Listo para dominar 💪",
        "New Member": "Nuevo Miembro",
        "booked an evening session": "reservó una sesión nocturna",
        "Can't wait for tonight's game!": "¡No puedo esperar al juego de esta noche!",
        "Court 1": "Cancha 1",
        "completed a lesson": "completó una lección",
        "My backhand is getting better! 🎾": "¡Mi revés está mejorando! 🎾",
        "Advanced Class": "Clase Avanzada",
        "Active Players": "Jugadores Activos",
        "Today's Matches": "Partidos de Hoy",
        "Court Utilization": "Utilización de Canchas",

        // Stories
        "Game Changing Stories": "Historias Que Cambian El Juego",
        "Querétaro": "Querétaro",

        // CTA
        "Ready to Elevate Your Game?": "¿Listo Para Elevar Tu Juego?",
        "Join the Flamingo community today and experience padel like never before": "Únete a la comunidad Flamingo hoy y experimenta el pádel como nunca antes",

        // Footer
        "Elevating the padel experience": "Elevando la experiencia del pádel",
        "Quick Links": "Enlaces Rápidos",
        "About Us": "Acerca de Nosotros",
        "Location": "Ubicación",
        "East Querétaro<br>Near Zakia, Zibatá & Universidad Anáhuac": "Zona Este de Querétaro<br>Cerca de Zakia, Zibatá y Universidad Anáhuac",
        "All Rights Reserved": "Todos los Derechos Reservados",

        // Booking Pages
        "Book Your Court": "Reserva Tu Cancha",
        "Book Your Class": "Reserva Tu Clase",
        "Select your preferred date and time": "Selecciona tu fecha y hora preferida",
        "Select your preferred training session": "Selecciona tu sesión de entrenamiento preferida",
        "Coming Soon": "Próximamente",
        "We're working hard to bring you the best booking experience": "Estamos trabajando duro para brindarte la mejor experiencia de reserva",
        "Go Back Home": "Volver al Inicio",
        "Court Booking": "Reserva de Cancha",
        "Class Booking": "Reserva de Clase"
    }
};

let currentLanguage = 'en';

// ============================================
// LANGUAGE SWITCHER
// ============================================

function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            switchLanguage(lang);

            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;

    // Update all elements with data-en and data-es attributes
    const elements = document.querySelectorAll('[data-en][data-es]');

    elements.forEach(el => {
        const text = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text;
        }
    });

    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.feature-card, .story-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// ============================================
// PARALLAX EFFECT
// ============================================

function initParallax() {
    const parallaxSection = document.querySelector('.parallax-section');

    if (parallaxSection && !isLowPower && !prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxBg = parallaxSection.querySelector('.parallax-bg');
            const parallaxContent = parallaxSection.querySelector('.parallax-content');

            const sectionTop = parallaxSection.offsetTop;
            const sectionHeight = parallaxSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Only apply effect when section is in view
            if (scrolled + windowHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
                const offset = scrolled - sectionTop;
                parallaxBg.style.transform = `translateY(${offset * 0.5}px) scale(1.1)`;
                parallaxContent.style.transform = `translateY(${offset * 0.2}px)`;
            }
        });
    }
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

// function initNavbarScroll() {
//     const navbar = document.querySelector('.navbar');

//     window.addEventListener('scroll', () => {
//         if (window.scrollY > 100) {
//             navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.1)';
//             navbar.style.padding = '0.5rem 0';
//         } else {
//             navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
//             navbar.style.padding = '1rem 0';
//         }
//     });
// }

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// STORY SLIDER
// ============================================

let currentSlide = 0;
const slidesPerView = window.innerWidth > 968 ? 3 : window.innerWidth > 640 ? 2 : 1;

function initStorySlider() {
    const dots = document.querySelectorAll('.dot');
    const stories = document.querySelectorAll('.story-card');

    if (dots.length > 0 && stories.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
        });

        // Auto-rotate every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % dots.length;
            updateSlider();
        }, 5000);
    }
}

function updateSlider() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// ============================================
// FLOATING ANIMATION ENHANCEMENT
// ============================================

function initFloatingCards() {
    // Removed - no longer using floating cards
}

// ============================================
// NAVBAR SCROLL EFFECT - Enhanced
// ============================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
            navToggle.classList.toggle('open'); // optional animation for hamburger
            menuToggle.classList.toggle('open');
        });
    }
}

// ============================================
// STATS COUNTER ANIMATION
// ============================================

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateValue(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateValue(element) {
    const targetValue = parseInt(element.getAttribute('data-value')) || 0;
    let current = 0;
    const increment = targetValue / 50;
    const duration = 1500;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, stepTime);
}

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================

function initPageLoadAnimation() {
    // Smooth fade-in on load
    document.body.style.opacity = '1';
}

// ============================================
// INITIALIZE ALL FUNCTIONS
// ============================================
// Load saved language preference
const savedLang = localStorage.getItem('preferredLanguage') || 'en';
if (savedLang === 'es') {
    document.querySelector('[data-lang="es"]')?.click();
}


const video = document.querySelector('.hero-video');
if (video) {
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Video is playing');
            })
            .catch((error) => {
                console.log('Autoplay blocked, fallback to poster', error);
            });
    }
}



// Initialize all features
initLanguageSwitcher();
initScrollAnimations();
initParallax();
initNavbarScroll();
initSmoothScroll();
initStorySlider();
animateStats();
initPageLoadAnimation();

if (!isLowPower && !prefersReducedMotion) {
    initScrollRally();
}

// MOBILE MENU
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

if (menuToggle && navLinks && navActions) {
    menuToggle.addEventListener('click', () => {
        console.log('MENU CLICKED');
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');
    });
}

console.log('JS RUNNING AFTER DOM');

// ============================================
// RESPONSIVE ADJUSTMENTS
// ============================================

window.addEventListener('resize', () => {
    // Recalculate slides per view on resize
    const newSlidesPerView = window.innerWidth > 968 ? 3 : window.innerWidth > 640 ? 2 : 1;
    if (newSlidesPerView !== slidesPerView && !isMobile) {
        location.reload();
    }
});

// ============================================
// KINETIC POSTER - Large words move subtly on scroll
// ============================================

function initKineticPoster() {
    const section = document.querySelector('.kinetic-poster-section');
    const words = document.querySelectorAll('.poster-word');
    if (!section || words.length === 0 || isLowPower || prefersReducedMotion) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // respect reduced motion

    function getProgress() {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const totalScrollable = rect.height - viewportH;
        const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
        return totalScrollable > 0 ? scrolled / totalScrollable : 0;
    }

    function animate() {
        const p = getProgress();
        // Place words at different offsets and slide subtly
        words.forEach((el, i) => {
            const baseY = (-30 + i * 30); // percent positions
            const shift = (i % 2 === 0 ? -1 : 1) * p * 30; // move opposite directions
            const x = (i - 1) * 8 + p * (i % 2 === 0 ? -6 : 6);
            el.style.transform = `translate(${x}vw, ${baseY + shift}vh)`;
        });
        requestAnimationFrame(animate);
    }

    animate();
}
