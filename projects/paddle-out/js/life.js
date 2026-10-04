/* =========================================================
   PADDLE OUT: BEACH LIFE
   Stick figures on the sand and in the water, driven by the
   same live conditions as the sea:
   sunny + good surf  a busy beach, surfers in the water
   blown out          a few walkers, nobody surfing
   flat               swimmers, kids and sunbathers
   raining            empty, apart from someone running for cover
   night              empty
   The crowd is rebuilt only when the conditions change, so
   it never flickers, and figures walk off one side of the
   screen and back on the other.
========================================================= */

import { LANDMARKS, KEEP_CLEAR, WATER_CLEAR, FOCUS } from "./landmarks.js";

const NS = "http://www.w3.org/2000/svg";
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const BOARDS = ["#ff5d5d", "#ffd23f", "#3ec1d3", "#ff9a3c", "#8b5cf6", "#2ecc71", "#ff4f8b", "#1e90ff", "#fbfaf5"];
const TOWELS = ["#ff5d5d", "#3ec1d3", "#ffd23f", "#8b5cf6", "#2ecc71", "#ff9a3c"];

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const r1 = (n) => Math.round(n * 10) / 10;
const P = (x, y) => `${r1(x)} ${r1(y)}`;

function el(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
}

// sand people stand between y 167 (further away, smaller) and 184 (closer, bigger)
const sandScale = (y) => 1.08 + ((y - 166) / 18) * 0.3;
const waterScale = (y) => 0.82 + ((y - 118) / 36) * 0.32;

const inRanges = (x, ranges = []) => ranges.some(([a, b]) => x >= a && x <= b);
function freeX(ranges, lo = 80, hi = 1520) {
    for (let i = 0; i < 30; i++) {
        const x = rnd(lo, hi);
        if (!inRanges(x, ranges)) return x;
    }
    return rnd(lo, hi);
}


/* ---------- poses ----------
   Local coordinates: feet at (0, 0), facing right, about 26 units tall. */

function walkPath(p, stride, arms) {
    const a = Math.sin(p) * 0.5 * stride;
    const L = 10.5;
    const hipY = -10.5;
    const leg = (ang) => P(Math.sin(ang) * L, hipY + Math.cos(ang) * L);
    let d = `M${leg(a)}L0 ${hipY}L${leg(-a)}M0 ${hipY}L0 -19.6`;
    const shY = -17.5;
    const arm = (ang, len = 7.5) => P(Math.sin(ang) * len, shY + Math.cos(ang) * len);
    if (arms === "head") d += `M-3 -24L-6 -19.5L0 ${shY}L6 -19.5L3 -24`;
    else if (arms === "carry") d += `M${arm(a * 0.8)}L0 ${shY}L4 -12.5`;
    else if (arms === "leash") d += `M${arm(a * 0.8)}L0 ${shY}L6.5 -12`;
    else if (arms === "pump") {
        const b = a * 1.2;
        d += `M0 ${shY}L${P(-Math.sin(b) * 5, -13.5)}L${P(-Math.sin(b) * 5 + 3, -16.5)}`;
        d += `M0 ${shY}L${P(Math.sin(b) * 5, -13.5)}L${P(Math.sin(b) * 5 + 3, -16.5)}`;
    } else if (arms === "up") d += `M-6 -25L0 ${shY}L6 -25`;
    else d += `M${arm(a * 0.9)}L0 ${shY}L${arm(-a * 0.9)}`;
    return d;
}

function dogPath(q) {
    const leg = (x, ph) => `M${x} -7L${P(x + Math.sin(q + ph) * 3, 0)}`;
    return `M15 -7L27 -7M15 -7L${P(12, -10 - Math.abs(Math.sin(q * 2)) * 2)}` + leg(26, 0) + leg(24.5, Math.PI) + leg(17, Math.PI) + leg(15.5, 0);
}


/* ---------- people on the sand ---------- */

function walker(layer, kind) {
    const g = el("g", { class: "fig" });
    let board = null;
    if (kind === "carrier") board = el("ellipse", { cx: 1, cy: -12, rx: 13, ry: 2.6, fill: pick(BOARDS), transform: "rotate(-10 1 -12)" }, g);
    const body = el("path", {}, g);
    el("circle", { cx: 0, cy: -23, r: 3.4 }, g);
    let dog = null, dogHead = null, leash = null;
    if (kind === "dogWalker") {
        leash = el("path", { class: "leash", d: "M6.5 -12 Q18 -6 28.5 -10.5" }, g);
        dog = el("path", {}, g);
        dogHead = el("circle", { cx: 29.5, cy: -9.5, r: 2.5 }, g);
    }

    const speeds = { walker: [10, 17], dogWalker: [11, 15], carrier: [12, 18], runner: [36, 48], rainRunner: [58, 70] };
    const [s0, s1] = speeds[kind] || speeds.walker;
    const f = {
        g, kind,
        x: rnd(-40, 1640), y: rnd(170, 186), dir: Math.random() < 0.5 ? -1 : 1, speed: rnd(s0, s1),
        p: rnd(0, 6), stride: kind === "runner" || kind === "rainRunner" ? 1.5 : 1,
        arms: kind === "carrier" ? "carry" : kind === "dogWalker" ? "leash" : kind === "runner" ? "pump" : kind === "rainRunner" ? "head" : "swing",
        wait: 0
    };
    if (kind === "rainRunner") { f.x = f.dir > 0 ? -40 : 1640; f.y = rnd(170, 182); }

    f.update = (dt) => {
        if (f.wait > 0) { f.wait -= dt; if (f.wait <= 0) { f.dir = Math.random() < 0.5 ? -1 : 1; f.x = f.dir > 0 ? -40 : 1640; g.style.opacity = 1; } return; }
        f.x += f.dir * f.speed * dt;
        f.p += f.speed * dt * (f.stride > 1 ? 0.22 : 0.34);
        if (f.x > 1660 || f.x < -60) {
            if (kind === "rainRunner") { f.wait = rnd(3, 7); g.style.opacity = 0; return; }
            f.x = f.x > 1660 ? -50 : 1650;               // walk back on from the other side
            f.y = rnd(170, 186);
        }
    };
    f.draw = () => {
        const s = sandScale(f.y);
        const bob = -Math.abs(Math.sin(f.p)) * (f.stride > 1 ? 1.6 : 0.7);
        g.setAttribute("transform", `translate(${r1(f.x)} ${r1(f.y + bob)}) scale(${r1(s * f.dir * 100) / 100} ${r1(s * 100) / 100})`);
        body.setAttribute("d", walkPath(f.p, f.stride, f.arms));
        if (dog) dog.setAttribute("d", dogPath(f.p * 2));
    };
    return f;
}

function kids(clear) {
    const g = el("g", { class: "fig" });
    const x0 = freeX(clear, 120, 1430);
    const y = rnd(172, 184);
    const gap = 46;
    const kidA = el("g", {}, g), kidB = el("g", {}, g);
    const bodyA = el("path", {}, kidA), bodyB = el("path", {}, kidB);
    el("circle", { cx: 0, cy: -23, r: 3.6 }, kidA);
    el("circle", { cx: 0, cy: -23, r: 3.6 }, kidB);
    const ball = el("circle", { r: 2.8, fill: pick(["#ff5d5d", "#ffd23f", "#1e90ff"]), class: "ball" }, g);
    const T = rnd(1.3, 1.8);
    const f = { g, kind: "kids", y, ph: rnd(0, 4) };
    f.update = () => {};
    f.draw = (t) => {
        const s = sandScale(y) * 0.72;
        const cyc = ((t + f.ph) % (2 * T)) / T;               // 0..2: there and back
        const u = cyc < 1 ? cyc : 2 - cyc;
        const hopA = cyc > 1.85 || cyc < 0.15 ? 3 : 0;
        const hopB = cyc > 0.85 && cyc < 1.15 ? 3 : 0;
        kidA.setAttribute("transform", `translate(${r1(x0)} ${r1(y - hopA)}) scale(${r1(s * 100) / 100})`);
        kidB.setAttribute("transform", `translate(${r1(x0 + gap)} ${r1(y - hopB)}) scale(${r1(-s * 100) / 100} ${r1(s * 100) / 100})`);
        bodyA.setAttribute("d", walkPath(Math.PI / 2, 0.7, "up"));
        bodyB.setAttribute("d", walkPath(Math.PI / 2, 0.7, "up"));
        const handY = y - 25 * s;
        ball.setAttribute("cx", r1(x0 + 4 + u * (gap - 8)));
        ball.setAttribute("cy", r1(handY - Math.sin(Math.PI * u) * 26));
    };
    return f;
}

function sunbather(clear) {
    const g = el("g", { class: "fig" });
    const x = freeX(clear, 100, 1480);
    const y = rnd(170, 184);
    const s = sandScale(y);
    g.setAttribute("transform", `translate(${r1(x)} ${r1(y)}) scale(${Math.random() < 0.5 ? "-" : ""}${r1(s * 100) / 100} ${r1(s * 100) / 100})`);
    el("rect", { x: -16, y: -2.5, width: 32, height: 3.5, fill: pick(TOWELS), rx: 1 }, g);
    el("path", { d: "M-12 -4.5L-6 -9L-1 -4.5M-1 -4.5L9 -5M2 -5L-2 -9", class: "limb" }, g);
    el("circle", { cx: 12, cy: -6.5, r: 3.2 }, g);
    el("path", { d: "M20 1L15 -31", class: "pole" }, g);
    el("path", { d: "M-1 -27 Q13 -47 31 -35 Z", class: "canopy", style: `fill:${pick(TOWELS)}` }, g);
    const f = { g, kind: "sunbather", y, update() {}, draw() {} };
    return f;
}


/* ---------- people in the water (y 118 to 154) ---------- */

function rider(clear) {
    const g = el("g", { class: "fig" });
    const spray = el("path", { class: "spray", d: "M-15 -1 Q-22 -7 -27 -2" }, g);
    el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 2.4, fill: pick(BOARDS) }, g);
    const body = el("path", {}, g);
    const head = el("circle", { cx: 1.5, cy: -20, r: 3.2 }, g);
    const f = { g, kind: "rider", ph: rnd(0, 6) };
    const spawn = () => {
        f.dir = Math.random() < 0.5 ? -1 : 1;
        f.x = freeX(clear, 140, 1460);
        f.baseY = rnd(124, 148);
        f.speed = rnd(34, 58);
        f.left = rnd(180, 420);
        f.wait = 0;
        g.style.opacity = 1;
    };
    spawn();
    f.update = (dt) => {
        if (f.wait > 0) { f.wait -= dt; if (f.wait <= 0) spawn(); return; }
        f.x += f.dir * f.speed * dt;
        f.left -= f.speed * dt;
        if (f.left <= 0 || f.x < 40 || f.x > 1560 || inRanges(f.x, clear)) { f.wait = rnd(1.5, 4); g.style.opacity = 0; }
    };
    f.draw = (t) => {
        const y = f.baseY + Math.sin(t * 1.6 + f.ph) * 1.6;
        const tilt = Math.sin(t * 1.1 + f.ph) * 5;
        const s = waterScale(f.baseY);
        const arm = Math.sin(t * 2 + f.ph) * 2;
        g.setAttribute("transform", `translate(${r1(f.x)} ${r1(y)}) rotate(${r1(tilt * f.dir)}) scale(${r1(s * f.dir * 100) / 100} ${r1(s * 100) / 100})`);
        body.setAttribute("d", `M-6 -1L-3 -6L0 -10L3 -6L6 -1M0 -10L1.5 -16.5M${P(-9, -13 + arm)}L1 -15L${P(9, -12 - arm)}`);
        spray.style.opacity = 0.5 + 0.4 * Math.sin(t * 6 + f.ph);
    };
    return f;
}

function paddler(clear) {
    const g = el("g", { class: "fig" });
    el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 2.3, fill: pick(BOARDS) }, g);
    const body = el("path", {}, g);
    el("circle", { cx: 9, cy: -5, r: 3 }, g);
    const f = {
        g, kind: "paddler", ph: rnd(0, 6),
        x: freeX(clear, 80, 1520), baseY: rnd(128, 152), dir: Math.random() < 0.5 ? -1 : 1, speed: rnd(2, 7)
    };
    f.update = (dt) => {
        f.x += f.dir * f.speed * dt;
        if (f.x < 60 || f.x > 1540 || inRanges(f.x, clear)) { f.dir *= -1; f.x += f.dir * 2; }
    };
    f.draw = (t) => {
        const y = f.baseY + Math.sin(t * 1.2 + f.ph) * 1.8;
        const s = waterScale(f.baseY);
        const w = t * 3 + f.ph;
        g.setAttribute("transform", `translate(${r1(f.x)} ${r1(y)}) scale(${r1(s * f.dir * 100) / 100} ${r1(s * 100) / 100})`);
        body.setAttribute("d", `M-9 -2.5L6 -3.5M-9 -2.5L-15 -1.5M5 -3.5L${P(5 + Math.cos(w) * 6, -3.5 + Math.max(Math.sin(w), -0.3) * 5)}`);
    };
    return f;
}

function swimmer(clear) {
    const g = el("g", { class: "fig" });
    const arm = el("path", { class: "limb" }, g);
    el("circle", { cx: 0, cy: -2, r: 3 }, g);
    const f = { g, kind: "swimmer", ph: rnd(0, 6), x: freeX(clear, 100, 1500), baseY: rnd(148, 155), dir: Math.random() < 0.5 ? -1 : 1 };
    f.update = (dt) => {
        f.x += f.dir * 2.5 * dt;
        if (f.x < 80 || f.x > 1520 || inRanges(f.x, clear)) f.dir *= -1;
    };
    f.draw = (t) => {
        const y = f.baseY + Math.sin(t * 1.4 + f.ph) * 1.2;
        const s = waterScale(f.baseY);
        const w = t * 2.4 + f.ph;
        g.setAttribute("transform", `translate(${r1(f.x)} ${r1(y)}) scale(${r1(s * f.dir * 100) / 100} ${r1(s * 100) / 100})`);
        arm.setAttribute("d", Math.sin(w) > 0 ? `M2 0 Q${P(5, -7 * Math.sin(w))} ${P(9, 0)}` : "");
    };
    return f;
}


/* ---------- who's on the beach ---------- */

export function castFor({ mood, phase, rain, overcast }, beachId) {
    if (phase === "night") return {};
    if (rain > 0.5) return { rainRunner: 1 };
    if (rain > 0) return { rainRunner: 1, walker: 1 };

    let light = phase === "dawn" || phase === "dusk" ? 0.45 : phase === "sunset" ? 0.7 : 1;
    light *= 1 - (overcast || 0) * 0.5;
    const n = (k) => Math.max(0, Math.round(k * light));
    const surf = phase === "dawn" ? 1.1 : 1;                 // dawn patrol: the surfers are out
    const m = (k) => Math.max(0, Math.round(k * surf * (light + 1) / 2));

    let cast;
    switch (mood) {
        case "blown": cast = { walker: n(2), dogWalker: n(1), runner: n(1) }; break;
        case "flat": cast = { walker: n(3), dogWalker: n(1), kids: n(1), swimmer: n(3), sunbather: n(2), paddler: m(1) }; break;
        case "pumping": cast = { rider: m(3), paddler: m(3), carrier: n(2), walker: n(2), dogWalker: n(1) }; break;
        case "glassy": cast = { rider: m(2), paddler: m(3), carrier: n(2), walker: n(2), dogWalker: n(1), runner: n(1), kids: n(1), sunbather: n(1) }; break;
        default: cast = { rider: m(2), paddler: m(2), carrier: n(2), walker: n(3), dogWalker: n(1), kids: n(1), sunbather: n(2), swimmer: n(1) };
    }
    if ((beachId === "supertubes" || beachId === "kitchen-windows") && cast.rider != null) cast.rider += 1;   // it's J-Bay
    if ((beachId === "north-beach" || beachId === "addington") && cast.walker != null) cast.walker += 1;     // the Golden Mile is busy
    if (beachId === "big-bay" && cast.rider != null) cast.rider += 1;                                        // kites and surfers
    return cast;
}


/* ---------- the scene ---------- */

export class BeachLife {

    constructor(svg) {
        this.svg = svg;
        this.landmark = svg.querySelector(".landmark");
        this.water = svg.querySelector(".life-water");
        this.sand = svg.querySelector(".life-sand");
        this.figs = [];
        this.beach = null;
        this.sig = "";
        this.t = 0;
        this.visible = true;
        new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(svg);
        new ResizeObserver(() => this.fit()).observe(svg);

        let last = performance.now();
        const loop = (now) => {
            requestAnimationFrame(loop);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (REDUCED || !this.visible || document.hidden) return;
            this.t += dt;
            for (const f of this.figs) { f.update(dt); f.draw(this.t); }
        };
        requestAnimationFrame(loop);
    }

    setBeach(id) {
        if (id === this.beach) return;
        this.beach = id;
        this.landmark.innerHTML = LANDMARKS[id] ? LANDMARKS[id]() : "";
        this.fit();
        this.sig = "";
    }

    // On a narrow screen only part of the 1600-wide band fits: keep the landmark in view
    fit() {
        const w = this.svg.clientWidth;
        const h = this.svg.clientHeight;
        if (!w || !h) return;
        const visible = w / Math.max(w / 1600, h / 190);
        const focus = FOCUS[this.beach] ?? 800;
        const minX = Math.max(0, Math.min(1600 - visible, focus - visible / 2));
        this.svg.setAttribute("preserveAspectRatio", "xMinYMax slice");
        this.svg.setAttribute("viewBox", `${Math.round(minX)} 0 1600 190`);
    }

    setConditions(c) {
        const cast = castFor(c, this.beach);
        const sig = this.beach + JSON.stringify(cast);
        if (sig === this.sig) return;
        this.sig = sig;
        this.build(cast);
    }

    build(cast) {
        this.water.innerHTML = "";
        this.sand.innerHTML = "";
        const sandClear = KEEP_CLEAR[this.beach] || [];
        const waterClear = WATER_CLEAR[this.beach] || [];
        const make = {
            walker: () => walker("sand", "walker"),
            dogWalker: () => walker("sand", "dogWalker"),
            carrier: () => walker("sand", "carrier"),
            runner: () => walker("sand", "runner"),
            rainRunner: () => walker("sand", "rainRunner"),
            kids: () => kids(sandClear),
            sunbather: () => sunbather(sandClear),
            rider: () => rider(waterClear),
            paddler: () => paddler(waterClear),
            swimmer: () => swimmer(waterClear)
        };
        const inWater = new Set(["rider", "paddler", "swimmer"]);
        const figs = [];
        for (const [kind, count] of Object.entries(cast)) {
            for (let i = 0; i < count; i++) {
                const f = make[kind]();
                f.layer = inWater.has(kind) ? "water" : "sand";
                figs.push(f);
            }
        }
        // further away first, so nearer people overlap them
        figs.sort((a, b) => (a.y ?? a.baseY ?? 0) - (b.y ?? b.baseY ?? 0));
        for (const f of figs) (f.layer === "water" ? this.water : this.sand).appendChild(f.g);
        this.figs = figs;
        for (const f of figs) f.draw(this.t);
    }
}
