/* =========================================================
   PADDLE OUT: CONDITIONS
   Loads marine + weather data for every beach at once.

   1. /api/conditions  our cached server function (live site,
                       uses the commercial API key)
   2. Open-Meteo free  direct from the browser, for local
                       demos only (non-commercial)
   3. Sample data      clearly labelled, if both are down
========================================================= */

import { BEACHES, EXPOSURE } from "./beaches.js";

const TZ = "Africa%2FJohannesburg";
const CACHE_KEY = "paddle-out-sa-conditions-v1";
const CACHE_MINUTES = 15;

const lats = BEACHES.map((b) => b.lat).join(",");
const lons = BEACHES.map((b) => b.lon).join(",");

// Kept identical to the server function so both give the same shape
export const MARINE_QUERY =
    `latitude=${lats}&longitude=${lons}` +
    `&current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,sea_surface_temperature` +
    `&hourly=wave_height,wave_period,swell_wave_height,sea_level_height_msl,sea_surface_temperature` +
    `&timezone=${TZ}&forecast_days=3`;

export const WEATHER_QUERY =
    `latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,cloud_cover,precipitation` +
    `&hourly=wind_speed_10m,wind_direction_10m,is_day` +
    `&daily=sunrise,sunset&timezone=${TZ}&forecast_days=3&wind_speed_unit=kmh`;


async function getJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

const num = (v, fallback = null) => (typeof v === "number" && !Number.isNaN(v) ? v : fallback);
const hourKey = (iso) => iso.slice(0, 13);


/* ---------- one beach ---------- */

function parse(marine, weather) {
    const mh = marine.hourly;
    const wh = weather.hourly;
    if (!mh?.time?.length || mh.wave_height?.every((v) => v == null)) throw new Error("no marine data");
    const windByHour = new Map(wh.time.map((t, i) => [hourKey(t), i]));

    const hours = mh.time.map((t, i) => {
        const w = windByHour.get(hourKey(t));
        return {
            time: t,
            wave: num(mh.wave_height?.[i], 0),
            period: num(mh.wave_period?.[i], 0),
            swell: num(mh.swell_wave_height?.[i]),
            tide: num(mh.sea_level_height_msl?.[i]),
            wind: w === undefined ? null : num(wh.wind_speed_10m[w]),
            windDir: w === undefined ? null : num(wh.wind_direction_10m[w]),
            isDay: w === undefined ? null : wh.is_day?.[w] ?? null
        };
    });

    const mc = marine.current || {};
    const wc = weather.current || {};
    const nowKey = hourKey(wc.time || mc.time || hours[0].time);
    let nowIndex = hours.findIndex((h) => hourKey(h.time) === nowKey);
    if (nowIndex < 0) nowIndex = 0;
    const nowHour = hours[nowIndex];

    return {
        source: "live",
        updated: wc.time || mc.time || nowHour.time,
        nowIndex,
        hours,
        now: {
            wave: num(mc.wave_height, nowHour.wave),
            period: num(mc.wave_period, nowHour.period),
            waveDir: num(mc.wave_direction),
            swell: num(mc.swell_wave_height, nowHour.swell),
            swellPeriod: num(mc.swell_wave_period),
            water: num(mc.sea_surface_temperature, num(mh.sea_surface_temperature?.[nowIndex])),
            wind: num(wc.wind_speed_10m, nowHour.wind ?? 0),
            windDir: num(wc.wind_direction_10m, nowHour.windDir ?? 0),
            gusts: num(wc.wind_gusts_10m),
            air: num(wc.temperature_2m),
            isDay: wc.is_day ?? 1,
            cloud: num(wc.cloud_cover, 20),
            precip: num(wc.precipitation, 0)
        },
        sunrise: weather.daily?.sunrise || [],
        sunset: weather.daily?.sunset || []
    };
}


/* ---------- sample data (clearly labelled on the page) ---------- */

const sastNow = () => new Date(Date.now() + 2 * 3600 * 1000);
const isoLocal = (d) => d.toISOString().slice(0, 16);

export function sampleConditions(seed = 0, beach = {}) {
    const now = sastNow();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    const off = beach.offshore ?? 320;
    const on = (off + 180) % 360;
    const size = 0.55 + (seed % 5) * 0.18;
    const hours = [];
    for (let i = 0; i < 72; i++) {
        const d = new Date(start.getTime() + i * 3600 * 1000);
        const h = d.getUTCHours();
        const day = i / 24;
        const wave = size + 0.45 * Math.sin(i / 11 + seed) + 0.25 * Math.sin(i / 4.3 + 1 + seed * 0.7);
        const seaBreeze = Math.max(0, Math.sin(((h - 9 - (seed % 3)) / 24) * Math.PI * 2)) * (10 + 9 * day + seed);
        hours.push({
            time: isoLocal(d),
            wave: Math.max(0.25, +wave.toFixed(2)),
            period: +(9 + 3 * Math.sin(i / 17 + seed)).toFixed(1),
            swell: Math.max(0.2, +(wave * 0.8).toFixed(2)),
            tide: +(0.7 * Math.sin((i / 12.42) * Math.PI * 2 + 0.6 + seed * 0.4)).toFixed(2),
            wind: +(5 + seaBreeze).toFixed(0),
            windDir: h > 10 && h < 20 ? on : off,
            isDay: h >= 6 && h < 19 ? 1 : 0
        });
    }
    const nowIndex = now.getUTCHours();
    const nh = hours[nowIndex];
    const dayStr = isoLocal(start).slice(0, 10);
    const lonShift = Math.round(((beach.lon ?? 18.5) - 18.5) * 4);   // minutes: the sun rises earlier further east
    const clock = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    return {
        source: "sample",
        updated: isoLocal(now),
        nowIndex,
        hours,
        now: {
            wave: nh.wave, period: nh.period, waveDir: 200, swell: nh.swell, swellPeriod: nh.period,
            water: 16 + (beach.lon ?? 18) / 6, wind: nh.wind, windDir: nh.windDir, gusts: nh.wind * 1.4, air: 20,
            isDay: nh.isDay, cloud: (seed * 17) % 70, precip: 0
        },
        sunrise: [`${dayStr}T${clock(6 * 60 + 15 - lonShift)}`],
        sunset: [`${dayStr}T${clock(19 * 60 - lonShift)}`]
    };
}


/* ---------- all beaches ---------- */

// Scale the swell for sheltered beaches (see EXPOSURE in beaches.js)
function shelter(d, k) {
    if (k === 1) return d;
    const sc = (v) => (v == null ? v : +(v * k).toFixed(2));
    d.hours = d.hours.map((h) => ({ ...h, wave: sc(h.wave), swell: sc(h.swell) }));
    d.now = { ...d.now, wave: sc(d.now.wave), swell: sc(d.now.swell) };
    return d;
}

function parseAll(marine, weather, source) {
    const ms = Array.isArray(marine) ? marine : [marine];
    const ws = Array.isArray(weather) ? weather : [weather];
    const beaches = {};
    const missing = [];
    BEACHES.forEach((b, i) => {
        try {
            beaches[b.id] = shelter({ ...parse(ms[i], ws[i]), source }, EXPOSURE[b.id] ?? 1);
        } catch {
            beaches[b.id] = sampleConditions(i, b);
            missing.push(b.name);
        }
    });
    if (missing.length) console.warn("No live marine data for:", missing.join(", "), "(showing sample data there).");
    return { source, beaches, missing };
}

function sampleAll() {
    const beaches = {};
    BEACHES.forEach((b, i) => { beaches[b.id] = sampleConditions(i, b); });
    return { source: "sample", beaches, missing: [] };
}

export async function loadAll() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.at < CACHE_MINUTES * 60 * 1000) return cached.data;
    } catch { /* storage blocked: just fetch */ }

    let data = null;
    try {
        // 1. our own cached function (deployed site)
        const api = await getJSON("/api/paddle-out/conditions");
        data = parseAll(api.marine, api.weather, "live");
    } catch {
        try {
            // 2. free API straight from the browser (local demo only)
            const [marine, weather] = await Promise.all([
                getJSON(`https://marine-api.open-meteo.com/v1/marine?${MARINE_QUERY}`),
                getJSON(`https://api.open-meteo.com/v1/forecast?${WEATHER_QUERY}`)
            ]);
            data = parseAll(marine, weather, "live");
        } catch (err) {
            console.warn("Live surf feed unavailable, using sample data.", err);
            return sampleAll();
        }
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* ignore */ }
    return data;
}
