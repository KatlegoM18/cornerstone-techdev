document.addEventListener("DOMContentLoaded", () => {

    // Make sure GSAP and ScrollTrigger are available
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.error("GSAP or ScrollTrigger failed to load.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);


    /*
    ==========================================
    SCENE ELEMENTS
    ==========================================
    */

    const teacherSection = document.querySelector("#teacher");

    const teacherIndicator =
        document.querySelector(".teacher-indicator");

    const teacherContent =
        document.querySelector(".teacher-content");

    const teacherImage =
        document.querySelector(".teacher-image");

    const teacherEyebrow =
        document.querySelector(".teacher-content .eyebrow");

    const teacherHeading =
        document.querySelector(".teacher-content h2");

    const teacherDescription =
        document.querySelector(".teacher-description");

    const teacherCta =
        document.querySelector(".teacher-cta");


    // Stop if the section doesn't exist
    if (!teacherSection) {
        console.warn("Teacher section not found.");
        return;
    }


    /*
    ==========================================
    INITIAL STATES
    ==========================================
    */

    gsap.set(teacherIndicator, {
        opacity: 0,
        x: -20
    });

    gsap.set(teacherImage, {
        opacity: 0,
        x: 100
    });

    gsap.set(teacherEyebrow, {
        opacity: 0,
        y: 20
    });

    gsap.set(teacherHeading, {
        opacity: 0,
        y: 30
    });

    gsap.set(teacherDescription, {
        opacity: 0,
        y: 20
    });

    gsap.set(teacherCta, {
        opacity: 0,
        y: 20
    });


    /*
    ==========================================
    SCENE 02 ENTRANCE
    ==========================================
    */

    const teacherTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: teacherSection,
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });


    /*
    ------------------------------------------
    PHASE 1
    Scene indicator
    ------------------------------------------
    */

    teacherTimeline.to(teacherIndicator, {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: "power2.out"
    });


    /*
    ------------------------------------------
    PHASE 2
    Teacher image
    ------------------------------------------
    */

    teacherTimeline.to(teacherImage, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out"
    }, 0.05);


    /*
    ------------------------------------------
    PHASE 3
    Eyebrow
    ------------------------------------------
    */

    teacherTimeline.to(teacherEyebrow, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out"
    }, 0.18);


    /*
    ------------------------------------------
    PHASE 4
    Main heading
    ------------------------------------------
    */

    teacherTimeline.to(teacherHeading, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out"
    }, 0.28);


    /*
    ------------------------------------------
    PHASE 5
    Description
    ------------------------------------------
    */

    teacherTimeline.to(teacherDescription, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
    }, 0.48);


    /*
    ------------------------------------------
    PHASE 6
    CTA
    ------------------------------------------
    */

    teacherTimeline.to(teacherCta, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
    }, 0.62);


    /*
    ==========================================
    LEARN HOW TO PLAY BUTTON
    ==========================================
    */

    const learnButton =
        document.querySelector("#learn-button");

    if (learnButton) {

        learnButton.addEventListener("click", () => {

            teacherSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    }


    /*
    ==========================================
    EXPLORE LESSONS BUTTON
    ==========================================
    */

    const exploreLessonsButton =
        document.querySelector("#explore-lessons-button");

    const lessonsSection =
        document.querySelector("#lessons");

    if (exploreLessonsButton && lessonsSection) {

        exploreLessonsButton.addEventListener("click", () => {

            lessonsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    }


    /*
    ==========================================
    REFRESH SCROLLTRIGGER
    ==========================================
    */

    ScrollTrigger.refresh();

});