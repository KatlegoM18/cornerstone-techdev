/* =========================================================
   CORNERSTONE TECHDEV
   SHARED SCRIPTS (every page)
   1. Mobile menu
   2. Scroll reveals
   3. Process pipeline progress
========================================================= */

document.documentElement.classList.add("cs-js");


/* =========================================================
   1. MOBILE MENU
========================================================= */

(() => {

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!menuToggle || !navLinks) {
        return;
    }

    const setOpen = (isOpen) => {
        navLinks.classList.toggle("active", isOpen);
        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    };

    menuToggle.addEventListener("click", () => {
        setOpen(!navLinks.classList.contains("active"));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navLinks.classList.contains("active")) {
            setOpen(false);
            menuToggle.focus();
        }
    });

})();


/* =========================================================
   2. SCROLL REVEALS
   Anything with .reveal fades up the first time it
   scrolls into view. Content is never hidden without JS.
========================================================= */

(() => {

    const items = document.querySelectorAll(".reveal");

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-in"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

    items.forEach((el) => observer.observe(el));

})();


/* =========================================================
   3. PROCESS PIPELINE
   The track fills as the pipeline scrolls through view
   and each stage lights up as the fill reaches it.
========================================================= */

(() => {

    const pipelines = document.querySelectorAll("[data-pipeline]");

    if (!pipelines.length) {
        return;
    }

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
        pipelines.forEach((pipeline) => {
            const stages = Array.from(pipeline.querySelectorAll(".cs-stage"));
            let progress = 1;
            if (!reduceMotion) {
                const rect = pipeline.getBoundingClientRect();
                const view = window.innerHeight;
                progress = (view * 0.85 - rect.top) / (view * 0.55);
            }
            progress = Math.min(1, Math.max(0, progress));
            pipeline.style.setProperty("--progress", progress.toFixed(3));
            stages.forEach((stage, i) => {
                stage.classList.toggle("is-done", progress >= i / Math.max(stages.length - 1, 1) - 0.02);
            });
        });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

})();
