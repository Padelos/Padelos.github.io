// ── Navbar ────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const hero   = document.getElementById('hero');

new IntersectionObserver(([e]) => {
    navbar.classList.toggle('visible', !e.isIntersecting);
}, { threshold: 0.1 }).observe(hero);

const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(a => a.classList.remove('active'));
            const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { threshold: 0, rootMargin: '-50% 0px -50% 0px' });

document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

// ── PDF Modal ─────────────────────────────────────────────
const scanlines = document.getElementById('scanlines');

function openPDF(element) {

    const pdf = element.getAttribute('data-pdf');
    // const absoluteUrl = window.location.origin + '/' + pdf;
    // document.getElementById('pdfDisplay').src = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(absoluteUrl)}`;
    // document.getElementById('pdfDisplay').src = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`; // google docs

    // Mozilla params -> #pagemode=none or thumbs or bookmarks

    // above 2000px 90% size?
    const pageMode = window.innerWidth > 1250 ? "thumbs" : "none";
    const absoluteUrl = "https://padelos.github.io" + '/' + pdf;
    const filePath = "https://mozilla.github.io/pdf.js/web/viewer.html?" +
            `file=${encodeURIComponent(absoluteUrl)}` +
            `#pagemode=${pageMode}`;

    document.getElementById('pdfDisplay').src = filePath;

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

const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
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
updateVolIcon(0.1);

const audioTitle = document.querySelector('.audio-title');
const titleWrap  = document.querySelector('.audio-title-wrap');

function startMarquee() {
    const textWidth = audioTitle.scrollWidth;
    const wrapWidth = titleWrap.clientWidth;
    if (textWidth <= wrapWidth) return;

    let pos = 0;
    audioTitle.style.transform = `translateX(0px)`;

    setInterval(() => {
        pos -= 0.65;
        if (pos < -(textWidth + 20)) pos = wrapWidth;
        audioTitle.style.transform = `translateX(${pos}px)`;
    }, 16);
}

startMarquee();

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

function drawMatrix() {
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

    // Throttle to ~12fps instead of 60fps
    setTimeout(() => requestAnimationFrame(drawMatrix), 80);
}

requestAnimationFrame(drawMatrix);

// ── Terminal ──────────────────────────────────────────────
const terminal       = document.getElementById('terminal');
const terminalInput  = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

// Build PDF map from DOM
const pdfItems = {};
document.querySelectorAll('[data-pdf]').forEach(el => {
    const label = (el.querySelector('p, h3') || el).textContent.trim();
    const key = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, '');
    if (key) pdfItems[key] = el;
});

function longestCommonPrefix(arr) {
    if (!arr.length) return '';
    let prefix = arr[0];
    for (const s of arr) {
        let i = 0;
        while (i < prefix.length && i < s.length && prefix[i] === s[i]) i++;
        prefix = prefix.slice(0, i);
    }
    return prefix;
}

const allCmdNames = ['help','whoami','uname','job','experience','skills','timeline','contact','openpdf','listpdf','clear'];

function toggleTerminal() {
    terminal.classList.toggle('open');
    if (terminal.classList.contains('open')) terminalInput.focus();
}

// replace with number
document.addEventListener('keydown', e => {
    if ((e.key === '`' || e.key === '~') && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        toggleTerminal();
    }
});


const commands = {
    help: () => [
        '<span class="t-yellow">Available commands:</span>',
        '  <span class="t-green">help</span>        — show this list',
        '  <span class="t-green">whoami</span>      — who is this guy',
        '  <span class="t-green">uname</span>       — system info',
        '  <span class="t-green">job</span>         — current position',
        '  <span class="t-green">experience</span>  — work experience',
        '  <span class="t-green">skills</span>      — technical skills',
        '  <span class="t-green">timeline</span>    — career timeline',
        '  <span class="t-green">contact</span>     — get in touch',
        '  <span class="t-green">listpdf</span>     — list all available PDFs',
        '  <span class="t-green">openpdf</span>     — open a PDF, e.g. openpdf cv',
        '  <span class="t-green">ls</span>          — list sections',
        '  <span class="t-green">cd</span>          — go to section, e.g. cd about',
        '  <span class="t-green">clear</span>       — clear terminal',
    ],
    whoami: () => [
        '<span class="t-white">Padelis Proios</span>',
        '<span class="t-dim">Informatics & Computer Engineering graduate.</span>',
        // '<span class="t-dim">QA Automation Engineer by day, tinkerer by night.</span>',
        // '<span class="t-dim">QA Automation Engineer by day, midnight driver by night.</span>',
        '<span class="t-dim">QA Automation Engineer by day, bug creator by night.</span>',
        '<span class="t-dim">Based in Attica, Athens, Greece.</span>',
        '<span class="t-dim">Interests: mobile software, fast cars, well-built things.</span>',
    ],
    uname: () => [
        '<span class="t-green">OS</span>        <span class="t-white">Human v1.0 (Athens Edition)</span>',
        '<span class="t-green">HOST</span>      <span class="t-white">padelis@portfolio</span>',
        '<span class="t-green">KERNEL</span>    <span class="t-white">Informatics & Computer Engineering</span>',
        '<span class="t-green">UPTIME</span>    <span class="t-white">since \'99</span>',
        '<span class="t-green">SHELL</span>     <span class="t-white">curiosity</span>',
    ],
    job: () => [
        '<span class="t-yellow">Current Position</span>',
        '<span class="t-green">Title</span>     <span class="t-white">QA Automation Engineer</span>',
        '<span class="t-green">Focus</span>     <span class="t-white">Test automation, API testing, CI/CD pipelines</span>',
        '<span class="t-green">Stack</span>     <span class="t-white">Playwright, Jenkins, Postman, cURL</span>',
        '<span class="t-green">Location</span>  <span class="t-white">Athens, Greece</span>',
    ],
    experience: () => [
        '<span class="t-yellow">Work Experience</span>',
        '<span class="t-green">QA Automation Engineer</span>',
        '<span class="t-dim">  — Writing test cases and automation software/scripts</span>',
        '<span class="t-dim">  — Building and maintaining test pipelines</span>',
        '<span class="t-dim">  — API testing and validation</span>',
        '<span class="t-dim">  — Ensuring software ships without breaking things (hopefully)</span>',
    ],
    skills: () => [
        '<span class="t-yellow">Technical Skills</span>',
        '<span class="t-green">Languages</span>   <span class="t-white">Python, Java, C, C++, JavaScript, Bash</span>',
        '<span class="t-green">QA & Test</span>   <span class="t-white">Playwright, Jenkins, Postman, ApiDog, cURL</span>',
        '<span class="t-green">AI & Data</span>   <span class="t-white">Machine Learning, Data Mining, Image Processing</span>',
        '<span class="t-green">Tools</span>       <span class="t-white">Git, Linux, IntelliJ, Vim, VS Code</span>',
    ],
    timeline: () => [
        '<span class="t-yellow">Career Timeline</span>',
        '<span class="t-green">2024 →</span>  <span class="t-white">QA Automation Engineer</span>',
        '<span class="t-dim">         Started professional career in QA automation</span>',
        '<span class="t-green">2024</span>    <span class="t-white">Graduated — Informatics & Computer Engineering</span>',
        '<span class="t-dim">         Thesis: Solar Explorer project</span>',
        '<span class="t-green">2019</span>    <span class="t-white">Started University</span>',
    ],
    contact: () => [
        '<span class="t-yellow">Contact</span>',
        '<span class="t-green">Email</span>     <span class="t-white">unknown@gmail.com</span>',
        '<span class="t-green">GitHub</span>    <span class="t-white">github.com/Padelos</span>',
        '<span class="t-green">LinkedIn</span>  <span class="t-white">linkedin.com/in/unknown</span>',
    ],
    listpdf: () => {
        const keys = Object.keys(pdfItems);
        if (keys.length === 0) return ['<span class="t-red">No PDFs found.</span>'];
        return ['<span class="t-yellow">Available PDFs:</span>', ...keys.map(k => `  <span class="t-green">${k}</span>`)];
    },
    clear: () => null,
};

function printLines(lines) {
    lines.forEach(line => {
        const div = document.createElement('div');
        div.className = 't-line';
        div.innerHTML = line;
        terminalOutput.appendChild(div);
    });
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printCommand(cmd) {
    const div = document.createElement('div');
    div.className = 't-line';
    div.innerHTML = `<span class="t-green">padelis@portfolio</span><span class="t-dim">:</span><span class="t-blue">~</span><span class="t-dim">$</span> <span class="t-white">${cmd}</span>`;
    terminalOutput.appendChild(div);
}


terminalInput.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const val = terminalInput.value;
        const spaceIdx = val.indexOf(' ');

        if (spaceIdx === -1) {
            // Autocomplete command name
            const partial = val.toLowerCase();
            const matches = allCmdNames.filter(c => c.startsWith(partial));
            if (matches.length === 1) {
                terminalInput.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                const prefix = longestCommonPrefix(matches);
                if (prefix.length > partial.length) {
                    terminalInput.value = prefix;
                } else {
                    printCommand(val);
                    printLines([`<span class="t-dim">${matches.join('  ')}</span>`]);
                }
            }
        } else {
            // Autocomplete PDF argument
            const cmd = val.slice(0, spaceIdx).toLowerCase();
            const arg = val.slice(spaceIdx + 1).toLowerCase();
            if (cmd === 'openpdf') {
                const matches = Object.keys(pdfItems).filter(k => k.startsWith(arg));
                if (matches.length === 1) {
                    terminalInput.value = 'openpdf ' + matches[0];
                } else if (matches.length > 1) {
                    const prefix = longestCommonPrefix(matches);
                    terminalInput.value = 'openpdf ' + prefix;
                    if (prefix === arg) {
                        printCommand(terminalInput.value);
                        printLines([`<span class="t-dim">${matches.join('  ')}</span>`]);
                    }
                }
            }
            else if (cmd === 'cd') {
                const matches = Object.keys(sections).filter(k => k.startsWith(arg));
                if (matches.length === 1) {
                    terminalInput.value = 'cd ' + matches[0];
                } else if (matches.length > 1) {
                    const prefix = longestCommonPrefix(matches);
                    terminalInput.value = 'cd ' + prefix;
                    if (prefix === arg) {
                        printCommand(terminalInput.value);
                        printLines([`<span class="t-dim">${matches.join('  ')}</span>`]);
                    }
                }
            }
        }
        return;
    }

    if (e.key !== 'Enter') return;
    const raw = terminalInput.value.trim();
    terminalInput.value = '';
    if (!raw) return;
    printCommand(raw);

    const spaceIdx = raw.indexOf(' ');
    const cmd = (spaceIdx === -1 ? raw : raw.slice(0, spaceIdx)).toLowerCase();
    const arg = spaceIdx === -1 ? '' : raw.slice(spaceIdx + 1).trim().toLowerCase();

    if (cmd === 'clear') { terminalOutput.innerHTML = ''; return; }

    if (cmd === 'openpdf') {
        if (!arg) {
            printLines([
                '<span class="t-red">Usage: openpdf &lt;name&gt;</span>',
                '<span class="t-dim">Type <span class="t-green">listpdf</span> to see available PDFs.</span>',
            ]);
            return;
        }
        const el = pdfItems[arg];
        if (el) {
            openPDF(el);
            printLines([`<span class="t-dim">Opening </span><span class="t-green">${arg}</span><span class="t-dim">...</span>`]);
        } else {
            printLines([
                `<span class="t-red">not found: ${arg}</span>`,
                '<span class="t-dim">Type <span class="t-green">listpdf</span> to see available PDFs.</span>',
            ]);
        }
        return;
    }

    if (cmd === 'cd') {
        if (!arg) {
            printLines(['<span class="t-red">Usage: cd &lt;section&gt;</span>',
                '<span class="t-dim">Type <span class="t-green">ls</span> to see available sections.</span>']);
            return;
        }
        if (sections[arg]) {
            sections[arg]();
            printLines([`<span class="t-dim">Navigating to </span><span class="t-green">${arg}</span><span class="t-dim">...</span>`]);
        } else {
            printLines([`<span class="t-red">no such section: ${arg}</span>`,
                '<span class="t-dim">Type <span class="t-green">ls</span> to see available sections.</span>']);
        }
        return;
    }

    if (commands[cmd]) {
        const result = commands[cmd]();
        if (result) printLines(result);
    } else {
        printLines([
            `<span class="t-red">command not found: ${cmd}</span>`,
            '<span class="t-dim">Type <span class="t-green">help</span> for available commands.</span>',
        ]);
    }
});