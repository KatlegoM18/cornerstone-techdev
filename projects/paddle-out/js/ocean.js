/* =========================================================
   PADDLE OUT: OCEAN
   A 2D canvas sea driven by real numbers:
   wave height → how tall the lines stand
   wave period → how far apart they are and how fast they roll
   wind        → chop and whitewash, and which way the spray drifts
   Palette and motion ease towards new targets, so switching
   conditions feels like weather changing, not a page reload.
========================================================= */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const LAYERS = 11;

function parseColor(c) {
    if (c.startsWith("#")) {
        const n = parseInt(c.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
    }
    const m = c.match(/[\d.]+/g).map(Number);
    return [m[0], m[1], m[2], m[3] ?? 1];
}
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(c[3] * a).toFixed(3)})`;
const mixC = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function numericPalette(p) {
    return {
        skyTop: parseColor(p.skyTop),
        skyBottom: parseColor(p.skyBottom),
        sea: p.sea.map(parseColor),
        foam: parseColor(p.foam),
        sun: parseColor(p.sun),
        sunX: p.sunX ?? 0.53, sunY: p.sunY, sunR: p.sunR, sunA: p.sunA,
        stars: p.stars, clouds: p.clouds, rain: p.rain ?? 0
    };
}

function approach(cur, target, k) {
    if (Array.isArray(cur)) return cur.map((v, i) => approach(v, target[i], k));
    if (typeof cur === "object") {
        const out = {};
        for (const key in cur) out[key] = approach(cur[key], target[key], k);
        return out;
    }
    return cur + (target - cur) * k;
}

function seaColour(sea, p) {
    const x = p * (sea.length - 1);
    const i = Math.min(Math.floor(x), sea.length - 2);
    return mixC(sea[i], sea[i + 1], x - i);
}


export class Ocean {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.t = 0;
        this.visible = true;
        this.palette = null;
        this.target = null;
        this.sea = { amp: 0.8, period: 10, chop: 0, drift: 0 };
        this.seaTarget = { ...this.sea };

        // fixed random details so nothing flickers between frames
        this.stars = Array.from({ length: 140 }, () => [Math.random(), Math.random() * 0.9, Math.random() * 1.4 + 0.3, Math.random() * 6]);
        this.clouds = Array.from({ length: 6 }, (_, i) => [Math.random(), 0.12 + Math.random() * 0.5, 0.18 + Math.random() * 0.22, i]);
        this.glints = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random() * 6]);
        this.drops = Array.from({ length: 220 }, () => [Math.random(), Math.random(), 0.7 + Math.random() * 0.6]);

        this.resize = this.resize.bind(this);
        new ResizeObserver(this.resize).observe(canvas);
        new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
        this.resize();

        this.last = performance.now();
        const loop = (now) => {
            requestAnimationFrame(loop);
            const dt = Math.min((now - this.last) / 1000, 0.05);
            this.last = now;
            if (!this.visible || !this.palette) return;
            if (!REDUCED_MOTION) this.t += dt;
            const k = REDUCED_MOTION ? 1 : 1 - Math.exp(-dt * 1.6);
            this.palette = approach(this.palette, this.target, k);
            this.sea = approach(this.sea, this.seaTarget, k);
            this.draw();
        };
        requestAnimationFrame(loop);
    }

    set(palette, sea, instant = false) {
        this.target = numericPalette(palette);
        this.seaTarget = { ...sea };
        if (!this.palette || instant) {
            this.palette = structuredClone(this.target);
            this.sea = { ...sea };
        }
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.canvas.width = Math.round(w * dpr);
        this.canvas.height = Math.round(h * dpr);
        this.dpr = dpr;
        if (this.palette) this.draw();
    }

    draw() {
        const { ctx, t, dpr } = this;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const P = this.palette;
        const S = this.sea;
        const narrow = W / dpr < 700;
        const horizon = H * (narrow ? 0.56 : 0.63);
        const unit = Math.min(H / 900, 1.3) * dpr;
        const sunX = W * P.sunX;
        const sunY = horizon * P.sunY;
        const sunR = Math.min(W, H) * P.sunR;

        /* ---- sky ---- */
        const sky = ctx.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, rgba(P.skyTop));
        sky.addColorStop(1, rgba(P.skyBottom));
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, horizon + 2);

        if (P.stars > 0.01) {
            for (const [x, y, r, ph] of this.stars) {
                const tw = 0.55 + 0.45 * Math.sin(t * 1.3 + ph);
                ctx.fillStyle = `rgba(255,255,255,${(P.stars * tw * 0.85).toFixed(3)})`;
                ctx.fillRect(x * W, y * horizon, r * dpr, r * dpr);
            }
        }

        if (P.sunA > 0.01) {
            const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.2);
            glow.addColorStop(0, rgba(P.sun, P.sunA * 0.55));
            glow.addColorStop(0.35, rgba(P.sun, P.sunA * 0.18));
            glow.addColorStop(1, rgba(P.sun, 0));
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, W, horizon);
            ctx.fillStyle = rgba(P.sun, P.sunA);
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * 0.42, 0, Math.PI * 2);
            ctx.fill();
        }

        if (P.clouds > 0.01) {
            for (const [x0, y, s, i] of this.clouds) {
                const x = ((x0 + t * 0.006 * (1 + S.drift * 1.5) * (1 + i * 0.2)) % 1.4 - 0.2) * W;
                const cw = W * s;
                const cy = horizon * y;
                const g = ctx.createRadialGradient(x, cy, 0, x, cy, cw * 0.5);
                const c = mixC(P.skyBottom, [255, 255, 255, 1], 0.55);
                g.addColorStop(0, rgba(c, P.clouds * 0.6));
                g.addColorStop(1, rgba(c, 0));
                ctx.save();
                ctx.translate(x, cy);
                ctx.scale(1, 0.32);
                ctx.translate(-x, -cy);
                ctx.fillStyle = g;
                ctx.fillRect(x - cw, cy - cw, cw * 2, cw * 2);
                ctx.restore();
            }
        }

        /* ---- sea ---- */
        const step = Math.max(4, Math.round(6 * dpr));
        const seaH = H - horizon;
        const ampPx = (5 + S.amp * 30) * unit;
        const whitewashOn = Math.max(0, Math.min((S.amp - 0.9) / 0.8, 1)) + S.chop * 0.6;

        for (let i = 0; i < LAYERS; i++) {
            const p = i / (LAYERS - 1);
            const persp = 0.06 + 0.94 * Math.pow(p, 1.35);
            const baseY = horizon + seaH * (0.015 + 0.985 * Math.pow(p, 1.75));
            const lambda = W * (0.07 + 0.5 * persp) * (S.period / 10);
            const speed = 1.1 * (10 / S.period) * (0.45 + p);
            const A = ampPx * persp * (1 + 0.3 * p);
            const sharp = 2 + Math.min(S.amp, 2.5) * 1.1;          // bigger swell, steeper faces
            const chopA = S.chop * (1.2 + 6 * persp) * unit;

            const pts = [];
            const crests = [];
            for (let x = -step; x <= W + step; x += step) {
                const set = 0.72 + 0.34 * Math.sin(t * 0.13 + i * 0.7 + x / (W * 1.2));
                const th = (x / lambda) * Math.PI * 2 - t * speed + i * 1.9;
                const crest = Math.pow((Math.sin(th) + 1) / 2, sharp) * 2 - 0.6;
                const f = 0.09 / (0.35 + persp);
                const chop = 0.6 * Math.sin(x * f * 0.6 + t * 3 * (S.drift || 0.4) + i)
                    + 0.4 * Math.sin(x * f * 1.7 - t * 4.2 + i * 2.3);
                pts.push(x, baseY - A * set * crest - chopA * chop);
                crests.push(crest * set);
            }

            // body of water: a little sky reflected on the face of each line
            const col = seaColour(P.sea, p);
            const face = ctx.createLinearGradient(0, baseY - A * 1.4, 0, baseY + seaH * 0.12 + A);
            face.addColorStop(0, rgba(mixC(col, P.skyBottom, 0.28 * (1 - S.chop * 0.5))));
            face.addColorStop(1, rgba(col));
            ctx.fillStyle = face;
            ctx.beginPath();
            ctx.moveTo(-step, H);
            for (let k = 0; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
            ctx.lineTo(W + step, H);
            ctx.closePath();
            ctx.fill();

            // the lip of each line
            ctx.strokeStyle = rgba(P.foam, (0.1 + 0.3 * S.chop + 0.3 * p * Math.min(S.amp, 2) / 2) * (0.35 + 0.65 * p));
            ctx.lineWidth = (0.6 + 2 * p) * dpr;
            ctx.beginPath();
            for (let k = 0; k < pts.length; k += 2) (k ? ctx.lineTo : ctx.moveTo).call(ctx, pts[k], pts[k + 1]);
            ctx.stroke();

            // whitewash where the bigger crests break
            if (whitewashOn > 0.02 && p > 0.5) {
                ctx.strokeStyle = rgba(P.foam, Math.min(whitewashOn, 1) * 0.55);
                ctx.lineWidth = (1.5 + 4 * p) * dpr * Math.min(whitewashOn + 0.3, 1.1);
                ctx.lineCap = "butt";
                ctx.setLineDash([10 * dpr, 4 * dpr, 3 * dpr, 5 * dpr]);
                ctx.beginPath();
                let drawing = false;
                for (let k = 0; k < crests.length; k++) {
                    const x = pts[k * 2];
                    const y = pts[k * 2 + 1] + ctx.lineWidth * 0.35;
                    if (crests[k] > 1.05) {
                        drawing ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
                        drawing = true;
                    } else {
                        drawing = false;
                    }
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        /* ---- sun / moon path on calm water ---- */
        const calm = Math.max(0, 1 - S.chop * 1.6) * P.sunA;
        if (calm > 0.05) {
            for (const [gx, gy, ph] of this.glints) {
                const y = horizon + Math.pow(gy, 1.6) * seaH * 0.7 + 4 * dpr;
                const spread = (0.25 + gy * 1.4) * sunR * 0.8;
                const x = sunX + (gx - 0.5) * 2 * spread;
                const tw = 0.5 + 0.5 * Math.sin(t * 2.2 + ph);
                ctx.fillStyle = rgba(P.sun, calm * tw * 0.55);
                ctx.fillRect(x, y, (6 + gy * 26) * dpr * tw, 1.4 * dpr);
            }
        }

        /* ---- rain ---- */
        if (P.rain > 0.02) {
            const n = Math.round(this.drops.length * Math.min(P.rain, 1));
            const lean = (S.drift || 0.2) * 0.35;
            ctx.strokeStyle = `rgba(225,232,240,${(0.18 + 0.3 * P.rain).toFixed(3)})`;
            ctx.lineWidth = 1.1 * dpr;
            ctx.beginPath();
            for (let i = 0; i < n; i++) {
                const [x0, y0, sp] = this.drops[i];
                const len = (12 + 16 * sp) * dpr;
                const y = ((y0 + t * 0.9 * sp) % 1) * (H + len) - len;
                const x = ((x0 + t * 0.05 * lean) % 1) * W;
                ctx.moveTo(x, y);
                ctx.lineTo(x - lean * len, y + len);
            }
            ctx.stroke();
        }
    }
}
