/* =========================================================
   HUT NINE: MAIN
   Loads the live conditions, decides the mood, and hands
   colours, motion and words to the page.
========================================================= */

import { loadConditions } from "./conditions.js";
import {
    PALETTES, PRESETS, TIME_PRESETS, SKY_PRESETS, moodFor, seaFor, copyFor, scoreHour,
    windRelation, compass, wetsuitFor
} from "./mood.js";
import { skyAt, phaseOf, weatherOf, describeSky, compose, minutesOf, sastMinutesNow } from "./sky.js";
import { Ocean } from "./ocean.js";
import { renderChart, describeWindow } from "./chart.js";

const $ = (id) => document.getElementById(id);
const body = document.body;
const ocean = new Ocean($("ocean"));

let data = null;                                      // live (or sample) conditions
const preview = { surf: "live", time: "live", sky: "live" };   // the preview panel


/* ---------- beach huts ---------- */

const HUT_COLOURS = ["#ff5d5d", "#ffd23f", "#3ec1d3", "#ff9a3c", "#8b5cf6", "#2ecc71", "#ff4f8b", "#1e90ff", "#ffb400", "#ff6f59", "#00b894", "#f78fb3", "#4d96ff", "#ffa94d"];

function drawHuts() {
    const row = document.querySelector(".hut-row");
    let html = "";
    const n = HUT_COLOURS.length;
    for (let i = 0; i < n; i++) {
        const x = 40 + i * 112;
        const c = HUT_COLOURS[i];
        const number = i + 1;
        html += `<g transform="translate(${x} 0)">
            <path d="M0 122V70L32 48L64 70V122Z" fill="${c}"/>
            <path d="M-4 72L32 45L68 72" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="5"/>
            <rect x="20" y="84" width="24" height="38" rx="2" fill="rgba(0,0,0,.14)"/>
            ${number === 9 ? `<circle cx="32" cy="66" r="10" fill="#fff"/><text x="32" y="72" fill="${c}">9</text>` : ""}
        </g>`;
    }
    row.innerHTML = html;
}
drawHuts();


/* ---------- helpers ---------- */

const hhmm = (iso) => (iso ? iso.slice(11, 16) : "–");

function tideInfo(hours, i) {
    const cur = hours[i]?.tide;
    const next = hours[i + 1]?.tide;
    if (cur == null || next == null) return { state: "–", next: "Tide data unavailable" };
    const rising = next > cur;
    for (let k = i + 1; k < hours.length - 1; k++) {
        const a = hours[k].tide;
        const b = hours[k + 1].tide;
        if (a == null || b == null) break;
        if (rising ? b < a : b > a) {
            return { state: rising ? "Rising" : "Falling", next: `${rising ? "High" : "Low"} around ${hhmm(hours[k].time)}` };
        }
    }
    return { state: rising ? "Rising" : "Falling", next: "" };
}

function applyPalette(p) {
    const s = body.style;
    s.setProperty("--ink", p.ink);
    s.setProperty("--ink-soft", p.inkSoft);
    s.setProperty("--accent", p.accent);
    s.setProperty("--accent-ink", p.accentInk);
    s.setProperty("--card", p.card);
    s.setProperty("--line", p.line);
    s.setProperty("--page", p.page);
    s.setProperty("--page-ink", p.pageInk);
    s.setProperty("--sand", p.sand);
    body.classList.toggle("has-light-ink", p.textShadow);
    document.querySelector(".hut-row").style.filter = p.hutDim < 0.98 ? `brightness(${p.hutDim.toFixed(2)}) saturate(${(p.hutDim + 0.15).toFixed(2)})` : "";
    document.querySelector('meta[name="theme-color"]').content = p.skyTop;
}

// Today's sunrise and sunset in minutes past midnight (with sensible Cape Town fallbacks)
function sunTimes() {
    const today = (data?.updated || "").slice(0, 10);
    const rise = data?.sunrise.find((d) => d.startsWith(today)) || data?.sunrise[0];
    const set = data?.sunset.find((d) => d.startsWith(today)) || data?.sunset[0];
    return { r: rise ? minutesOf(rise) : 6 * 60 + 45, s: set ? minutesOf(set) : 19 * 60, riseIso: rise };
}

const clock = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;


/* ---------- render ---------- */

function render(instant = false) {
    if (!data) return;

    // 1. surf
    const live = data.now;
    const now = preview.surf === "live" ? live : { ...live, ...PRESETS[preview.surf] };
    const mood = moodFor(now);

    // 2. time of day
    const { r, s } = sunTimes();
    const minutes = preview.time === "live" ? sastMinutesNow() : TIME_PRESETS[preview.time](r, s);
    const phase = phaseOf(minutes, r, s);
    const sky = skyAt(minutes, r, s);

    // 3. weather
    const wx = preview.sky === "live" ? { cloud: live.cloud, precip: live.precip } : SKY_PRESETS[preview.sky];
    const weather = weatherOf(wx.cloud, wx.precip);

    const palette = compose(PALETTES[mood], sky, weather);
    const previewing = Object.values(preview).some((v) => v !== "live");

    body.dataset.mood = mood;
    body.dataset.phase = phase;
    body.classList.toggle("is-preview", previewing);
    body.classList.toggle("is-sample", data.source === "sample");
    applyPalette(palette);
    ocean.set(palette, seaFor(now, mood), instant);

    const riseNext = minutes > s ? "tomorrow at " + clock(r) : clock(r);
    const copy = copyFor(mood, now, { phase, weather, sunrise: riseNext });
    $("verdict").innerHTML = copy.verdict;
    $("verdict-sub").textContent = copy.sub;
    $("today-call").innerHTML = copy.call;

    const skyWords = describeSky(wx.cloud ?? 0, wx.precip ?? 0);
    const air = live.air != null ? `${Math.round(live.air)}°C, ` : "";
    $("live-label").textContent =
        previewing ? `Preview · ${phase} · ${skyWords}` :
        data.source === "sample" ? `Sample data · live feed unavailable` :
        `Live · Muizenberg · ${clock(minutes)} · ${air}${skyWords}`;
    $("preview-reset").hidden = !previewing;

    // readout
    $("r-wave").textContent = now.wave.toFixed(1);
    $("r-swell").textContent = `${Math.round(now.period)} second period${now.swell != null ? ` · swell ${now.swell.toFixed(1)} m` : ""}`;
    $("r-wind").textContent = `${Math.round(now.wind)} km/h ${compass(now.windDir)}`;
    $("r-wind-arrow").style.transform = `rotate(${now.windDir}deg)`;   // arrow points where the wind blows to
    const rel = windRelation(now.windDir);
    const windTag = $("r-wind-tag");
    windTag.textContent = now.wind < 8 ? "Light and variable" : rel === "offshore" ? "Offshore: clean" : rel === "onshore" ? "Onshore: messy" : "Cross-shore";
    windTag.classList.toggle("is-good", now.wind < 8 || rel === "offshore");
    $("r-water").textContent = now.water != null ? `${Math.round(now.water)}°C` : "–";
    $("r-suit").textContent = wetsuitFor(now.water);
    const tide = tideInfo(data.hours, data.nowIndex);
    $("r-tide").textContent = tide.state;
    $("r-tide-next").textContent = tide.next;
    $("r-score").textContent = scoreHour(now).toFixed(1).replace(".0", "");
    $("r-updated").textContent = preview.surf === "live" ? `Updated ${hhmm(data.updated)}` : "Preview";
}

function renderForecast() {
    const win = renderChart($("chart"), data.hours, data.nowIndex);
    $("best-window").innerHTML = describeWindow(data.hours, win);
}


/* ---------- preview panel: surf, time and sky ---------- */

const groups = [...document.querySelectorAll(".preview-chips")];

function setChoice(group, value) {
    preview[group] = value;
    const row = document.querySelector(`.preview-chips[data-group="${group}"]`);
    row.querySelectorAll("[role=radio]").forEach((c) => {
        const on = c.dataset.value === value;
        c.setAttribute("aria-checked", String(on));
        c.tabIndex = on ? 0 : -1;
    });
}

groups.forEach((row) => {
    const group = row.dataset.group;
    const chips = [...row.querySelectorAll("[role=radio]")];
    chips.forEach((chip, i) => {
        chip.tabIndex = i === 0 ? 0 : -1;
        chip.addEventListener("click", () => { setChoice(group, chip.dataset.value); render(); });
        chip.addEventListener("keydown", (e) => {
            const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!d) return;
            e.preventDefault();
            const next = chips[(i + d + chips.length) % chips.length];
            setChoice(group, next.dataset.value);
            render();
            next.focus();
        });
    });
});

$("preview-reset").addEventListener("click", () => {
    ["surf", "time", "sky"].forEach((g) => setChoice(g, "live"));
    render();
});


/* ---------- lesson buttons (concept: no booking system) ---------- */

document.querySelectorAll(".lesson-cta").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        $("lesson-note").textContent =
            `On the real site, "${btn.dataset.lesson}" would open the booking calendar here. This is a concept, so nothing is booked.`;
    });
});


/* ---------- boot ---------- */

// Paint a calm sea straight away so there's no blank hero while data loads
{
    const m = sastMinutesNow();
    const first = compose(PALETTES.glassy, skyAt(m, 405, 1140), weatherOf(0, 0));
    ocean.set(first, { amp: 0.8, period: 10, chop: 0, drift: 0 }, true);
    applyPalette(first);
}

// Shareable looks: ?surf=pumping&time=sunset&sky=rain (older ?mood= links still work)
function applyQuery() {
    const q = new URLSearchParams(location.search);
    const mood = q.get("mood");
    if (mood === "night") setChoice("time", "night");
    else if (mood && PRESETS[mood]) setChoice("surf", mood);
    if (PRESETS[q.get("surf")]) setChoice("surf", q.get("surf"));
    if (TIME_PRESETS[q.get("time")]) setChoice("time", q.get("time"));
    if (SKY_PRESETS[q.get("sky")]) setChoice("sky", q.get("sky"));
    if (Object.values(preview).some((v) => v !== "live")) $("preview").open = true;
}

loadConditions().then((d) => {
    data = d;
    applyQuery();
    render(true);
    renderForecast();

    let lastW = window.innerWidth;
    window.addEventListener("resize", () => {
        if (Math.abs(window.innerWidth - lastW) < 40) return;
        lastW = window.innerWidth;
        renderForecast();
    });

    // Keep the sky moving with the real clock, and refresh the data now and then
    setInterval(() => render(), 60 * 1000);
    setInterval(async () => {
        data = await loadConditions();
        render();
        renderForecast();
    }, 15 * 60 * 1000);
});
