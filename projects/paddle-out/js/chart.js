/* =========================================================
   PADDLE OUT: FORECAST CHART
   Hourly bars for wave height (coloured by surf score),
   a dashed tide line, and wind arrows every three hours.
========================================================= */

import { scoreHour, windRelation, compass, windName } from "./mood.js";
const slotMinutes = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);

const NS = "http://www.w3.org/2000/svg";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function el(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
}

const hourOf = (iso) => +iso.slice(11, 13);
const dayLabel = (iso) => {
    const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
    return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()}`;
};

// Best daylight window of at least two hours, from now onwards
export function bestWindow(hours, nowIndex) {
    let best = null;
    for (let i = nowIndex; i < hours.length; i++) {
        const h = hourOf(hours[i].time);
        if (h < 6 || h > 17) continue;
        for (let len = 2; len <= 4; len++) {
            const run = hours.slice(i, i + len);
            if (run.length < len || run.some((r) => hourOf(r.time) > 18)) break;
            const avg = run.reduce((s, r) => s + scoreHour(r), 0) / len + len * 0.05;
            if (!best || avg > best.score) best = { start: i, end: i + len - 1, score: avg };
        }
    }
    return best;
}

export function describeWindow(hours, win) {
    if (!win) return "No clear window in the next three days. Keep an eye on this space.";
    const a = hours[win.start];
    const b = hours[win.end];
    const avgWave = (hours.slice(win.start, win.end + 1).reduce((s, h) => s + h.wave, 0) / (win.end - win.start + 1)).toFixed(1);
    const rel = windRelation(a.windDir ?? 0);
    const wind = a.wind == null ? "" : `, ${Math.round(a.wind)} km/h ${rel === "offshore" ? "offshore" : windName(a.windDir)}`;
    return `Best window: <strong>${dayLabel(a.time)}, ${a.time.slice(11, 16)}–${String(hourOf(b.time) + 1).padStart(2, "0")}:00</strong>. About ${avgWave} m at ${Math.round(a.period)} s${wind}.`;
}

export function renderChart(svg, hours, nowIndex, slots = []) {
    while (svg.lastChild && svg.lastChild.nodeName !== "desc") svg.removeChild(svg.lastChild);

    const wrapW = svg.parentElement.clientWidth || 900;
    const barW = 10;
    const gap = 4;
    const left = 46;
    const right = 16;
    const W = Math.max(wrapW, left + right + hours.length * (barW + gap));
    const H = 330;
    const top = 58;
    const bottom = 232;
    const colW = (W - left - right) / hours.length;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);

    const maxWave = Math.max(2, Math.ceil(Math.max(...hours.map((h) => h.wave)) * 2) / 2);
    const y = (m) => bottom - (m / maxWave) * (bottom - top);
    const xAt = (i) => left + i * colW + colW / 2;

    // night shading + day labels
    const night = el("g", { class: "grid" }, svg);
    hours.forEach((h, i) => {
        const hr = hourOf(h.time);
        if (h.isDay === 0 || (h.isDay == null && (hr < 6 || hr >= 19))) {
            el("rect", { x: left + i * colW, y: top - 8, width: colW + 0.5, height: bottom - top + 8, fill: "currentColor", opacity: 0.045 }, night);
        }
        if (hr === 0 || i === 0) {
            el("line", { x1: left + i * colW, x2: left + i * colW, y1: 20, y2: H - 14 }, night);
            const t = el("text", { x: left + i * colW + 8, y: 34, class: "day-label" }, svg);
            t.textContent = dayLabel(h.time);
        }
    });

    // gridlines in metres
    const grid = el("g", { class: "grid" }, svg);
    for (let m = 0.5; m <= maxWave; m += 0.5) {
        el("line", { x1: left, x2: W - right, y1: y(m), y2: y(m) }, grid);
        if (m % 1 === 0) {
            const t = el("text", { x: left - 10, y: y(m) + 4, "text-anchor": "end", class: "axis-label" }, svg);
            t.textContent = `${m} m`;
        }
    }

    // best window
    const win = bestWindow(hours, nowIndex);
    if (win) {
        const g = el("g", { class: "best" }, svg);
        const x0 = left + win.start * colW;
        el("rect", { x: x0, y: top - 8, width: (win.end - win.start + 1) * colW, height: bottom - top + 8, rx: 6 }, g);
        const t = el("text", { x: x0 + 4, y: top + 6, }, g);
        t.textContent = "BEST";
    }

    // wave bars
    const bars = el("g", {}, svg);
    hours.forEach((h, i) => {
        const s = scoreHour(h);
        const cls = s >= 6.5 ? "bar-good" : s >= 4 ? "bar-ok" : "bar-poor";
        const bh = Math.max(2, bottom - y(h.wave));
        const r = el("rect", { x: xAt(i) - barW / 2, y: bottom - bh, width: barW, height: bh, rx: 3, class: cls }, bars);
        const title = el("title", {}, r);
        title.textContent = `${dayLabel(h.time)} ${h.time.slice(11, 16)}: ${h.wave.toFixed(1)} m at ${Math.round(h.period)} s` +
            (h.wind != null ? `, wind ${Math.round(h.wind)} km/h ${compass(h.windDir)}` : "") + ` (score ${s}/10)`;
    });

    // lesson times: a short bar under each 90-minute slot
    const lessons = el("g", { class: "lesson-marks" }, svg);
    hours.forEach((h, i) => {
        const hr = hourOf(h.time);
        for (const s of slots) {
            const m = slotMinutes(s);
            if (Math.floor(m / 60) !== hr) continue;
            const x0 = left + i * colW + ((m % 60) / 60) * colW;
            el("rect", { x: x0 + 1, y: bottom + 5, width: 1.5 * colW - 2, height: 5, rx: 2.5 }, lessons);
        }
    });

    // tide
    const tides = hours.map((h) => h.tide).filter((v) => v != null);
    if (tides.length > 6) {
        const lo = Math.min(...tides);
        const hi = Math.max(...tides);
        const ty = (v) => top + 14 + (1 - (v - lo) / (hi - lo || 1)) * (bottom - top - 40);
        let d = "";
        hours.forEach((h, i) => {
            if (h.tide == null) return;
            d += (d ? "L" : "M") + xAt(i).toFixed(1) + " " + ty(h.tide).toFixed(1);
        });
        el("path", { d, class: "tide" }, svg);
    }

    // wind arrows every 3 hours (arrow points where the wind blows to)
    const winds = el("g", { class: "wind" }, svg);
    hours.forEach((h, i) => {
        if (i % 3 !== 0 || h.wind == null) return;
        const cx = xAt(i);
        const cy = 266;
        const g = el("g", { transform: `translate(${cx} ${cy}) rotate(${h.windDir})`, class: windRelation(h.windDir) }, winds);
        const len = 6 + Math.min(h.wind, 45) / 45 * 8;
        el("path", { d: `M0 ${-len} V${len} M-4 ${len - 4} L0 ${len} L4 ${len - 4}` }, g);
        const t = el("text", { x: cx, y: 298, "text-anchor": "middle", class: "hour-label" }, svg);
        t.textContent = Math.round(h.wind);
    });
    const kmh = el("text", { x: left - 10, y: 270, "text-anchor": "end", class: "axis-label" }, svg);
    kmh.textContent = "wind";
    const kmh2 = el("text", { x: left - 10, y: 298, "text-anchor": "end", class: "axis-label" }, svg);
    kmh2.textContent = "km/h";

    // hour labels
    hours.forEach((h, i) => {
        const hr = hourOf(h.time);
        if (hr % 6 !== 0) return;
        const t = el("text", { x: xAt(i), y: 320, "text-anchor": "middle", class: "hour-label" }, svg);
        t.textContent = `${String(hr).padStart(2, "0")}h`;
    });

    // now marker
    const nx = xAt(nowIndex);
    el("line", { x1: nx, x2: nx, y1: top - 14, y2: bottom + 6, class: "now-line" }, svg);
    const nt = el("text", { x: nx + 5, y: top - 16, class: "now-label" }, svg);
    nt.textContent = "NOW";

    // start scrolled so "now" is in view on small screens
    const wrap = svg.parentElement;
    if (wrap.scrollWidth > wrap.clientWidth) wrap.scrollLeft = Math.max(0, nx - 60);

    return win;
}
