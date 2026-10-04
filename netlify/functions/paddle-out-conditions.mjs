/* =========================================================
   PADDLE OUT: CONDITIONS FUNCTION  (/api/paddle-out/conditions)
   Fetches marine + weather data for every beach in two
   calls, and lets Netlify's CDN cache the answer for 20
   minutes. Every visitor reads the cache, so the number of
   Open-Meteo calls stays the same however busy the site is,
   and the API key never reaches the browser.

   Set OPEN_METEO_KEY in Netlify (Site settings, Environment
   variables) once the commercial plan is active. Without it,
   the function uses the free API: fine for the demo and
   pitch, not for a paying client.
========================================================= */

import { MARINE_QUERY, WEATHER_QUERY } from "../../projects/paddle-out/js/conditions.js";

export default async () => {
    const key = process.env.OPEN_METEO_KEY;
    const marineBase = key ? "https://customer-marine-api.open-meteo.com/v1/marine" : "https://marine-api.open-meteo.com/v1/marine";
    const weatherBase = key ? "https://customer-api.open-meteo.com/v1/forecast" : "https://api.open-meteo.com/v1/forecast";
    const auth = key ? `&apikey=${encodeURIComponent(key)}` : "";

    try {
        const [m, w] = await Promise.all([
            fetch(`${marineBase}?${MARINE_QUERY}${auth}`),
            fetch(`${weatherBase}?${WEATHER_QUERY}${auth}`)
        ]);
        if (!m.ok || !w.ok) throw new Error(`Open-Meteo replied ${m.status} / ${w.status}`);

        const body = JSON.stringify({
            marine: await m.json(),
            weather: await w.json(),
            fetched: new Date().toISOString()
        });

        return new Response(body, {
            headers: {
                "content-type": "application/json; charset=utf-8",
                // browsers keep it 5 minutes; Netlify's CDN keeps it 20 and refreshes in the background
                "cache-control": "public, max-age=300",
                "netlify-cdn-cache-control": "public, s-maxage=1200, stale-while-revalidate=600"
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 502,
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
        });
    }
};

export const config = { path: "/api/paddle-out/conditions" };
