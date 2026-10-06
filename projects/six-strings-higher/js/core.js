/* =========================================
   SIX STRINGS HIGHER
   CORE
   1. Smooth scroll (Lenis + ScrollTrigger)
   2. Sound: plucked strings synthesised in the browser
   3. Loader: the strings tune up while the guitar loads
   4. Split-text and fade reveals
   5. Header, menu, progress string, anchor links
   6. Pick cursor
========================================= */

window.SSH = window.SSH || {};

SSH.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
SSH.finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

(() => {

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        document.body.classList.remove("is-loading");
        document.getElementById("loader")?.remove();
        console.error("GSAP failed to load.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });


    /* =========================================
       1. SMOOTH SCROLL
    ========================================= */

    if (typeof Lenis !== "undefined" && !SSH.reducedMotion) {
        const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        SSH.lenis = lenis;
    }

    SSH.scrollTo = (target, opts = {}) => {
        const y = typeof target === "number"
            ? target
            : target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
        if (SSH.lenis) {
            const distance = Math.abs(y - window.scrollY);
            SSH.lenis.scrollTo(y, {
                duration: opts.duration ?? gsap.utils.clamp(1.2, 4.5, distance / 1400),
                easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
                lock: opts.lock ?? false,
                force: true
            });
        } else {
            window.scrollTo({ top: y, behavior: SSH.reducedMotion ? "auto" : "smooth" });
        }
    };


    /* =========================================
       2. SOUND
       Karplus–Strong: a burst of noise fed round a
       delay line one wavelength long sounds like a
       plucked string. One buffer per note, cached.
    ========================================= */

    const NOTES = { E2: 82.41, A2: 110.0, D3: 146.83, G3: 196.0, B3: 246.94, E4: 329.63 };
    const STRING_NOTES = ["E2", "A2", "D3", "G3", "B3", "E4"];

    const audio = {
        enabled: false,
        ctx: null,
        out: null,
        buffers: {},

        init() {
            if (this.ctx) {
                this.ctx.resume?.();
                return;
            }
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            const comp = this.ctx.createDynamicsCompressor();
            const tone = this.ctx.createBiquadFilter();
            tone.type = "lowpass";
            tone.frequency.value = 4200;
            tone.connect(comp);
            comp.connect(this.ctx.destination);
            this.out = tone;
        },

        buffer(note) {
            if (this.buffers[note]) return this.buffers[note];
            const ctx = this.ctx;
            const sr = ctx.sampleRate;
            const freq = NOTES[note] || 110;
            const length = Math.floor(sr * 2.6);
            const buf = ctx.createBuffer(1, length, sr);
            const data = buf.getChannelData(0);
            const period = Math.round(sr / freq);
            const ring = new Float32Array(period);
            let last = 0;
            for (let i = 0; i < period; i++) {           // softened noise = warmer attack
                last = last * 0.55 + (Math.random() * 2 - 1) * 0.45;
                ring[i] = last;
            }
            const decay = 0.9965 + Math.min(freq, 330) / 330 * 0.0025;
            let idx = 0;
            for (let i = 0; i < length; i++) {
                const next = (idx + 1) % period;
                const v = ring[idx];
                data[i] = v;
                ring[idx] = decay * 0.5 * (v + ring[next]);
                idx = next;
            }
            this.buffers[note] = buf;
            return buf;
        },

        pluck(note, velocity = 0.6, when = 0) {
            if (!this.enabled || !this.ctx) return;
            const ctx = this.ctx;
            const src = ctx.createBufferSource();
            src.buffer = this.buffer(note);
            const gain = ctx.createGain();
            const t = ctx.currentTime + when;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(velocity * 0.55, t + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0008, t + 2.5);
            src.connect(gain);
            gain.connect(this.out);
            src.start(t);
            src.stop(t + 2.6);
        },

        pluckString(index, velocity) {
            this.pluck(STRING_NOTES[index], velocity);
        },

        strum(down = true, velocity = 0.5) {
            const order = down ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
            order.forEach((s, i) => this.pluck(STRING_NOTES[s], velocity * (0.85 + Math.random() * 0.3), i * 0.028));
        },

        setEnabled(on) {
            this.enabled = on;
            if (on) this.init();
            try { localStorage.setItem("ssh-sound", on ? "1" : "0"); } catch { /* private mode */ }
            document.querySelectorAll(".sound-toggle").forEach((btn) => {
                btn.setAttribute("aria-pressed", String(on));
                btn.setAttribute("aria-label", on ? "Sound on" : "Sound off");
            });
            document.body.classList.toggle("sound-on", on);
        }
    };

    SSH.audio = audio;
    SSH.STRING_NOTES = STRING_NOTES;

    document.querySelectorAll(".sound-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            audio.setEnabled(!audio.enabled);
            if (audio.enabled) audio.strum(true, 0.35);
        });
    });


    /* =========================================
       4. SPLIT TEXT
       Wraps each word (keeping <em>) so it can rise
       out of a mask. Screen readers get the
       original text through aria-label.
    ========================================= */

    function splitWords(el) {
        if (el.dataset.splitDone) return [];
        el.dataset.splitDone = "1";
        el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
        const words = [];
        const walk = (node, into) => {
            node.childNodes.forEach((child) => {
                if (child.nodeType === 3) {
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            into.appendChild(document.createTextNode(" "));
                            return;
                        }
                        const w = document.createElement("span");
                        w.className = "w";
                        w.setAttribute("aria-hidden", "true");
                        const inner = document.createElement("span");
                        inner.className = "wi";
                        inner.textContent = part;
                        w.appendChild(inner);
                        into.appendChild(w);
                        words.push(inner);
                    });
                } else if (child.nodeType === 1) {
                    const clone = child.cloneNode(false);
                    into.appendChild(clone);
                    walk(child, clone);
                }
            });
        };
        const frag = document.createDocumentFragment();
        walk(el, frag);
        el.textContent = "";
        el.appendChild(frag);
        return words;
    }

    SSH.splitWords = splitWords;

    const heroTitle = document.querySelector(".hero [data-split]");
    const heroWords = heroTitle ? splitWords(heroTitle) : [];
    const heroFades = document.querySelectorAll(".hero [data-fade], .hero .kicker");

    if (!SSH.reducedMotion) {

        gsap.set(heroWords, { yPercent: 115, rotate: 4 });
        gsap.set(heroFades, { opacity: 0, y: 24 });

        // every other split heading rises as it scrolls into view. Created once
        // all scripts have run, so the pinned sections above are measured first.
        const splitHeads = [...document.querySelectorAll("[data-split]")].filter((el) => el !== heroTitle);
        const splitWordsOf = new Map(splitHeads.map((el) => [el, splitWords(el)]));
        splitWordsOf.forEach((words) => gsap.set(words, { yPercent: 115, rotate: 3 }));
        window.addEventListener("DOMContentLoaded", () => {
            splitWordsOf.forEach((words, el) => {
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 85%",
                    once: true,
                    onEnter: () => gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.06 })
                });
            });
        });
    }

    SSH.playHeroIntro = () => {
        if (SSH.reducedMotion) return;
        const tl = gsap.timeline();
        tl.to(heroFades[0], { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.1);
        tl.to(heroWords, { yPercent: 0, rotate: 0, duration: 1.3, ease: "expo.out", stagger: 0.07 }, 0.15);
        tl.to([...heroFades].slice(1), { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, 0.6);
        return tl;
    };


    /* =========================================
       3. LOADER
    ========================================= */

    const loader = document.getElementById("loader");
    const pctEl = loader?.querySelector("[data-loader-pct]");
    const textEl = loader?.querySelector("[data-loader-text]");
    const enterBox = loader?.querySelector(".loader-enter");
    const loaderStrings = loader ? [...loader.querySelectorAll(".loader-strings path")] : [];
    const loaderNotes = loader ? [...loader.querySelectorAll(".loader-notes li")] : [];

    const images = [...document.querySelectorAll(".guitar-assembly img")];
    let loaded = 0;
    let shown = 0;
    let tuned = -1;

    // vibrate one loader string (a quick damped wobble along its middle)
    function wobble(path, amp = 9) {
        const o = { a: amp };
        gsap.to(o, {
            a: 0,
            duration: 1.1,
            ease: "power2.out",
            onUpdate: () => {
                const y = parseFloat(path.getAttribute("d").split(" ")[1]);
                const a = o.a * Math.sin(performance.now() / 22);
                path.setAttribute("d", `M0 ${y} Q300 ${y + a} 600 ${y}`);
            },
            onComplete: () => {
                const y = parseFloat(path.getAttribute("d").split(" ")[1]);
                path.setAttribute("d", `M0 ${y} H600`);
            }
        });
    }

    function tuneUpTo(n) {
        while (tuned < n && tuned < 5) {
            tuned++;
            loaderStrings[tuned]?.classList.add("is-tuned");
            loaderNotes[tuned]?.classList.add("is-tuned");
            if (loaderStrings[tuned]) wobble(loaderStrings[tuned]);
            if (textEl) textEl.textContent = `Tuning ${loaderNotes[tuned]?.textContent || ""}`;
        }
    }

    const progress = { v: 0 };
    const minTime = SSH.reducedMotion ? 0.3 : 1.8;
    const started = performance.now();

    function updateProgress() {
        const target = images.length ? loaded / images.length : 1;
        const elapsed = (performance.now() - started) / 1000;
        const cap = Math.min(1, elapsed / minTime);
        const value = Math.min(target, cap);
        gsap.to(progress, {
            v: value,
            duration: 0.4,
            overwrite: true,
            onUpdate: () => {
                if (readyCalled) return;
                const p = Math.round(progress.v * 100);
                if (p !== shown) {
                    shown = p;
                    if (pctEl) pctEl.textContent = String(p).padStart(2, "0");
                    tuneUpTo(Math.floor(progress.v * 6 - 0.001));
                }
            }
        });
        if (value >= 1) {
            setTimeout(ready, 450);
        } else {
            setTimeout(updateProgress, 120);
        }
    }

    images.forEach((img) => {
        const done = () => { loaded++; };
        if (img.complete) done();
        else {
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
        }
    });

    let readyCalled = false;
    function ready() {
        if (readyCalled) return;
        readyCalled = true;
        tuneUpTo(5);
        if (textEl) textEl.textContent = "In tune";
        if (pctEl) pctEl.textContent = "";
        let remembered = null;
        try { remembered = sessionStorage.getItem("ssh-entered"); } catch { /* ignore */ }
        if (remembered) {
            // already chose this visit: go straight in
            enter(remembered === "sound");
            return;
        }
        if (enterBox) {
            enterBox.hidden = false;
            gsap.from(enterBox.children, { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, ease: "power3.out" });
            enterBox.querySelector("button")?.focus();
        }
    }

    function enter(withSound) {
        // start from the top, settled, while the loader still covers the page
        window.scrollTo(0, 0);
        SSH.lenis?.scrollTo(0, { immediate: true, force: true });
        ScrollTrigger.update();
        ScrollTrigger.getAll().forEach((st) => st.getTween?.()?.progress(1));

        try { sessionStorage.setItem("ssh-entered", withSound ? "sound" : "mute"); } catch { /* ignore */ }
        audio.setEnabled(withSound);
        if (withSound) audio.strum(true, 0.5);

        loaderStrings.forEach((p, i) => setTimeout(() => wobble(p, 14), i * 28));

        const out = gsap.timeline({
            delay: SSH.reducedMotion ? 0 : 0.35,
            onComplete: () => {
                loader?.remove();
                document.body.classList.remove("is-loading");
                SSH.lenis?.start();
                ScrollTrigger.refresh();
            }
        });

        if (SSH.reducedMotion) {
            out.to(loader, { opacity: 0, duration: 0.3 });
        } else {
            out.to(loader.querySelector(".loader-inner"), { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" });
            out.to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, 0.25);
        }
        out.add(() => {
            SSH.playHeroIntro?.();
            document.dispatchEvent(new CustomEvent("ssh:enter"));
        }, SSH.reducedMotion ? 0 : 0.7);
    }

    if (loader) {
        SSH.lenis?.stop();
        loader.addEventListener("click", (e) => {
            const choice = e.target.closest("[data-enter]")?.dataset.enter;
            if (choice) enter(choice === "sound");
        });
        updateProgress();
        // never trap anyone behind the loader
        setTimeout(() => { loaded = images.length; }, 6000);
    } else {
        document.body.classList.remove("is-loading");
    }


    /* =========================================
       5. HEADER, MENU, PROGRESS, ANCHORS
    ========================================= */

    const header = document.querySelector(".site-header");
    const bar = document.querySelector(".progress-string span");

    ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
            header?.classList.toggle("is-scrolled", self.scroll() > 30);
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
        }
    });

    const menuBtn = document.querySelector(".menu-btn");
    const setMenu = (open) => {
        document.body.classList.toggle("menu-open", open);
        menuBtn?.setAttribute("aria-expanded", String(open));
        menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        if (open) SSH.lenis?.stop(); else SSH.lenis?.start();
    };
    menuBtn?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
    });

    document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute("href").slice(1);
        const target = id === "top" ? document.body : document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        setMenu(false);
        SSH.scrollTo(id === "top" ? 0 : target);
        history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
    });


    /* =========================================
       6. PICK CURSOR (mouse only)
    ========================================= */

    const cursor = document.querySelector(".cursor");

    if (cursor && SSH.finePointer && !SSH.reducedMotion) {
        document.body.classList.add("has-cursor");
        const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
        let lastX = 0;
        window.addEventListener("pointermove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
            // tilt the pick with the direction of travel
            const dx = e.clientX - lastX;
            lastX = e.clientX;
            gsap.to(cursor, { rotate: gsap.utils.clamp(-35, 35, dx * 1.6), duration: 0.4, ease: "power2.out", overwrite: "auto" });
        });
        const hoverable = "a, button, summary, .string-row, label, input, select, textarea";
        document.addEventListener("pointerover", (e) => {
            cursor.classList.toggle("is-hover", !!e.target.closest(hoverable));
        });
        document.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
        document.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
        document.addEventListener("pointerleave", () => cursor.classList.add("is-away"));
        document.addEventListener("pointerenter", () => cursor.classList.remove("is-away"));
    }


    /* =========================================
       FAQ: smooth open and close
    ========================================= */

    document.querySelectorAll(".faq details").forEach((d) => {
        const summary = d.querySelector("summary");
        const body = d.querySelector(".faq-a");
        summary.addEventListener("click", (e) => {
            if (SSH.reducedMotion) return;
            e.preventDefault();
            if (d.open) {
                gsap.to(body, { height: 0, opacity: 0, duration: 0.45, ease: "power3.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "all" }); ScrollTrigger.refresh(); } });
            } else {
                d.open = true;
                gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.55, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
                audio.pluck(STRING_NOTES[[...d.parentNode.children].indexOf(d) % 6], 0.25);
            }
        });
    });

})();
