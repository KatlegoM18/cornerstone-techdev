/* =========================================================
   PADDLE OUT: MAIN (engine from Hut Nine)
   Loads every beach at once, then paints the chosen beach:
   the live sea, the readout, the forecast and the best
   times to surf. The grid compares every beach, filterable
   by province.
========================================================= */

import { BEACHES, PROVINCES, beachById } from "./beaches.js";
import { loadAll } from "./conditions.js";
import {
    PALETTES, PRESETS, TIME_PRESETS, SKY_PRESETS, moodFor, seaFor, copyFor, scoreHour,
    windRelation, setOffshore, compass, wetsuitFor
} from "./mood.js";
import { skyAt, phaseOf, weatherOf, describeSky, compose, minutesOf, sastMinutesNow } from "./sky.js";
import { Ocean } from "./ocean.js";
import { renderChart, describeWindow } from "./chart.js";
import { BeachLife } from "./life.js";

const $ = (id) => document.getElementById(id);
const body = document.body;
const ocean = new Ocean($("ocean"));

let all = null;                                       // { source, beaches: { id: data }, missing }
let beach = beachById(new URLSearchParams(location.search).get("beach"));
const preview = { surf: "live", time: "live", sky: "live" };
const data = () => all?.beaches[beach.id];
let province = "all";                                 // grid filter
const WINDOWS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"];   // two-hour surf windows


/* ---------- the beach: landmark + people ---------- */

const life = new BeachLife(document.querySelector(".huts"));


/* ---------- helpers ---------- */

const hhmm = (iso) => (iso ? iso.slice(11, 16) : "–");
const clock = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;
const rating = (s) => (s >= 6.5 ? "good" : s >= 4 ? "ok" : "poor");
const RATING = { good: "Good", ok: "Fair", poor: "Poor" };
const MOOD_WORD = { glassy: "Glassy", pumping: "Pumping", fun: "Fun", blown: "Blown out", flat: "Flat" };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayName = (iso) => { const d = new Date(iso + "T12:00:00Z"); return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };

function tideInfo(hours, i) {
    const cur = hours[i]?.tide;
    const next = hours[i + 1]?.tide;
    if (cur == null || next == null) return { state: "–", next: "Tide data unavailable" };
    const rising = next > cur;
    for (let k = i + 1; k < hours.length - 1; k++) {
        const a = hours[k].tide;
        const b = hours[k + 1].tide;
        if (a == null || b == null) break;
        if (rising ? b < a : b > a) return { state: rising ? "Rising" : "Falling", next: `${rising ? "High" : "Low"} around ${hhmm(hours[k].time)}` };
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
    document.querySelector(".scene").style.filter = p.hutDim < 0.98 ? `brightness(${p.hutDim.toFixed(2)}) saturate(${(p.hutDim + 0.15).toFixed(2)})` : "";
    document.querySelector('meta[name="theme-color"]').content = p.skyTop;
}

function sunTimes(d) {
    const today = (d?.updated || "").slice(0, 10);
    const rise = d?.sunrise.find((x) => x.startsWith(today)) || d?.sunrise[0];
    const set = d?.sunset.find((x) => x.startsWith(today)) || d?.sunset[0];
    return { r: rise ? minutesOf(rise) : 6 * 60 + 15, s: set ? minutesOf(set) : 18 * 60 + 45 };
}

// Average the forecast hours a two-hour window covers
function slotForecast(hours, date, time) {
    const h = +time.slice(0, 2);
    const rows = [h, h + 1].map((hr) => hours.find((x) => x.time.startsWith(`${date}T${String(hr).padStart(2, "0")}`))).filter(Boolean);
    if (!rows.length) return null;
    const avg = (k) => rows.reduce((n, r) => n + (r[k] ?? 0), 0) / rows.length;
    const f = { wave: avg("wave"), period: avg("period"), wind: rows[0].wind, windDir: rows[0].windDir };
    return { ...f, score: scoreHour(f) };
}


/* ---------- hero ---------- */

function render(instant = false) {
    const d = data();
    if (!d) return;
    setOffshore(beach.offshore);

    const live = d.now;
    const now = preview.surf === "live" ? live : { ...live, ...PRESETS[preview.surf] };
    const mood = moodFor(now);

    const { r, s } = sunTimes(d);
    const minutes = preview.time === "live" ? sastMinutesNow() : TIME_PRESETS[preview.time](r, s);
    const phase = phaseOf(minutes, r, s);
    const sky = skyAt(minutes, r, s);

    const wx = preview.sky === "live" ? { cloud: live.cloud, precip: live.precip } : SKY_PRESETS[preview.sky];
    const weather = weatherOf(wx.cloud, wx.precip);

    const palette = compose(PALETTES[mood], sky, weather);
    const previewing = Object.values(preview).some((v) => v !== "live");

    body.dataset.mood = mood;
    body.dataset.phase = phase;
    body.classList.toggle("is-preview", previewing);
    body.classList.toggle("is-sample", d.source === "sample");
    applyPalette(palette);
    ocean.set(palette, seaFor(now, mood), instant);
    life.setConditions({ mood, phase, rain: weather.rain, overcast: weather.overcast });

    const riseNext = minutes > s ? clock(r) + " tomorrow" : clock(r);
    const copy = copyFor(mood, now, { phase, weather, sunrise: riseNext });
    $("verdict").innerHTML = copy.verdict;
    $("verdict-sub").textContent = copy.sub;
    $("today-call").innerHTML = copy.call;

    const skyWords = describeSky(wx.cloud ?? 0, wx.precip ?? 0);
    const air = live.air != null ? `${Math.round(live.air)}°C, ` : "";
    $("live-label").textContent =
        previewing ? `Preview · ${phase} · ${skyWords}` :
        d.source === "sample" ? `Sample data · ${beach.name}` :
        `Live · ${beach.name} · ${clock(minutes)} · ${air}${skyWords}`;
    $("preview-reset").hidden = !previewing;

    $("r-wave").textContent = now.wave.toFixed(1);
    $("r-swell").textContent = `${Math.round(now.period)} second period${now.swell != null ? ` · swell ${now.swell.toFixed(1)} m` : ""}`;
    $("r-wind").textContent = `${Math.round(now.wind)} km/h ${compass(now.windDir)}`;
    $("r-wind-arrow").style.transform = `rotate(${now.windDir}deg)`;
    const rel = windRelation(now.windDir);
    const windTag = $("r-wind-tag");
    windTag.textContent = now.wind < 8 ? "Light and variable" : rel === "offshore" ? "Offshore: clean" : rel === "onshore" ? "Onshore: messy" : "Cross-shore";
    windTag.classList.toggle("is-good", now.wind < 8 || rel === "offshore");
    $("r-water").textContent = now.water != null ? `${Math.round(now.water)}°C` : "–";
    $("r-suit").textContent = wetsuitFor(now.water);
    const tide = tideInfo(d.hours, d.nowIndex);
    $("r-tide").textContent = tide.state;
    $("r-tide-next").textContent = tide.next;
    $("r-score").textContent = scoreHour(now).toFixed(1).replace(".0", "");
    $("r-updated").textContent = preview.surf === "live" ? `Updated ${hhmm(d.updated)}` : "Preview";
}


/* ---------- all beaches grid (filter by province) ---------- */

function cardFor({ b, d, now, mood, score, rel }, bestId) {
    return `<li>
        <button type="button" class="beach-card${b.id === beach.id ? " is-current" : ""}" data-beach="${b.id}" style="--m:${PALETTES[mood].accent}" aria-pressed="${b.id === beach.id}">
            <span class="bc-top">
                <span class="bc-mood"><i></i>${MOOD_WORD[mood]}</span>
                ${b.id === bestId ? `<span class="bc-best">Best right now</span>` : ""}
            </span>
            <span class="bc-name">${b.name}</span>
            <span class="bc-beach">${b.area}</span>
            <span class="bc-stats">
                <span><b>${now.wave.toFixed(1)}</b> m</span>
                <span><b>${Math.round(now.wind)}</b> km/h ${now.wind < 8 ? "light" : rel === "cross-shore" ? "cross" : rel}</span>
                <span><b>${score.toFixed(1).replace(".0", "")}</b>/10</span>
            </span>
            ${d.source === "sample" ? `<span class="bc-sample">Sample data</span>` : ""}
        </button>
    </li>`;
}

function renderGrid() {
    if (!all) return;
    const rows = BEACHES.map((b) => {
        const d = all.beaches[b.id];
        setOffshore(b.offshore);
        const now = d.now;
        return { b, d, now, mood: moodFor(now), score: scoreHour(now), rel: windRelation(now.windDir) };
    });
    setOffshore(beach.offshore);

    const shown = rows.filter((r) => province === "all" || r.b.province === province);
    const best = shown.reduce((a, x) => (x.score > a.score ? x : a), shown[0]);
    const groups = PROVINCES.filter((p) => province === "all" || p === province);

    $("beach-grid").innerHTML = groups.map((p) => {
        const inP = shown.filter((r) => r.b.province === p);
        return `<section class="grid-group" aria-label="${p}">
            <h3>${p} <small>${inP.length} beaches</small></h3>
            <ul class="beach-grid">${inP.map((r) => cardFor(r, best.b.id)).join("")}</ul>
        </section>`;
    }).join("");

    document.querySelectorAll("#province-filter [data-province]").forEach((btn) => {
        const n = btn.dataset.province === "all" ? rows.length : rows.filter((r) => r.b.province === btn.dataset.province).length;
        btn.querySelector("small").textContent = n;
        btn.setAttribute("aria-pressed", String(btn.dataset.province === province));
    });

    const where = province === "all" ? "South Africa" : province;
    $("beaches-lede").innerHTML = `Live conditions at ${shown.length} surf beaches in ${where}. Right now the best surf is at <strong>${best.b.name}</strong> (${best.b.area}): ${best.now.wave.toFixed(1)} m and a score of ${best.score.toFixed(1).replace(".0", "")}. Tap a beach to see its forecast.`;
}


/* ---------- forecast + best surf windows ---------- */

function renderForecast() {
    const d = data();
    setOffshore(beach.offshore);
    $("forecast-kicker").textContent = `${beach.name} · next three days`;
    const win = renderChart($("chart"), d.hours, d.nowIndex, []);
    $("best-window").innerHTML = describeWindow(d.hours, win);
}

function renderLessons() {
    const d = data();
    setOffshore(beach.offshore);
    $("lessons-title").innerHTML = `When to surf <span>${beach.name}</span>`;

    const today = d.updated.slice(0, 10);
    const dates = [...new Set(d.hours.map((h) => h.time.slice(0, 10)))].filter((x) => x >= today).slice(0, 2);
    const nowMin = sastMinutesNow();

    $("slot-days").innerHTML = dates.map((date, di) => {
        const slots = WINDOWS.map((t) => ({ t, f: slotForecast(d.hours, date, t), passed: di === 0 && nowMin > +t.slice(0, 2) * 60 + 60 }));
        const open = slots.filter((x) => !x.passed && x.f);
        const best = open.length ? open.reduce((a, x) => (x.f.score > a.f.score ? x : a), open[0]) : null;
        return `<div class="slot-day">
            <h3>${di === 0 ? "Today" : "Tomorrow"} <small>${dayName(date)}</small></h3>
            <div class="slot-row">${slots.map(({ t, f, passed }) => {
                const r = f ? rating(f.score) : "poor";
                const isBest = best && best.t === t;
                const end = String(+t.slice(0, 2) + 2).padStart(2, "0") + ":00";
                return `<div class="slot-card r-${r}${passed ? " is-passed" : ""}">
                    ${isBest ? `<span class="slot-best">Best surf</span>` : ""}
                    <span class="slot-time">${t}<small>to ${end}</small></span>
                    ${f ? `<span class="slot-surf"><i></i>${f.wave.toFixed(1)} m · ${Math.round(f.period)} s · ${RATING[r]}</span>` : `<span class="slot-surf">No forecast yet</span>`}
                    ${f ? `<span class="slot-go">${f.wind != null ? `${Math.round(f.wind)} km/h ${windRelation(f.windDir) === "offshore" ? "offshore" : windRelation(f.windDir) === "onshore" ? "onshore" : "cross-shore"}` : ""}${passed ? " · passed" : ""}</span>` : ""}
                </div>`;
            }).join("")}</div>
        </div>`;
    }).join("");
}


/* ---------- choosing a beach ---------- */

function chooseBeach(id, { scroll = false } = {}) {
    beach = beachById(id);
    life.setBeach(beach.id);
    $("beach-select").value = beach.id;
    document.title = `${beach.name} surf | Paddle Out`;
    const url = new URL(location.href);
    url.searchParams.set("beach", beach.id);
    history.replaceState(null, "", url);
    if (!all) return;
    render();
    renderGrid();
    renderForecast();
    renderLessons();
    if (scroll) $("conditions").scrollIntoView({ behavior: "smooth" });
}

$("beach-select").innerHTML = PROVINCES.map((p) => `<optgroup label="${p}">${BEACHES.filter((b) => b.province === p).map((b) => `<option value="${b.id}">${b.name} · ${b.area}</option>`).join("")}</optgroup>`).join("");
$("beach-select").addEventListener("change", (e) => chooseBeach(e.target.value));
$("beach-grid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-beach]");
    if (card) chooseBeach(card.dataset.beach, { scroll: true });
});
$("province-filter").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-province]");
    if (!btn) return;
    province = btn.dataset.province;
    renderGrid();
});
chooseBeach(beach.id);


/* ---------- preview panel: surf, time and sky ---------- */

function setChoice(group, value) {
    preview[group] = value;
    const row = document.querySelector(`.preview-chips[data-group="${group}"]`);
    row.querySelectorAll("[role=radio]").forEach((c) => {
        const on = c.dataset.value === value;
        c.setAttribute("aria-checked", String(on));
        c.tabIndex = on ? 0 : -1;
    });
}

document.querySelectorAll(".preview-chips").forEach((row) => {
    const group = row.dataset.group;
    const chips = [...row.querySelectorAll("[role=radio]")];
    chips.forEach((chip, i) => {
        chip.tabIndex = i === 0 ? 0 : -1;
        chip.addEventListener("click", () => { setChoice(group, chip.dataset.value); render(); });
        chip.addEventListener("keydown", (e) => {
            const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!dir) return;
            e.preventDefault();
            const next = chips[(i + dir + chips.length) % chips.length];
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


/* ---------- boot ---------- */

{
    const m = sastMinutesNow();
    const first = compose(PALETTES.glassy, skyAt(m, 375, 1125), weatherOf(0, 0));
    ocean.set(first, { amp: 0.8, period: 10, chop: 0, drift: 0 }, true);
    applyPalette(first);
}

function dataNote() {
    $("data-note").textContent =
        all.source === "sample" ? "Live feed unavailable: showing sample data." :
        all.missing.length ? `Live data for ${BEACHES.length - all.missing.length} of ${BEACHES.length} beaches (sample for ${all.missing.join(", ")}).` :
        `Live data for all ${BEACHES.length} beaches.`;
}

function paintAll(instant) {
    dataNote();
    render(instant);
    renderGrid();
    renderForecast();
    renderLessons();
}

loadAll().then((d) => {
    all = d;
    paintAll(true);

    let lastW = window.innerWidth;
    window.addEventListener("resize", () => {
        if (Math.abs(window.innerWidth - lastW) < 40) return;
        lastW = window.innerWidth;
        renderForecast();
    });

    setInterval(() => { render(); renderLessons(); }, 60 * 1000);
    setInterval(async () => { all = await loadAll(); paintAll(false); }, 15 * 60 * 1000);
});
