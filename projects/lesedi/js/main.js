/* =========================================================
   LESEDI: MAIN
   A procedural 3D wine bottle you can turn by hand.
   The wrap-around label is the interface: each quarter-turn
   shows a different panel, mirrored in the reader beside it.
========================================================= */

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { WINES, FACES } from "./wines.js";
import { drawLabel } from "./label.js";


const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const QUARTER = Math.PI / 2;
const PROFILE_POINTS = 120;
const LABEL_Y = 1.3;           // centre of the label on the bottle
const LABEL_H = 1.3;
const WIDTH = 0.64;           // profiles are drawn at radius 1, then slimmed to wine-bottle proportions

const body = document.body;
const stageEl = document.getElementById("bottle-stage");
const canvas = document.getElementById("bottle-canvas");
const panelEl = document.getElementById("face-panel");
const dialNeedle = document.querySelector(".face-dial-needle");
const faceTabs = [...document.querySelectorAll(".face-tabs [role=tab]")];
const wineButtons = [...document.querySelectorAll(".wine-picker [role=radio]")];
const buyPrice = document.querySelector("[data-buy-price]");
const buyMeta = document.querySelector("[data-buy-meta]");
const buyButton = document.querySelector(".reader-buy [data-add]");


/* =========================================================
   STATE
========================================================= */

const state = {
    wine: 0,
    face: 0,
    rotation: 0,             // the bottle's resting rotation (radians)
    target: 0,               // where it is easing towards
    velocity: 0,
    dragging: false,
    interacted: false,
    lastX: 0,
    transition: null         // { from, to, start }
};

const mod = (n, m) => ((n % m) + m) % m;
const faceFromRotation = (r) => mod(Math.round(-r / QUARTER), 4);


/* =========================================================
   THE READER PANEL (HTML)
========================================================= */

function listItems(pairs) {
    return pairs.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join("");
}

function contourMap() {
    let paths = "";
    for (let r = 0; r < 5; r++) {
        let d = "";
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
            const wob = 1 + 0.08 * Math.sin(a * 3 + r) + 0.05 * Math.cos(a * 5 - r);
            const x = 150 + Math.cos(a) * (28 + r * 24) * 1.9 * wob;
            const y = 46 + Math.sin(a) * (9 + r * 7.5) * wob;
            d += (a === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
        }
        paths += `<path d="${d}Z"/>`;
    }
    return `<svg class="panel-map" viewBox="0 0 300 92" aria-hidden="true">${paths}
        <ellipse class="block" cx="182" cy="42" rx="26" ry="9" transform="rotate(-10 182 42)"/>
        <text x="214" y="30">THE BLOCK</text></svg>`;
}

function renderPanel() {
    const wine = WINES[state.wine];
    const f = state.face;
    let html = "";

    if (f === 0) {
        html = `
            <p class="panel-kicker">${wine.block} · ${wine.vintage}</p>
            <h2 class="panel-title">${wine.name}</h2>
            <p class="panel-text">${wine.intro}</p>
            <dl class="panel-stats">
                <div><dt>Drink</dt><dd>${wine.cellar}</dd></div>
                <div><dt>Alcohol</dt><dd>${wine.abv}</dd></div>
            </dl>`;
    } else if (f === 1) {
        html = `
            <p class="panel-kicker">Tasting note</p>
            <h2 class="panel-title">In the <em>glass</em></h2>
            <ul class="panel-list">${listItems(wine.tasting)}</ul>`;
    } else if (f === 2) {
        html = `
            <p class="panel-kicker">${wine.block}</p>
            <h2 class="panel-title">The <em>block</em></h2>
            ${contourMap()}
            <dl class="panel-stats">${wine.vineyard
                .map(([k, v]) => `<div><dt>${k || "&nbsp;"}</dt><dd>${v}</dd></div>`)
                .join("")}</dl>`;
    } else {
        html = `
            <p class="panel-kicker">Serving</p>
            <h2 class="panel-title">At the <em>table</em></h2>
            <div class="panel-temp"><strong>${wine.serve}</strong><span>${wine.serveNote}</span></div>
            <ul class="panel-list">${listItems(wine.pairing)}</ul>`;
    }

    panelEl.innerHTML = html;
    buyPrice.textContent = wine.price;
    buyMeta.textContent = `750 ml · ${wine.abv}`;
    buyButton.dataset.add = state.wine;
    buyButton.setAttribute("aria-label", `Add ${wine.name} ${wine.vintage} to cart`);
    panelEl.setAttribute("aria-labelledby", `tab-${f}`);

    faceTabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === f));
        tab.tabIndex = i === f ? 0 : -1;
    });
    body.dataset.face = f;
}

function setFace(face) {
    if (face === state.face) return;
    state.face = face;
    renderPanel();
}


/* =========================================================
   CONTROLS: TABS, WINE PICKER, DRAG
========================================================= */

function turnToFace(face) {
    // shortest way round to the requested face
    const current = -state.target / QUARTER;
    let delta = mod(face - current, 4);
    if (delta > 2) delta -= 4;
    state.target = -(current + delta) * QUARTER;
    state.interacted = true;
    if (REDUCED_MOTION || !renderer) state.rotation = state.target;
    setFace(face);
}

faceTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => turnToFace(i));
    tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = mod(i + (e.key === "ArrowRight" ? 1 : -1), 4);
        turnToFace(next);
        faceTabs[next].focus();
    });
});

function selectWine(index) {
    if (index === state.wine) return;
    const from = state.wine;
    state.wine = index;
    body.dataset.wine = index;
    wineButtons.forEach((b, i) => {
        b.setAttribute("aria-checked", String(i === index));
        b.tabIndex = i === index ? 0 : -1;
    });
    renderPanel();

    if (renderer && !REDUCED_MOTION) {
        state.transition = { from, to: index, start: performance.now(), swapped: false };
    } else if (bottle) {
        bottle.applyWine(WINES[index], 1, WINES[index]);
        bottle.setLabel(index);
    }
}

wineButtons.forEach((btn, i) => {
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.addEventListener("click", () => selectWine(i));
    btn.addEventListener("keydown", (e) => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        const next = mod(i + keys[e.key], WINES.length);
        selectWine(next);
        wineButtons[next].focus();
    });
});

stageEl.addEventListener("pointerdown", (e) => {
    if (!renderer || (e.pointerType === "mouse" && e.button !== 0)) return;
    state.dragging = true;
    state.interacted = true;
    state.lastX = e.clientX;
    state.velocity = 0;
    stageEl.setPointerCapture(e.pointerId);
    stageEl.classList.add("is-dragging");
    body.classList.add("has-dragged");
});

stageEl.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const dx = e.clientX - state.lastX;
    state.lastX = e.clientX;
    const turn = dx * (Math.PI / Math.max(stageEl.clientWidth, 320)) * 0.85;
    state.rotation += turn;
    state.target = state.rotation;
    state.velocity = turn;
    setFace(faceFromRotation(state.rotation));
});

function endDrag() {
    if (!state.dragging) return;
    state.dragging = false;
    stageEl.classList.remove("is-dragging");
    // throw: carry some momentum, then settle on the nearest panel
    const projected = state.rotation + state.velocity * 6;
    state.target = Math.round(projected / QUARTER) * QUARTER;
    setFace(faceFromRotation(state.target));
}
stageEl.addEventListener("pointerup", endDrag);
stageEl.addEventListener("pointercancel", endDrag);


/* =========================================================
   BOTTLE GEOMETRY
   Each shape is a side profile that gets spun (lathed)
   into a bottle. All profiles are resampled to the same
   number of points so one can morph into another.
========================================================= */

const SHAPES = {
    bordeaux: [
        [0, 0.16], [0.45, 0.1], [0.86, 0.0], [0.985, 0.05], [1.0, 0.22],
        [1.0, 1.5], [1.0, 2.72], [0.975, 2.96], [0.82, 3.16], [0.52, 3.38],
        [0.375, 3.6], [0.345, 3.9], [0.34, 4.3], [0.37, 4.335], [0.372, 4.43], [0.35, 4.5], [0.29, 4.52]
    ],
    burgundy: [
        [0, 0.16], [0.45, 0.1], [0.86, 0.0], [0.985, 0.05], [1.0, 0.22],
        [1.0, 1.5], [1.0, 2.22], [0.95, 2.6], [0.8, 2.98], [0.58, 3.34],
        [0.41, 3.7], [0.355, 4.0], [0.345, 4.3], [0.37, 4.335], [0.372, 4.43], [0.35, 4.5], [0.29, 4.52]
    ],
    sparkling: [
        [0, 0.3], [0.5, 0.17], [0.9, 0.0], [1.04, 0.06], [1.06, 0.24],
        [1.06, 1.5], [1.06, 2.28], [1.0, 2.64], [0.82, 3.0], [0.58, 3.36],
        [0.44, 3.74], [0.405, 4.1], [0.4, 4.28], [0.47, 4.32], [0.47, 4.44], [0.43, 4.5], [0.34, 4.52]
    ]
};

function sampleProfile(points) {
    const curve = new THREE.CatmullRomCurve3(
        points.map(([x, y]) => new THREE.Vector3(x * WIDTH, y, 0)),
        false,
        "centripetal"
    );
    return curve.getSpacedPoints(PROFILE_POINTS - 1).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
}

const PROFILES = Object.fromEntries(Object.entries(SHAPES).map(([k, v]) => [k, sampleProfile(v)]));

function lerpProfile(a, b, t) {
    return a.map((p, i) => new THREE.Vector2(
        THREE.MathUtils.lerp(p.x, b[i].x, t),
        THREE.MathUtils.lerp(p.y, b[i].y, t)
    ));
}

function radiusAt(profile, y) {
    for (let i = 1; i < profile.length; i++) {
        const a = profile[i - 1];
        const b = profile[i];
        if ((a.y <= y && b.y >= y) && b.y !== a.y) {
            return THREE.MathUtils.lerp(a.x, b.x, (y - a.y) / (b.y - a.y));
        }
    }
    return profile[profile.length - 1].x;
}

function liquidProfile(profile, fill) {
    const pts = [new THREE.Vector2(0, profile[0].y + 0.07)];
    for (const p of profile) {
        if (p.y > fill) break;
        if (p.y < 0.07 && p.x > 0.15) continue;
        pts.push(new THREE.Vector2(p.x * 0.92, Math.max(p.y, 0.07) + 0.02));
    }
    const r = radiusAt(profile, fill) * 0.92;
    pts.push(new THREE.Vector2(r, fill), new THREE.Vector2(0, fill));
    return pts;
}

function capsuleProfile(profile, start) {
    const pts = [];
    const top = profile[profile.length - 1].y;
    pts.push(new THREE.Vector2(radiusAt(profile, start) + 0.012, start));
    for (const p of profile) {
        if (p.y > start) pts.push(new THREE.Vector2(p.x + 0.014, p.y));
    }
    pts.push(new THREE.Vector2(0.001, top + 0.012));
    return pts;
}


/* =========================================================
   SCENE
========================================================= */

let renderer = null;
let bottle = null;

function createRenderer() {
    try {
        const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
        r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        r.outputColorSpace = THREE.SRGBColorSpace;
        r.toneMapping = THREE.ACESFilmicToneMapping;
        r.toneMappingExposure = 1.05;
        return r;
    } catch (err) {
        console.warn("WebGL unavailable, showing the flat bottle instead.", err);
        return null;
    }
}

// Studio highlights that stay put while the bottle turns under them.
// Driven by view-space normals, so they wrap the shoulders naturally.
function highlightMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            uRim: { value: new THREE.Color("#ffb56b") },
            uStrength: { value: 1 },
            uLabelMin: { value: LABEL_Y - LABEL_H / 2 },
            uLabelMax: { value: LABEL_Y + LABEL_H / 2 }
        },
        vertexShader: /* glsl */`
            varying vec3 vNormal;
            varying float vY;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vY = position.y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: /* glsl */`
            uniform vec3 uRim;
            uniform float uStrength;
            uniform float uLabelMin;
            uniform float uLabelMax;
            varying vec3 vNormal;
            varying float vY;
            void main() {
                vec3 n = normalize(vNormal);
                float fres = pow(1.0 - abs(n.z), 2.6);
                float key  = smoothstep(0.075, 0.0, abs(n.x + 0.5)) * smoothstep(-0.2, 0.4, n.z) * 0.75;
                float fill = smoothstep(0.04, 0.0, abs(n.x - 0.74)) * 0.4;
                float top  = smoothstep(0.6, 0.95, n.y) * 0.25;
                float onLabel = step(uLabelMin, vY) * step(vY, uLabelMax);
                float gloss = (key + fill) * (1.0 - onLabel * 0.92);
                vec3 col = uRim * fres * 0.85 * (1.0 - onLabel * 0.75) + vec3(1.0, 0.97, 0.92) * (gloss + top);
                gl_FragColor = vec4(col * uStrength, 1.0);
            }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
}

function shadowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(0.45, "rgba(0,0,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
}

class Bottle {

    constructor(scene, labels) {
        this.labels = labels;
        this.group = new THREE.Group();          // turns with the drag
        this.fixed = new THREE.Group();          // highlights: never turn
        scene.add(this.group, this.fixed);

        const wine = WINES[0];
        this.profile = PROFILES[wine.shape];

        this.glassMat = new THREE.MeshStandardMaterial({
            color: wine.glass, roughness: 0.08, metalness: 0.1,
            transparent: true, opacity: wine.glassOpacity, depthWrite: false,
            side: THREE.DoubleSide
        });
        this.liquidMat = new THREE.MeshStandardMaterial({
            color: wine.liquid, roughness: 0.3, metalness: 0,
            emissive: wine.liquid, emissiveIntensity: 0.18,
            transparent: true, opacity: wine.liquidOpacity, depthWrite: false
        });
        this.capsuleMat = new THREE.MeshStandardMaterial({
            color: wine.capsule, roughness: 0.32, metalness: wine.capsuleMetal
        });
        this.labelMat = new THREE.MeshStandardMaterial({ map: labels[0], color: "#d6d2cc", roughness: 0.82, metalness: 0 });
        this.highlightMat = highlightMaterial();

        this.glass = new THREE.Mesh(undefined, this.glassMat);
        this.liquid = new THREE.Mesh(undefined, this.liquidMat);
        this.capsule = new THREE.Mesh(undefined, this.capsuleMat);
        this.label = new THREE.Mesh(undefined, this.labelMat);
        this.highlight = new THREE.Mesh(undefined, this.highlightMat);

        this.liquid.renderOrder = 1;
        this.glass.renderOrder = 2;
        this.highlight.renderOrder = 3;

        this.group.add(this.liquid, this.glass, this.capsule, this.label);
        this.fixed.add(this.highlight);

        const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(2.6, 1.0),
            new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.005;
        this.shadow = shadow;
        scene.add(shadow);

        this.applyWine(wine, 1, wine);
    }

    build(profile, fill, capStart, labelRadius) {
        const swap = (mesh, geo) => {
            mesh.geometry?.dispose();
            mesh.geometry = geo;
        };
        const glassGeo = new THREE.LatheGeometry(profile, 96);
        swap(this.glass, glassGeo);
        swap(this.highlight, new THREE.LatheGeometry(profile.map((p) => new THREE.Vector2(p.x * 1.004 + 0.002, p.y)), 96));
        swap(this.liquid, new THREE.LatheGeometry(liquidProfile(profile, fill), 64));
        swap(this.capsule, new THREE.LatheGeometry(capsuleProfile(profile, capStart), 64));
        swap(this.label, new THREE.CylinderGeometry(
            labelRadius, labelRadius, LABEL_H, 128, 1, true, -Math.PI / 4, Math.PI * 2
        ));
        this.label.position.y = LABEL_Y;
    }

    // Blend from wine a to wine b by t (0..1)
    applyWine(a, t, b) {
        const lerp = THREE.MathUtils.lerp;
        const profile = lerpProfile(PROFILES[a.shape], PROFILES[b.shape], t);
        const fill = lerp(a.fill, b.fill, t);
        const capStart = lerp(a.capsuleStart ?? 3.9, b.capsuleStart ?? 3.9, t);
        const labelRadius = radiusAt(profile, LABEL_Y) + 0.007;
        this.build(profile, fill, capStart, labelRadius);

        const mix = (x, y) => new THREE.Color(x).lerp(new THREE.Color(y), t);
        this.glassMat.color.copy(mix(a.glass, b.glass));
        this.glassMat.opacity = lerp(a.glassOpacity, b.glassOpacity, t);
        this.liquidMat.color.copy(mix(a.liquid, b.liquid));
        this.liquidMat.emissive.copy(this.liquidMat.color);
        this.liquidMat.opacity = lerp(a.liquidOpacity, b.liquidOpacity, t);
        this.capsuleMat.color.copy(mix(a.capsule, b.capsule));
        this.capsuleMat.metalness = lerp(a.capsuleMetal, b.capsuleMetal, t);
        this.highlightMat.uniforms.uRim.value.copy(mix(a.rim, b.rim));
    }

    setLabel(index) {
        this.labelMat.map = this.labels[index];
        this.labelMat.needsUpdate = true;
    }
}


/* =========================================================
   BOOT
========================================================= */

async function fontsReady() {
    if (!document.fonts) return;
    const loads = [
        '500 40px "Cormorant"', 'italic 400 40px "Cormorant"',
        '500 20px "Inter"', '600 20px "Inter"'
    ].map((f) => document.fonts.load(f));
    await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2500))]);
}

async function init() {
    renderPanel();

    renderer = createRenderer();
    if (!renderer) {
        body.classList.add("no-webgl");
        return;
    }

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.7;

    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);

    const key = new THREE.DirectionalLight("#fff1dc", 1.6);
    key.position.set(-4, 6, 6);
    const warm = new THREE.DirectionalLight("#ffae70", 1.4);   // low sun from behind-right
    warm.position.set(5, 2, -3);
    scene.add(key, warm, new THREE.HemisphereLight("#ffe7c9", "#2a1216", 0.6));

    await fontsReady();

    const labels = WINES.map((wine) => {
        const tex = new THREE.CanvasTexture(drawLabel(wine));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tex;
    });

    bottle = new Bottle(scene, labels);


    /* ---------- sizing ---------- */

    const lookY = 2.2;
    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;

        // fit the bottle's height, and its width on narrow screens
        const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const fitH = (4.9 / 0.84) / 2 / halfTan;
        const fitW = (1.6 / 0.62) / 2 / halfTan / camera.aspect;
        const dist = Math.max(fitH, fitW);
        camera.position.set(0, lookY + dist * 0.09, dist);
        camera.lookAt(0, lookY, 0);
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(canvas);
    resize();


    /* ---------- loop ---------- */

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stageEl);

    const clock = new THREE.Clock();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function frame() {
        requestAnimationFrame(frame);
        if (!visible) return;
        const t = performance.now() / 1000;

        const dt = Math.min(clock.getDelta(), 0.1);
        if (!state.dragging) {
            const k = REDUCED_MOTION ? 1 : 1 - Math.exp(-dt * 6.5);   // same feel at any frame rate
            state.rotation += (state.target - state.rotation) * k;
        }

        let spin = 0;
        if (state.transition) {
            const tr = state.transition;
            const p = Math.min((performance.now() - tr.start) / 1300, 1);
            const e = ease(p);
            bottle.applyWine(WINES[tr.from], e, WINES[tr.to]);
            if (!tr.swapped && p >= 0.5) {
                bottle.setLabel(tr.to);
                tr.swapped = true;
            }
            spin = e * Math.PI * 2;
            if (p >= 1) state.transition = null;
        }

        const sway = state.interacted || REDUCED_MOTION ? 0 : Math.sin(t * 0.7) * 0.38;
        bottle.group.rotation.y = state.rotation + sway + spin;
        const bob = REDUCED_MOTION ? 0 : Math.sin(t * 0.9) * 0.035;
        bottle.group.position.y = bottle.fixed.position.y = bob;

        dialNeedle?.style.setProperty("--dial", `${(-state.rotation * 180) / Math.PI}deg`);

        renderer.render(scene, camera);
    }
    frame();

    body.classList.add("is-ready");
}

init();

