/* =========================================================
   CORNERSTONE TECHDEV
   HOMEPAGE SCRIPTS
   1. Hero code editor typing animation
   2. Start picker (closing CTA)
========================================================= */


/* =========================================================
   1. HERO CODE EDITOR TYPING ANIMATION
   The full code is already in the HTML (so it shows with
   JavaScript off or reduced motion). This script hides the
   lines and reveals them one by one, then loops.
========================================================= */

(() => {

    const editor = document.querySelector("[data-typing]");

    if (!editor) {
        return;
    }

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lines = Array.from(
        editor.querySelectorAll(".ht-line, .ht-out")
    );

    const caret = document.createElement("span");
    caret.className = "ht-caret";
    caret.setAttribute("aria-hidden", "true");

    const placeCaret = (line) => {
        const target = line.querySelector(".ht-src") || line;
        target.appendChild(caret);
    };

    if (reduceMotion || lines.length === 0) {
        // Show everything, park the caret on the last code line.
        const codeLines = editor.querySelectorAll(".ht-line");
        if (codeLines.length) {
            placeCaret(codeLines[codeLines.length - 1]);
        }
        return;
    }

    let index = 0;
    let timer = null;

    const step = () => {

        if (index === 0) {
            lines.forEach((line) => {
                line.hidden = true;
            });
        }

        if (index < lines.length) {

            const line = lines[index];
            line.hidden = false;
            placeCaret(line);

            index += 1;

            const isOutput = line.classList.contains("ht-out");
            timer = setTimeout(step, isOutput ? 650 : 300);

            return;
        }

        // Finished: hold the result on screen, then start over.
        index = 0;
        timer = setTimeout(step, 4500);
    };


    // Only animate while the editor is on screen.

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && timer === null) {
                    step();
                } else if (!entry.isIntersecting && timer !== null) {
                    clearTimeout(timer);
                    timer = null;
                    index = 0;
                    lines.forEach((line) => {
                        line.hidden = false;
                    });
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(editor);

})();


/* =========================================================
   2. START PICKER (CLOSING CTA)
   Picking what you're building rewrites the WhatsApp
   message and points "Start A Project" at the contact form
   with that service pre-selected. Without JavaScript the
   links still work with the "New website" defaults.
========================================================= */

(() => {

    const picker = document.querySelector(".ht-start");

    if (!picker) {
        return;
    }

    const chips = Array.from(picker.querySelectorAll(".ht-chip"));
    const msgBox = picker.querySelector(".ht-start-msg");
    const msgText = picker.querySelector("[data-start-msg]");
    const waLink = picker.querySelector("[data-start-wa]");
    const formLink = picker.querySelector("[data-start-form]");

    const WHATSAPP = "https://wa.me/27813694172";
    const CONTACT = "pages/contact.html";

    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
