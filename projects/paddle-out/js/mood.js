/* =========================================================
   PADDLE OUT: MOOD (engine from Hut Nine)
   Turns raw numbers into a surf call, a colour palette,
   sea motion and the words on the page.
   Every beach faces a different way, so "offshore" comes
   from the selected beach's config (beaches.js).
========================================================= */

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

export function compass(deg) {
    return COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

// The bearing the wind blows FROM when it's offshore at the current beach
let OFFSHORE = 340;
export function setOffshore(deg) { OFFSHORE = deg; }

const angleBetween = (a, b) => {
    const d = Math.abs((((a - b) % 360) + 360) % 360);
    return d > 180 ? 360 - d : d;
};

export function windRelation(deg) {
    const d = angleBetween(deg ?? 0, OFFSHORE);
    if (d <= 50) return "offshore";
    if (d >= 130) return "onshore";
    return "cross-shore";
}

export function windName(deg) {
    const c = compass(deg);
    if (["SE", "ESE", "SSE"].includes(c)) return "south-easter";
    if (["NW", "WNW", "NNW"].includes(c)) return "north-wester";
    if (["N", "NNE"].includes(c)) return "northerly";
    if (["S", "SSW"].includes(c)) return "southerly";
    if (["SW", "WSW", "W"].includes(c)) return "south-wester";
    return "easterly";
}

// 0-10 for any hour
export function scoreHour({ wave, period, wind, windDir }) {
    if (wave == null) return 0;
    let s;
    if (wave < 0.3) s = 0.5;
    else if (wave < 0.6) s = 3;
    else if (wave < 1.0) s = 5.5;
    else if (wave < 1.8) s = 7;
    else if (wave < 2.6) s = 7.5;
    else s = 6;

    if (period >= 12) s += 1.5;
    else if (period >= 10) s += 1;
    else if (period < 7) s -= 1.5;

    const w = wind ?? 10;
    const rel = windRelation(windDir ?? 0);
    if (w < 8) s += 1.5;
    else if (rel === "offshore" && w < 25) s += 1;
    else if (rel === "onshore" && w >= 15) s -= 2 + Math.min((w - 15) / 10, 2.5);
    else if (w >= 25) s -= 2;

    return Math.max(0, Math.min(10, +s.toFixed(1)));
}

export function moodFor(now) {
    const rel = windRelation(now.windDir);
    if (now.wave < 0.35) return "flat";
    if ((rel === "onshore" && now.wind >= 18) || now.wind >= 32) return "blown";
    if (now.wind < 8) return "glassy";
    if (scoreHour(now) >= 7.5) return "pumping";
    return "fun";
}


/* ---------- surf palettes ----------
   The surf sets the sea, the accent colour and the page below.
   The sky, the light and the text colour come from sky.js
   (time of day + weather). sea: far → near. */

export const PALETTES = {
    glassy: {
        sea: ["#9fd7d2", "#5fb8b8", "#2f97a1", "#1b7686"], foam: "rgba(255,255,255,0.55)", clouds: 0,
        accent: "#ff5d5d", accentInk: "#ffffff",
        page: "#fff7ea", pageInk: "#0c2a3a", sand: "#f3d9a4"
    },
    pumping: {
        sea: ["#2a92c2", "#127099", "#0b5582", "#063e64"], foam: "rgba(255,255,255,0.92)", clouds: 0.1,
        accent: "#ffc21a", accentInk: "#0b2a44",
        page: "#f2f8ff", pageInk: "#0b2a44", sand: "#f0d49a"
    },
    fun: {
        sea: ["#6cc9d6", "#39acc2", "#2090a9", "#15728d"], foam: "rgba(255,255,255,0.75)", clouds: 0.2,
        accent: "#ff4f8b", accentInk: "#ffffff",
        page: "#fbf8f2", pageInk: "#0b2d40", sand: "#f2dcae"
    },
    blown: {
        sea: ["#86a09a", "#62807a", "#4a6862", "#36514c"], foam: "rgba(240,246,242,0.85)", clouds: 0.7,
        accent: "#ff7a2f", accentInk: "#ffffff",
        page: "#eef0ec", pageInk: "#15201f", sand: "#cfc3a4"
    },
    flat: {
        sea: ["#c4e8e6", "#a8dbdb", "#90cdd0", "#7ac0c5"], foam: "rgba(255,255,255,0.5)", clouds: 0.05,
        accent: "#8b5cf6", accentInk: "#ffffff",
        page: "#fdf9f0", pageInk: "#1d3440", sand: "#f6e4bd"
    }
};


/* ---------- sea motion ---------- */

export function seaFor(now, mood) {
    const rel = windRelation(now.windDir);
    const wind = now.wind ?? 0;
    return {
        amp: Math.min(Math.max(now.wave, 0.12), 2.6),          // metres, drives wave height
        period: Math.min(Math.max(now.period || 8, 4), 16),     // seconds, drives spacing + speed
        chop: mood === "glassy" ? 0 : Math.min(wind / 40, 1) * (rel === "onshore" ? 1 : 0.55),
        drift: rel === "offshore" ? -1 : rel === "onshore" ? 1 : 0.3
    };
}


/* ---------- words ---------- */

const f1 = (n) => (n == null ? "–" : n.toFixed(1));

export function copyFor(mood, now, extra = {}) {
    const wave = f1(now.wave);
    const period = Math.round(now.period || 0);
    const wind = Math.round(now.wind || 0);
    const name = windName(now.windDir);
    const rel = windRelation(now.windDir);

    const c = {
        glassy: {
            verdict: "Glassy.<br><em>Get in.</em>",
            sub: `${wave} m at ${period} seconds and barely a breath of wind. The bay is a mirror. Go now, before it changes.`,
            call: "<strong>Today's call:</strong> glassy and gentle. Perfect conditions for a first lesson."
        },
        pumping: {
            verdict: "It's<br><em>pumping.</em>",
            sub: `${wave} m lines at ${period} seconds with a ${rel === "offshore" ? "light offshore " : ""}${name}. Wax up. This is the day you'll talk about.`,
            call: "<strong>Today's call:</strong> a bit big for first-timers. Pick a calmer lesson time below, or book a private lesson."
        },
        fun: {
            verdict: "Fun little<br><em>peelers.</em>",
            sub: `${wave} m at ${period} seconds, ${wind} km/h ${name}. Friendly waves for longboards and first lessons.`,
            call: "<strong>Today's call:</strong> textbook learner waves. Every lesson time today looks friendly."
        },
        blown: {
            verdict: "Blown<br><em>out.</em>",
            sub: `The ${name} is blowing ${wind} km/h straight in. Grab a coffee on the beachfront and wait for it to drop.`,
            call: "<strong>Today's call:</strong> lessons may move until the wind drops. The forecast shows the next good window."
        },
        flat: {
            verdict: "Flat as a<br><em>pancake.</em>",
            sub: `Only ${wave} m today. Honestly? Perfect for a first lesson in the whitewash. Or a swim.`,
            call: "<strong>Today's call:</strong> small and safe. The best kind of day to stand up for the first time."
        },
    };

    const out = { ...c[mood] };

    // After dark the headline is about tomorrow, whatever the surf is doing
    if (extra.phase === "night") {
        out.verdict = "See you at<br><em>first light.</em>";
        out.sub = `${wave} m at ${period} seconds out there in the dark.${extra.sunrise ? ` Sunrise is at ${extra.sunrise}.` : ""} Dawn patrol?`;
        out.call = "<strong>Today's call:</strong> the first lesson paddles out in the morning. Pick a time below.";
    }

    // One extra line for the sky: weather first, otherwise the time of day
    const w = extra.weather || {};
    let line = "";
    if (w.rain > 0.6) line = "It's properly raining. You get wet surfing anyway.";
    else if (w.rain > 0) line = "Drizzle about. Bring a hoodie for after.";
    else if (w.overcast > 0.6) line = extra.phase === "night" ? "" : "Grey sky, but the water doesn't mind.";
    else if (extra.phase === "dawn" && mood !== "blown") line = "Dawn patrol it is.";
    else if (extra.phase === "sunset" && mood !== "blown") line = "Sunset session, anyone?";
    else if (extra.phase === "dusk") line = "Last light is going fast.";
    if (line) out.sub += " " + line;

    return out;
}


/* ---------- preview presets ---------- */

export const PRESETS = {
    glassy:  { wave: 0.9, period: 11, swell: 0.8, water: 16.5, wind: 4,  windDir: 330 },
    pumping: { wave: 1.9, period: 13, swell: 1.7, water: 16,   wind: 12, windDir: 318 },
    fun:     { wave: 0.8, period: 9,  swell: 0.6, water: 17,   wind: 13, windDir: 250 },
    blown:   { wave: 1.3, period: 7,  swell: 0.6, water: 15,   wind: 38, windDir: 140 },
    flat:    { wave: 0.2, period: 6,  swell: 0.1, water: 18,   wind: 10, windDir: 220 }
};

// minutes past midnight, worked out from today's sunrise (r) and sunset (s)
export const TIME_PRESETS = {
    dawn:    (r) => r + 8,
    morning: () => 9 * 60,
    midday:  () => 12 * 60 + 30,
    sunset:  (r, s) => s - 22,
    night:   () => 22 * 60 + 30
};

export const SKY_PRESETS = {
    clear:  { cloud: 5,   precip: 0 },
    cloudy: { cloud: 92,  precip: 0 },
    rain:   { cloud: 100, precip: 2.6 }
};

export function wetsuitFor(temp) {
    if (temp == null) return "–";
    if (temp < 14) return "5/4 + booties";
    if (temp < 17) return "4/3 wetsuit";
    if (temp < 20) return "3/2 wetsuit";
    return "Springsuit";
}
