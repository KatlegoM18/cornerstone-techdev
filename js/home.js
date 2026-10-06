/* =========================================================
   CORNERSTONE TECHDEV
   HOMEPAGE SCRIPTS
   1. Build viewer (blueprint ↔ live)
   2. Three layers (services ↔ stacked slabs)
   3. Start picker (closing CTA)
========================================================= */

const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================================
   1. BUILD VIEWER
   The live screens are in the HTML. Here they are cloned
   into the blueprint layer, which CSS draws as a wireframe
   and clips to the left of the divider.
========================================================= */

(() => {

    const viewer = document.querySelector("[data-bv]");

    if (!viewer) {
        return;
    }

    const body = viewer.querySelector(".bv-body");
    const live = viewer.querySelector("[data-bv-live]");
    const wire = viewer.querySelector("[data-bv-wire]");
    const handle = viewer.querySelector("[data-bv-handle]");
    const urlText = viewer.querySelector("[data-bv-url]");
    const tabs = Array.from(viewer.querySelectorAll("[role=tab]"));

    // blueprint copy of every screen
    live.querySelectorAll(".bv-screen").forEach((screen) => {
        wire.appendChild(screen.cloneNode(true));
    });

    const screens = (name) =>
        viewer.querySelectorAll(`.bv-screen[data-screen="${name}"]`);


    /* ---------- divider ---------- */

    let split = 50;

    const setSplit = (value) => {
        split = Math.min(100, Math.max(0, value));
        body.style.setProperty("--split", `${split}%`);
        handle.setAttribute("aria-valuenow", String(Math.round(split)));
        handle.setAttribute("aria-valuetext", `${Math.round(split)}% blueprint`);
        body.toggleAttribute("data-split-low", split < 14);
        body.toggleAttribute("data-split-high", split > 86);
    };

    let touched = false;
    const stopAuto = () => { touched = true; };

    const fromPointer = (event) => {
        const rect = body.getBoundingClientRect();
        setSplit(((event.clientX - rect.left) / rect.width) * 100);
    };

    body.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        stopAuto();
        body.setPointerCapture(event.pointerId);
        body.classList.add("is-dragging");
        fromPointer(event);
    });

    body.addEventListener("pointermove", (event) => {
        if (body.classList.contains("is-dragging")) {
            fromPointer(event);
        }
    });

    const endDrag = () => body.classList.remove("is-dragging");
    body.addEventListener("pointerup", endDrag);
    body.addEventListener("pointercancel", endDrag);

    handle.addEventListener("keydown", (event) => {
        const steps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 };
        if (event.key in steps) {
            setSplit(split + steps[event.key]);
        } else if (event.key === "Home") {
            setSplit(0);
        } else if (event.key === "End") {
            setSplit(100);
        } else {
            return;
        }
        event.preventDefault();
        stopAuto();
    });


    /* ---------- tabs ---------- */

    let current = "site";

    const show = (name) => {
        current = name;
        viewer.querySelectorAll(".bv-screen").forEach((screen) => {
            screen.classList.toggle("is-active", screen.dataset.screen === name);
        });
        const first = screens(name)[0];
        urlText.textContent = first.dataset.url;
        tabs.forEach((tab) => {
            const on = tab.dataset.screen === name;
            tab.setAttribute("aria-selected", String(on));
            tab.tabIndex = on ? 0 : -1;
            if (on) {
                body.setAttribute("aria-labelledby", tab.id);
            }
        });
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            stopAuto();
            show(tab.dataset.screen);
        });
        tab.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
            }
            event.preventDefault();
            const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
            stopAuto();
            show(next.dataset.screen);
            next.focus();
        });
    });

    show(current);


    /* ---------- intro sweep + gentle autoplay ---------- */

    if (reduceMotion) {
        setSplit(50);
        return;
    }

    const sweep = (from, to, duration) => new Promise((resolve) => {
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const frame = (now) => {
            if (touched) {
                resolve();
                return;
            }
            const t = Math.min((now - start) / duration, 1);
            setSplit(from + (to - from) * ease(t));
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(frame);
    });

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const order = tabs.map((tab) => tab.dataset.screen);
    let visible = false;

    const loop = async () => {
        setSplit(100);
        await wait(500);
        await sweep(100, 48, 1600);

        // until someone touches it, show each screen being "built"
        while (!touched) {
            await wait(4200);
            if (touched) break;
            if (!visible) continue;
            await sweep(split, 100, 700);
            if (touched) break;
            show(order[(order.indexOf(current) + 1) % order.length]);
            await wait(250);
            await sweep(100, 48, 1300);
        }
    };

    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
    }, { threshold: 0.3 }).observe(viewer);

    setSplit(100);
    loop();

})();


/* =========================================================
   2. THREE LAYERS
   Hovering or focusing a service lifts its slab.
========================================================= */

(() => {

    const root = document.querySelector("[data-layers]");

    if (!root) {
        return;
    }

    const wrap = root.querySelector(".cs-iso-wrap");
    const slabs = Array.from(root.querySelectorAll(".cs-slab"));
    const services = root.querySelectorAll(".cs-service");

    // Text on a tilted plane is hard to read, so each slab gets a flat
    // label pinned to its right-hand corner.
    const labels = slabs.map((slab) => {
        const label = document.createElement("span");
        label.className = "cs-slab-label";
        label.textContent = slab.querySelector("span").textContent;
        wrap.appendChild(label);
        return label;
    });

    const placeLabels = () => {
        const box = wrap.getBoundingClientRect();
        slabs.forEach((slab, i) => {
            const rect = slab.getBoundingClientRect();
            labels[i].style.left = `${rect.right - box.left}px`;
            labels[i].style.top = `${rect.top + rect.height / 2 - box.top}px`;
            labels[i].classList.toggle("is-active", slab.classList.contains("is-active"));
        });
    };

    const activate = (layer) => {
        // layers above the active one lift away so it can be seen
        const activeZ = Number(slabs.find((s) => s.dataset.layer === layer).style.getPropertyValue("--z"));
        slabs.forEach((slab) => {
            slab.classList.toggle("is-active", slab.dataset.layer === layer);
            slab.style.setProperty("--lift", Number(slab.style.getPropertyValue("--z")) > activeZ ? 1 : 0);
        });
        services.forEach((item) => item.classList.toggle("is-active", item.dataset.layer === layer));
        placeLabels();
    };

    // slabs move with a transition, so settle the labels once they stop
    slabs.forEach((slab) => slab.addEventListener("transitionend", placeLabels));
    window.addEventListener("resize", placeLabels);
    placeLabels();

    services.forEach((item) => {
        item.addEventListener("pointerenter", () => activate(item.dataset.layer));
        item.addEventListener("focus", () => activate(item.dataset.layer));
    });

})();


/* =========================================================
   3. START PICKER (CLOSING CTA)
   Picking what you're building rewrites the WhatsApp
   message and points "Start a project" at the contact form
   with that service pre-selected. Without JavaScript the
   links still work with the "New website" defaults.
========================================================= */

(() => {

    const picker = document.querySelector("[data-start]");

    if (!picker) {
        return;
    }

    const chips = Array.from(picker.querySelectorAll(".cs-chip"));
    const msgBox = picker.querySelector(".cs-start-msg");
    const msgText = picker.querySelector("[data-start-msg]");
    const waLink = picker.querySelector("[data-start-wa]");
    const formLink = picker.querySelector("[data-start-form]");

    const WHATSAPP = "https://wa.me/27813694172";
    const CONTACT = "pages/contact.html";

    const messageFor = (label) => label
        ? `Hi CornerStone, I'm looking for ${label}. Can we chat?`
        : "Hi CornerStone, I have an idea and I'd like help working out what to build.";

    let swapTimer = null;

    const select = (chip) => {

        chips.forEach((c) => {
            c.setAttribute("aria-pressed", String(c === chip));
        });

        const message = messageFor(chip.dataset.label);

        waLink.href = `${WHATSAPP}?text=${encodeURIComponent(message)}`;
        formLink.href = `${CONTACT}?project=${encodeURIComponent(chip.dataset.project)}`;

        if (reduceMotion) {
            msgText.textContent = message;
            return;
        }

        // Brief blur so the old and new message read as one change.
        clearTimeout(swapTimer);
        msgBox.classList.add("is-swapping");

        swapTimer = setTimeout(() => {
            msgText.textContent = message;
            msgBox.classList.remove("is-swapping");
        }, 120);
    };

    chips.forEach((chip) => {
        chip.addEventListener("click", () => select(chip));
    });

})();
