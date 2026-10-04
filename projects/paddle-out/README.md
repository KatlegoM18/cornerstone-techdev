# Paddle Out: live surf conditions for South Africa

A concept by CornerStone TechDev, built on the Hut Nine engine. Live waves,
wind, tide and a three-day forecast for 34 surf beaches in Cape Town, the
greater Durban coast and the Eastern Cape, filterable by province, with the
best two-hour windows to surf today and tomorrow. Every beach has its own
scene, and the stick figures on the sand follow the live weather.

## Run it locally

Open the folder in VS Code and start **Live Server**. Locally the page calls
Open-Meteo's free API straight from the browser, which is fine for building and
demoing (non-commercial).

Try `?beach=supertubes`, `?beach=umhlanga`, `?beach=coffee-bay` and so on, or
pick a beach from the dropdown or the grid.

## Deploy

On cornerstonetechdev.co.za the page reads `/api/paddle-out/conditions`, a cached
function in the site's `netlify/functions/paddle-out-conditions.mjs`. Set
`OPEN_METEO_KEY` in Netlify once you have a commercial Open-Meteo plan; without
it the function uses the free API.

## Beaches

Everything beach-specific is in `js/beaches.js`:

- `lat` / `lon`: a point just off the beach
- `offshore`: the bearing the wind blows **from** when it's offshore (first-pass
  values; tune with local surfers)
- `EXPOSURE`: how much of the open-ocean swell reaches the beach (the forecast
  grid is about 8 km wide, so neighbouring beaches share a forecast point)

Landmarks are in `js/landmarks.js`; the beach-life animation is in `js/life.js`.
