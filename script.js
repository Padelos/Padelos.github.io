// ── Navbar ────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const hero   = document.getElementById('hero');

new IntersectionObserver(([e]) => {
    navbar.classList.toggle('visible', !e.isIntersecting);
}, { threshold: 0.1 }).observe(hero);

// ── PDF Modal ─────────────────────────────────────────────
const scanlines = document.getElementById('scanlines');

function openPDF(element) {
    document.getElementById('pdfDisplay').src = element.getAttribute('data-pdf');
    document.getElementById('pdfViewer').classList.add('open');
    scanlines.classList.add('hidden');

    if (typeof canvas !== 'undefined') {
        document.getElementById('pdfViewer').appendChild(canvas);
        // canvas.style.zIndex = '1';
        // canvas.style.borderRadius = '4px';
    }
}

function closePDF() {
    document.getElementById('pdfViewer').classList.remove('open');
    scanlines.classList.remove('hidden');

    if (typeof canvas !== 'undefined') {
        document.body.appendChild(canvas);
        // canvas.style.zIndex = '-2';
        // canvas.style.borderRadius = '0';
    }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePDF(); });

// ── Audio ─────────────────────────────────────────────────
const bgMusic      = document.getElementById('bgMusic');
const playBtn      = document.getElementById('audioPlayBtn');
const volumeSlider = document.getElementById('audioVolume');
const audioEq      = document.getElementById('audioEq');
const volIcon      = document.getElementById('audioVolIcon');

const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const iconVolHigh = document.getElementById('iconVolHigh');
const iconVolMid  = document.getElementById('iconVolMid');
const iconVolMute = document.getElementById('iconVolMute');

function setPlaying(on) {
    iconPlay.style.display  = on ? 'none' : 'block';
    iconPause.style.display = on ? 'block' : 'none';
    audioEq.classList.toggle('playing', on);
}

function updateVolIcon(val) {
    iconVolHigh.style.display = val >= 0.4 ? 'block' : 'none';
    iconVolMid.style.display  = val > 0 && val < 0.4 ? 'block' : 'none';
    iconVolMute.style.display = val <= 0 ? 'block' : 'none';
}

bgMusic.volume = 0.1;
// const audioTitle = document.querySelector('.audio-title');
// if (audioTitle.scrollWidth > audioTitle.clientWidth) {
//     audioTitle.classList.add('scrolling');
// }
const audioTitle = document.querySelector('.audio-title');
const titleWrap = document.querySelector('.audio-title-wrap');

function startMarquee() {
    const textWidth = audioTitle.scrollWidth;
    const wrapWidth = titleWrap.clientWidth;
    if (textWidth <= wrapWidth) return;

    let pos = wrapWidth;
    audioTitle.style.transform = `translateX(${pos}px)`;

    setInterval(() => {
        pos -= 0.65;
        if (pos < -textWidth) pos = wrapWidth;
        audioTitle.style.transform = `translateX(${pos}px)`;
    }, 16);
}

startMarquee();
updateVolIcon(0.1);

bgMusic.play().then(() => setPlaying(true)).catch(() => {
    const tryPlay = () => {
        bgMusic.play().then(() => setPlaying(true)).catch(() => {});
        document.removeEventListener('click',      tryPlay);
        document.removeEventListener('touchstart', tryPlay);
    };
    document.addEventListener('click',      tryPlay);
    document.addEventListener('touchstart', tryPlay);
});

playBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (bgMusic.paused) { bgMusic.play(); setPlaying(true); }
    else                { bgMusic.pause(); setPlaying(false); }
});

volumeSlider.addEventListener('input', () => {
    const val = parseFloat(volumeSlider.value);
    bgMusic.volume = val;
    updateVolIcon(val);
});

bgMusic.addEventListener('ended', () => setPlaying(false));

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgMusic.pause();
        setPlaying(false);
    } else {
        bgMusic.play().then(() => setPlaying(true)).catch(() => {});
    }
});

// ── Scroll-in animations ──────────────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.neon-card, .stat-item, .pdf-item, .featured-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s, border-color 0.3s, box-shadow 0.3s`;
    fadeObserver.observe(el);
});


// ── Matrix runs on all devices ────────────────────────────
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none;';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
});

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
const fontSize = 14;
const cols = Math.floor(canvas.width / fontSize);
const streams = Array(cols).fill(null);

streams.forEach((_, i) => {
    if (Math.random() < 0.15) {
        streams[i] = {
            y: Math.floor(Math.random() * canvas.height / fontSize),
            length: Math.floor(Math.random() * 8) + 4,
            opacity: 1
        };
    }
});

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    streams.forEach((s, i) => {
        if (!s) {
            if (Math.random() > 0.998) {
                streams[i] = { y: 0, length: Math.floor(Math.random() * 8) + 4, opacity: 1 };
            }
            return;
        }

        for (let j = 0; j < s.length; j++) {
            const trailY = s.y - j;
            if (trailY < 0) continue;
            const alpha = (1 - j / s.length) * s.opacity;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = j === 0 ? '#ccffdd' : '#69ff9e';
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, trailY * fontSize);
        }

        s.y++;

        if (s.y * fontSize > canvas.height) {
            s.opacity -= 0.05;
            if (s.opacity <= 0) streams[i] = null;
        }
    });

    ctx.globalAlpha = 1;
}, 80);