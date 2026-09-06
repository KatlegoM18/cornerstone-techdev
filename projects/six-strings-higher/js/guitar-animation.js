document.addEventListener("DOMContentLoaded", () => {

    // Make sure GSAP and ScrollTrigger loaded correctly
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.error("GSAP or ScrollTrigger failed to load.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);


    /*
    ==========================================
    ELEMENTS
    ==========================================
    */

    const hero = document.querySelector("#hero");
    const guitar = document.querySelector(".guitar-assembly");
    const neck = document.querySelector(".guitar-neck");
    const heroContent = document.querySelector(".hero-content");
    const heroCta = document.querySelector(".hero-cta");

    const technicalNotes = hero.querySelectorAll(
        ".technical-note, .technical-label, .tech-label"
    );

    const scrollPrompt = document.querySelector(".scroll-prompt");


    /*
    ==========================================
    SAFETY CHECK
    ==========================================
    */

    if (!hero || !guitar || !neck) {

        console.warn("Hero animation elements not found.");

        return;

    }


    /*
    ==========================================
    HERO SCROLL SEQUENCE
    ==========================================
    */

    const heroTimeline = gsap.timeline({

        scrollTrigger: {

            trigger: hero,

            start: "top top",

            end: "+=2200",

            scrub: 1,

            pin: true,

            anticipatePin: 1

        }

    });


    /*
    ------------------------------------------
    PHASE 1
    Hero typography disappears
    ------------------------------------------
    */

    heroTimeline.to(heroContent, {

        opacity: 0,

        x: -80,

        duration: 0.22,

        ease: "power2.out"

    }, 0);


    /*
    ------------------------------------------
    PHASE 2
    Technical annotations disappear
    ------------------------------------------
    */

    heroTimeline.to(technicalNotes, {

        opacity: 0,

        x: 30,

        stagger: 0.03,

        duration: 0.18,

        ease: "power2.out"

    }, 0.04);


    /*
    ------------------------------------------
    PHASE 3
    Scroll prompt disappears
    ------------------------------------------
    */

    heroTimeline.to(scrollPrompt, {

        opacity: 0,

        y: 20,

        duration: 0.12,

        ease: "power2.out"

    }, 0);


    /*
    ------------------------------------------
    PHASE 4
    Guitar moves toward centre
    ------------------------------------------
    */

    heroTimeline.to(guitar, {

        left: "50%",

        top: "50%",

        scale: 0.72,

        rotation: -2,

        duration: 0.42,

        ease: "power2.inOut"

    }, 0.12);


    /*
    ------------------------------------------
    PHASE 5
    Guitar becomes slightly smaller
    ------------------------------------------
    */

    heroTimeline.to(guitar, {

        top: "46%",

        scale: 0.64,

        rotation: 1,

        duration: 0.28,

        ease: "power2.inOut"

    }, 0.54);


    /*
    ------------------------------------------
    PHASE 6
    NECK SEPARATES
    ------------------------------------------
    */

    heroTimeline.to(neck, {

        y: -220,

        duration: 0.25,

        ease: "power2.inOut"

    }, 0.54);


    /*
    ------------------------------------------
    PHASE 7
    NECK EXITS COMPLETELY
    ------------------------------------------
    */

    heroTimeline.to(neck, {

        y: -700,

        opacity: 0,

        duration: 0.28,

        ease: "power3.in"

    }, 0.79);


    /*
    ------------------------------------------
    PHASE 8
    BODY SETTLES
    ------------------------------------------
    */

    heroTimeline.to(guitar, {

        scale: 0.68,

        y: -20,

        rotation: 0,

        duration: 0.22,

        ease: "power2.inOut"

    }, 0.82);


    /*
    ------------------------------------------
    PHASE 9
    HOLD THE BODY
    ------------------------------------------
    */

    heroTimeline.to(guitar, {

        scale: 0.68,

        y: -20,

        duration: 0.18,

        ease: "none"

    }, 0.94);


    /*
    ------------------------------------------
    PHASE 10
    CTA REVEALS
    ------------------------------------------
    */

    if (heroCta) {

        heroTimeline.to(heroCta, {

            opacity: 1,

            y: 0,

            duration: 0.20,

            ease: "power2.out"

        }, 0.96);

    }


    /*
    ==========================================
    REFRESH SCROLLTRIGGER
    ==========================================
    */

    ScrollTrigger.refresh();

});