/* =========================================================
   HUT NINE: CONDITIONS
   Live marine + weather data from Open-Meteo (free, no key,
   CORS-friendly). Falls back to clearly-labelled sample data
   if the feed can't be reached.
========================================================= */

// Just off Surfer's Corner, Muizenberg, in False Bay
const LAT = -34.112;
const LON = 18.478;
const TZ = "Africa%2FJohannesburg";
const CACHE_KEY = "hut9-conditions-v2";
const CACHE_MINUTES = 20;

const MARINE_URL =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}` +
    `&current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,sea_surface_temperature` +
    `&hourly=wave_height,wave_period,swell_wave_height,sea_level_height_msl,sea_surface_temperature` +
    `&timezone=${TZ}&forecast_days=3`;

const WEATHER_URL =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
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
const hourKey = (iso) => iso.slice(0, 13);            // "2026-09-26T15"

function parse(marine, weather) {
    const mh = marine.hourly;
    const wh = weather.hourly;
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

function sastNow() {
    // South Africa is UTC+2 all year, no daylight saving
    return new Date(Date.now() + 2 * 3600 * 1000);
}

function isoLocal(d) {
    return d.toISOString().slice(0, 16);
}

export function sampleConditions() {
    const now = sastNow();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    const hours = [];
    for (let i = 0; i < 72; i++) {
        const d = new Date(start.getTime() + i * 3600 * 1000);
        const h = d.getUTCHours();
        const day = i / 24;
        const wave = 0.7 + 0.45 * Math.sin(i / 11) + 0.25 * Math.sin(i / 4.3 + 1);
        const seBuild = Math.max(0, Math.sin(((h - 9) / 24) * Math.PI * 2)) * (12 + 10 * day);
        hours.push({
            time: isoLocal(d),
            wave: Math.max(0.25, +wave.toFixed(2)),
            period: +(9 + 3 * Math.sin(i / 17)).toFixed(1),
            swell: Math.max(0.2, +(wave * 0.8).toFixed(2)),
            tide: +(0.7 * Math.sin((i / 12.42) * Math.PI * 2 + 0.6)).toFixed(2),
            wind: +(6 + seBuild).toFixed(0),
            windDir: h > 10 && h < 20 ? 140 : 320,
            isDay: h >= 7 && h < 19 ? 1 : 0
        });
    }
    const nowIndex = now.getUTCHours();
    const nh = hours[nowIndex];
    const dayStr = isoLocal(start).slice(0, 10);
    return {
        source: "sample",
        updated: isoLocal(now),
        nowIndex,
        hours,
        now: {
            wave: nh.wave, period: nh.period, waveDir: 200, swell: nh.swell, swellPeriod: nh.period,
            water: 16.5, wind: nh.wind, windDir: nh.windDir, gusts: nh.wind * 1.4, air: 19,
            isDay: nh.isDay, cloud: 15, precip: 0
        },
        sunrise: [`${dayStr}T06:48`],
        sunset: [`${dayStr}T18:59`]
    };
}


/* ---------- public ---------- */

export async function loadConditions() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.at < CACHE_MINUTES * 60 * 1000) return cached.data;
    } catch { /* storage blocked: just fetch */ }

    try {
        const [marine, weather] = await Promise.all([getJSON(MARINE_URL), getJSON(WEATHER_URL)]);
        const data = parse(marine, weather);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* ignore */ }
        return data;
    } catch (err) {
        console.warn("Live surf feed unavailable, using sample data.", err);
        return sampleConditions();
    }
}
