/* =========================================
   SIX STRINGS HIGHER
   HOW IT WORKS: a fretboard that slides sideways
   as you scroll. Each step sits in its own fret
   space; as it reaches the middle its inlay
   lights, the strings shimmer and (sound on)
   a note rises.
========================================= */

(() => {

    const section = document.querySelector(".how");
    const viewport = section?.querySelector(".fret-viewport");
    const track = section?.querySelector(".fret-track");
    const steps = section ? [...section.querySelectorAll(".fret-step")] : [];
    if (!section || !track || !steps.length || typeof gsap === "undefined") return;

    if (window.SSH?.reducedMotion) {
        section.classList.add("is-static");
        steps.forEach((s) => s.classList.add("is-active"));
        return;
    }

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    let active = -1;

    function setActive(i) {
        if (i === active) return;
        active = i;
        steps.forEach((s, k) => {
            s.classList.toggle("is-active", k === i);
            s.classList.toggle("is-past", k < i);
        });
        section.classList.remove("is-shimmer");
        void section.offsetWidth;                 // restart the shimmer
        section.classList.add("is-shimmer");
        if (i >= 0) SSH.audio?.pluckString(Math.min(5, i + 1), 0.22);
    }

    // the step closest to the middle of the screen is active (checked as the
    // track moves, so it follows the smoothed position, not the raw scroll)
    function pickActive() {
        const mid = window.innerWidth / 2;
        let best = 0;
        let bestD = Infinity;
        steps.forEach((s, k) => {
            const r = s.getBoundingClientRect();
            const d = Math.abs(r.left + r.width / 2 - mid);
            if (d < bestD) { bestD = d; best = k; }
        });
        setActive(bestD > window.innerWidth * 0.35 ? -1 : best);
    }

    gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        onUpdate: pickActive,
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + distance() * 1.15,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    // the cards tilt slightly with scroll speed, like they have weight
    const skewTo = gsap.quickTo(steps, "skewX", { duration: 0.5, ease: "power3.out" });
    ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / -500))
    });
    ScrollTrigger.addEventListener("scrollEnd", () => skewTo(0));

})();
