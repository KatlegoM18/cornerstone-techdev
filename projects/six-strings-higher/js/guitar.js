/* =========================================
   SIX STRINGS HIGHER
   THE GUITAR
   01  Hero: brush the strings to pluck them, then
       scroll and the guitar comes apart into an
       exploded view while a counter tallies parts.
   02  Teacher: the parts fly back together into
       his hands as the light comes up.
   03  Dive: the scroll zooms into the soundhole
       and out the other side onto six strings.

   Offsets are in "frame units": pixels of the
   1024 x 1536 master illustration, converted to
   screen pixels at runtime.
========================================= */

(() => {

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const hero = document.querySelector("#hero");
    const stage = document.querySelector(".guitar-stage");
    const guitar = document.querySelector(".guitar-assembly");
    const header = document.querySelector(".site-header");
    const labelLayer = document.querySelector(".part-labels");
    if (!hero || !guitar || !stage) return;

    const FRAME_W = 1024;
    const FRAME_H = 1536;
    const unit = () => guitar.offsetWidth / FRAME_W;
    const fx = (v) => () => v * unit();
    const lerp = (a, b, t) => a + (b - a) * t;

    const part = (id) => guitar.querySelector(`[data-part="${id}"]`);
    const parts = (ids) => ids.map(part).filter(Boolean);
    const P = {
        shell: part("shell"), top: part("top"), rosette: part("rosette"),
        pickguard: part("pickguard"), bridge: part("bridge"), saddle: part("saddle"),
        neck: part("neck"), nut: part("nut"), headstock: part("headstock"),
        pins: parts(["pin-1", "pin-2", "pin-3", "pin-4", "pin-5", "pin-6"]),
        tunersLeft: parts(["tuner-1", "tuner-2", "tuner-3"]),
        tunersRight: parts(["tuner-4", "tuner-5", "tuner-6"])
    };
    const stringPaths = [...guitar.querySelectorAll(".guitar-string")];


    /* -----------------------------------------
       Always measure from the top of the page:
       pinned sections measure wrongly otherwise.
    ----------------------------------------- */

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const startHash = location.hash.slice(1);
    window.scrollTo(0, 0);

    document.addEventListener("ssh:enter", () => {
        ScrollTrigger.refresh();
        const target = startHash && document.getElementById(startHash);
        if (target) setTimeout(() => SSH.scrollTo(target, { duration: 0.01 }), 50);
    }, { once: true });

    // crossing the phone/desktop breakpoint uses a different layout: rebuild
    const mobileQuery = window.matchMedia("(max-width: 800px)");
    mobileQuery.addEventListener?.("change", () => location.reload());
    const isMobile = mobileQuery.matches;


    /* -----------------------------------------
       Guitar entrance after the loader
    ----------------------------------------- */

    if (!SSH.reducedMotion) {
        // fades the stage, not the guitar: the scroll timelines own the guitar's opacity
        gsap.set(stage, { opacity: 0 });
        document.addEventListener("ssh:enter", () => {
            gsap.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.2 });
            gsap.fromTo(".guitar-strings", { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1 });
        }, { once: true });
    }

    if (SSH.reducedMotion) return;      // leave the guitar assembled and still


    /* =========================================
       STRINGS
       tuner post -> nut -> saddle -> bridge pin.
       slack bows the string out, lift moves it to
       the side, vib makes it ring after a pluck.
    ========================================= */

    const STRING_REST = [
        [[506, 149], [519.2, 215], [530.1, 1172], [528, 1198]],
        [[501, 100], [532.7, 215], [547.1, 1172], [546, 1197.5]],
        [[497, 53], [542.5, 215], [564.2, 1172], [563.5, 1196]],
        [[556, 60], [552.3, 215], [581.2, 1172], [580.5, 1193.5]],
        [[557, 106], [562.2, 215], [598.3, 1172], [598.5, 1191.5]],
        [[565, 155], [571.0, 215], [614.3, 1172], [616, 1190]]
    ];
    const strings = STRING_REST.map((rest) => ({ rest, slack: 0, lift: 0, vib: 0, phase: 0, speed: 0 }));

    function renderStrings(layout) {
        strings.forEach((s, i) => {
            const finalX = layout.stringsX + i * layout.stringGap;
            const finalY = [layout.stringsTop, layout.stringsTop + 65, layout.stringsBottom - 26, layout.stringsBottom];
            const pts = s.rest.map(([x, y], k) => [lerp(x, finalX, s.lift), lerp(y, finalY[k], s.lift)]);
            const dir = i < 3 ? -1 : 1;
            const ring = s.vib * Math.sin(s.phase);
            const cx = (pts[1][0] + pts[2][0]) / 2 + dir * s.slack * (1 + i * 0.12) + ring;
            const cy = (pts[1][1] + pts[2][1]) / 2;
            stringPaths[i].setAttribute("d",
                `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]} ` +
                `Q${cx} ${cy} ${pts[2][0]} ${pts[2][1]} L${pts[3][0]} ${pts[3][1]}`);
        });
    }


    /* =========================================
       EXPLODED LAYOUTS (frame units)
    ========================================= */

    const DESKTOP = {
        shell: { x: -360, y: 40, r: -2 }, top: { x: -60, y: 0 },
        rosette: { x: 300, y: -120, r: -10 }, pickguard: { x: 420, y: 40, r: 6 },
        bridge: { x: 300, y: 90 }, saddle: { x: 300, y: 30 }, pins: { x: 300, y: 175, spread: 14 },
        neck: { x: 0, y: -130 }, nut: { x: 0, y: -168 }, headstock: { x: 0, y: -262 }, tunerOut: 85,
        stringsX: 1215, stringGap: 18, stringsTop: 140, stringsBottom: 1190,
        bounds: { left: -200, right: 1400, top: -290, bottom: 1600 },
        labels: [
            { text: "Headstock", x: 640, y: -150 },
            { text: "Tuners <b>× 6</b>", x: 360, y: -175, left: true },
            { text: "Nut", x: 630, y: 45 },
            { text: "Neck <b>&amp;</b> fretboard", x: 640, y: 380 },
            { text: "Back <b>&amp;</b> sides", x: -170, y: 690, left: true },
            { text: "Soundboard", x: 330, y: 655, left: true },
            { text: "Rosette", x: 770, y: 700 },
            { text: "Pickguard", x: 1040, y: 1255 },
            { text: "Bridge <b>·</b> saddle <b>·</b> pins", x: 700, y: 1420 },
            { text: "Strings <b>× 6</b>", x: 1210, y: 105 }
        ]
    };

    const MOBILE = {
        shell: { x: -150, y: 40, r: -2 }, top: { x: -20, y: 0 },
        rosette: { x: 215, y: -250, r: -10 }, pickguard: { x: 232, y: 70, r: 6 },
        bridge: { x: 170, y: 120 }, saddle: { x: 170, y: 55 }, pins: { x: 170, y: 200, spread: 10 },
        neck: { x: 0, y: -130 }, nut: { x: 0, y: -168 }, headstock: { x: 0, y: -262 }, tunerOut: 70,
        stringsX: 1010, stringGap: 16, stringsTop: 160, stringsBottom: 1170,
        bounds: { left: 20, right: 1120, top: -280, bottom: 1580 },
        labels: []
    };

    const layout = isMobile ? MOBILE : DESKTOP;

    const labels = labelLayer ? layout.labels.map((l) => {
        const el = document.createElement("span");
        el.className = "part-label" + (l.left ? " is-left" : "");
        el.innerHTML = `<i></i><span>${l.text}</span>`;
        el.style.left = (l.x / FRAME_W * 100) + "%";
        el.style.top = (l.y / FRAME_H * 100) + "%";
        labelLayer.appendChild(el);
        return el;
    }) : [];

    function exploded(viewportH, viewportW, topInset) {
        const b = layout.bounds;
        const u = unit();
        const scale = Math.min(
            (viewportH - topInset - 40) / ((b.bottom - b.top) * u),
            (viewportW * 0.92) / ((b.right - b.left) * u),
            1.25
        );
        const cx = (b.left + b.right) / 2;
        const cy = (b.top + b.bottom) / 2;
        return {
            scale,
            x: (FRAME_W / 2 - cx) * u * scale,
            y: (FRAME_H / 2 - cy) * u * scale + topInset / 2
        };
    }


    /* =========================================
       DISASSEMBLY (timeline time t0 .. t0 + 6.1)
    ========================================= */

    function addDisassembly(tl, L, t0) {
        strings.forEach((s, i) => tl.to(s, { slack: 38, duration: 1.0, ease: "sine.inOut" }, t0 + i * 0.06));
        strings.forEach((s, i) => {
            tl.to(s, { lift: 1, duration: 1.3, ease: "power2.inOut" }, t0 + 1.0 + i * 0.1);
            tl.to(s, { slack: 0, duration: 1.1, ease: "power2.out" }, t0 + 1.2 + i * 0.1);
        });
        P.tunersLeft.forEach((el, i) => tl.to(el, { x: fx(-L.tunerOut), rotation: -18, duration: 0.9, ease: "power2.out" }, t0 + 1.6 + i * 0.08));
        P.tunersRight.forEach((el, i) => tl.to(el, { x: fx(L.tunerOut), rotation: 18, duration: 0.9, ease: "power2.out" }, t0 + 1.6 + i * 0.08));
        P.pins.forEach((el, i) => tl.to(el, { y: fx(-45), duration: 0.45, ease: "back.out(2)" }, t0 + 1.9 + i * 0.05));
        tl.to(P.saddle, { y: fx(-30), duration: 0.5, ease: "power2.out" }, t0 + 2.1);
        tl.to(P.headstock, { y: fx(L.headstock.y), duration: 1.1, ease: "power2.inOut" }, t0 + 2.6);
        [...P.tunersLeft, ...P.tunersRight].forEach((el) => tl.to(el, { y: fx(L.headstock.y), rotation: 0, duration: 1.1, ease: "power2.inOut" }, t0 + 2.6));
        tl.to(P.nut, { y: fx(L.nut.y), duration: 1.0, ease: "power2.inOut" }, t0 + 2.75);
        tl.to(P.neck, { x: fx(L.neck.x), y: fx(L.neck.y), duration: 1.1, ease: "power2.inOut" }, t0 + 3.1);
        tl.to(P.pickguard, { x: fx(L.pickguard.x), y: fx(L.pickguard.y), rotation: L.pickguard.r, duration: 1.2, ease: "power2.inOut" }, t0 + 3.5);
        tl.to(P.rosette, { x: fx(L.rosette.x), y: fx(L.rosette.y), rotation: L.rosette.r, duration: 1.2, ease: "power2.inOut" }, t0 + 3.7);
        tl.to(P.bridge, { x: fx(L.bridge.x), y: fx(L.bridge.y), duration: 1.2, ease: "power2.inOut" }, t0 + 3.9);
        tl.to(P.saddle, { x: fx(L.saddle.x), y: fx(L.saddle.y), duration: 1.2, ease: "power2.inOut" }, t0 + 3.95);
        P.pins.forEach((el, i) => tl.to(el, { x: fx(L.pins.x + (i - 2.5) * L.pins.spread), y: fx(L.pins.y), duration: 1.2, ease: "power2.inOut" }, t0 + 4.0 + i * 0.04));
        tl.to(P.top, { x: fx(L.top.x), y: fx(L.top.y), duration: 1.3, ease: "power2.inOut" }, t0 + 4.6);
        tl.to(P.shell, { x: fx(L.shell.x), y: fx(L.shell.y), rotation: L.shell.r, duration: 1.4, ease: "power2.inOut" }, t0 + 4.7);
        return t0 + 6.1;
    }


    /* =========================================
       SETUP: the stage floats above the page so
       the guitar can travel between sections.
    ========================================= */

    gsap.set(guitar, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1 });
    renderStrings(layout);

    document.body.appendChild(stage);
    stage.classList.add("is-floating");

    const headerH = () => (header ? header.offsetHeight : 0);
    const fit = () => exploded(window.innerHeight, window.innerWidth, headerH());

    const heroCopy = hero.querySelector(".hero-copy");
    const cue = hero.querySelector(".scroll-cue");
    const narration = hero.querySelector(".hero-narration");
    const countEl = hero.querySelector("[data-part-count]");
    const narrSteps = narration ? [...narration.querySelectorAll("li")] : [];

    const T0 = 1.2;
    let heroDone = 0;

    const heroTl = gsap.timeline({
        defaults: { immediateRender: false },
        onUpdate: () => {
            renderStrings(layout);
            // tally the parts as they separate, and move the narration on
            const t = heroTl.time();
            const p = gsap.utils.clamp(0, 1, (t - T0) / (heroDone - T0));
            if (countEl) countEl.textContent = String(Math.round(p * 21)).padStart(2, "0");
            const step = p <= 0 ? -1 : p < 0.3 ? 0 : p < 0.6 ? 1 : p < 0.98 ? 2 : 3;
            narrSteps.forEach((li, i) => li.classList.toggle("is-on", i === step));
        }
    });
    // (driven by the master timeline at the bottom of this file)

    // copy leaves word by word, the narration arrives
    heroTl.to(heroCopy, { opacity: 0, y: -60, filter: "blur(6px)", duration: 0.9, ease: "power2.in" }, 0);
    if (cue) heroTl.to(cue, { opacity: 0, y: 20, duration: 0.4 }, 0);
    if (narration) heroTl.fromTo(narration, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 0.8);

    // the guitar glides to the centre and grows to fit the exploded view
    heroTl.to(guitar, {
        left: "50%", top: "50%",
        scale: () => fit().scale, x: () => fit().x, y: () => fit().y,
        duration: 1.6, ease: "power2.inOut"
    }, 0.2);

    heroDone = addDisassembly(heroTl, layout, T0);

    // labels draw in once everything has separated
    if (labels.length) heroTl.to(labels, { "--draw": 1, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power2.out" }, heroDone - 0.5);
    heroTl.to({}, { duration: 1.2 }, heroDone + 0.4);
    if (narration) heroTl.to(narration, { opacity: 0, x: -30, duration: 0.5 }, heroDone + 1.2);


    /* =========================================
       PLUCK THE STRINGS (hero, assembled only)
       Brushing across a string makes it ring and,
       with sound on, play its note.
    ========================================= */

    let ringing = false;

    function ringLoop() {
        let any = false;
        strings.forEach((s) => {
            if (s.vib > 0.05) {
                s.phase += s.speed;
                s.vib *= 0.955;
                any = true;
            } else {
                s.vib = 0;
            }
        });
        renderStrings(layout);
        if (any) requestAnimationFrame(ringLoop);
        else ringing = false;
    }

    function pluck(i, strength) {
        const s = strings[i];
        s.vib = Math.min(14, 5 + strength * 10);
        s.phase = 0;
        s.speed = 1.1 + i * 0.12;            // thinner strings shimmer faster
        SSH.audio?.pluckString(i, 0.25 + strength * 0.35);
        if (!ringing) {
            ringing = true;
            requestAnimationFrame(ringLoop);
        }
    }

    const svg = guitar.querySelector(".guitar-strings");
    let lastFrameX = null;

    window.addEventListener("pointermove", (e) => {
        if (window.scrollY > 40 || document.body.classList.contains("is-loading")) {
            lastFrameX = null;
            return;
        }
        const r = svg.getBoundingClientRect();
        const fxp = (e.clientX - r.left) / r.width * FRAME_W;
        const fyp = (e.clientY - r.top) / r.height * FRAME_H;
        if (fyp < 215 || fyp > 1172) {
            lastFrameX = null;
            return;
        }
        if (lastFrameX !== null) {
            const t = (fyp - 215) / (1172 - 215);
            STRING_REST.forEach((rest, i) => {
                const sx = lerp(rest[1][0], rest[2][0], t);
                if ((lastFrameX - sx) * (fxp - sx) < 0) {
                    pluck(i, Math.min(1, Math.abs(fxp - lastFrameX) / 40));
                }
            });
        }
        lastFrameX = fxp;
    }, { passive: true });

    // a gentle strum to say hello once the page opens
    document.addEventListener("ssh:enter", () => {
        setTimeout(() => strings.forEach((s, i) => setTimeout(() => {
            s.vib = 6; s.phase = 0; s.speed = 1.1 + i * 0.12;
            if (!ringing) { ringing = true; requestAnimationFrame(ringLoop); }
        }, i * 45)), 1300);
    }, { once: true });


    /* =========================================
       02  TEACHER HAND-OFF + 03  THE DIVE
    ========================================= */

    const teacher = document.querySelector("#teacher");
    const teacherImage = teacher?.querySelector(".teacher-image");
    const scene = teacher?.querySelector(".teacher-scene");
    const sceneGuitar = scene?.querySelector(".teacher-guitar");
    const sceneHands = scene?.querySelector(".teacher-hands");
    const copyItems = teacher ? [...teacher.querySelectorAll(".teacher-copy > *, .teacher-points li")] : [];
    const hole = teacher?.querySelector(".soundhole");

    if (!teacher || !scene || !sceneGuitar || !sceneHands) return;

    // a copy of his hands rides above the flying guitar, so it slides in UNDER them
    const flightHands = document.createElement("img");
    flightHands.className = "flight-hands";
    flightHands.src = sceneHands.getAttribute("src");
    flightHands.alt = "";
    flightHands.setAttribute("aria-hidden", "true");
    stage.appendChild(flightHands);

    // where the guitar sits in his arms (must match .teacher-guitar in the CSS)
    const SCENE_W = 1374;
    const SCENE_H = 1145;
    const HOLD = { angle: 85, size: 0.72, frameAnchor: [541, 215], sceneAnchor: [1125, 612] };

    // the soundhole of the guitar in his arms, in scene pixels
    // (frame point 555, 945 run through the same hold transform)
    const HOLE = (() => {
        const a = HOLD.angle * Math.PI / 180;
        const dx = (555 - HOLD.frameAnchor[0]) * HOLD.size;
        const dy = (945 - HOLD.frameAnchor[1]) * HOLD.size;
        return [HOLD.sceneAnchor[0] + dx * Math.cos(a) - dy * Math.sin(a), HOLD.sceneAnchor[1] + dx * Math.sin(a) + dy * Math.cos(a)];
    })();

    gsap.set(scene, { transformOrigin: `${HOLE[0] / SCENE_W * 100}% ${HOLE[1] / SCENE_H * 100}%` });

    // Where the scene sits on screen while the teacher section is pinned.
    // Measured from layout offsets, so the dive's slide and zoom
    // (transforms) never throw the numbers off.
    const pinsAtTop = () => teacher.offsetHeight <= window.innerHeight + 2;
    const pinStart = () => (pinsAtTop() ? "top top" : "bottom bottom");
    const teacherStage = teacher.querySelector(".teacher-stage");
    const pinnedTop = () => (pinsAtTop() ? 0 : window.innerHeight - teacher.offsetHeight);

    function sceneBox() {
        const sectionRect = teacher.getBoundingClientRect();
        const stageRect = teacherStage.getBoundingClientRect();
        const width = scene.offsetWidth;
        return {
            left: stageRect.left + teacherImage.offsetLeft + scene.offsetLeft,
            top: stageRect.top - sectionRect.top + teacherImage.offsetTop + scene.offsetTop + pinnedTop(),
            width,
            height: scene.offsetHeight,
            k: width / SCENE_W
        };
    }

    function landing() {
        const box = sceneBox();
        const pxPerFrame = HOLD.size * box.k;
        const a = HOLD.angle * Math.PI / 180;
        const anchorX = box.left + HOLD.sceneAnchor[0] * box.k;
        const anchorY = box.top + HOLD.sceneAnchor[1] * box.k;
        const dx = (FRAME_W / 2 - HOLD.frameAnchor[0]) * pxPerFrame;
        const dy = (FRAME_H / 2 - HOLD.frameAnchor[1]) * pxPerFrame;
        return {
            scale: pxPerFrame / unit(),
            rotation: HOLD.angle,
            x: anchorX + (dx * Math.cos(a) - dy * Math.sin(a)) - stage.clientWidth / 2,
            y: anchorY + (dx * Math.sin(a) + dy * Math.cos(a)) - stage.clientHeight / 2
        };
    }

    function placeFlightHands() {
        const box = sceneBox();
        gsap.set(flightHands, { left: box.left, top: box.top, width: box.width, height: box.height });
    }
    placeFlightHands();
    ScrollTrigger.addEventListener("refresh", placeFlightHands);

    // exploded positions, to rebuild from
    const L = layout;
    const explodedOf = new Map([
        [P.shell, L.shell], [P.top, L.top], [P.rosette, L.rosette], [P.pickguard, L.pickguard],
        [P.bridge, L.bridge], [P.saddle, L.saddle], [P.neck, L.neck], [P.nut, L.nut], [P.headstock, L.headstock],
        ...P.pins.map((el, i) => [el, { x: L.pins.x + (i - 2.5) * L.pins.spread, y: L.pins.y }]),
        ...P.tunersLeft.map((el) => [el, { x: -L.tunerOut, y: L.headstock.y }]),
        ...P.tunersRight.map((el) => [el, { x: L.tunerOut, y: L.headstock.y }])
    ]);

    function rejoin(tl, els, at, duration = 1, ease = "power3.inOut", stagger = 0) {
        els.filter(Boolean).forEach((el, i) => {
            const v = explodedOf.get(el) || {};
            tl.fromTo(el, { x: fx(v.x || 0), y: fx(v.y || 0), rotation: v.r || 0 }, { x: 0, y: 0, rotation: 0, duration, ease }, at + i * stagger);
        });
    }

    const DIM = "brightness(0.35) saturate(0.8)";
    const LIT = "brightness(1) saturate(1)";

    gsap.set(scene, { filter: DIM });
    gsap.set(flightHands, { filter: DIM, opacity: 0 });
    gsap.set(sceneGuitar, { opacity: 0 });
    gsap.set(teacherImage, { opacity: 0 });
    gsap.set(copyItems, { opacity: 0, y: 30 });

    // PART 1: the scene rises in and the guitar rebuilds in reverse order
    const enter = gsap.timeline({ defaults: { immediateRender: false } });
    if (labelLayer) enter.fromTo(labelLayer, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0);
    rejoin(enter, [P.shell, P.top], 0.1, 0.4);
    rejoin(enter, [P.rosette, P.pickguard, P.bridge, P.saddle], 0.35, 0.4, "power3.inOut", 0.04);
    rejoin(enter, P.pins, 0.4, 0.4, "power3.inOut", 0.02);
    rejoin(enter, [P.neck], 0.5, 0.35);
    rejoin(enter, [P.nut, P.headstock], 0.58, 0.35);
    rejoin(enter, [...P.tunersLeft, ...P.tunersRight], 0.62, 0.35, "power3.inOut", 0.02);
    enter.fromTo(teacherImage, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.55);

    // PART 2 (pinned): strings back on, guitar into his hands, light up, copy in,
    // then the dive into the soundhole
    let strummed = false;

    let lastHandoff = 0;
    const handoff = gsap.timeline({
        defaults: { immediateRender: false },
        onUpdate: () => {
            renderStrings(layout);
            // a soft strum the moment the guitar lands in his hands (scrolling down)
            const p = handoff.progress();
            if (p > 0.38 && p < 0.55 && !strummed && p > lastHandoff) {
                strummed = true;
                SSH.audio?.strum(true, 0.4);
            }
            if (p < 0.25) strummed = false;
            lastHandoff = p;
        }
    });

    handoff.fromTo(flightHands, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);
    strings.forEach((s, i) => {
        handoff.fromTo(s, { lift: 1 }, { lift: 0, duration: 1.1, ease: "power2.inOut" }, 0.02 + i * 0.08);
        handoff.fromTo(s, { slack: 0 }, { slack: 30, duration: 0.5, ease: "sine.out" }, 0.2 + i * 0.08);
        handoff.to(s, { slack: 0, duration: 0.5, ease: "power2.in" }, 0.7 + i * 0.08);
    });
    handoff.fromTo(guitar,
        { scale: () => fit().scale, x: () => fit().x, y: () => fit().y, rotation: 0 },
        { scale: () => landing().scale, x: () => landing().x, y: () => landing().y, rotation: () => landing().rotation, duration: 2.0, ease: "power3.inOut" },
        1.4);
    handoff.fromTo([scene, flightHands], { filter: DIM }, { filter: LIT, duration: 1.2, ease: "power1.inOut" }, 2.6);
    handoff.fromTo(sceneGuitar, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 3.8);
    handoff.fromTo([guitar, flightHands], { opacity: 1 }, { opacity: 0, duration: 0.01 }, 3.81);

    // the copy arrives as the light comes up
    handoff.to(copyItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 3.2);
    handoff.to({}, { duration: 1.6 }, 4.4);

    // THE DIVE: copy steps aside, the room zooms into the soundhole
    const DIVE = 6.0;
    handoff.to(copyItems, { opacity: 0, y: -24, duration: 0.5, stagger: 0.03, ease: "power2.in" }, DIVE);
    handoff.to(teacherImage, { x: () => {
        // slide the picture so the soundhole ends up in the middle of the screen
        const box = sceneBox();
        return window.innerWidth / 2 - (box.left + HOLE[0] * box.k);
    }, y: () => {
        const box = sceneBox();
        return window.innerHeight / 2 - (box.top + HOLE[1] * box.k);
    }, duration: 1.2, ease: "power2.inOut" }, DIVE + 0.2);
    handoff.fromTo(scene, { scale: 1 }, { scale: 26, duration: 2.4, ease: "power3.in" }, DIVE + 0.9);
    // motion blur as it rushes in (also hides the illustration's pixels up close)
    handoff.fromTo(teacherImage, { filter: "blur(0px)" }, { filter: "blur(12px)", duration: 1.3, ease: "power2.in" }, DIVE + 2.0);
    if (hole) {
        handoff.fromTo(hole, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.9, ease: "power2.in" }, DIVE + 2.4);
    }
    handoff.to({}, { duration: 0.4 }, DIVE + 3.3);


    /* =========================================
       ONE MASTER TIMELINE
       The take-apart, the rebuild and the hand-off
       all move the same parts, so they live on one
       timeline: a fast jump (back to top, a
       reload) can never leave two of them fighting
       over the guitar. The pins are separate,
       pin-only triggers. 1 timeline unit = 400px.
    ========================================= */

    const HERO_LEN = isMobile ? 2600 : 3600;
    const HANDOFF_LEN = isMobile ? 3000 : 3800;
    const PX = 400;

    const heroPin = ScrollTrigger.create({ trigger: hero, start: "top top", end: "+=" + HERO_LEN, pin: true, anticipatePin: 1 });
    const teacherPin = ScrollTrigger.create({ trigger: teacher, start: pinStart, end: "+=" + HANDOFF_LEN, pin: true, anticipatePin: 1 });

    // between the two pins the teacher section travels up into place: one screen
    // (or its own height, if it is taller and pins by its bottom edge)
    const enterLen = pinsAtTop() ? window.innerHeight : teacher.offsetHeight;

    const master = gsap.timeline({
        defaults: { immediateRender: false },
        scrollTrigger: {
            // absolute positions: a trigger inside the pinned hero would be offset by its pin
            start: () => heroPin.start,
            end: () => teacherPin.end,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });
    master.add(heroTl.duration(HERO_LEN / PX), 0);
    master.add(enter.duration(enterLen / PX), HERO_LEN / PX);
    master.add(handoff.duration(HANDOFF_LEN / PX), (HERO_LEN + enterLen) / PX);

    ScrollTrigger.refresh();

})();
