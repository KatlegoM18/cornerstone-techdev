/* =========================================
   SIX STRINGS HIGHER
   SIX PATHS: the strings are the lesson menu.
   - brush across a string and it vibrates where
     you touched it (and plays its note, sound on)
   - fast scrolling makes all six shiver
   - choosing a string shows its path
========================================= */

(() => {

    const board = document.querySelector(".strings");
    if (!board || !window.SSH) return;

    const rows = [...board.querySelectorAll(".string-row")];
    const card = document.querySelector(".path-card");
    const el = (sel) => card?.querySelector(sel);

    const strings = rows.map((row, i) => ({
        row,
        i,
        svg: row.querySelector(".sr-wire"),
        path: row.querySelector(".sr-wire path"),
        w: 0,
        h: 0,
        amp: 0,          // current vibration amplitude (px)
        at: 0.5,         // where it was plucked (0..1 along the string)
        phase: 0,
        speed: 0.55 + i * 0.09
    }));


    /* -----------------------------------------
       SIZE + DRAW
    ----------------------------------------- */

    function measure() {
        strings.forEach((s) => {
            const r = s.svg.getBoundingClientRect();
            s.w = r.width;
            s.h = r.height;
            s.svg.setAttribute("viewBox", `0 0 ${s.w} ${s.h}`);
        });
        drawAll();
    }

    function draw(s) {
        const mid = s.h / 2;
        if (s.amp < 0.05) {
            s.path.setAttribute("d", `M0 ${mid} L${s.w} ${mid}`);
            return;
        }
        // a plucked string: a soft triangle peaking where it was touched,
        // swinging back and forth, with a little second harmonic on top
        const n = 48;
        let d = "";
        const swing = Math.sin(s.phase);
        const second = Math.sin(s.phase * 2.03) * 0.22;
        for (let k = 0; k <= n; k++) {
            const x = k / n;
            const tri = x < s.at ? x / s.at : (1 - x) / (1 - s.at);
            const shape = 0.55 * tri + 0.45 * Math.sin(Math.PI * x);
            const y = mid + s.amp * (shape * swing + second * Math.sin(2 * Math.PI * x));
            d += (k ? " L" : "M") + (x * s.w).toFixed(1) + " " + y.toFixed(2);
        }
        s.path.setAttribute("d", d);
    }

    const drawAll = () => strings.forEach(draw);

    let running = false;
    function loop() {
        let any = false;
        strings.forEach((s) => {
            if (s.amp > 0.05) {
                s.phase += s.speed;
                s.amp *= 0.962;
                any = true;
            } else {
                s.amp = 0;
            }
            draw(s);
        });
        if (any) requestAnimationFrame(loop);
        else running = false;
    }

    function pluck(s, at = 0.5, strength = 0.6, sound = true) {
        s.at = gsap.utils.clamp(0.08, 0.92, at);
        s.amp = Math.max(s.amp, Math.min(s.h * 0.42, 6 + strength * 16));
        s.phase = 0;
        s.row.classList.add("is-ringing");
        clearTimeout(s.timer);
        s.timer = setTimeout(() => s.row.classList.remove("is-ringing"), 700);
        if (sound) SSH.audio?.pluckString(s.i, 0.15 + strength * 0.45);
        if (!running && !SSH.reducedMotion) {
            running = true;
            requestAnimationFrame(loop);
        }
    }


    /* -----------------------------------------
       BRUSH ACROSS THE STRINGS
    ----------------------------------------- */

    let lastY = null;
    let lastT = 0;

    board.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const now = performance.now();
        if (lastY !== null) {
            const speed = Math.abs(e.clientY - lastY) / Math.max(now - lastT, 8);
            strings.forEach((s) => {
                const r = s.svg.getBoundingClientRect();
                const y = r.top + r.height / 2;
                if ((lastY - y) * (e.clientY - y) < 0) {
                    pluck(s, (e.clientX - r.left) / r.width, Math.min(1, speed * 0.9));
                }
            });
        }
        lastY = e.clientY;
        lastT = now;
    });
    board.addEventListener("pointerleave", () => { lastY = null; });

    // fast scrolling makes the strings shiver (no sound)
    if (SSH.lenis && !SSH.reducedMotion) {
        let cool = 0;
        SSH.lenis.on("scroll", ({ velocity }) => {
            const r = board.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            const v = Math.abs(velocity);
            if (v > 18 && performance.now() > cool) {
                cool = performance.now() + 220;
                strings.forEach((s, i) => setTimeout(() => pluck(s, 0.5, Math.min(0.5, v / 120), false), i * 25));
            }
        });
    }


    /* -----------------------------------------
       CHOOSE A PATH
    ----------------------------------------- */

    function fillCard(id) {
        const p = SSH.paths[id];
        if (!p || !card) return;
        el("[data-path-level]").textContent = p.level;
        el("[data-path-title]").textContent = p.title;
        el("[data-path-desc]").textContent = p.description;
        el("[data-path-price]").textContent = p.price;
        el("[data-path-learn]").innerHTML = p.learn.map((t) => `<li>${t}</li>`).join("");
    }

    function select(id, { sound = true, focus = false } = {}) {
        const index = SSH.pathOrder.indexOf(id);
        if (index < 0) return;
        SSH.selectedPath = id;
        rows.forEach((row, i) => {
            const on = i === index;
            row.setAttribute("aria-checked", String(on));
            row.tabIndex = on ? 0 : -1;
        });
        if (focus) rows[index].focus();
        pluck(strings[index], 0.5, 0.9, sound);

        if (SSH.reducedMotion || !card) {
            fillCard(id);
        } else {
            const parts = card.querySelectorAll(".path-level, h3, .path-desc, .path-learn, .path-price");
            gsap.timeline()
                .to(parts, { opacity: 0, y: -12, duration: 0.22, stagger: 0.03, ease: "power2.in" })
                .add(() => fillCard(id))
                .fromTo(card.querySelectorAll(".path-level, h3, .path-desc, .path-learn li, .path-price"),
                    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.045, ease: "power3.out" })
                .set(parts, { opacity: 1, y: 0 });
        }
        document.dispatchEvent(new CustomEvent("ssh:path", { detail: id }));
    }

    rows.forEach((row) => {
        row.addEventListener("click", () => select(row.dataset.path));
        row.addEventListener("keydown", (e) => {
            const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            e.preventDefault();
            const i = (SSH.pathOrder.indexOf(SSH.selectedPath) + step + rows.length) % rows.length;
            select(SSH.pathOrder[i], { focus: true });
        });
    });

    // "Book this path": the booking flow listens for ssh:path
    card?.querySelector("[data-book-path]")?.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("ssh:path", { detail: SSH.selectedPath }));
    });

    // other parts of the page (booking) can change the path too
    document.addEventListener("ssh:path-set", (e) => {
        if (e.detail !== SSH.selectedPath) select(e.detail, { sound: false });
    });

    fillCard(SSH.selectedPath);
    rows.forEach((row, i) => { row.tabIndex = i === 0 ? 0 : -1; });


    /* -----------------------------------------
       ENTRANCE: the strings draw across the
       screen one by one, then a strum runs
       through them.
    ----------------------------------------- */

    window.addEventListener("resize", measure);
    document.addEventListener("ssh:enter", measure, { once: true });
    measure();

    if (!SSH.reducedMotion && typeof ScrollTrigger !== "undefined") {

        const labelsIn = rows.map((r) => r.querySelectorAll(".sr-num, .sr-note, .sr-name, .sr-price"));
        gsap.set(strings.map((s) => s.svg), { clipPath: "inset(0 100% 0 0)" });
        gsap.set(labelsIn, { opacity: 0, x: -20 });
        gsap.set(card, { opacity: 0, x: 40 });

        ScrollTrigger.create({
            trigger: board,
            start: "top 75%",
            once: true,
            onEnter: () => {
                measure();
                const tl = gsap.timeline();
                strings.forEach((s, i) => {
                    tl.to(s.svg, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "expo.inOut" }, i * 0.09);
                    tl.to(labelsIn[i], { opacity: 1, x: 0, duration: 0.7, stagger: 0.05, ease: "power3.out" }, 0.3 + i * 0.09);
                });
                tl.to(card, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, 0.5);
                tl.add(() => {
                    strings.forEach((s, i) => setTimeout(() => pluck(s, 0.3 + i * 0.06, 0.55), i * 55));
                }, 1.2);
            }
        });
    }

})();
