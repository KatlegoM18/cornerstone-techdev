/* =========================================================
   CORNERSTONE TECHDEV
   PORTFOLIO CAROUSEL
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const carousel =
            document.getElementById(
                "portfolio-carousel"
            );

        const viewport =
            document.querySelector(
                ".portfolio-carousel-viewport"
            );

        const track =
            document.getElementById(
                "portfolio-carousel-track"
            );

        const indicators =
            document.getElementById(
                "portfolio-carousel-indicators"
            );

        const previousButton =
            document.getElementById(
                "portfolio-carousel-prev"
            );

        const nextButton =
            document.getElementById(
                "portfolio-carousel-next"
            );

        const currentNumber =
            document.getElementById(
                "portfolio-carousel-current"
            );

        const totalNumber =
            document.getElementById(
                "portfolio-carousel-total"
            );


        if (
            !carousel ||
            !viewport ||
            !track
        ) {
            return;
        }


        /* =================================================
           PROJECTS

           Add real completed projects here as the
           CornerStone portfolio grows.
        ================================================= */

        const projects = [

            {
                number: "01",

                category:
                    "STUDENT ACCOMMODATION",

                title:
                    "BARC HOUSE",

                description:
                    "A digital platform created for student accommodation, combining a public-facing website with custom functionality behind the experience.",

                image:
                    "../images/barc-house-preview.jpg",

                imageAlt:
                    "Barc House website preview",

                tags: [
                    "WEB DESIGN",
                    "FRONT-END",
                    "FULL-STACK",
                    "CUSTOM FUNCTIONALITY"
                ],

                link:
                    "../projects/BarcHouse/index.html"
            },


            {
                number: "02",

                category:
                    "PORTFOLIO GROWING",

                title:
                    "MORE WORK",

                description:
                    "New websites and digital solutions will be added here as CornerStone projects are completed.",

                image:
                    null,

                imageAlt:
                    "",

                tags: [
                    "NEW PROJECTS",
                    "COMING SOON"
                ],

                link:
                    null
            }

        ];


        /* =================================================
           STATE
        ================================================= */

        let currentIndex = 0;

        let startX = 0;

        let currentX = 0;

        let isDragging = false;

        let hasMoved = false;

        let startTime = 0;


        /* =================================================
           CREATE PROJECT
        ================================================= */

        function createProject(project) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "portfolio-carousel-card";


            /* ---------------------------------------------
               IMAGE
            --------------------------------------------- */

            const imageContainer =
                document.createElement(
                    "div"
                );

            imageContainer.className =
                "portfolio-carousel-image";


            if (project.image) {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    project.image;

                image.alt =
                    project.imageAlt;

                image.draggable =
                    false;

                imageContainer.appendChild(
                    image
                );

            } else {

                imageContainer.classList.add(
                    "portfolio-carousel-image-empty"
                );


                const emptyContent =
                    document.createElement(
                        "div"
                    );

                emptyContent.className =
                    "portfolio-carousel-empty-content";


                const number =
                    document.createElement(
                        "span"
                    );

                number.textContent =
                    project.number;


                const text =
                    document.createElement(
                        "strong"
                    );

                text.textContent =
                    "MORE TO COME.";


                emptyContent.appendChild(
                    number
                );

                emptyContent.appendChild(
                    text
                );


                imageContainer.appendChild(
                    emptyContent
                );

            }


            /* ---------------------------------------------
               NUMBER
            --------------------------------------------- */

            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "portfolio-carousel-number";

            number.textContent =
                project.number;


            imageContainer.appendChild(
                number
            );


            /* ---------------------------------------------
               CONTENT
            --------------------------------------------- */

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "portfolio-carousel-content";


            const category =
                document.createElement(
                    "p"
                );

            category.className =
                "portfolio-carousel-category";

            category.textContent =
                project.category;


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                project.title;


            const description =
                document.createElement(
                    "p"
                );

            description.className =
                "portfolio-carousel-description";

            description.textContent =
                project.description;


            /* ---------------------------------------------
               TAGS
            --------------------------------------------- */

            const tags =
                document.createElement(
                    "div"
                );

            tags.className =
                "portfolio-carousel-tags";


            project.tags.forEach(
                (tag) => {

                    const tagElement =
                        document.createElement(
                            "span"
                        );

                    tagElement.textContent =
                        tag;

                    tags.appendChild(
                        tagElement
                    );

                }
            );


            /* ---------------------------------------------
               LINK
            --------------------------------------------- */

            if (project.link) {

                const link =
                    document.createElement(
                        "a"
                    );

                link.className =
                    "portfolio-carousel-link";

                link.href =
                    project.link;

                link.innerHTML =
                    `
                        VIEW PROJECT
                        <span>→</span>
                    `;


                content.appendChild(
                    link
                );

            }


            content.prepend(
                tags
            );

            content.prepend(
                description
            );

            content.prepend(
                title
            );

            content.prepend(
                category
            );


            card.appendChild(
                imageContainer
            );

            card.appendChild(
                content
            );


            return card;

        }


        /* =================================================
           RENDER
        ================================================= */

        projects.forEach(
            (project) => {

                track.appendChild(
                    createProject(project)
                );

            }
        );


        /* =================================================
           INDICATORS
        ================================================= */

        if (indicators) {

            projects.forEach(
                (project, index) => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "portfolio-carousel-indicator";


                    button.setAttribute(
                        "aria-label",
                        `Go to project ${index + 1}`
                    );


                    button.addEventListener(
                        "click",
                        () => {

                            goToSlide(index);

                        }
                    );


                    indicators.appendChild(
                        button
                    );

                }
            );

        }


        /* =================================================
           SLIDE WIDTH
        ================================================= */

        function getSlideWidth() {

            const card =
                track.querySelector(
                    ".portfolio-carousel-card"
                );


            if (!card) {
                return 0;
            }


            const styles =
                window.getComputedStyle(
                    track
                );


            const gap =
                parseFloat(
                    styles.gap
                ) || 0;


            return (
                card.offsetWidth +
                gap
            );

        }


        /* =================================================
           UPDATE
        ================================================= */

        function updateCarousel() {

            const width =
                getSlideWidth();


            if (!width) {
                return;
            }


            track.style.transform =
                `translate3d(
                    -${currentIndex * width}px,
                    0,
                    0
                )`;


            /* ---------------------------------------------
               COUNTER
            --------------------------------------------- */

            if (currentNumber) {

                currentNumber.textContent =
                    String(
                        currentIndex + 1
                    ).padStart(
                        2,
                        "0"
                    );

            }


            if (totalNumber) {

                totalNumber.textContent =
                    String(
                        projects.length
                    ).padStart(
                        2,
                        "0"
                    );

            }


            /* ---------------------------------------------
               INDICATORS
            --------------------------------------------- */

            if (indicators) {

                const buttons =
                    indicators.querySelectorAll(
                        "button"
                    );


                buttons.forEach(
                    (button, index) => {

                        const active =
                            index === currentIndex;


                        button.classList.toggle(
                            "active",
                            active
                        );


                        button.setAttribute(
                            "aria-current",
                            active
                                ? "true"
                                : "false"
                        );

                    }
                );

            }


            /* ---------------------------------------------
               BUTTONS
            --------------------------------------------- */

            if (previousButton) {

                previousButton.disabled =
                    currentIndex === 0;

            }


            if (nextButton) {

                nextButton.disabled =
                    currentIndex ===
                    projects.length - 1;

            }

        }


        /* =================================================
           GO TO SLIDE
        ================================================= */

        function goToSlide(index) {

            currentIndex =
                Math.max(
                    0,
                    Math.min(
                        index,
                        projects.length - 1
                    )
                );


            updateCarousel();

        }


        /* =================================================
           NEXT / PREVIOUS
        ================================================= */

        function nextSlide() {

            if (
                currentIndex <
                projects.length - 1
            ) {

                goToSlide(
                    currentIndex + 1
                );

            }

        }


        function previousSlide() {

            if (
                currentIndex > 0
            ) {

                goToSlide(
                    currentIndex - 1
                );

            }

        }


        /* =================================================
           BUTTONS
        ================================================= */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                nextSlide
            );

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                previousSlide
            );

        }


        /* =================================================
           POINTER DOWN
        ================================================= */

        viewport.addEventListener(
            "pointerdown",
            (event) => {

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }


                isDragging =
                    true;

                hasMoved =
                    false;

                startX =
                    event.clientX;

                currentX =
                    event.clientX;

                startTime =
                    Date.now();


                track.classList.add(
                    "is-dragging"
                );


                viewport.setPointerCapture(
                    event.pointerId
                );

            }
        );


        /* =================================================
           POINTER MOVE
        ================================================= */

        viewport.addEventListener(
            "pointermove",
            (event) => {

                if (!isDragging) {
                    return;
                }


                currentX =
                    event.clientX;


                const distance =
                    currentX - startX;


                if (
                    Math.abs(distance) > 5
                ) {

                    hasMoved =
                        true;

                }


                const width =
                    getSlideWidth();


                if (!width) {
                    return;
                }


                const basePosition =
                    -currentIndex * width;


                let dragDistance =
                    distance;


                /*
                 * Resistance at the ends.
                 */

                if (
                    currentIndex === 0 &&
                    distance > 0
                ) {

                    dragDistance =
                        distance * 0.3;

                }


                if (
                    currentIndex ===
                        projects.length - 1 &&
                    distance < 0
                ) {

                    dragDistance =
                        distance * 0.3;

                }


                track.style.transform =
                    `translate3d(
                        ${basePosition + dragDistance}px,
                        0,
                        0
                    )`;

            }
        );


        /* =================================================
           POINTER UP
        ================================================= */

        function finishDrag(event) {

            if (!isDragging) {
                return;
            }


            isDragging =
                false;


            track.classList.remove(
                "is-dragging"
            );


            const distance =
                currentX - startX;


            const elapsed =
                Math.max(
                    1,
                    Date.now() - startTime
                );


            const velocity =
                Math.abs(distance) /
                elapsed;


            const width =
                getSlideWidth();


            try {

                viewport.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {

                /* Pointer may already be released. */

            }


            if (
                !hasMoved ||
                !width
            ) {

                updateCarousel();

                return;

            }


            const threshold =
                width * 0.18;


            const fastSwipe =
                velocity > 0.5;


            if (
                distance < -threshold ||
                (
                    distance < -50 &&
                    fastSwipe
                )
            ) {

                nextSlide();

            } else if (
                distance > threshold ||
                (
                    distance > 50 &&
                    fastSwipe
                )
            ) {

                previousSlide();

            } else {

                updateCarousel();

            }

        }


        viewport.addEventListener(
            "pointerup",
            finishDrag
        );


        viewport.addEventListener(
            "pointercancel",
            finishDrag
        );


        /* =================================================
           STOP ACCIDENTAL LINK CLICKS AFTER DRAG
        ================================================= */

        viewport.addEventListener(
            "click",
            (event) => {

                if (hasMoved) {

                    event.preventDefault();

                    event.stopPropagation();

                    hasMoved =
                        false;

                }

            },
            true
        );


        /* =================================================
           KEYBOARD
        ================================================= */

        document.addEventListener(
            "keydown",
            (event) => {

                const active =
                    document.activeElement;


                if (
                    active &&
                    (
                        active.tagName ===
                            "INPUT" ||
                        active.tagName ===
                            "TEXTAREA" ||
                        active.tagName ===
                            "SELECT"
                    )
                ) {

                    return;

                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    nextSlide();

                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    previousSlide();

                }

            }
        );


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                updateCarousel();

            }
        );


        /* =================================================
           INITIALISE
        ================================================= */

        updateCarousel();

    }
);