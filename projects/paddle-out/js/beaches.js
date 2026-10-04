/* =========================================================
   PADDLE OUT: BEACHES
   The main surf beaches of Cape Town, the greater Durban
   coast and the Eastern Cape. Everything that makes a beach
   different lives here, so adding one is one line.

   lat / lon  a point just off the beach (the marine model
              picks the nearest sea cell)
   offshore   the compass bearing the wind blows FROM when it
              is offshore (clean). Onshore is the opposite.
              First-pass values from the way each beach faces;
              tune them with local surfers.
========================================================= */

export const PROVINCES = ["Western Cape", "KwaZulu-Natal", "Eastern Cape"];

const WC = "Western Cape", KZN = "KwaZulu-Natal", EC = "Eastern Cape";

export const BEACHES = [
    // ---------- Western Cape: Cape Town ----------
    { id: "muizenberg",      name: "Muizenberg",        area: "Cape Town, False Bay",       province: WC,  lat: -34.112, lon: 18.478, offshore: 340 },
    { id: "fish-hoek",       name: "Fish Hoek",         area: "Cape Town, False Bay",       province: WC,  lat: -34.140, lon: 18.440, offshore: 290 },
    { id: "glencairn",       name: "Glencairn",         area: "Cape Town, False Bay",       province: WC,  lat: -34.165, lon: 18.435, offshore: 270 },
    { id: "strand",          name: "Strand",            area: "Cape Town, False Bay",       province: WC,  lat: -34.115, lon: 18.815, offshore: 45 },
    { id: "big-bay",         name: "Big Bay",           area: "Cape Town, Bloubergstrand",  province: WC,  lat: -33.795, lon: 18.445, offshore: 120 },
    { id: "melkbos",         name: "Melkbosstrand",     area: "Cape Town, West Coast",      province: WC,  lat: -33.725, lon: 18.430, offshore: 110 },
    { id: "camps-bay",       name: "Camps Bay",         area: "Cape Town, Atlantic Seaboard", province: WC, lat: -33.950, lon: 18.368, offshore: 110 },
    { id: "llandudno",       name: "Llandudno",         area: "Cape Town, Atlantic Seaboard", province: WC, lat: -34.007, lon: 18.335, offshore: 110 },
    { id: "hout-bay",        name: "Hout Bay",          area: "Cape Town, Atlantic Seaboard", province: WC, lat: -34.052, lon: 18.355, offshore: 0 },
    { id: "noordhoek",       name: "Noordhoek",         area: "Cape Town, Cape Peninsula",  province: WC,  lat: -34.105, lon: 18.345, offshore: 110 },
    { id: "long-beach",      name: "Long Beach",        area: "Cape Town, Kommetjie",       province: WC,  lat: -34.130, lon: 18.322, offshore: 120 },
    { id: "scarborough",     name: "Scarborough",       area: "Cape Town, Cape Peninsula",  province: WC,  lat: -34.200, lon: 18.365, offshore: 110 },

    // ---------- KwaZulu-Natal: Ballito to Scottburgh ----------
    { id: "ballito",         name: "Ballito",           area: "Durban, North Coast",        province: KZN, lat: -29.535, lon: 31.230, offshore: 280 },
    { id: "umdloti",         name: "Umdloti",           area: "Durban, North Coast",        province: KZN, lat: -29.675, lon: 31.125, offshore: 290 },
    { id: "umhlanga",        name: "Umhlanga",          area: "Durban, North Coast",        province: KZN, lat: -29.728, lon: 31.095, offshore: 280 },
    { id: "north-beach",     name: "North Beach",       area: "Durban, Golden Mile",        province: KZN, lat: -29.852, lon: 31.048, offshore: 260 },
    { id: "addington",       name: "Addington Beach",   area: "Durban, Golden Mile",        province: KZN, lat: -29.870, lon: 31.065, offshore: 270 },
    { id: "brighton",        name: "Brighton Beach",    area: "Durban, Bluff",              province: KZN, lat: -29.935, lon: 31.020, offshore: 280 },
    { id: "amanzimtoti",     name: "Amanzimtoti",       area: "Durban, South Coast",        province: KZN, lat: -30.060, lon: 30.895, offshore: 300 },
    { id: "scottburgh",      name: "Scottburgh",        area: "Durban, South Coast",        province: KZN, lat: -30.290, lon: 30.760, offshore: 300 },

    // ---------- Eastern Cape: St Francis to the Wild Coast ----------
    { id: "cape-st-francis", name: "Cape St Francis",   area: "St Francis",                 province: EC,  lat: -34.215, lon: 24.835, offshore: 330 },
    { id: "st-francis-bay",  name: "St Francis Bay",    area: "St Francis",                 province: EC,  lat: -34.170, lon: 24.860, offshore: 300 },
    { id: "supertubes",      name: "Supertubes",        area: "Jeffreys Bay",               province: EC,  lat: -34.030, lon: 24.930, offshore: 250 },
    { id: "kitchen-windows", name: "Kitchen Windows",   area: "Jeffreys Bay",               province: EC,  lat: -34.060, lon: 24.950, offshore: 290 },
    { id: "kings-beach",     name: "Kings Beach",       area: "Gqeberha",                   province: EC,  lat: -33.970, lon: 25.660, offshore: 280 },
    { id: "summerstrand",    name: "Summerstrand",      area: "Gqeberha",                   province: EC,  lat: -34.000, lon: 25.685, offshore: 320 },
    { id: "kenton",          name: "Kenton-on-Sea",     area: "Sunshine Coast",             province: EC,  lat: -33.690, lon: 26.675, offshore: 320 },
    { id: "port-alfred",     name: "Port Alfred",       area: "Sunshine Coast",             province: EC,  lat: -33.605, lon: 26.905, offshore: 320 },
    { id: "orient-beach",    name: "Orient Beach",      area: "East London",                province: EC,  lat: -33.030, lon: 27.925, offshore: 340 },
    { id: "nahoon",          name: "Nahoon",            area: "East London",                province: EC,  lat: -33.000, lon: 27.970, offshore: 315 },
    { id: "gonubie",         name: "Gonubie",           area: "East London",                province: EC,  lat: -32.945, lon: 28.040, offshore: 315 },
    { id: "chintsa",         name: "Chintsa",           area: "Wild Coast",                 province: EC,  lat: -32.840, lon: 28.120, offshore: 315 },
    { id: "coffee-bay",      name: "Coffee Bay",        area: "Wild Coast",                 province: EC,  lat: -31.990, lon: 29.150, offshore: 315 },
    { id: "port-st-johns",   name: "Port St Johns",     area: "Wild Coast",                 province: EC,  lat: -31.640, lon: 29.550, offshore: 320 }
];

export const beachById = (id) => BEACHES.find((b) => b.id === id) || BEACHES[0];

// How much of the open-ocean swell reaches each beach (1 = fully exposed).
// The forecast grid is about 8 km wide, so neighbouring beaches share a
// forecast point; this keeps sheltered bays smaller than exposed points.
export const EXPOSURE = {
    "muizenberg": 0.8, "fish-hoek": 0.7, "glencairn": 0.7, "strand": 0.85, "big-bay": 1, "melkbos": 0.9,
    "camps-bay": 0.9, "llandudno": 1, "hout-bay": 0.55, "noordhoek": 1, "long-beach": 1, "scarborough": 1,
    "ballito": 0.95, "umdloti": 0.95, "umhlanga": 0.95, "north-beach": 0.85, "addington": 0.75, "brighton": 0.95,
    "amanzimtoti": 0.95, "scottburgh": 0.9,
    "cape-st-francis": 1, "st-francis-bay": 0.7, "supertubes": 1, "kitchen-windows": 0.8, "kings-beach": 0.55,
    "summerstrand": 0.8, "kenton": 0.85, "port-alfred": 0.9, "orient-beach": 0.7, "nahoon": 1, "gonubie": 0.9,
    "chintsa": 0.9, "coffee-bay": 0.9, "port-st-johns": 0.85
};
