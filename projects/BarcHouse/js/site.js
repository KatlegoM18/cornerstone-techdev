// =========================================================
// BARC HOUSE — SHARED SCRIPT
// Loaded at the end of every page, before any page script.
// =========================================================

// ==========================================
// PREVIEW MODE
// On the online preview (anything other than this computer),
// features that need the backend show a friendly note instead.
// Remove this once the backend is live.
// ==========================================
window.BARC_PREVIEW =
    !["localhost", "127.0.0.1", ""].includes(location.hostname);

document.documentElement.classList.add("js");


// ==========================================
// HEADER BORDER ON SCROLL
// ==========================================
const siteHeader = document.querySelector(".site-header");

function updateHeader() {
    siteHeader.classList.toggle("scrolled", window.scrollY > 8);
}

if (siteHeader) {
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
}


// ==========================================
// MOBILE MENU
// ==========================================
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.querySelector(".mobile-nav");

function setMobileNav(open) {
    mobileNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    document.body.classList.toggle("no-scroll", open);
}

if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () =>
        setMobileNav(!mobileNav.classList.contains("open")));

    mobileNav.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMobileNav(false);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) setMobileNav(false);
    });
}


// ==========================================
// RESIDENT PORTAL LINK
// The portal isn't online yet, so on the preview
// the login link shows a note instead.
// ==========================================
function showToast(title, text) {
    let toast = document.getElementById("preview-note");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "preview-note";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<strong>${title}</strong>${text}`;
    toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toast.hidden = true; }, 5000);
}

document.querySelectorAll("[data-portal-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
        if (!window.BARC_PREVIEW) return;
        event.preventDefault();
        showToast(
            "Resident portal coming soon",
            "Residents and management will log in here once the portal goes live."
        );
    });
});


// ==========================================
// SUB NAV: HIGHLIGHT THE SECTION IN VIEW
// ==========================================
const subNavLinks = document.querySelectorAll(".sub-nav-links a[href^='#']");

if (subNavLinks.length && "IntersectionObserver" in window) {
    const linkFor = new Map();

    subNavLinks.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) linkFor.set(section, link);
    });

    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            subNavLinks.forEach((l) => l.classList.remove("active"));
            const link = linkFor.get(entry.target);
            link.classList.add("active");

            // Slide the menu bar sideways (on phones) so the active link
            // shows. Never use scrollIntoView here: it also scrolls the
            // page, which cancels the reader's scroll and jerks it back up.
            const bar = link.parentElement;
            if (bar.scrollWidth > bar.clientWidth) {
                bar.scrollTo({
                    left: link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2,
                    behavior: "smooth"
                });
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    linkFor.forEach((_, section) => spy.observe(section));
}


// ==========================================
// LIGHTBOX
// Any element with data-lightbox="group" and data-src
// opens a full-screen viewer for every photo in that group.
// ==========================================
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Photo viewer");
lightbox.innerHTML = `
    <div class="lightbox-bar">
        <span class="lightbox-caption"></span>
        <span class="lightbox-counter"></span>
        <button type="button" class="lightbox-close" aria-label="Close photos">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
    <div class="lightbox-stage">
        <button type="button" class="lightbox-prev" aria-label="Previous photo">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        <img alt="">
        <button type="button" class="lightbox-next" aria-label="Next photo">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    </div>`;

const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const lightboxCounter = lightbox.querySelector(".lightbox-counter");

let lightboxItems = [];
let lightboxIndex = 0;
let lightboxOpener = null;

// Every photo has a small copy in a "thumbs" folder next to it
function thumbOf(src) {
    return src.replace(/\/([^/]+)$/, "/thumbs/$1");
}

// Full-size photos already fetched (or on their way)
const lightboxCache = new Map();

function fetchPhoto(src) {
    if (!lightboxCache.has(src)) {
        const photo = new Image();
        photo.decoding = "async";
        photo.src = src;
        lightboxCache.set(src, photo);
    }
    return lightboxCache.get(src);
}

function showLightboxImage(index) {
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    const src = item.dataset.src;
    const full = fetchPhoto(src);

    // Show the small copy straight away, then swap in the sharp one
    if (full.complete && full.naturalWidth) {
        lightboxImage.src = src;
    } else {
        lightboxImage.src = thumbOf(src);
        full.addEventListener("load", () => {
            if (lightboxItems[lightboxIndex] === item) lightboxImage.src = src;
        }, { once: true });
    }

    lightboxImage.alt = item.dataset.caption || "";
    lightboxCaption.textContent = item.dataset.caption || "";
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;

    // Get the photos either side ready, so the next click is instant
    [1, -1, 2].forEach((step) => {
        const next = lightboxItems[(lightboxIndex + step + lightboxItems.length) % lightboxItems.length];
        if (next) fetchPhoto(next.dataset.src);
    });
}

function openLightbox(group, startItem) {
    lightboxItems = Array.from(
        document.querySelectorAll(`[data-lightbox="${group}"]`))
        .filter((item, i, all) =>
            all.findIndex((other) => other.dataset.src === item.dataset.src) === i);

    const start = lightboxItems.findIndex(
        (item) => item.dataset.src === startItem.dataset.src);

    lightboxOpener = startItem;
    showLightboxImage(Math.max(start, 0));

    // A history step for the viewer, so a phone's Back button
    // closes it instead of leaving the page
    if (!lightbox.classList.contains("open")) {
        history.pushState({ lightbox: true }, "");
    }

    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
    lightbox.querySelector(".lightbox-close").focus();
}

function hideLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    document.body.classList.remove("no-scroll");
    if (lightboxOpener) lightboxOpener.focus();
}

// X, Escape or tapping outside: undo the viewer's history step
// (the popstate listener below then hides it)
function closeLightbox() {
    if (history.state && history.state.lightbox) {
        history.back();
    } else {
        hideLightbox();
    }
}

window.addEventListener("popstate", hideLightbox);

// Coming back to the page from the browser's cache: never
// with the viewer still open
window.addEventListener("pageshow", () => {
    hideLightbox();
    if (history.state && history.state.lightbox) {
        history.replaceState(null, "");
    }
});

if (document.querySelector("[data-lightbox]")) {
    document.body.appendChild(lightbox);

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-lightbox]");
        if (!trigger) return;
        event.preventDefault();
        openLightbox(trigger.dataset.lightbox, trigger);
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showLightboxImage(lightboxIndex - 1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => showLightboxImage(lightboxIndex + 1));

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox || event.target.classList.contains("lightbox-stage")) {
            closeLightbox();
        }
    });

    // Swipe on phones
    let touchStartX = null;
    lightbox.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
        if (touchStartX === null) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) showLightboxImage(lightboxIndex + (dx < 0 ? 1 : -1));
        touchStartX = null;
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("open")) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
        if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
    });
}


// ==========================================
// ENQUIRY FORM (IRENE + KAROO PAGES)
// Online, Netlify Forms receives it and emails Donna (until the
// portal is hosted). On this computer it goes to the backend, which
// saves it for the management dashboard (Enquiries) and emails Donna.
// ==========================================
const ENQUIRY_URL = "http://localhost:8080/api/enquiries";
const ENQUIRY_VIA_NETLIFY = window.BARC_PREVIEW;

const contactForm = document.getElementById("contact-form");
const formSuccess = document.getElementById("form-success");

// Netlify can't check the "I'm human" widget, so it isn't shown there
// (Netlify's spam filter and the honeypot protect the form instead)
if (contactForm && ENQUIRY_VIA_NETLIFY) {
    contactForm.querySelector(".cf-turnstile")?.remove();
}

function closeSuccess() {
    formSuccess.classList.remove("open");
    document.body.classList.remove("no-scroll");
}

function showSuccess() {
    formSuccess.classList.add("open");
    document.body.classList.add("no-scroll");
    formSuccess.querySelector("button").focus();
}

function showEnquiryProblem(text) {
    const problem = document.getElementById("form-problem");
    if (!problem) return alert(text);
    problem.textContent = text;
    problem.hidden = false;
    problem.scrollIntoView({ behavior: "smooth", block: "center" });
}

// "I'm human" check: each token works once, so reset after a failed try
function enquiryCaptchaToken() {
    const field = contactForm.querySelector('[name="cf-turnstile-response"]');
    return field ? field.value : "";
}

function resetEnquiryCaptcha() {
    if (window.turnstile && contactForm.querySelector(".cf-turnstile")) window.turnstile.reset();
}

if (contactForm && formSuccess) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!ENQUIRY_VIA_NETLIFY && !enquiryCaptchaToken()) {
            showEnquiryProblem("Please complete the \"I'm human\" check above the button.");
            return;
        }

        const problem = document.getElementById("form-problem");
        if (problem) problem.hidden = true;

        const button = contactForm.querySelector("button[type=submit]");
        const buttonHtml = button.innerHTML;
        button.disabled = true;
        button.textContent = "Sending…";

        const value = (id) => {
            const field = contactForm.querySelector("#" + id);
            return field ? field.value.trim() : "";
        };

        try {
            if (ENQUIRY_VIA_NETLIFY) {
                contactForm.elements.subject.value =
                    "New Barc House enquiry: " + value("name") +
                    " (" + contactForm.elements.residence.value + ")";
            }

            const response = ENQUIRY_VIA_NETLIFY
                ? await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(new FormData(contactForm)).toString()
                })
                : await fetch(ENQUIRY_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: value("name"),
                        email: value("email"),
                        phone: value("phone"),
                        institution: value("institution"),
                        residence: document.body.classList.contains("res-karoo") ? "Karoo" : "Irene",
                        message: value("message"),
                        captchaToken: enquiryCaptchaToken(),
                        website: value("website")
                    })
                });

            if (response.ok) {
                contactForm.reset();
                resetEnquiryCaptcha();
                showSuccess();
            } else {
                const data = await response.json().catch(() => ({}));
                showEnquiryProblem(data.message ||
                    "Your enquiry couldn't be sent. Please try again, or WhatsApp us on 083 443 2592.");
                resetEnquiryCaptcha();
            }
        } catch (error) {
            showEnquiryProblem(
                "Your enquiry couldn't be sent right now. Please WhatsApp us on 083 443 2592.");
            resetEnquiryCaptcha();
        }

        button.disabled = false;
        button.innerHTML = buttonHtml;
    });

    formSuccess.addEventListener("click", (event) => {
        if (event.target === formSuccess || event.target.closest("[data-close]")) {
            closeSuccess();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && formSuccess.classList.contains("open")) {
            closeSuccess();
        }
    });
}


// ==========================================
// REVEAL ON SCROLL
// ==========================================
const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length && "IntersectionObserver" in window) {
    const revealer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px" });

    revealItems.forEach((item) => revealer.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("in"));
}


// ==========================================
// PHOTO SKELETONS
// A photo's frame shimmers until the photo has loaded,
// then the photo fades in (styles in site.css).
// ==========================================
const photoFrames = document.querySelectorAll(
    ".page-hero, .residence-media, .room-media, .thumb-row button, " +
    ".mosaic button, .premises-grid button, .story-photo");

photoFrames.forEach((frame) => {
    const photo = frame.querySelector(":scope > img");
    if (!photo) return;

    frame.classList.add("photo-frame");
    if (photo.complete && photo.naturalWidth) return;

    frame.classList.add("is-loading");
    const done = () => frame.classList.remove("is-loading");
    photo.addEventListener("load", done, { once: true });
    photo.addEventListener("error", done, { once: true });
});


// ==========================================
// FOOTER YEAR
// ==========================================
document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
});
