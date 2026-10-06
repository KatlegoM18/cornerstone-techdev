/* =========================================
   SIX STRINGS HIGHER
   BOOKING: three steps
   1. path, day and time
   2. your details
   3. confirmed (concept: nothing is sent)
========================================= */

(() => {

    const card = document.querySelector(".book-card");
    if (!card || !window.SSH) return;

    const $ = (sel) => card.querySelector(sel);
    const panes = [...card.querySelectorAll(".book-pane")];
    const progressItems = [...card.querySelectorAll(".book-progress li")];
    const chipsBox = $("[data-path-chips]");
    const grid = $("[data-cal-grid]");
    const monthLabel = card.querySelector("#cal-month");
    const timesBox = $("[data-times]");
    const form = $("#book-form");

    const state = { path: SSH.selectedPath, date: null, time: null, step: 1 };

    const fmtDay = (d) => d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });


    /* -----------------------------------------
       SUMMARY
    ----------------------------------------- */

    function setText(sel, text) {
        const node = $(sel);
        if (!node || node.textContent === text) return;
        node.textContent = text;
        if (!SSH.reducedMotion && typeof gsap !== "undefined") {
            gsap.fromTo(node, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
        }
    }

    function renderSummary() {
        const p = SSH.paths[state.path];
        setText("[data-sum-title]", p.title);
        setText("[data-sum-level]", p.level);
        setText("[data-sum-price]", p.price);
        setText("[data-sum-day]", state.date ? fmtDay(state.date) : "Choose a day");
        setText("[data-sum-time]", state.time || "Choose a time");
    }


    /* -----------------------------------------
       PATH CHIPS (kept in sync with the strings)
    ----------------------------------------- */

    chipsBox.innerHTML = SSH.pathOrder.map((id, i) =>
        `<button type="button" class="chip" data-path="${id}" aria-pressed="false"><span>0${i + 1}</span>${SSH.paths[id].title}</button>`
    ).join("");

    function setPath(id, fromStrings = false) {
        if (!SSH.paths[id]) return;
        state.path = id;
        chipsBox.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.path === id)));
        renderSummary();
        if (!fromStrings) document.dispatchEvent(new CustomEvent("ssh:path-set", { detail: id }));
    }

    chipsBox.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        setPath(chip.dataset.path);
        SSH.audio?.pluckString(SSH.pathOrder.indexOf(chip.dataset.path), 0.3);
    });

    document.addEventListener("ssh:path", (e) => setPath(e.detail, true));


    /* -----------------------------------------
       CALENDAR
       Monday to Saturday, from tomorrow, for the
       next ten weeks. A few slots each day are
       already taken (the same ones every visit).
    ----------------------------------------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const first = new Date(today);
    first.setDate(first.getDate() + 1);
    const last = new Date(today);
    last.setDate(last.getDate() + 70);

    let view = new Date(first.getFullYear(), first.getMonth(), 1);

    const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
    const open = (d) => d >= first && d <= last && d.getDay() !== 0;

    function renderCalendar() {
        monthLabel.textContent = view.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
        const startOffset = (view.getDay() + 6) % 7;           // Monday first
        const daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        let html = "";
        for (let i = 0; i < startOffset; i++) html += `<span class="cal-pad"></span>`;
        for (let day = 1; day <= daysIn; day++) {
            const d = new Date(view.getFullYear(), view.getMonth(), day);
            const ok = open(d);
            const on = sameDay(d, state.date);
            html += `<button type="button" class="cal-day${on ? " is-on" : ""}" data-day="${day}" ${ok ? "" : "disabled"} aria-pressed="${on}" aria-label="${fmtDay(d)}${ok ? "" : ", unavailable"}">${day}</button>`;
        }
        grid.innerHTML = html;
        card.querySelector('[data-cal="-1"]').disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
        card.querySelector('[data-cal="1"]').disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
        if (!SSH.reducedMotion && typeof gsap !== "undefined") {
            gsap.fromTo(grid.querySelectorAll(".cal-day"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.008, ease: "power2.out" });
        }
    }

    card.querySelectorAll("[data-cal]").forEach((btn) => btn.addEventListener("click", () => {
        view = new Date(view.getFullYear(), view.getMonth() + Number(btn.dataset.cal), 1);
        renderCalendar();
    }));

    grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".cal-day");
        if (!btn || btn.disabled) return;
        state.date = new Date(view.getFullYear(), view.getMonth(), Number(btn.dataset.day));
        grid.querySelectorAll(".cal-day").forEach((b) => {
            const on = b === btn;
            b.classList.toggle("is-on", on);
            b.setAttribute("aria-pressed", String(on));
        });
        renderTimes();
        renderSummary();
        note(1, "");
    });


    /* -----------------------------------------
       TIMES
    ----------------------------------------- */

    const timeButtons = [...timesBox.querySelectorAll("button")];

    function taken(date, index) {
        if (!date) return false;
        const seed = date.getDate() * 7 + date.getMonth() * 13 + index * 31;
        return seed % 5 === 0 || (date.getDay() === 6 && index > 3);
    }

    function renderTimes() {
        timeButtons.forEach((b, i) => {
            const t = taken(state.date, i);
            b.disabled = t;
            b.classList.toggle("is-taken", t);
            if (t && state.time === b.textContent.trim()) state.time = null;
            b.setAttribute("aria-pressed", String(state.time === b.textContent.trim()));
            b.setAttribute("aria-label", b.textContent.trim() + (t ? ", taken" : ""));
        });
    }

    timesBox.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn || btn.disabled) return;
        state.time = btn.textContent.trim();
        timeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        renderSummary();
        note(1, "");
    });


    /* -----------------------------------------
       STEPS
    ----------------------------------------- */

    function note(n, text) {
        const node = $(`[data-note-${n}]`);
        if (node) node.textContent = text;
    }

    function go(step) {
        const from = panes[state.step - 1];
        const to = panes[step - 1];
        const forward = step > state.step;
        state.step = step;
        progressItems.forEach((li, i) => {
            li.classList.toggle("is-current", i === step - 1);
            li.classList.toggle("is-done", i < step - 1);
        });
        card.classList.toggle("is-done", step === 3);

        const swap = () => {
            panes.forEach((p) => p.classList.toggle("is-active", p === to));
            const focusable = step === 3 ? to : to.querySelector("input, button");
            focusable?.focus({ preventScroll: true });
        };

        if (SSH.reducedMotion || typeof gsap === "undefined") {
            swap();
            return;
        }
        gsap.timeline()
            .to(from, { opacity: 0, x: forward ? -40 : 40, duration: 0.3, ease: "power2.in" })
            .add(swap)
            .fromTo(to, { opacity: 0, x: forward ? 40 : -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" })
            .add(() => ScrollTrigger?.refresh());
    }

    $("[data-next]").addEventListener("click", () => {
        if (!state.date || !state.time) {
            note(1, !state.date ? "Choose a day first." : "Now choose a time.");
            return;
        }
        go(2);
    });

    $("[data-back]").addEventListener("click", () => go(1));

    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = form.elements.name;
        const email = form.elements.email;
        const badName = !name.value.trim();
        const badEmail = !EMAIL.test(email.value.trim());
        name.setAttribute("aria-invalid", String(badName));
        email.setAttribute("aria-invalid", String(badEmail));
        if (badName || badEmail) {
            note(2, badName ? "Please add your name." : "Please add a valid email.");
            (badName ? name : email).focus();
            return;
        }
        note(2, "");

        const p = SSH.paths[state.path];
        $("[data-done-name]").textContent = name.value.trim().split(" ")[0];
        $("[data-done-text]").textContent =
            `${p.title}, ${fmtDay(state.date)} at ${state.time}. Your teacher would confirm by email at ${email.value.trim()}.`;

        go(3);
        SSH.audio?.strum(true, 0.5);
        const mark = $(".done-mark path");
        if (mark && !SSH.reducedMotion && typeof gsap !== "undefined") {
            const len = mark.getTotalLength();
            gsap.fromTo(mark, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, delay: 0.4, ease: "power2.inOut" });
        }
    });

    $("[data-restart]").addEventListener("click", () => {
        form.reset();
        state.date = null;
        state.time = null;
        renderCalendar();
        renderTimes();
        renderSummary();
        go(1);
    });


    /* -----------------------------------------
       START
    ----------------------------------------- */

    setPath(state.path, true);
    renderCalendar();
    renderTimes();
    renderSummary();

})();
