document.addEventListener("DOMContentLoaded", () => {

    /*
    ==========================================
    LESSON DATA
    ==========================================
    */

    const lessons = {

        foundations: {
            title: "Foundations",
            description:
                "Build a strong foundation in posture, picking, basic chords and the fundamentals every guitarist needs.",
            price: "R450 / MONTH",
            level: "BEGINNER"
        },

        chords: {
            title: "Chords",
            description:
                "Learn the essential chord shapes, transitions and progressions that form the foundation of real songs.",
            price: "R550 / MONTH",
            level: "BEGINNER → INTERMEDIATE"
        },

        rhythm: {
            title: "Rhythm",
            description:
                "Develop your timing, strumming patterns and groove so you can confidently play along with music.",
            price: "R550 / MONTH",
            level: "BEGINNER → INTERMEDIATE"
        },

        scales: {
            title: "Scales",
            description:
                "Learn the essential scales, patterns and techniques that unlock the fretboard and improve your playing.",
            price: "R650 / MONTH",
            level: "INTERMEDIATE"
        },

        lead: {
            title: "Lead Guitar",
            description:
                "Develop lead playing through melodies, phrasing, improvisation and confident movement across the fretboard.",
            price: "R750 / MONTH",
            level: "INTERMEDIATE → ADVANCED"
        },

        advanced: {
            title: "Advanced",
            description:
                "Push your playing further with advanced technique, musicality, improvisation and personalised development.",
            price: "R850 / MONTH",
            level: "ADVANCED"
        }

    };


    /*
    ==========================================
    ELEMENTS
    ==========================================
    */

    const lessonButtons =
        document.querySelectorAll(".lesson-string");

    const lessonTitle =
        document.querySelector("#lesson-title");

    const lessonDescription =
        document.querySelector("#lesson-description");

    const lessonPrice =
        document.querySelector("#lesson-price");

    const lessonLevel =
        document.querySelector("#lesson-level");

    const bookButton =
        document.querySelector("#book-lesson-button");

    const bookingSection =
        document.querySelector("#booking");


    let selectedLesson =
        lessons.foundations;


    /*
    ==========================================
    DISPLAY LESSON
    ==========================================
    */

    function displayLesson(
        lessonId
    ) {

        const lesson =
            lessons[lessonId];

        if (!lesson) {
            return;
        }


        selectedLesson = {
            id: lessonId,
            ...lesson
        };


        lessonButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lesson === lessonId
            );

        });


        if (lessonTitle) {
            lessonTitle.textContent =
                lesson.title;
        }


        if (lessonDescription) {
            lessonDescription.textContent =
                lesson.description;
        }


        if (lessonPrice) {
            lessonPrice.textContent =
                lesson.price;
        }


        if (lessonLevel) {
            lessonLevel.textContent =
                lesson.level;
        }

    }


    /*
    ==========================================
    LESSON SELECTION
    ==========================================
    */

    lessonButtons.forEach(button => {

        button.addEventListener("click", () => {

            displayLesson(
                button.dataset.lesson
            );

        });

    });


    /*
    ==========================================
    FOUNDATIONS DEFAULT
    ==========================================
    */

    displayLesson("foundations");


    /*
    ==========================================
    BOOK THIS PATH
    ==========================================
    */

    if (bookButton) {

        bookButton.addEventListener("click", () => {

            if (
                typeof window.setBookingLesson ===
                "function"
            ) {

                window.setBookingLesson({

                    name:
                        selectedLesson.title,

                    price:
                        selectedLesson.price,

                    description:
                        selectedLesson.description

                });

            }


            if (bookingSection) {

                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    }


    console.log(
        "LESSONS.JS IS RUNNING"
    );

});