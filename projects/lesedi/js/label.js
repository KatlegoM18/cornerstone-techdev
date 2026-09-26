/* =========================================================
   LESEDI: THE LABEL
   Draws the wrap-around label onto a canvas that becomes
   the texture on the 3D bottle. Four panels, one per
   quarter-turn: Label, In the glass, The block, At the table.
========================================================= */

// Logical drawing space: four 1024 x 1312 panels side by side.
// The real canvas is smaller (SCALE) to keep GPU memory sensible.
const PANEL = 1024;
const W = PANEL * 4;
const H = 1312;
const SCALE = 0.625;

const SERIF = '"Cormorant", Georgia, serif';
const SANS = '"Inter", Arial, sans-serif';


/* ---------- helpers ---------- */

function spaced(ctx, text, cx, y, spacing, fromLeft = false) {
    // Letter-spaced text, centred on cx or starting at it
    // (canvas letterSpacing isn't supported everywhere yet)
    const chars = [...text];
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = fromLeft ? cx : cx - total / 2;
    const align = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((c, i) => {
        ctx.fillText(c, x, y);
        x += widths[i] + spacing;
    });
    ctx.textAlign = align;
    return total;
}

function wrap(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function rule(ctx, x1, x2, y) {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
}

function emblem(ctx, cx, cy, s, accent) {
    // Setting sun over a ridge line: the estate mark
    ctx.save();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.36, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy + s * 0.05);
    ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.25, cx - s * 0.1, cy + s * 0.2, cx + s * 0.25, cy - s * 0.05);
    ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.25, cx + s * 0.8, cy, cx + s, cy - s * 0.1);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {                       // rays
        const a = Math.PI + (i + 0.5) * (Math.PI / 7);
        ctx.lineWidth = s * 0.03;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * s * 0.48, cy + Math.sin(a) * s * 0.48);
        ctx.lineTo(cx + Math.cos(a) * s * 0.66, cy + Math.sin(a) * s * 0.66);
        ctx.stroke();
    }
    ctx.restore();
}

function paper(ctx, colours) {
    ctx.fillStyle = colours.paper;
    ctx.fillRect(0, 0, W, H);

    // fibres and speckle so it reads as paper, not a flat colour
    const n = parseInt(colours.paper.slice(1), 16);
    const dark = ((n >> 16) + ((n >> 8) & 255) + (n & 255)) / 3 < 128;
    for (let i = 0; i < 14000; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        ctx.fillStyle = dark
            ? `rgba(255,240,210,${Math.random() * 0.05})`
            : `rgba(60,40,20,${Math.random() * 0.06})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
}


/* ---------- the four panels ----------
   Drawn in a 1024 x 1312 space per panel, then scaled to fit. */

function frontPanel(ctx, wine, x0) {
    const { ink, accent } = wine.label;
    const cx = x0 + PANEL / 2;

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(x0 + 60, 70, PANEL - 120, H - 140);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 + 76, 86, PANEL - 152, H - 172);

    emblem(ctx, cx, 250, 86, accent);

    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 58px ${SANS}`;
    spaced(ctx, "LESEDI", cx, 380, 34);

    ctx.fillStyle = accent;
    ctx.font = `500 23px ${SANS}`;
    spaced(ctx, "WINE ESTATE · STELLENBOSCH", cx, 432, 9);

    ctx.fillStyle = ink;
    ctx.font = `italic 400 ${wine.name.length > 12 ? 146 : 164}px ${SERIF}`;
    ctx.fillText(wine.name, cx, 680);

    ctx.font = `500 50px ${SERIF}`;
    ctx.fillText(wine.block, cx, 770);

    ctx.fillStyle = accent;
    ctx.font = `500 104px ${SERIF}`;
    ctx.fillText(wine.vintage, cx, 960);
    const vw = ctx.measureText(wine.vintage).width;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    rule(ctx, cx - vw / 2 - 200, cx - vw / 2 - 40, 928);
    rule(ctx, cx + vw / 2 + 40, cx + vw / 2 + 200, 928);

    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.72;
    ctx.font = `500 22px ${SANS}`;
    spaced(ctx, "WINE OF ORIGIN STELLENBOSCH", cx, 1140, 6);
    spaced(ctx, `${wine.abv} VOL · 750 ML`, cx, 1180, 6);
    ctx.globalAlpha = 1;
}

function heading(ctx, text, x0, wine) {
    const cx = x0 + PANEL / 2;
    ctx.fillStyle = wine.label.accent;
    ctx.textAlign = "center";
    ctx.font = `600 34px ${SANS}`;
    spaced(ctx, text, cx, 200, 16);
    ctx.strokeStyle = wine.label.accent;
    ctx.lineWidth = 2;
    rule(ctx, cx - 80, cx + 80, 244);
}

function tastingPanel(ctx, wine, x0) {
    heading(ctx, "IN THE GLASS", x0, wine);
    const left = x0 + 130;
    const width = PANEL - 260;
    let y = 360;
    ctx.textAlign = "left";
    for (const [label, text] of wine.tasting) {
        ctx.fillStyle = wine.label.accent;
        ctx.font = `600 26px ${SANS}`;
        spaced(ctx, label.toUpperCase(), left, y, 8, true);
        ctx.fillStyle = wine.label.ink;
        ctx.font = `italic 400 68px ${SERIF}`;
        const lines = wrap(ctx, text, width);
        lines.forEach((line, i) => ctx.fillText(line, left, y + 76 + i * 70));
        y += 90 + lines.length * 70 + 44;
    }
}

function blockPanel(ctx, wine, x0) {
    heading(ctx, "THE BLOCK", x0, wine);
    const cx = x0 + PANEL / 2;
    const cy = 440;

    // contour lines with the block marked
    ctx.save();
    ctx.strokeStyle = wine.label.ink;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    for (let r = 0; r < 6; r++) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
            const wob = 1 + 0.08 * Math.sin(a * 3 + r) + 0.05 * Math.cos(a * 5 - r);
            const x = cx + Math.cos(a) * (60 + r * 60) * 1.12 * wob;
            const y = cy + Math.sin(a) * (22 + r * 22) * wob;
            a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = wine.label.accent;
    ctx.beginPath();
    ctx.ellipse(cx + 80, cy - 14, 84, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = wine.label.accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // stats in two columns
    const cols = [x0 + 130, x0 + PANEL / 2 + 30];
    ctx.textAlign = "left";
    wine.vineyard.forEach(([k, v], i) => {
        const x = cols[i % 2];
        const y = 710 + Math.floor(i / 2) * 150;
        if (k) {
            ctx.fillStyle = wine.label.accent;
            ctx.font = `600 22px ${SANS}`;
            spaced(ctx, k.toUpperCase(), x, y, 6, true);
        }
        ctx.fillStyle = wine.label.ink;
        ctx.font = `500 ${v.length > 13 ? 44 : 54}px ${SERIF}`;
        ctx.fillText(v, x, y + 62);
    });
}

function tablePanel(ctx, wine, x0) {
    heading(ctx, "AT THE TABLE", x0, wine);
    const cx = x0 + PANEL / 2;

    ctx.textAlign = "center";
    ctx.fillStyle = wine.label.ink;
    ctx.font = `600 24px ${SANS}`;
    spaced(ctx, "SERVE AT", cx, 340, 10);
    ctx.fillStyle = wine.label.accent;
    ctx.font = `500 150px ${SERIF}`;
    ctx.fillText(wine.serve, cx, 490);

    ctx.strokeStyle = wine.label.ink;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    rule(ctx, x0 + 150, x0 + PANEL - 150, 570);
    ctx.globalAlpha = 1;

    ctx.fillStyle = wine.label.ink;
    let y = 680;
    wine.pairing.forEach(([, dish]) => {
        ctx.font = `italic 400 62px ${SERIF}`;
        const lines = wrap(ctx, dish, PANEL - 220);
        lines.forEach((line) => {
            ctx.fillText(line, cx, y);
            y += 68;
        });
        y += 34;
    });

    ctx.fillStyle = wine.label.accent;
    ctx.font = `600 24px ${SANS}`;
    spaced(ctx, `CELLAR ${wine.cellar.toUpperCase()}`, cx, 1180, 8);
}


/* ---------- public ---------- */

export function drawLabel(wine) {
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);

    paper(ctx, wine.label);

    frontPanel(ctx, wine, 0);
    tastingPanel(ctx, wine, PANEL);
    blockPanel(ctx, wine, PANEL * 2);
    tablePanel(ctx, wine, PANEL * 3);

    // perforation-style dividers between panels
    ctx.fillStyle = wine.label.accent;
    ctx.globalAlpha = 0.5;
    for (let p = 1; p < 4; p++) {
        for (let y = 90; y < H - 90; y += 22) {
            ctx.fillRect(PANEL * p - 2, y, 3, 10);
        }
    }
    ctx.globalAlpha = 1;

    // top and bottom trim
    ctx.fillStyle = wine.label.accent;
    ctx.fillRect(0, 0, W, 12);
    ctx.fillRect(0, H - 12, W, 12);

    return canvas;
}
