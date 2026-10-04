/* =========================================================
   PADDLE OUT: LANDMARKS
   One small scene per beach (34 beaches), drawn in the band of sand at
   the bottom of the hero (viewBox 1600 x 190, sand from
   y = 158). Each is something true to that beach. Kept
   roughly central so it still shows on a phone, where the
   band is cropped to about x 515 to 1085.
========================================================= */

const HUT_COLOURS = ["#ff5d5d", "#ffd23f", "#3ec1d3", "#ff9a3c", "#8b5cf6", "#2ecc71", "#ff4f8b", "#1e90ff", "#ffb400", "#ff6f59", "#00b894", "#f78fb3", "#4d96ff", "#ffa94d"];

const bush = (x, y, r, c = "#5f8a5a") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + r * 0.9}" cy="${y + r * 0.25}" r="${r * 0.8}" fill="${c}"/><circle cx="${x - r * 0.85}" cy="${y + r * 0.3}" r="${r * 0.7}" fill="${c}"/>`;

const palm = (x, lean = 18, h = 92, s = 1) => {
    const top = 160 - h;
    const cx = x + lean;
    const frond = (dx, dy) => `<path d="M${cx} ${top} q${dx * 0.5} ${dy - 14} ${dx} ${dy}" />`;
    return `<g transform="translate(${x} 160) scale(${s}) translate(${-x} -160)">
        <path d="M${x} 160 Q${x + lean * 0.2} ${top + h * 0.45} ${cx} ${top}" stroke="#7a5a3a" stroke-width="6" fill="none" stroke-linecap="round"/>
        <g stroke="#3f8a4f" stroke-width="5" fill="none" stroke-linecap="round">
            ${frond(-30, 14)}${frond(-20, 22)}${frond(4, 26)}${frond(24, 20)}${frond(32, 10)}${frond(-6, -12)}
        </g>
        <circle cx="${cx}" cy="${top + 3}" r="4" fill="#6b4a2b"/>
    </g>`;
};


/* ---------- Cape Town: the Muizenberg bathing huts ---------- */

function muizenberg() {
    return HUT_COLOURS.map((c, i) => `<g transform="translate(${40 + i * 112} 40)">
        <path d="M0 122V70L32 48L64 70V122Z" fill="${c}"/>
        <path d="M-4 72L32 45L68 72" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="5"/>
        <rect x="20" y="84" width="24" height="38" rx="2" fill="rgba(0,0,0,.14)"/>
    </g>`).join("");
}


/* ---------- Mossel Bay: Cape St Blaize lighthouse on the point ---------- */

function mosselBay() {
    return `
        <path class="beam" d="M1146 47 L1600 0 L1600 92 Z" fill="#fff3b0"/>
        <path d="M900 166 C950 146 990 124 1050 116 L1230 108 C1280 110 1320 128 1350 150 L1390 166 Z" fill="#8a8370"/>
        <path d="M930 160 C980 138 1040 126 1100 124" stroke="rgba(0,0,0,.14)" stroke-width="3" fill="none"/>
        <path d="M1240 120 C1280 126 1310 140 1340 158" stroke="rgba(0,0,0,.14)" stroke-width="3" fill="none"/>
        ${bush(1010, 116, 7, "#6d7f55")}${bush(1210, 106, 6, "#6d7f55")}
        <rect x="1166" y="92" width="44" height="20" fill="#f4f1e8"/>
        <path d="M1162 92 L1188 80 L1214 92 Z" fill="#b5463a"/>
        <rect x="1176" y="98" width="8" height="8" fill="#2b4a5a"/><rect x="1194" y="98" width="8" height="8" fill="#2b4a5a"/>
        <path d="M1132 112 L1136 54 L1156 54 L1160 112 Z" fill="#f4f1e8"/>
        <path d="M1136 54 L1156 54" stroke="#c9c3b3" stroke-width="2"/>
        <rect x="1135" y="42" width="22" height="12" fill="#2b3a40"/>
        <rect x="1139" y="44.5" width="14" height="7" class="lamp" fill="#ffd23f"/>
        <path d="M1132 42 L1146 31 L1160 42 Z" fill="#b5463a"/>`;
}


/* ---------- Knysna: Buffels Bay dunes, fynbos and the lifeguard tower ---------- */

function knysna() {
    return `
        <path d="M520 162 C590 128 680 122 760 140 C830 116 940 108 1040 132 C1110 120 1190 128 1260 162 Z" fill="var(--sand)"/>
        <path d="M520 162 C590 128 680 122 760 140 C830 116 940 108 1040 132 C1110 120 1190 128 1260 162 Z" fill="rgba(0,0,0,.07)"/>
        ${bush(610, 134, 8)}${bush(700, 128, 9, "#6f9460")}${bush(1000, 120, 8)}${bush(1130, 128, 10, "#6f9460")}${bush(1200, 140, 7)}
        <g stroke="#7a5a3a" stroke-width="4" stroke-linecap="round">
            <path d="M872 166 L882 124 M908 166 L898 124 M876 148 L904 148"/>
        </g>
        <rect x="866" y="116" width="48" height="9" fill="#d9433b"/>
        <rect x="872" y="96" width="36" height="20" fill="#ffd23f"/>
        <path d="M868 96 L890 86 L912 96 Z" fill="#d9433b"/>
        <rect x="880" y="101" width="20" height="8" fill="#2b4a5a"/>
        <path d="M914 116 L914 70" stroke="#555" stroke-width="2"/>
        <g class="flag"><rect x="914" y="70" width="20" height="7" fill="#d9433b"/><rect x="914" y="77" width="20" height="7" fill="#ffd23f"/></g>`;
}


/* ---------- Plettenberg Bay: the Robberg peninsula ---------- */

function plett() {
    return `
        <path d="M860 166 C910 152 970 140 1030 130 C1090 114 1160 98 1230 94 C1300 92 1360 104 1420 120 C1480 134 1540 146 1600 150 L1600 166 Z" fill="#6f7d63"/>
        <path d="M1030 132 C1090 120 1160 106 1230 102 C1300 100 1360 112 1420 126" stroke="rgba(255,255,255,.2)" stroke-width="3" fill="none"/>
        <path d="M1120 150 C1180 146 1260 140 1340 142 C1420 144 1500 150 1600 156 L1600 166 L1100 166 Z" fill="#59654f"/>
        ${bush(1180, 100, 6, "#55684a")}${bush(1300, 98, 5, "#55684a")}`;
}


/* ---------- St Francis Bay: white walls and black thatch ---------- */

function stFrancis() {
    const house = (x, w, h, roof) => `<g>
        <rect x="${x}" y="${162 - h}" width="${w}" height="${h}" fill="#fbfaf5"/>
        <path d="M${x - 7} ${164 - h} L${x + w * 0.28} ${162 - h - roof} L${x + w * 0.72} ${162 - h - roof} L${x + w + 7} ${164 - h} Z" fill="#2d2a26"/>
        <path d="M${x - 7} ${164 - h} L${x + w + 7} ${164 - h}" stroke="#1b1916" stroke-width="3"/>
        <rect x="${x + w * 0.66}" y="${162 - h - roof - 6}" width="7" height="14" fill="#fbfaf5"/>
        <rect x="${x + 9}" y="${170 - h}" width="11" height="11" fill="#2b4a5a"/>
        <rect x="${x + w - 20}" y="${170 - h}" width="11" height="11" fill="#2b4a5a"/>
        <rect x="${x + w / 2 - 6}" y="${162 - 20}" width="12" height="20" fill="#5b4636"/>
    </g>`;
    return `
        <path d="M540 164 C620 146 760 140 900 142 C1040 144 1160 146 1220 164 Z" fill="var(--sand)"/>
        <path d="M540 164 C620 146 760 140 900 142 C1040 144 1160 146 1220 164 Z" fill="rgba(0,0,0,.06)"/>
        ${house(590, 76, 34, 30)}${house(700, 64, 30, 26)}${house(800, 84, 38, 32)}${house(920, 70, 32, 28)}${house(1030, 78, 35, 30)}
        ${bush(570, 156, 6, "#7a8f5c")}${bush(1140, 154, 7, "#7a8f5c")}`;
}


/* ---------- Jeffreys Bay: aloes on the dunes, rocks at the point ---------- */

function jbay() {
    const aloe = (x, s) => `<g transform="translate(${x} 162) scale(${s})">
        <path d="M0 0 L0 -24" stroke="#6b5440" stroke-width="5" stroke-linecap="round"/>
        <path d="M0 -24 L-20 -32 L-4 -27 Z M0 -24 L-14 -44 L-2 -28 Z M0 -24 L0 -50 L3 -28 Z M0 -24 L14 -44 L4 -27 Z M0 -24 L21 -31 L5 -25 Z M0 -24 L-22 -20 L-4 -24 Z M0 -24 L22 -19 L4 -23 Z" fill="#5f8a6a"/>
        <g stroke-linecap="round" stroke-width="5">
            <path d="M-5 -48 L-5 -70" stroke="#e8582c"/><path d="M3 -50 L3 -78" stroke="#f07a2a"/><path d="M10 -46 L10 -66" stroke="#e8582c"/>
        </g>
        <g stroke="#6b5440" stroke-width="2"><path d="M-5 -40 L-5 -48 M3 -40 L3 -50 M10 -38 L10 -46"/></g>
    </g>`;
    return `
        <path d="M460 166 C480 150 510 146 540 150 C570 144 610 148 640 166 Z" fill="#7d7a70"/>
        <path d="M600 166 C620 156 650 154 680 160 L700 166 Z" fill="#6e6b62"/>
        ${aloe(760, 0.95)}${aloe(840, 1.15)}${aloe(930, 0.85)}${aloe(1030, 1.05)}
        ${bush(800, 158, 6, "#6f8f5c")}${bush(985, 157, 7, "#6f8f5c")}`;
}


/* ---------- Gqeberha: Kings Beach, the harbour wall and its cranes ---------- */

function gqeberha() {
    const crane = (x) => `<g transform="translate(${x} 0)">
        <g stroke="#b5382f" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round">
            <path d="M0 152 L8 86 M40 152 L32 86 M6 86 L34 86 M4 122 L36 122"/>
            <path d="M-34 80 L96 80" stroke-width="6"/>
            <path d="M20 80 L20 56 L-34 80 M20 56 L96 80" stroke-width="2.5"/>
        </g>
        <rect x="9" y="84" width="16" height="9" fill="#ececec"/>
    </g>`;
    const box = (x, y, c) => `<rect x="${x}" y="${y}" width="26" height="10" fill="${c}"/>`;
    return `
        <path d="M430 166 L530 166 L640 104 L622 104 Z" fill="#8a8f93"/>
        <path d="M530 166 L640 104" stroke="#6d7276" stroke-width="2"/>
        <rect x="560" y="148" width="420" height="16" fill="#9aa0a4"/>
        ${crane(640)}${crane(800)}
        ${box(880, 138, "#3e7cb1")}${box(908, 138, "#d9433b")}${box(936, 138, "#e8a33b")}${box(894, 128, "#2e8b57")}${box(922, 128, "#3e7cb1")}`;
}


/* ---------- East London: the Nahoon boardwalk through the dune forest ---------- */

function eastLondon() {
    let posts = "";
    for (let x = 650; x <= 1090; x += 31) posts += `M${x} 166 L${x} ${142 - (x - 650) * 0.012}`;
    let rails = "";
    for (let x = 650; x <= 1130; x += 15) rails += `M${x} ${141 - (x - 650) * 0.012} L${x} ${131 - (x - 650) * 0.012}`;
    return `
        ${bush(640, 132, 14, "#4f7a46")}${bush(720, 120, 18, "#3f6b3c")}${bush(820, 116, 20, "#4f7a46")}${bush(930, 112, 18, "#3f6b3c")}${bush(1040, 118, 20, "#4f7a46")}${bush(1150, 128, 16, "#3f6b3c")}
        <g stroke="#7d5c3e" stroke-linecap="round" fill="none">
            <path d="${posts}" stroke-width="3"/>
            <path d="M640 142 L1140 136" stroke-width="5"/>
            <path d="M640 131 L1140 125" stroke-width="2.5"/>
            <path d="${rails}" stroke-width="1.5"/>
            <path d="M1100 136 L1160 136 L1160 166 M1100 136 L1100 166" stroke-width="3"/>
        </g>`;
}


/* ---------- Southbroom: palms, lush bush and a vervet monkey ---------- */

function southbroom() {
    return `
        ${bush(560, 150, 12, "#3f7d47")}${bush(1160, 146, 14, "#3f7d47")}${bush(1240, 152, 10, "#4f8f52")}
        ${palm(640, 22, 96)}${palm(1090, -18, 104)}${palm(1180, 14, 80, 0.85)}
        <path d="M860 166 C880 150 920 146 950 152 C980 148 1010 154 1030 166 Z" fill="#7d7a70"/>
        <g class="monkey" transform="translate(940 146)">
            <path class="monkey-tail" d="M-6 0 C-18 2 -24 -6 -20 -16 C-18 -22 -12 -22 -12 -17" stroke="#7d7f78" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <ellipse cx="0" cy="-5" rx="7" ry="8" fill="#8e9089"/>
            <circle cx="3" cy="-15" r="5" fill="#8e9089"/>
            <circle cx="5" cy="-15" r="3" fill="#2f2f2f"/>
            <path d="M-4 2 L-6 6 M4 2 L6 6" stroke="#7d7f78" stroke-width="2.5" stroke-linecap="round"/>
        </g>`;
}


/* ---------- Durban: the beachfront promenade, a pier and a rickshaw ---------- */

function durban() {
    let lamps = "";
    for (let x = 520; x <= 1560; x += 150) {
        lamps += `<path d="M${x} 152 L${x} 112 M${x} 112 L${x + 8} 112" stroke="#555d62" stroke-width="2.5" fill="none"/><circle class="lamp" cx="${x + 9}" cy="114" r="3.5" fill="#ffd23f"/>`;
    }
    let pierPosts = "";
    for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        const y = 160 - t * 54;
        const half = 34 - t * 26;
        pierPosts += `M${1150 - half} ${y} L${1150 - half} ${y + 6 - t * 2} M${1150 + half} ${y} L${1150 + half} ${y + 6 - t * 2}`;
    }
    return `
        <rect x="440" y="146" width="1160" height="12" fill="#d8d2c4"/>
        <path d="M440 146 L1600 146" stroke="#bdb6a7" stroke-width="2"/>
        ${lamps}
        <path d="M1116 160 L1184 160 L1158 106 L1142 106 Z" fill="#a39885"/>
        <path d="M1116 160 L1142 106 M1184 160 L1158 106" stroke="#7d7464" stroke-width="2"/>
        <path d="${pierPosts}" stroke="#6b6355" stroke-width="2"/>
        ${palm(560, 16, 98, 0.9)}${palm(1320, -14, 92, 0.85)}
        <g transform="translate(800 0)">
            <circle cx="0" cy="150" r="13" fill="none" stroke="#3b3b3b" stroke-width="3"/>
            <path d="M0 150 L0 137 M-9 141 L9 159 M9 141 L-9 159" stroke="#3b3b3b" stroke-width="1.5"/>
            <path d="M-16 136 L18 136 L14 116 L-12 116 Z" fill="#d9433b"/>
            <path d="M-18 116 Q1 92 20 116 Z" fill="#ffd23f"/>
            <path d="M-14 112 L18 112" stroke="#2e8b57" stroke-width="3"/>
            <path d="M18 136 L46 140" stroke="#3b3b3b" stroke-width="2.5"/>
            <g class="puller" stroke="#1d2b33" stroke-width="2.2" fill="none" stroke-linecap="round">
                <path d="M50 166 L54 155 L58 166 M54 155 L54 146 M54 148 L46 141"/>
                <path d="M51 138 L46 124 M57 138 L62 124" stroke="#f2f2f2" stroke-width="2.5"/>
            </g>
            <circle cx="54" cy="142" r="3.4" fill="#1d2b33"/>
            <path d="M49 140 L59 140" stroke="#e8582c" stroke-width="2.5"/>
        </g>`;
}




/* =========================================================
   BUILDING BLOCKS for the rest of the coast
========================================================= */

const SAND = 158;

function lighthouse(x, h, style = "white", base = SAND + 2) {
    const top = base - h;
    const band = style === "stripes"
        ? [0.2, 0.45, 0.7].map((f) => `<path d="M${x - 12 + f * 3} ${base - h * f - 8} L${x + 12 - f * 3} ${base - h * f - 8} L${x + 12 - f * 3 - 1} ${base - h * f - 16} L${x - 12 + f * 3 + 1} ${base - h * f - 16} Z" fill="#c8372d"/>`).join("")
        : "";
    const cap = style === "redtop" || style === "stripes" ? "#c8372d" : "#2b3a40";
    return `
        <path class="beam" d="M${x} ${top - 6} L1700 ${top - 60} L1700 ${top + 40} Z" fill="#fff3b0"/>
        <path d="M${x - 13} ${base} L${x - 9} ${top} L${x + 9} ${top} L${x + 13} ${base} Z" fill="#f4f1e8"/>
        ${band}
        <rect x="${x - 11}" y="${top - 12}" width="22" height="12" fill="#2b3a40"/>
        <rect x="${x - 7}" y="${top - 9.5}" width="14" height="7" class="lamp" fill="#ffd23f"/>
        <path d="M${x - 14} ${top - 12} L${x} ${top - 24} L${x + 14} ${top - 12} Z" fill="${cap}"/>
        <path d="M${x - 15} ${top} L${x + 15} ${top}" stroke="#2b3a40" stroke-width="2.5"/>`;
}

const rocks = (x, w = 120, c = "#7d7a70") => `
    <path d="M${x} 166 C${x + w * 0.1} 148 ${x + w * 0.3} 142 ${x + w * 0.45} 148 C${x + w * 0.6} 138 ${x + w * 0.85} 144 ${x + w} 166 Z" fill="${c}"/>
    <path d="M${x + w * 0.25} 160 C${x + w * 0.35} 150 ${x + w * 0.5} 150 ${x + w * 0.6} 158" stroke="rgba(0,0,0,.12)" stroke-width="2.5" fill="none"/>`;

const boulder = (x, w, h, c = "#a39d91") => `
    <path d="M${x} 166 C${x - w * 0.05} ${166 - h * 0.6} ${x + w * 0.2} ${166 - h} ${x + w * 0.5} ${166 - h} C${x + w * 0.85} ${166 - h} ${x + w * 1.05} ${166 - h * 0.55} ${x + w} 166 Z" fill="${c}"/>
    <path d="M${x + w * 0.25} ${166 - h * 0.75} C${x + w * 0.4} ${166 - h * 0.9} ${x + w * 0.6} ${166 - h * 0.9} ${x + w * 0.72} ${166 - h * 0.78}" stroke="rgba(255,255,255,.25)" stroke-width="3" fill="none"/>`;

function highRises(x0, x1, seed = 1, tall = 1) {
    const cols = ["#ece7dd", "#d9e0e4", "#f3eee4", "#cfd8dd", "#e6ded0"];
    let out = "", x = x0, i = 0;
    while (x < x1) {
        const w = 34 + ((seed * 7 + i * 13) % 30);
        const h = (46 + ((seed * 11 + i * 29) % 64)) * tall;
        out += `<rect x="${x}" y="${SAND - h}" width="${w}" height="${h}" fill="${cols[(seed + i) % cols.length]}"/>`;
        for (let y = SAND - h + 8; y < SAND - 6; y += 9) out += `<path d="M${x + 5} ${y} L${x + w - 5} ${y}" stroke="#6f8a99" stroke-opacity=".45" stroke-width="3" stroke-dasharray="5 3"/>`;
        x += w + 6 + ((seed + i * 5) % 14);
        i++;
    }
    return out;
}

const tidalPool = (x0, x1) => `
    <rect x="${x0}" y="147" width="${x1 - x0}" height="9" fill="#a8a397"/>
    <rect x="${x0 + 7}" y="149.5" width="${x1 - x0 - 14}" height="4.5" fill="#9fd6de"/>
    <path d="M${x0} 147 L${x1} 147" stroke="#8d897f" stroke-width="2"/>`;

const sharkFlag = (x, colour = "#2e9d57") => `
    <path d="M${x} 162 L${x} 92" stroke="#555" stroke-width="2.5"/>
    <g class="flag"><rect x="${x}" y="92" width="30" height="18" fill="${colour}"/></g>
    <rect x="${x - 17}" y="128" width="34" height="22" fill="#fbfaf5" stroke="#2b3a40" stroke-width="1.5"/>
    <path d="M${x - 9} 145 L${x + 1} 133 L${x + 3} 145 Z M${x - 12} 145 L${x + 12} 145" fill="#2b3a40" stroke="#2b3a40" stroke-width="1.5"/>`;

const range = (d, c) => `<path d="${d}" fill="${c}"/>`;

const boat = (x, c, s = 1) => `<g transform="translate(${x} 150) scale(${s})">
    <path d="M-22 0 L22 0 L16 9 L-17 9 Z" fill="${c}"/>
    <rect x="-6" y="-11" width="14" height="11" fill="#f4f1e8"/>
    <path d="M2 -11 L2 -30" stroke="#555" stroke-width="2"/>
</g>`;

const rondavel = (x, c = "#f4f1e8", s = 1) => `<g transform="translate(${x} 162) scale(${s})">
    <rect x="-20" y="-24" width="40" height="24" fill="${c}"/>
    <path d="M-20 -24 Q0 -20 20 -24" stroke="rgba(0,0,0,.12)" stroke-width="2" fill="none"/>
    <path d="M-27 -22 L0 -48 L27 -22 Z" fill="#b08a4f"/>
    <path d="M-27 -22 L27 -22" stroke="#8a6a3a" stroke-width="3"/>
    <rect x="-5" y="-15" width="10" height="15" fill="#5b4636"/>
</g>`;

const hills = (c1 = "#6f9a58", c2 = "#5d8a4b") => `
    ${range("M420 160 C520 104 640 96 760 128 C840 92 960 86 1080 118 C1160 98 1260 104 1340 160 Z", c1)}
    ${range("M380 162 C470 134 560 130 660 146 C760 128 860 132 960 150 L980 162 Z", c2)}`;

const kites = () => `
    <g fill="none" stroke="#2b3a40" stroke-width="0.8" opacity=".75"><path d="M560 34 L610 146"/><path d="M1010 50 L960 140"/></g>
    <path d="M538 40 Q560 22 584 40" stroke="#ff5d5d" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M992 56 Q1012 40 1034 56" stroke="#ffd23f" stroke-width="6" fill="none" stroke-linecap="round"/>`;

const ship = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".8">
    <path d="M-40 0 L40 0 L32 8 L-34 8 Z" fill="#59636b"/>
    <rect x="18" y="-12" width="14" height="12" fill="#e8e8e8"/>
    <rect x="-30" y="-7" width="40" height="7" fill="#b5382f"/>
</g>`;

const dunes = (x0 = 520, x1 = 1260) => {
    const m = (x0 + x1) / 2;
    return `<path d="M${x0} 162 C${x0 + 70} 128 ${m - 140} 122 ${m - 60} 140 C${m + 10} 116 ${m + 120} 110 ${m + 220} 132 C${x1 - 80} 122 ${x1 - 40} 132 ${x1} 162 Z" fill="var(--sand)"/>
        <path d="M${x0} 162 C${x0 + 70} 128 ${m - 140} 122 ${m - 60} 140 C${m + 10} 116 ${m + 120} 110 ${m + 220} 132 C${x1 - 80} 122 ${x1 - 40} 132 ${x1} 162 Z" fill="rgba(0,0,0,.07)"/>
        ${bush(x0 + 90, 134, 8)}${bush(m - 80, 130, 9, "#6f9460")}${bush(m + 140, 122, 8)}${bush(x1 - 120, 132, 9, "#6f9460")}`;
};

const lifeguardTower = (x) => `
    <g stroke="#7a5a3a" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M${x - 18} 166 L${x - 8} 124 M${x + 18} 166 L${x + 8} 124 M${x - 14} 148 L${x + 14} 148"/>
    </g>
    <rect x="${x - 24}" y="116" width="48" height="9" fill="#d9433b"/>
    <rect x="${x - 18}" y="96" width="36" height="20" fill="#ffd23f"/>
    <path d="M${x - 22} 96 L${x} 86 L${x + 22} 96 Z" fill="#d9433b"/>
    <rect x="${x - 10}" y="101" width="20" height="8" fill="#2b4a5a"/>
    <path d="M${x + 24} 116 L${x + 24} 70" stroke="#555" stroke-width="2"/>
    <g class="flag"><rect x="${x + 24}" y="70" width="20" height="7" fill="#d9433b"/><rect x="${x + 24}" y="77" width="20" height="7" fill="#ffd23f"/></g>`;

const river = (x, w = 70) => `<path d="M${x} 158 C${x + 10} 166 ${x + 20} 176 ${x + 10} 190 L${x + w + 30} 190 C${x + w + 30} 176 ${x + w + 10} 166 ${x + w} 158 Z" fill="#6fbcc6"/>`;

const breakwater = (x, dir = 1, light = true) => `
    <path d="M${x} 162 L${x + dir * 40} 162 L${x + dir * 150} 112 L${x + dir * 134} 112 Z" fill="#8a8f93"/>
    ${light ? `<rect x="${x + dir * 138 - 4}" y="94" width="10" height="18" fill="#c8372d"/><rect x="${x + dir * 138 - 2}" y="90" width="6" height="4" class="lamp" fill="#ffd23f"/>` : ""}`;

const train = (x) => `
    <path d="M${x - 40} 152 L${x + 420} 152" stroke="#6b6355" stroke-width="2"/>
    ${[0, 1, 2].map((i) => `<g transform="translate(${x + i * 128} 0)">
        <rect x="0" y="122" width="120" height="28" rx="4" fill="#d8d3c4"/>
        <rect x="0" y="140" width="120" height="6" fill="#e2a72e"/>
        ${[10, 40, 70, 100].map((wx) => `<rect x="${wx}" y="128" width="16" height="9" fill="#2b4a5a"/>`).join("")}
        <circle cx="20" cy="151" r="3" fill="#333"/><circle cx="100" cy="151" r="3" fill="#333"/>
    </g>`).join("")}`;


/* =========================================================
   BEACHES: Western Cape (Cape Town)
========================================================= */

const fishHoek = () => `
    ${range("M420 160 C500 110 600 96 700 118 C760 104 820 100 880 124 L900 160 Z", "#7f9a7a")}
    ${range("M1150 160 C1210 120 1290 100 1380 112 C1450 118 1520 138 1600 150 L1600 162 Z", "#6f8a6a")}
    ${sharkFlag(780)}${rocks(1300, 180)}`;

const glencairn = () => `${train(540)}${rocks(1020, 160)}${tidalPool(1060, 1160)}${bush(500, 150, 8, "#7a8f5c")}`;

const strand = () => `
    ${range("M0 150 C140 96 260 84 380 104 C460 74 560 70 660 98 C760 80 880 76 1000 104 C1120 90 1240 86 1360 110 C1460 100 1540 108 1600 118 L1600 160 L0 160 Z", "#8ea5b0")}
    ${highRises(520, 1200, 3)}`;

const bigBay = () => `
    ${range("M360 158 C400 140 430 108 470 96 C490 92 505 100 520 118 C560 112 610 96 650 82 L700 72 L1050 70 C1090 72 1120 64 1150 78 C1200 96 1260 124 1320 158 Z", "#8aa1ad")}
    <path d="M690 74 C760 60 860 62 960 60 C1010 60 1040 66 1060 72 C1020 78 960 76 900 80 C820 82 740 80 690 74 Z" fill="#fbfdfd" opacity=".9"/>
    ${kites()}`;

const melkbos = () => `
    <g opacity=".85">
        <rect x="1020" y="120" width="90" height="38" fill="#c9cdd0"/>
        <path d="M1030 120 A22 22 0 0 1 1074 120 Z M1070 120 A22 22 0 0 1 1114 120 Z" fill="#dfe2e4"/>
        <rect x="1118" y="132" width="40" height="26" fill="#b9bfc3"/>
    </g>
    ${dunes(480, 980)}`;

const campsBay = () => `
    ${range("M400 160 L430 112 L460 128 L490 96 L520 120 L555 90 L585 118 L620 86 L650 116 L690 84 L720 114 L760 82 L790 112 L830 88 L860 116 L900 90 L930 118 L970 92 L1000 120 L1040 98 L1080 124 L1120 104 L1160 130 L1200 160 Z", "#8a9aa3")}
    ${palm(560, 14, 96)}${palm(980, -16, 100)}${palm(1060, 12, 84, 0.9)}${boulder(1180, 140, 46)}`;

const llandudno = () => `
    ${range("M980 162 C1040 120 1120 80 1220 64 C1320 52 1420 64 1600 70 L1600 162 Z", "#7d8a6f")}
    ${[1080, 1150, 1230, 1310, 1400, 1480].map((x, i) => `<rect x="${x}" y="${116 - i * 7}" width="44" height="22" fill="#f4f1e8"/><path d="M${x - 4} ${116 - i * 7} L${x + 22} ${104 - i * 7} L${x + 48} ${116 - i * 7} Z" fill="#5e6a70"/>`).join("")}
    ${boulder(560, 160, 58)}${boulder(700, 110, 40, "#958f83")}${boulder(860, 120, 50)}`;

const houtBay = () => `
    ${range("M1040 162 C1100 150 1170 120 1230 84 C1260 60 1290 40 1320 38 C1350 44 1380 70 1420 96 C1480 120 1540 134 1600 140 L1600 162 Z", "#5f6b58")}
    <path d="M1240 84 C1270 62 1300 46 1320 42" stroke="rgba(255,255,255,.18)" stroke-width="4" fill="none"/>
    ${boat(560, "#d9433b")}${boat(660, "#1e90ff", 0.9)}${boat(760, "#ffd23f", 0.85)}`;

const noordhoek = () => `
    ${range("M0 150 C120 110 220 80 320 64 C400 56 470 70 540 100 C600 124 660 146 720 160 L0 160 Z", "#6d7d5f")}
    <g transform="translate(940 0)">
        <rect x="0" y="134" width="70" height="26" rx="12" fill="#7a4b2a"/>
        <path d="M8 134 L8 160 M24 134 L24 160 M40 134 L40 160 M56 134 L56 160" stroke="#5e3a20" stroke-width="2"/>
        <path d="M86 160 C92 144 100 136 110 132 M110 160 C114 148 120 142 128 140" stroke="#5e3a20" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>`;

const longBeach = () => `${rocks(1080, 260, "#6e6b62")}${lighthouse(1200, 92, "white", 150)}${bush(1130, 146, 6, "#6d7f55")}`;

const scarborough = () => `
    ${dunes(460, 1000)}
    <path d="M1080 166 C1076 140 1092 124 1112 126 C1124 108 1146 104 1160 118 C1172 112 1188 116 1194 130 C1206 134 1214 150 1212 166 Z" fill="#9a958b"/>
    ${rocks(1240, 140)}`;


/* =========================================================
   BEACHES: KwaZulu-Natal (Ballito to Scottburgh)
========================================================= */

const ballito = () => `${highRises(560, 1060, 5, 0.8)}${palm(520, 16, 100)}${palm(1100, -14, 96)}${tidalPool(1140, 1280)}`;

const umdloti = () => `${palm(540, 18, 98)}${palm(620, -10, 84, 0.85)}${tidalPool(760, 1060)}${bush(1120, 148, 12, "#3f7d47")}${palm(1180, 12, 92)}`;

const umhlanga = () => `
    ${rocks(820, 170, "#6e6b62")}${lighthouse(900, 92, "stripes", 152)}
    <rect x="1040" y="116" width="150" height="42" fill="#fbfaf5"/>
    <path d="M1032 118 L1115 96 L1198 118 Z" fill="#b5382f"/>
    ${[1055, 1085, 1115, 1145, 1170].map((x) => `<rect x="${x}" y="126" width="12" height="12" fill="#2b4a5a"/>`).join("")}
    ${palm(1000, -10, 96)}${palm(1240, 14, 90)}`;

const northBeach = () => `
    ${highRises(380, 1260, 7, 1.15)}
    <path d="M1296 160 L1364 160 L1338 106 L1322 106 Z" fill="#a39885"/>
    <path d="M1296 160 L1322 106 M1364 160 L1338 106" stroke="#7d7464" stroke-width="2"/>
    ${palm(340, 14, 92, 0.85)}`;

const brighton = () => `
    ${range("M1060 162 C1120 132 1200 114 1300 108 C1400 104 1500 112 1600 122 L1600 162 Z", "#5e8550")}
    ${bush(1180, 118, 10, "#4f7a46")}${bush(1340, 108, 12, "#4f7a46")}
    ${ship(420, 108, 0.9)}${ship(700, 100, 0.7)}${lifeguardTower(880)}`;

const amanzimtoti = () => `${highRises(780, 1180, 9, 0.9)}${tidalPool(560, 740)}${palm(500, 16, 96)}${palm(1230, -12, 92)}`;


/* =========================================================
   BEACHES: Eastern Cape (St Francis to the Wild Coast)
========================================================= */

const supertubes = () => `
    ${rocks(380, 300, "#6e6b62")}${rocks(600, 180)}
    <g stroke="#7d5c3e" stroke-linecap="round" fill="none">
        <path d="M880 166 L880 128 M960 166 L960 126 M1040 166 L1040 124" stroke-width="3"/>
        <path d="M860 128 L1060 122" stroke-width="5"/><path d="M860 118 L1060 112" stroke-width="2.5"/>
        <path d="M880 128 L880 118 M920 127 L920 117 M960 126 L960 116 M1000 125 L1000 115 M1040 124 L1040 114" stroke-width="1.5"/>
    </g>
    ${jbayAloes([780, 1120, 1200])}`;

const kenton = () => `${dunes(520, 1080)}${boulder(1120, 170, 60, "#8d887c")}${boulder(1260, 110, 40)}${river(420, 60)}`;

const portAlfred = () => `
    ${breakwater(640, -1)}${breakwater(760, 1)}${river(650, 90)}
    ${[900, 990, 1080, 1170].map((x, i) => `<rect x="${x}" y="${128 + (i % 2) * 4}" width="70" height="${30 - (i % 2) * 4}" fill="#fbfaf5"/><path d="M${x - 5} ${130 + (i % 2) * 4} L${x + 35} ${112 + (i % 2) * 4} L${x + 75} ${130 + (i % 2) * 4} Z" fill="#6b7d86"/>`).join("")}`;

const orientBeach = () => `${breakwater(1100, 1)}${tidalPool(640, 900)}${rocks(520, 110)}${palm(980, 10, 86, 0.9)}`;

const gonubie = () => `${dunes(560, 1160)}${river(440, 70)}${lifeguardTower(1240)}`;

const chintsa = () => `${hills()}${rondavel(700, "#3ec1d3")}${rondavel(800, "#f4f1e8", 0.9)}${rondavel(1000, "#ffd23f", 0.95)}`;

const coffeeBay = () => `
    ${range("M300 162 C400 120 520 110 640 134 L700 162 Z", "#6f9a58")}
    <path fill-rule="evenodd" fill="#7d7466" d="M860 162 C850 120 880 92 940 84 C1010 76 1080 86 1120 106 C1160 124 1170 144 1166 162 Z M960 162 C962 136 980 120 1004 120 C1028 120 1046 136 1048 162 Z"/>
    <path d="M880 104 C920 86 1000 80 1070 88 C1100 92 1118 100 1126 108 C1080 98 980 92 880 104 Z" fill="#6f8f55"/>
    ${rondavel(520, "#3ec1d3", 0.9)}${rondavel(610, "#f4f1e8", 0.85)}`;

const portStJohns = () => `
    ${range("M300 162 C340 110 400 60 470 40 C520 34 560 60 600 104 C630 136 660 152 700 162 Z", "#4f7a46")}
    ${range("M980 162 C1010 130 1060 80 1130 50 C1190 34 1240 56 1280 96 C1320 136 1360 154 1400 162 Z", "#4f7a46")}
    ${rondavel(800, "#f4f1e8")}${rondavel(880, "#3ec1d3", 0.9)}${palm(740, 10, 70, 0.8)}${palm(940, -10, 74, 0.8)}`;


/* ---------- shared J-Bay aloes ---------- */

function jbayAloes(xs) {
    return xs.map((x, i) => `<g transform="translate(${x} 162) scale(${[1, 1.15, 0.9][i % 3]})">
        <path d="M0 0 L0 -24" stroke="#6b5440" stroke-width="5" stroke-linecap="round"/>
        <path d="M0 -24 L-20 -32 L-4 -27 Z M0 -24 L-14 -44 L-2 -28 Z M0 -24 L0 -50 L3 -28 Z M0 -24 L14 -44 L4 -27 Z M0 -24 L21 -31 L5 -25 Z" fill="#5f8a6a"/>
        <g stroke-linecap="round" stroke-width="5"><path d="M-5 -48 L-5 -70" stroke="#e8582c"/><path d="M3 -50 L3 -78" stroke="#f07a2a"/><path d="M10 -46 L10 -66" stroke="#e8582c"/></g>
    </g>`).join("");
}


/* =========================================================
   WHICH SCENE GOES WHERE
========================================================= */

export const LANDMARKS = {
    // Western Cape
    "muizenberg": muizenberg,
    "fish-hoek": fishHoek,
    "glencairn": glencairn,
    "strand": strand,
    "big-bay": bigBay,
    "melkbos": melkbos,
    "camps-bay": campsBay,
    "llandudno": llandudno,
    "hout-bay": houtBay,
    "noordhoek": noordhoek,
    "long-beach": longBeach,
    "scarborough": scarborough,
    // KwaZulu-Natal
    "ballito": ballito,
    "umdloti": umdloti,
    "umhlanga": umhlanga,
    "north-beach": northBeach,
    "addington": durban,
    "brighton": brighton,
    "amanzimtoti": amanzimtoti,
    "scottburgh": southbroom,
    // Eastern Cape
    "cape-st-francis": mosselBay,
    "st-francis-bay": stFrancis,
    "supertubes": supertubes,
    "kitchen-windows": jbay,
    "kings-beach": gqeberha,
    "summerstrand": knysna,
    "kenton": kenton,
    "port-alfred": portAlfred,
    "orient-beach": orientBeach,
    "nahoon": eastLondon,
    "gonubie": gonubie,
    "chintsa": chintsa,
    "coffee-bay": coffeeBay,
    "port-st-johns": portStJohns
};

// Stretches of sand people shouldn't stand in front of (landmark footprints)
export const KEEP_CLEAR = {
    "fish-hoek": [[750, 820]],
    "glencairn": [[500, 960]],
    "melkbos": [[1010, 1170]],
    "camps-bay": [[1170, 1330]],
    "llandudno": [[540, 990]],
    "noordhoek": [[930, 1080]],
    "long-beach": [[1070, 1350]],
    "scarborough": [[1070, 1220]],
    "umdloti": [[750, 1070]],
    "umhlanga": [[810, 1200]],
    "brighton": [[850, 910]],
    "amanzimtoti": [[550, 750]],
    "ballito": [[1130, 1290]],
    "cape-st-francis": [[900, 1390]],
    "st-francis-bay": [[580, 1120]],
    "supertubes": [[380, 1210]],
    "kitchen-windows": [[740, 1060]],
    "kings-beach": [[430, 990]],
    "summerstrand": [[860, 930]],
    "kenton": [[1110, 1380]],
    "port-alfred": [[480, 1250]],
    "orient-beach": [[630, 910], [1090, 1260]],
    "nahoon": [[640, 1160]],
    "gonubie": [[1210, 1270]],
    "chintsa": [[670, 1030]],
    "coffee-bay": [[490, 640], [850, 1170]],
    "port-st-johns": [[770, 910]],
    "addington": [[770, 860], [1110, 1190]],
    "scottburgh": [[620, 1200]]
};

// Stretches of water taken up by a landmark (headlands, piers, rocks): no surfers there
export const WATER_CLEAR = {
    "hout-bay": [[520, 800], [1040, 1600]],
    "llandudno": [[980, 1600]],
    "noordhoek": [[0, 700]],
    "long-beach": [[1080, 1340]],
    "north-beach": [[1290, 1370]],
    "brighton": [[1060, 1600]],
    "cape-st-francis": [[930, 1600]],
    "supertubes": [[380, 780]],
    "kings-beach": [[420, 660]],
    "port-alfred": [[480, 920]],
    "orient-beach": [[1100, 1260]],
    "coffee-bay": [[850, 1170]],
    "port-st-johns": [[300, 700], [980, 1400]],
    "addington": [[1100, 1200]]
};

// The x position to keep in view when a narrow screen crops the band
export const FOCUS = {
    "fish-hoek": 800, "glencairn": 760, "strand": 860, "big-bay": 860, "melkbos": 900, "camps-bay": 820,
    "llandudno": 900, "hout-bay": 1080, "noordhoek": 760, "long-beach": 1200, "scarborough": 1000,
    "ballito": 820, "umdloti": 900, "umhlanga": 1000, "north-beach": 900, "brighton": 900, "amanzimtoti": 880,
    "addington": 900, "scottburgh": 900,
    "cape-st-francis": 1150, "supertubes": 800, "kings-beach": 700, "kenton": 1000, "port-alfred": 820,
    "orient-beach": 900, "nahoon": 880, "gonubie": 900, "chintsa": 860, "coffee-bay": 900, "port-st-johns": 840
};
