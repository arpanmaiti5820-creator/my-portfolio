/* =========================================
   ARPAN MAITI PORTFOLIO: INTERACTIONS
========================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

/* Footer year */
$("#year").textContent = new Date().getFullYear();

/* ---------- Hero name: split into letters ---------- */
(() => {
    const el = $("#heroName");
    const text = el.textContent.trim();
    const nameEnd = text.indexOf(" ");
    el.textContent = "";
    [...text].forEach((c, i) => {
        const s = document.createElement("span");
        if (c === " ") s.className = "gap";
        else {
            s.className = "ch" + (i > nameEnd ? " last" : "");
            s.textContent = c;
        }
        s.style.setProperty("--i", i);
        s.setAttribute("aria-hidden", "true");
        el.appendChild(s);
    });
})();

/* ---------- Typing roles ---------- */
(() => {
    const el = $("#typed");
    const roles = ["Web developer", "Frontend builder", "Full-stack learner", "Problem solver"];
    if (reduced) return;
    let r = 0, c = roles[0].length, del = true;
    const tick = () => {
        const word = roles[r];
        c += del ? -1 : 1;
        el.textContent = word.slice(0, c);
        let wait = del ? 45 : 85;
        if (!del && c === word.length) { del = true; wait = 1700; }
        else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
        setTimeout(tick, wait);
    };
    setTimeout(tick, 3200);
})();

/* ---------- Mobile menu ---------- */
const navLinks = $("#navLinks");
const menuToggle = $("#menuToggle");
const setMenu = (open) => {
    navLinks.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.firstElementChild.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
};
menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("active")));
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => { if (!e.target.closest(".navbar")) setMenu(false); });

/* ---------- Active nav + scroll progress + back to top ---------- */
const sections = $$("main section[id]");
const links = $$("a", navLinks);
const backToTop = $("#backToTop");
const bar = $("#progressBar");
let ticking = false;

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    backToTop.classList.toggle("show", y > 400);

    let current = sections[0];
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = s; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current.id));

    /* education timeline fill */
    const tl = $("#timeline");
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    $("#tFill").style.transform = `scaleY(${p})`;
    ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
addEventListener("resize", onScroll);
onScroll();
backToTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

/* ---------- Scroll reveal, meters, count-up ---------- */
function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = to.toFixed(dec) + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec) + suffix;
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

/* stagger siblings */
$$("[data-r]").forEach((el) => {
    const sibs = $$(":scope > [data-r]", el.parentElement);
    el.style.setProperty("--d", Math.max(0, sibs.indexOf(el)));
});

const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add("show");
        if (el.classList.contains("path-list")) el.classList.add("in");
        $$(".meter", el).forEach((m) => m.classList.add("in"));
        $$(".count", el).forEach(countUp);
        io.unobserve(el);
        /* hand the element back to its own hover styles once the reveal has finished */
        setTimeout(() => el.removeAttribute("data-r"), 1600);
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
$$("[data-r]").forEach((el) => io.observe(el));

/* ---------- Marquee: duplicate for seamless loop ---------- */
(() => {
    const track = $("#marquee");
    track.innerHTML += track.innerHTML;
})();

/* ---------- Spotlight follows the cursor on cards ---------- */
$$(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
    });
});

/* ---------- Project modals (generic) ---------- */
(() => {
    let opener = null;
    const open = (id, btn) => {
        const m = document.getElementById(id);
        if (!m) return;
        opener = btn;
        m.classList.add("is-open");
        m.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        $(".modal-close", m).focus();
    };
    const close = (m) => {
        m.classList.remove("is-open");
        m.setAttribute("aria-hidden", "true");
        if (!$(".modal.is-open")) document.body.classList.remove("modal-open");
        opener?.focus();
    };
    $$("[data-modal]").forEach((b) => b.addEventListener("click", () => open(b.dataset.modal, b)));
    $$(".modal").forEach((m) => {
        $(".modal-close", m).addEventListener("click", () => close(m));
        m.addEventListener("click", (e) => { if (e.target === m) close(m); });
    });
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape" || $(".lightbox.open")) return;
        const m = $(".modal.is-open");
        if (m) close(m);
        else if (navLinks.classList.contains("active")) setMenu(false);
    });
})();

/* ---------- Screenshot viewer (click a screenshot to enlarge) ---------- */
(() => {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Screenshot viewer");
    lb.setAttribute("aria-hidden", "true");
    lb.innerHTML =
        '<button type="button" class="lb-close" aria-label="Close image">&times;</button>' +
        '<button type="button" class="lb-nav prev" aria-label="Previous screenshot"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<figure><img alt="" /><figcaption></figcaption></figure>' +
        '<button type="button" class="lb-nav next" aria-label="Next screenshot"><i class="fa-solid fa-chevron-right"></i></button>';
    document.body.appendChild(lb);

    const img = $("img", lb), cap = $("figcaption", lb);
    const prev = $(".prev", lb), next = $(".next", lb);
    let group = [], idx = 0, from = null;

    const show = (i) => {
        idx = (i + group.length) % group.length;
        const src = group[idx];
        img.classList.add("swap");
        setTimeout(() => {
            img.src = src.currentSrc || src.src;
            img.alt = src.alt;
            cap.textContent = $("figcaption", src.closest("figure"))?.textContent || src.alt;
            img.classList.remove("swap");
        }, 120);
        prev.hidden = next.hidden = group.length < 2;
    };
    const open = (el) => {
        group = $$("img", el.closest(".gallery"));
        from = el;
        idx = group.indexOf(el);
        img.src = el.currentSrc || el.src;
        img.alt = el.alt;
        cap.textContent = $("figcaption", el.closest("figure"))?.textContent || el.alt;
        prev.hidden = next.hidden = group.length < 2;
        lb.classList.add("open");
        lb.setAttribute("aria-hidden", "false");
        $(".lb-close", lb).focus();
    };
    const close = () => {
        lb.classList.remove("open");
        lb.setAttribute("aria-hidden", "true");
        from?.focus();
    };

    $$(".gallery img").forEach((el) => {
        el.tabIndex = 0;
        el.setAttribute("role", "button");
        el.addEventListener("click", () => open(el));
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
    });
    $(".lb-close", lb).addEventListener("click", close);
    prev.addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    next.addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") close(); });
    document.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(idx - 1);
        else if (e.key === "ArrowRight") show(idx + 1);
    });
})();

/* ---------- Copy email + toast ---------- */
(() => {
    const toast = $("#toast");
    let t;
    const say = (msg) => {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(t);
        t = setTimeout(() => toast.classList.remove("show"), 2200);
    };
    $("#copyMail").addEventListener("click", async () => {
        const mail = "arpanmaiti5820@gmail.com";
        try { await navigator.clipboard.writeText(mail); say("Email copied"); }
        catch { say("Copy failed. Select the email and copy it."); }
    });
})();

/* ---------- Desktop-only: cursor glow + magnetic email button ---------- */
if (finePointer && !reduced) {
    const glow = $("#cursorGlow");
    addEventListener("pointermove", (e) => {
        glow.style.opacity = 1;
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    const mail = $("#mail");
    mail.addEventListener("pointermove", (e) => {
        const r = mail.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        mail.style.transform = `translate(${x}px, ${y}px)`;
    });
    mail.addEventListener("pointerleave", () => (mail.style.transform = ""));
}

/* ---------- Background: connected-dots network that reacts to the cursor ---------- */
(() => {
    const cv = $("#net");
    const ctx = cv.getContext("2d");
    const pointer = { x: -999, y: -999 };
    let w, h, dots = [], dpr = 1, running = true;

    function size() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        w = cv.width = innerWidth * dpr;
        h = cv.height = innerHeight * dpr;
        const n = Math.min(90, Math.floor((innerWidth * innerHeight) / 17000));
        dots = Array.from({ length: n }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
            r: (Math.random() * 1.3 + 0.6) * dpr,
        }));
    }

    function frame() {
        if (!running) return;
        ctx.clearRect(0, 0, w, h);
        const link = 140 * dpr, near = 190 * dpr;
        for (let i = 0; i < dots.length; i++) {
            const a = dots[i];
            a.x += a.vx; a.y += a.vy;
            if (a.x < 0 || a.x > w) a.vx *= -1;
            if (a.y < 0 || a.y > h) a.vy *= -1;

            const dm = Math.hypot(a.x - pointer.x, a.y - pointer.y);
            if (dm < near) { /* gentle push away from cursor */
                a.x += ((a.x - pointer.x) / dm) * 0.6 * dpr;
                a.y += ((a.y - pointer.y) / dm) * 0.6 * dpr;
            }
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, 6.283);
            ctx.fillStyle = dm < near ? "rgba(255,216,77,.95)" : "rgba(236,239,248,.45)";
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                const b = dots[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < link) {
                    ctx.strokeStyle = `rgba(166,107,255,${(1 - d / link) * 0.4})`;
                    ctx.lineWidth = dpr * 0.8;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
        }
        requestAnimationFrame(frame);
    }

    addEventListener("pointermove", (e) => { pointer.x = e.clientX * dpr; pointer.y = e.clientY * dpr; }, { passive: true });
    addEventListener("resize", size);
    document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running) requestAnimationFrame(frame);
    });
    size();
    if (reduced) { frame(); running = false; } else frame();
})();