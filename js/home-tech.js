/* =========================================================
   CORNERSTONE TECHDEV
   HOMEPAGE — HERO CODE EDITOR TYPING ANIMATION
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
