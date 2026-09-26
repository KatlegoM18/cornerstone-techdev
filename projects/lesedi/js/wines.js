/* =========================================================
   LESEDI: THE WINES
   Everything the bottle, label and panel need.
   Colours are hex strings so both CSS and Three.js can use them.
========================================================= */

export const WINES = [
    {
        id: "chenin",
        name: "Chenin Blanc",
        vintage: "2024",
        block: "Klipkop Block",
        price: "R245",
        shape: "burgundy",
        glass: "#dfe8d2",          // flint glass, faint green
        glassOpacity: 0.16,
        liquid: "#c98a1e",
        liquidOpacity: 0.9,
        fill: 3.25,
        capsule: "#c9a25a",
        capsuleMetal: 0.85,
        label: { paper: "#efe6d2", ink: "#2b2119", accent: "#a87a33" },
        rim: "#ffb56b",
        intro:
            "Old bush vines on decomposed granite, picked in the cool of the morning " +
            "and fermented slowly in old oak.",
        tasting: [
            ["Nose", "Ripe quince, dried pear and orange blossom."],
            ["Palate", "Waxy and round, held up by a line of chalky acidity."],
            ["Finish", "Long and honeyed, with a little salt."]
        ],
        abv: "13.5%",
        vineyard: [
            ["Planted", "1974"],
            ["Vines", "Bush vines"],
            ["Soil", "Decomposed granite"],
            ["Elevation", "310 m"],
            ["Aspect", "South-facing"],
            ["Yield", "4 t/ha"]
        ],
        serve: "10–12°C",
        serveNote: "Take it out of the fridge 20 minutes before pouring.",
        pairing: [
            ["Braai", "Snoek with apricot glaze"],
            ["Table", "Cape Malay pickled fish"],
            ["Cheese", "Aged Gouda"]
        ],
        cellar: "Now – 2032"
    },
    {
        id: "pinotage",
        name: "Pinotage",
        vintage: "2021",
        block: "Laaste Lig",
        price: "R320",
        shape: "bordeaux",
        glass: "#1f3a24",          // deep green glass
        glassOpacity: 0.62,
        liquid: "#3a0914",
        liquidOpacity: 0.96,
        fill: 3.35,
        capsule: "#4a1420",
        capsuleMetal: 0.55,
        label: { paper: "#17100f", ink: "#eadbb9", accent: "#caa25c" },
        rim: "#ff8a66",
        intro:
            "Our highest block, the last on the farm to lose the sun. Eighteen " +
            "months in French oak, bottled unfiltered.",
        tasting: [
            ["Nose", "Mulberry, smoke and a hint of cocoa."],
            ["Palate", "Dark plum and fine, dusty tannins."],
            ["Finish", "Savoury, with cedar and a cool lift."]
        ],
        abv: "14%",
        vineyard: [
            ["Planted", "1998"],
            ["Vines", "Trellised"],
            ["Soil", "Sandstone over clay"],
            ["Elevation", "420 m"],
            ["Aspect", "North-west"],
            ["Oak", "18 months"]
        ],
        serve: "16–18°C",
        serveNote: "Open an hour before, or decant it if you're impatient.",
        pairing: [
            ["Pot", "Lamb potjie"],
            ["Table", "Bobotie with yellow rice"],
            ["Braai", "Venison loin, red-wine jus"]
        ],
        cellar: "Now – 2036"
    },
    {
        id: "mcc",
        name: "Cap Classique",
        vintage: "NV",
        block: "Eerste Skemer · Brut",
        price: "R285",
        shape: "sparkling",
        glass: "#3c4a2a",          // olive sparkling glass
        glassOpacity: 0.5,
        liquid: "#efd796",
        liquidOpacity: 0.7,
        fill: 3.45,
        capsule: "#d8b565",
        capsuleMetal: 1.0,
        capsuleStart: 3.05,        // sparkling foil runs down to the shoulder
        label: { paper: "#f2e8d6", ink: "#1f2a23", accent: "#8c6a2e" },
        rim: "#ffd3c0",
        intro:
            "Chardonnay and Pinot Noir from the bay-facing slopes, " +
            "made in the traditional method and left 36 months on the lees.",
        tasting: [
            ["Nose", "Green apple, brioche and lemon zest."],
            ["Palate", "A fine, persistent mousse. Crisp citrus, toasted almond."],
            ["Finish", "Bright, clean, and gone too soon."]
        ],
        abv: "12%",
        vineyard: [
            ["Blend", "70% Chardonnay"],
            ["", "30% Pinot Noir"],
            ["Soil", "Granite and shale"],
            ["Elevation", "280 m"],
            ["On lees", "36 months"],
            ["Dosage", "6 g/l"]
        ],
        serve: "6–8°C",
        serveNote: "Ice bucket, 20 minutes. Open with a sigh, not a pop.",
        pairing: [
            ["Coast", "West Coast oysters"],
            ["Beach", "Fish and chips, from the paper"],
            ["Always", "Good news"]
        ],
        cellar: "Now – 2028"
    }
];

export const FACES = ["Label", "In the glass", "The block", "At the table"];
