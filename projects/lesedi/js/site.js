/* =========================================================
   LESEDI: SITE
   Everything outside the bottle: age gate, menu, cart,
   reservations, club and newsletter forms, scroll reveals.
   Runs on its own so the page works even if 3D fails.
========================================================= */

import { WINES } from "./wines.js";

const body = document.body;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
    get(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    }
};

const rand = (n) => "R" + n.toLocaleString("en-ZA").replace(/,/g, " ");
const priceOf = (wine) => Number(wine.price.replace(/\D/g, ""));


/* =========================================================
   AGE GATE
========================================================= */

const gate = document.getElementById("age-gate");

if (!store.get("lesedi-age-ok", false)) {
    gate.hidden = false;
    body.classList.add("is-locked");
    gate.querySelector("[data-age=yes]").focus();
}

gate.addEventListener("click", (e) => {
    const answer = e.target.closest("[data-age]")?.dataset.age;
    if (answer === "yes") {
        store.set("lesedi-age-ok", true);
        gate.classList.add("is-leaving");
        body.classList.remove("is-locked");
        setTimeout(() => { gate.hidden = true; }, REDUCED_MOTION ? 0 : 600);
    } else if (answer === "no") {
        document.getElementById("age-gate-note").textContent =
            "Thank you for your honesty. Please come back when you’re 18.";
    }
});


/* =========================================================
   HEADER + MOBILE MENU
========================================================= */

const onScroll = () => body.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const menuBtn = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");

function setMenu(open) {
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });


/* =========================================================
   CART
========================================================= */

const cartEl = document.getElementById("cart");
const scrim = document.querySelector(".cart-scrim");
const cartToggle = document.querySelector(".cart-toggle");
const itemsEl = cartEl.querySelector("[data-cart-items]");
const emptyEl = cartEl.querySelector("[data-cart-empty]");
const totalEl = cartEl.querySelector("[data-cart-total]");
const shipEl = cartEl.querySelector("[data-cart-ship]");
const noteEl = cartEl.querySelector("[data-cart-note]");
const checkoutBtn = cartEl.querySelector("[data-checkout]");
const FREE_DELIVERY = 1500;

let cart = store.get("lesedi-cart", {});      // { wineIndex: qty }

function renderCart() {
    const lines = Object.entries(cart).filter(([, q]) => q > 0);
    const count = lines.reduce((n, [, q]) => n + q, 0);
    const total = lines.reduce((n, [i, q]) => n + priceOf(WINES[i]) * q, 0);

    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = count; });
    cartToggle.classList.toggle("has-items", count > 0);

    itemsEl.innerHTML = lines.map(([i, q]) => {
        const w = WINES[i];
        return `
            <li class="cart-item">
                <span class="cart-swatch" style="--c:${w.liquid}"></span>
                <div class="cart-item-info">
                    <p class="cart-item-name">${w.name} <em>${w.vintage}</em></p>
                    <p class="cart-item-meta">${w.block} · ${w.price}</p>
                </div>
                <div class="qty" role="group" aria-label="Quantity of ${w.name}">
                    <button type="button" data-qty="${i}" data-step="-1" aria-label="One fewer">−</button>
                    <span>${q}</span>
                    <button type="button" data-qty="${i}" data-step="1" aria-label="One more">+</button>
                </div>
            </li>`;
    }).join("");

    emptyEl.hidden = lines.length > 0;
    checkoutBtn.disabled = lines.length === 0;
    totalEl.textContent = rand(total);
    shipEl.textContent = lines.length === 0 ? ""
        : total >= FREE_DELIVERY ? "Complimentary delivery included."
        : `Add ${rand(FREE_DELIVERY - total)} more for complimentary delivery.`;
    store.set("lesedi-cart", cart);
}

function setCart(open) {
    cartEl.classList.toggle("is-open", open);
    cartEl.setAttribute("aria-hidden", String(!open));
    cartEl.inert = !open;
    scrim.hidden = !open;
    cartToggle.setAttribute("aria-expanded", String(open));
    body.classList.toggle("is-locked", open);
    if (open) cartEl.querySelector(".cart-close").focus();
    else cartToggle.focus({ preventScroll: true });
}

document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
        const i = add.dataset.add;
        cart[i] = (cart[i] || 0) + 1;
        noteEl.textContent = "";
        renderCart();
        setCart(true);
        return;
    }
    const qty = e.target.closest("[data-qty]");
    if (qty) {
        const i = qty.dataset.qty;
        cart[i] = Math.max(0, (cart[i] || 0) + Number(qty.dataset.step));
        if (!cart[i]) delete cart[i];
        renderCart();
        return;
    }
    if (e.target.closest("[data-cart-close]")) setCart(false);
});

cartToggle.addEventListener("click", () => setCart(true));
checkoutBtn.addEventListener("click", () => {
    noteEl.textContent = "This is a concept site, so checkout isn’t connected. Nothing was charged.";
});
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (cartEl.classList.contains("is-open")) setCart(false);
    if (body.classList.contains("menu-open")) setMenu(false);
});

renderCart();


/* =========================================================
   FORMS (concept: nothing is sent)
========================================================= */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function check(fields) {
    let ok = true;
    for (const field of fields) {
        const bad = field.type === "email" ? !EMAIL.test(field.value.trim()) : !field.value.trim();
        field.setAttribute("aria-invalid", String(bad));
        if (bad && ok) field.focus();
        if (bad) ok = false;
    }
    return ok;
}

// reservations
const visit = document.getElementById("visit-form");
const visitNote = document.getElementById("visit-form-note");
visit.elements.date.min = new Date().toISOString().slice(0, 10);

document.querySelectorAll("[data-experience]").forEach((link) => {
    link.addEventListener("click", () => { visit.elements.experience.value = link.dataset.experience; });
});

visit.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = visit.elements;
    if (!check([f.date, f.name, f.email])) {
        visitNote.textContent = "Please add a date, your name and an email address.";
        return;
    }
    const when = new Date(f.date.value + "T12:00").toLocaleDateString("en-ZA", {
        weekday: "long", day: "numeric", month: "long"
    });
    const what = f.experience.selectedOptions[0].text.split(" · ")[0];
    const first = f.name.value.trim().split(" ")[0];
    visitNote.textContent =
        `Thank you, ${first}. ${what} for ${f.guests.value} on ${when} would be confirmed by email. ` +
        `(This is a concept site, so nothing was booked.)`;
    visit.reset();
});

// club
const club = document.getElementById("club-join");
document.querySelectorAll("[data-tier]").forEach((btn) => {
    btn.addEventListener("click", () => {
        club.elements.tier.value = btn.dataset.tier;
        club.querySelector(".club-note").textContent = `${btn.dataset.tier}-bottle membership selected.`;
        setTimeout(() => club.elements.email.focus({ preventScroll: true }), 400);
    });
});
club.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = club.querySelector(".club-note");
    if (!check([club.elements.email])) {
        note.textContent = "Please enter a valid email address.";
        return;
    }
    note.textContent =
        `Thank you. We’ll be in touch about the ${club.elements.tier.value}-bottle membership. (Concept site: nothing was sent.)`;
    club.elements.email.value = "";
});

// newsletter
const news = document.getElementById("news-form");
news.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = news.querySelector(".news-note");
    if (!check([news.elements.email])) {
        note.textContent = "Please enter a valid email address.";
        return;
    }
    note.textContent = "Thank you. The next letter goes out at harvest.";
    news.reset();
});

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });


/* =========================================================
   SCROLL REVEALS
========================================================= */

const reveals = document.querySelectorAll(".reveal");
if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
} else {
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
        }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
}
