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

function showLightboxImage(index) {
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    lightboxImage.src = item.dataset.src;
    lightboxImage.alt = item.dataset.caption || "";
    lightboxCaption.textContent = item.dataset.caption || "";
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
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
    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
    lightbox.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.classList.remove("no-scroll");
    if (lightboxOpener) lightboxOpener.focus();
}

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
// Note: the message isn't saved or emailed yet —
// see GO-LIVE-CHECKLIST item 1.
// ==========================================
const contactForm = document.getElementById("contact-form");
const formSuccess = document.getElementById("form-success");

function closeSuccess() {
    formSuccess.classList.remove("open");
    document.body.classList.remove("no-scroll");
}

if (contactForm && formSuccess) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Preview mode: the contact form doesn't send yet
        if (window.BARC_PREVIEW) {
            formSuccess.querySelector("h3").textContent =
                "Thank you for your interest!";
            formSuccess.querySelector("p").textContent =
                "Our contact form isn't live yet. Please send us a " +
                "WhatsApp on 083 443 2592 and we'll get back to you.";
        }

        formSuccess.classList.add("open");
        document.body.classList.add("no-scroll");
        formSuccess.querySelector("button").focus();
        contactForm.reset();
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
// FOOTER YEAR
// ==========================================
document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
});
