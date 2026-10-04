/* =========================================================
   PADDLE OUT: SKY
   Two layers that sit on top of the surf mood:
   1. Time of day. The sky is keyframed around today's real
      sunrise and sunset and blended minute by minute, and the
      sun (or moon) moves along its arc from east to west.
   2. Weather. Cloud cover greys the sky and hides the sun,
      and rain adds streaks.
========================================================= */

/* ---------- colour helpers ---------- */

const hex = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lum = (h) => {
    const [r, g, b] = hex(h).map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const grey = (h, dim = 0.92) => {
    const g = Math.pow(lum(h), 1 / 2.2) * 255 * dim;
    return toHex([g * 0.97, g, g * 1.04]);
};
const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const minutesOf = (iso) => +iso.slice(11, 13) * 60 + +iso.slice(14, 16);

// South Africa is UTC+2 all year
export function sastMinutesNow() {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
}


/* ---------- time of day ---------- */

// Sky keyframes, placed relative to sunrise (r) and sunset (s) in minutes.
// light: how bright the scene is (dims the sea and huts).
function keyframes(r, s) {
    const noon = (r + s) / 2;
    return [
        { t: 0,        top: "#070b1e", bottom: "#1b2a52", sun: "#f4f1dc", light: 0.32, stars: 1 },
        { t: r - 80,   top: "#070b1e", bottom: "#1b2a52", sun: "#f4f1dc", light: 0.32, stars: 1 },
        { t: r - 30,   top: "#2b3566", bottom: "#c98c9b", sun: "#ffd9b0", light: 0.55, stars: 0.35 },
        { t: r + 5,    top: "#7f87b9", bottom: "#ffc39c", sun: "#ffd39a", light: 0.85, stars: 0 },
        { t: r + 100,  top: "#8cc4ee", bottom: "#eaf4fb", sun: "#fff6de", light: 1, stars: 0 },
        { t: noon,     top: "#4f9fe6", bottom: "#cde9ff", sun: "#ffffff", light: 1, stars: 0 },
        { t: s - 110,  top: "#69ade7", bottom: "#f3ebd3", sun: "#fff1c6", light: 1, stars: 0 },
        { t: s - 30,   top: "#c6779a", bottom: "#ffc27a", sun: "#ffc978", light: 0.88, stars: 0 },
        { t: s + 12,   top: "#2b2b63", bottom: "#df807a", sun: "#ffb27a", light: 0.6, stars: 0.2 },
        { t: s + 55,   top: "#070b1e", bottom: "#1b2a52", sun: "#f4f1dc", light: 0.32, stars: 1 },
        { t: 1440,     top: "#070b1e", bottom: "#1b2a52", sun: "#f4f1dc", light: 0.32, stars: 1 }
    ];
}

export function phaseOf(m, r, s) {
    if (m < r - 40 || m > s + 45) return "night";
    if (m < r + 50) return "dawn";
    if (m < 11 * 60) return "morning";
    if (m < 15 * 60) return "midday";
    if (m < s - 75) return "afternoon";
    if (m <= s + 10) return "sunset";
    return "dusk";
}

export function skyAt(m, r, s) {
    const k = keyframes(r, s);
    let i = 0;
    while (i < k.length - 2 && m > k[i + 1].t) i++;
    const a = k[i];
    const b = k[i + 1];
    const t = clamp01((m - a.t) / (b.t - a.t || 1));
    const sky = {
        top: mix(a.top, b.top, t),
        bottom: mix(a.bottom, b.bottom, t),
        sunColour: mix(a.sun, b.sun, t),
        light: a.light + (b.light - a.light) * t,
        stars: a.stars + (b.stars - a.stars) * t
    };

    // Sun: rises in the east (left, as you look out to sea) and sets in the west
    const up = r - 20;
    const down = s + 20;
    if (m >= up && m <= down) {
        const f = clamp01((m - r) / (s - r));
        const arc = Math.sin(Math.PI * f);
        sky.sunX = 0.38 + 0.26 * f;                // kept in the gap between headline and readout
        sky.sunY = 1.02 - 0.84 * arc;              // fraction of the way down to the horizon
        sky.sunR = 0.085 + 0.11 * (1 - arc);       // bigger and softer near the horizon
        sky.sunA = clamp01(Math.min((m - up) / 35, (down - m) / 35));
    } else {
        // Moon: crosses the night sky from east to west
        const nightLen = 1440 - (down - up);
        const since = m > down ? m - down : m + 1440 - down;
        const f = clamp01(since / nightLen);
        const arc = Math.sin(Math.PI * f);
        sky.sunX = 0.42 + 0.2 * f;
        sky.sunY = 0.95 - 0.72 * arc;
        sky.sunR = 0.045;
        sky.sunA = clamp01(Math.min(since / 40, (nightLen - since) / 40));
    }
    return sky;
}


/* ---------- weather ---------- */

export function weatherOf(cloudPct = 0, precip = 0) {
    const cloud = clamp01((cloudPct ?? 0) / 100);
    const rain = clamp01((precip ?? 0) / 3);
    return {
        cloud,
        rain: precip > 0.05 ? Math.max(rain, 0.25) : 0,
        overcast: clamp01((cloud - 0.45) / 0.5)
    };
}

export function describeSky(cloudPct, precip) {
    if (precip >= 1.5) return "rain";
    if (precip > 0.05) return "light rain";
    if (cloudPct < 20) return "clear";
    if (cloudPct < 55) return "partly cloudy";
    if (cloudPct < 85) return "mostly cloudy";
    return "overcast";
}


/* ---------- compose: surf mood + time + weather ---------- */

const DARK_INK = { ink: "#0c2233", inkSoft: "#34505f", card: "rgba(255,255,255,0.42)", line: "rgba(12,34,51,0.16)" };
const LIGHT_INK = { ink: "#f1f4ff", inkSoft: "rgba(241,244,255,0.8)", card: "rgba(10,18,42,0.42)", line: "rgba(241,244,255,0.2)" };
const NIGHT_BLUE = "#060c1f";

export function compose(surf, sky, weather) {
    const greyAmt = weather.overcast * 0.82 + weather.rain * 0.12;
    const skyTop = mix(sky.top, grey(sky.top), greyAmt);
    const skyBottom = mix(sky.bottom, grey(sky.bottom, 0.96), greyAmt);

    // the sea reflects the sky: tint towards it, darken with the light, grey out under cloud
    const sea = surf.sea.map((c, i) => {
        let out = mix(c, sky.bottom, 0.12 + 0.05 * (3 - i));
        out = mix(out, grey(out, 0.95), weather.overcast * 0.55);
        return mix(NIGHT_BLUE, out, sky.light);
    });

    // readable text: judge the sky where the headline sits
    const behindText = mix(skyTop, skyBottom, 0.45);
    const inks = lum(behindText) < 0.2 ? LIGHT_INK : DARK_INK;
    const dark = sky.light < 0.5;

    return {
        skyTop, skyBottom, sea,
        foam: surf.foam,
        sun: sky.sunColour,
        sunX: sky.sunX,
        sunY: sky.sunY,
        sunR: sky.sunR,
        sunA: sky.sunA * (1 - weather.overcast * 0.92),
        stars: sky.stars * (1 - weather.cloud * 0.9),
        clouds: Math.max(surf.clouds ?? 0, weather.cloud),
        rain: weather.rain,
        ...inks,
        textShadow: inks === LIGHT_INK,
        accent: surf.accent,
        accentInk: surf.accentInk,
        page: dark ? "#0c1228" : surf.page,
        pageInk: dark ? "#e8ecff" : surf.pageInk,
        sand: mix(NIGHT_BLUE, surf.sand, 0.35 + 0.65 * sky.light),
        hutDim: Math.min(1, 0.4 + 0.6 * sky.light) * (1 - weather.overcast * 0.12)
    };
}
