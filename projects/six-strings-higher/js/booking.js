document.addEventListener("DOMContentLoaded", () => {

    /*
    ==========================================
    BOOKING FLOW
    ==========================================
    */

    const bookingSection =
        document.querySelector("#booking");

    const bookingDetailsSection =
        document.querySelector("#booking-details");

    const confirmationSection =
        document.querySelector("#confirmation");


    /*
    ==========================================
    BOOKING STATE
    ==========================================
    */

    let selectedLesson = {
        name: "Foundations",
        price: "R450 / MONTH",
        description:
            "Build a strong foundation in posture, picking, basic chords and the fundamentals every guitarist needs."
    };

    let selectedDate = null;
    let selectedTime = null;


    /*
    ==========================================
    CALENDAR STATE
    ==========================================
    */

    const today = new Date();

    let calendarMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


    /*
    ==========================================
    ELEMENTS
    ==========================================
    */

    const calendarGrid =
        document.querySelector(
            "#booking-calendar-grid"
        );

    const calendarMonthLabel =
        document.querySelector(
            "#calendar-month"
        );

    const previousMonthButton =
        document.querySelector(
            "#previous-month"
        );

    const nextMonthButton =
        document.querySelector(
            "#next-month"
        );

    const timeButtons =
        document.querySelectorAll(
            ".booking-times button"
        );

    const continueButton =
        document.querySelector(
            "#continue-booking"
        );

    const bookingLessonTitle =
        document.querySelector(
            "#booking-lesson-title"
        );

    const bookingLessonDescription =
        document.querySelector(
            "#booking-lesson-description"
        );

    const bookingLessonName =
        document.querySelector(
            "#booking-lesson-name"
        );

    const bookingDay =
        document.querySelector(
            "#booking-day"
        );

    const bookingTime =
        document.querySelector(
            "#booking-time"
        );

    const bookingPrice =
        document.querySelector(
            "#booking-price"
        );

    const bookingForm =
        document.querySelector(
            "#booking-form"
        );


    /*
    ==========================================
    CUSTOM BOOKING MODAL
    ==========================================
    */

    const modalStyles = document.createElement("style");

    modalStyles.textContent = `
        .booking-modal {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 30px;

            background: rgba(7, 5, 4, 0.78);

            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);

            opacity: 0;
            visibility: hidden;

            transition:
                opacity 0.35s ease,
                visibility 0.35s ease;
        }

        .booking-modal.active {
            opacity: 1;
            visibility: visible;
        }

        .booking-modal-panel {
            position: relative;

            width: min(460px, 90vw);

            padding: 44px 42px 38px;

            background:
                linear-gradient(
                    145deg,
                    rgba(31, 24, 19, 0.98),
                    rgba(14, 11, 9, 0.98)
                );

            border: 1px solid
                rgba(218, 200, 174, 0.22);

            box-shadow:
                0 35px 100px
                rgba(0, 0, 0, 0.6);

            transform:
                translateY(25px)
                scale(0.97);

            transition:
                transform 0.45s
                cubic-bezier(0.22, 1, 0.36, 1);
        }

        .booking-modal.active
        .booking-modal-panel {
            transform:
                translateY(0)
                scale(1);
        }

        .booking-modal-panel::before {
            content: "";

            position: absolute;

            top: 0;
            left: 0;

            width: 70px;
            height: 1px;

            background:
                var(--cream, #e5d5bd);
        }

        .booking-modal-label {
            margin: 0 0 18px;

            font-family: var(
                --sans,
                Arial,
                sans-serif
            );

            font-size: 9px;
            font-weight: 500;

            letter-spacing: 0.2em;
            text-transform: uppercase;

            color:
                var(
                    --cream-muted,
                    #a89c8d
                );
        }

        .booking-modal-title {
            margin: 0 0 14px;

            font-family: var(
                --serif,
                Georgia,
                serif
            );

            font-size: clamp(
                32px,
                4vw,
                44px
            );

            font-weight: 400;

            line-height: 0.95;
            letter-spacing: -0.03em;

            color:
                var(
                    --cream,
                    #e5d5bd
                );
        }

        .booking-modal-message {
            margin: 0;

            max-width: 370px;

            font-family: var(
                --serif,
                Georgia,
                serif
            );

            font-size: 17px;
            line-height: 1.5;

            color:
                var(
                    --cream-muted,
                    #a89c8d
                );
        }

        .booking-modal-close {
            margin-top: 32px;

            min-width: 130px;

            padding: 14px 22px;

            border: 1px solid
                rgba(218, 200, 174, 0.35);

            background: transparent;

            font-family: var(
                --sans,
                Arial,
                sans-serif
            );

            font-size: 9px;

            letter-spacing: 0.18em;
            text-transform: uppercase;

            color:
                var(
                    --cream,
                    #e5d5bd
                );

            cursor: pointer;

            transition:
                background 0.25s ease,
                color 0.25s ease,
                border-color 0.25s ease;
        }

        .booking-modal-close:hover {
            background:
                var(
                    --cream,
                    #e5d5bd
                );

            color: #0b0908;

            border-color:
                var(
                    --cream,
                    #e5d5bd
                );
        }

        .booking-modal-index {
            position: absolute;

            right: 24px;
            bottom: 20px;

            font-family: var(
                --sans,
                Arial,
                sans-serif
            );

            font-size: 8px;

            letter-spacing: 0.15em;

            color:
                rgba(218, 200, 174, 0.35);
        }

        @media (max-width: 600px) {

            .booking-modal {
                padding: 20px;
            }

            .booking-modal-panel {
                padding: 36px 28px 32px;
            }

            .booking-modal-message {
                font-size: 16px;
            }
        }
    `;

    document.head.appendChild(modalStyles);


    /*
    ==========================================
    CREATE MODAL
    ==========================================
    */

    const bookingModal =
        document.createElement("div");

    bookingModal.className =
        "booking-modal";

    bookingModal.setAttribute(
        "role",
        "dialog"
    );

    bookingModal.setAttribute(
        "aria-modal",
        "true"
    );

    bookingModal.setAttribute(
        "aria-hidden",
        "true"
    );

    bookingModal.innerHTML = `

        <div class="booking-modal-panel">

            <p class="booking-modal-label">
                SIX STRINGS HIGHER
            </p>

            <h3 class="booking-modal-title">
                One more step.
            </h3>

            <p class="booking-modal-message">
                Please select a day and time before continuing.
            </p>

            <button
                type="button"
                class="booking-modal-close"
            >
                CLOSE
            </button>

            <span class="booking-modal-index">
                BOOKING / 04
            </span>

        </div>

    `;

    document.body.appendChild(
        bookingModal
    );


    const bookingModalTitle =
        bookingModal.querySelector(
            ".booking-modal-title"
        );

    const bookingModalMessage =
        bookingModal.querySelector(
            ".booking-modal-message"
        );

    const bookingModalClose =
        bookingModal.querySelector(
            ".booking-modal-close"
        );


    /*
    ==========================================
    OPEN MODAL
    ==========================================
    */

    function showBookingModal(
        title,
        message
    ) {

        bookingModalTitle.textContent =
            title;

        bookingModalMessage.textContent =
            message;

        bookingModal.classList.add(
            "active"
        );

        bookingModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

        setTimeout(() => {
            bookingModalClose.focus();
        }, 100);
    }


    /*
    ==========================================
    CLOSE MODAL
    ==========================================
    */

    function closeBookingModal() {

        bookingModal.classList.remove(
            "active"
        );

        bookingModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";
    }


    bookingModalClose.addEventListener(
        "click",
        closeBookingModal
    );


    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {
                closeBookingModal();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                bookingModal.classList.contains(
                    "active"
                )
            ) {
                closeBookingModal();
            }
        }
    );


    /*
    ==========================================
    UPDATE BOOKING SUMMARY
    ==========================================
    */

    function updateBookingSummary() {

        if (bookingLessonTitle) {

            bookingLessonTitle.textContent =
                selectedLesson.name;
        }

        if (bookingLessonDescription) {

            bookingLessonDescription.textContent =
                selectedLesson.description;
        }

        if (bookingLessonName) {

            bookingLessonName.textContent =
                selectedLesson.name;
        }

        if (bookingPrice) {

            bookingPrice.textContent =
                selectedLesson.price;
        }

        if (bookingDay) {

            bookingDay.textContent =
                selectedDate
                    ? formatSelectedDate(
                        selectedDate
                    )
                    : "SELECT A DAY";
        }

        if (bookingTime) {

            bookingTime.textContent =
                selectedTime ||
                "SELECT A TIME";
        }
    }


    /*
    ==========================================
    RECEIVE SELECTED LESSON
    ==========================================
    */

    window.setBookingLesson =
        function (lesson) {

            if (!lesson) {
                return;
            }

            selectedLesson = {

                name:
                    lesson.name ||
                    "Foundations",

                price:
                    lesson.price ||
                    "R450 / MONTH",

                description:
                    lesson.description ||
                    "Weekly private guitar instruction."
            };


            // Changing lesson resets
            // the booking date and time.

            selectedDate = null;
            selectedTime = null;


            timeButtons.forEach(
                button => {

                    button.classList.remove(
                        "active"
                    );
                }
            );


            updateBookingSummary();


            console.log(
                "Booking lesson:",
                selectedLesson
            );
        };


    /*
    ==========================================
    DATE HELPERS
    ==========================================
    */

    function isSameDate(
        dateA,
        dateB
    ) {

        if (!dateA || !dateB) {
            return false;
        }

        return (

            dateA.getFullYear() ===
                dateB.getFullYear() &&

            dateA.getMonth() ===
                dateB.getMonth() &&

            dateA.getDate() ===
                dateB.getDate()
        );
    }


    function isBeforeToday(
        date
    ) {

        const comparison =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

        const current =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        return comparison < current;
    }


    function formatSelectedDate(
        date
    ) {

        if (!date) {
            return "SELECT A DAY";
        }

        return date
            .toLocaleDateString(
                "en-ZA",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            )
            .toUpperCase();
    }


    /*
    ==========================================
    CALENDAR
    ==========================================
    */

    function renderCalendar() {

        if (
            !calendarGrid ||
            !calendarMonthLabel
        ) {
            return;
        }


        calendarGrid.innerHTML =
            "";


        const year =
            calendarMonth.getFullYear();

        const month =
            calendarMonth.getMonth();


        calendarMonthLabel.textContent =
            calendarMonth.toLocaleDateString(
                "en-ZA",
                {
                    month: "long",
                    year: "numeric"
                }
            ).toUpperCase();


        const firstDay =
            new Date(
                year,
                month,
                1
            );


        // Monday-first calendar.

        const startingDay =
            (firstDay.getDay() + 6) % 7;


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        /*
        ----------------------------------
        EMPTY CELLS
        ----------------------------------
        */

        for (
            let i = 0;
            i < startingDay;
            i++
        ) {

            const emptyCell =
                document.createElement(
                    "div"
                );

            emptyCell.className =
                "calendar-day empty";

            calendarGrid.appendChild(
                emptyCell
            );
        }


        /*
        ----------------------------------
        CREATE DAYS
        ----------------------------------
        */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const dayButton =
                document.createElement(
                    "button"
                );


            dayButton.type =
                "button";

            dayButton.className =
                "calendar-day";

            dayButton.textContent =
                day;


            /*
            PAST DATE
            */

            if (
                isBeforeToday(date)
            ) {

                dayButton.classList.add(
                    "past"
                );

                dayButton.disabled =
                    true;
            }


            /*
            TODAY
            */

            if (
                isSameDate(
                    date,
                    today
                )
            ) {

                dayButton.classList.add(
                    "today"
                );
            }


            /*
            SELECTED DATE
            */

            if (
                isSameDate(
                    date,
                    selectedDate
                )
            ) {

                dayButton.classList.add(
                    "active"
                );
            }


            /*
            CLICK
            */

            dayButton.addEventListener(
                "click",
                () => {

                    selectedDate =
                        date;

                    selectedTime =
                        null;


                    timeButtons.forEach(
                        button => {

                            button.classList.remove(
                                "active"
                            );
                        }
                    );


                    renderCalendar();

                    updateBookingSummary();


                    console.log(
                        "Selected date:",
                        formatSelectedDate(
                            selectedDate
                        )
                    );
                }
            );


            calendarGrid.appendChild(
                dayButton
            );
        }


        /*
        PREVIOUS MONTH
        */

        const currentMonth =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );


        if (
            previousMonthButton
        ) {

            previousMonthButton.disabled =
                calendarMonth <=
                currentMonth;
        }
    }


    /*
    ==========================================
    MONTH NAVIGATION
    ==========================================
    */

    if (
        previousMonthButton
    ) {

        previousMonthButton.addEventListener(
            "click",
            () => {

                calendarMonth.setMonth(
                    calendarMonth.getMonth() - 1
                );

                renderCalendar();
            }
        );
    }


    if (
        nextMonthButton
    ) {

        nextMonthButton.addEventListener(
            "click",
            () => {

                calendarMonth.setMonth(
                    calendarMonth.getMonth() + 1
                );

                renderCalendar();
            }
        );
    }


    /*
    ==========================================
    TIME SELECTION
    ==========================================
    */

    timeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    if (!selectedDate) {

                        showBookingModal(
                            "Choose a day.",
                            "Select a date from the calendar before choosing your lesson time."
                        );

                        return;
                    }


                    timeButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedTime =
                        button.textContent.trim();


                    updateBookingSummary();


                    if (
                        typeof gsap !==
                        "undefined"
                    ) {

                        gsap.fromTo(
                            button,
                            {
                                scale: 0.96
                            },
                            {
                                scale: 1,
                                duration: 0.3,
                                ease: "power2.out"
                            }
                        );
                    }
                }
            );
        }
    );


    /*
    ==========================================
    CONTINUE TO DETAILS
    ==========================================
    */

    if (
        continueButton
    ) {

        continueButton.addEventListener(
            "click",
            () => {

                if (!selectedDate) {

                    showBookingModal(
                        "Choose a day.",
                        "Select a date from the calendar before continuing."
                    );

                    return;
                }


                if (!selectedTime) {

                    showBookingModal(
                        "Choose a time.",
                        "Select an available lesson time before continuing."
                    );

                    return;
                }


                if (
                    bookingDetailsSection
                ) {

                    bookingDetailsSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );
    }


    /*
    ==========================================
    FORM SUBMISSION
    ==========================================
    */

    if (
        bookingForm
    ) {

        bookingForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                /*
                Validate booking date.
                */

                if (!selectedDate) {

                    showBookingModal(
                        "Date required.",
                        "Please select a lesson date before confirming your booking."
                    );

                    return;
                }


                /*
                Validate booking time.
                */

                if (!selectedTime) {

                    showBookingModal(
                        "Time required.",
                        "Please select a lesson time before confirming your booking."
                    );

                    return;
                }


                /*
                Read form fields.
                */

                const name =
                    document
                        .querySelector("#name")
                        ?.value
                        .trim();


                const email =
                    document
                        .querySelector("#email")
                        ?.value
                        .trim();


                const phone =
                    document
                        .querySelector("#phone")
                        ?.value
                        .trim();


                const experience =
                    document
                        .querySelector("#experience")
                        ?.value;


                const message =
                    document
                        .querySelector("#message")
                        ?.value
                        .trim();


                /*
                Validate required fields.
                */

                if (!name || !email) {

                    showBookingModal(
                        "Details required.",
                        "Please enter your full name and email address before confirming your booking."
                    );

                    return;
                }


                /*
                Create booking object.
                */

                const booking = {

                    lesson:
                        selectedLesson.name,

                    price:
                        selectedLesson.price,

                    date:
                        selectedDate,

                    time:
                        selectedTime,

                    name:
                        name,

                    email:
                        email,

                    phone:
                        phone,

                    experience:
                        experience,

                    message:
                        message
                };


                console.log(
                    "BOOKING SUBMITTED:",
                    booking
                );


                updateConfirmation(
                    booking
                );
            }
        );
    }


    /*
    ==========================================
    CONFIRMATION
    ==========================================
    */

    function updateConfirmation(
        booking
    ) {

        const confirmationStamp =
            document.querySelector(
                ".confirmation-stamp"
            );


        if (
            confirmationStamp
        ) {

            confirmationStamp.textContent =
                `${booking.lesson} · ${booking.price}`;
        }


        const confirmationNote =
            document.querySelector(
                ".confirmation-note"
            );


        if (
            confirmationNote
        ) {

            confirmationNote.textContent =
                `${formatSelectedDate(
                    booking.date
                )} · ${booking.time}`;
        }


        if (
            confirmationSection
        ) {

            confirmationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }


        console.log(
            "CONFIRMATION DISPLAYED"
        );
    }


    /*
    ==========================================
    ANIMATIONS
    ==========================================
    */

    function setupBookingAnimations() {

        if (
            typeof gsap === "undefined" ||
            typeof ScrollTrigger === "undefined"
        ) {

            console.warn(
                "GSAP or ScrollTrigger unavailable."
            );

            return;
        }


        gsap.registerPlugin(
            ScrollTrigger
        );


        /*
        ----------------------------------
        SCENE 04
        ----------------------------------
        */

        const bookingIndicator =
            bookingSection?.querySelector(
                ".scene-indicator"
            );

        const bookingIntro =
            bookingSection?.querySelector(
                ".booking-intro .eyebrow"
            );

        const bookingHeading =
            bookingSection?.querySelector(
                ".booking-intro h2"
            );

        const bookingCalendar =
            bookingSection?.querySelector(
                ".booking-calendar"
            );

        const bookingSummary =
            bookingSection?.querySelector(
                ".booking-summary"
            );


        const bookingElements = [
            bookingIndicator,
            bookingIntro,
            bookingHeading,
            bookingCalendar,
            bookingSummary
        ];


        bookingElements.forEach(
            element => {

                if (element) {
                    gsap.set(element, {
                        opacity: 0
                    });
                }
            }
        );


        if (bookingIndicator) {

            gsap.set(
                bookingIndicator,
                {
                    x: -20
                }
            );
        }


        if (bookingIntro) {

            gsap.set(
                bookingIntro,
                {
                    y: 20
                }
            );
        }


        if (bookingHeading) {

            gsap.set(
                bookingHeading,
                {
                    y: 35
                }
            );
        }


        if (bookingCalendar) {

            gsap.set(
                bookingCalendar,
                {
                    x: 60
                }
            );
        }


        if (bookingSummary) {

            gsap.set(
                bookingSummary,
                {
                    y: 25
                }
            );
        }


        const bookingTimeline =
            gsap.timeline({
                scrollTrigger: {
                    trigger:
                        bookingSection,

                    start:
                        "top 70%",

                    toggleActions:
                        "play none none reverse"
                }
            });


        if (bookingIndicator) {

            bookingTimeline.to(
                bookingIndicator,
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.45,
                    ease: "power2.out"
                }
            );
        }


        if (bookingIntro) {

            bookingTimeline.to(
                bookingIntro,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                },
                0.08
            );
        }


        if (bookingHeading) {

            bookingTimeline.to(
                bookingHeading,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    ease: "power3.out"
                },
                0.16
            );
        }


        if (bookingCalendar) {

            bookingTimeline.to(
                bookingCalendar,
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out"
                },
                0.2
            );
        }


        if (bookingSummary) {

            bookingTimeline.to(
                bookingSummary,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    ease: "power2.out"
                },
                0.48
            );
        }


        /*
        ----------------------------------
        SCENE 05
        ----------------------------------
        */

        const detailsEyebrow =
            bookingDetailsSection?.querySelector(
                ".details-content > .eyebrow"
            );

        const detailsHeading =
            bookingDetailsSection?.querySelector(
                ".details-content h2"
            );

        const detailsDescription =
            bookingDetailsSection?.querySelector(
                ".details-content > p"
            );

        const detailsForm =
            bookingDetailsSection?.querySelector(
                "#booking-form"
            );


        [
            detailsEyebrow,
            detailsHeading,
            detailsDescription,
            detailsForm
        ].forEach(
            element => {

                if (element) {

                    gsap.set(
                        element,
                        {
                            opacity: 0
                        }
                    );
                }
            }
        );


        if (detailsEyebrow) {

            gsap.set(
                detailsEyebrow,
                {
                    y: 20
                }
            );
        }


        if (detailsHeading) {

            gsap.set(
                detailsHeading,
                {
                    y: 35
                }
            );
        }


        if (detailsDescription) {

            gsap.set(
                detailsDescription,
                {
                    y: 20
                }
            );
        }


        if (detailsForm) {

            gsap.set(
                detailsForm,
                {
                    y: 35
                }
            );
        }


        const detailsTimeline =
            gsap.timeline({
                scrollTrigger: {
                    trigger:
                        bookingDetailsSection,

                    start:
                        "top 70%",

                    toggleActions:
                        "play none none reverse"
                }
            });


        if (detailsEyebrow) {

            detailsTimeline.to(
                detailsEyebrow,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                }
            );
        }


        if (detailsHeading) {

            detailsTimeline.to(
                detailsHeading,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    ease: "power3.out"
                },
                0.1
            );
        }


        if (detailsDescription) {

            detailsTimeline.to(
                detailsDescription,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "power2.out"
                },
                0.28
            );
        }


        if (detailsForm) {

            detailsTimeline.to(
                detailsForm,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out"
                },
                0.38
            );
        }


        /*
        ----------------------------------
        SCENE 06
        ----------------------------------
        */

        const confirmationEyebrow =
            confirmationSection?.querySelector(
                ".eyebrow"
            );

        const confirmationHeading =
            confirmationSection?.querySelector(
                "h2"
            );

        const confirmationText =
            confirmationSection?.querySelector(
                ":scope > .confirmation-content > p"
            );

        const confirmationStamp =
            confirmationSection?.querySelector(
                ".confirmation-stamp"
            );

        const confirmationNote =
            confirmationSection?.querySelector(
                ".confirmation-note"
            );


        [
            confirmationEyebrow,
            confirmationHeading,
            confirmationText,
            confirmationStamp,
            confirmationNote
        ].forEach(
            element => {

                if (element) {

                    gsap.set(
                        element,
                        {
                            opacity: 0
                        }
                    );
                }
            }
        );


        if (confirmationEyebrow) {

            gsap.set(
                confirmationEyebrow,
                {
                    y: 20
                }
            );
        }


        if (confirmationHeading) {

            gsap.set(
                confirmationHeading,
                {
                    y: 35,
                    scale: 0.97
                }
            );
        }


        if (confirmationText) {

            gsap.set(
                confirmationText,
                {
                    y: 20
                }
            );
        }


        if (confirmationStamp) {

            gsap.set(
                confirmationStamp,
                {
                    y: 20,
                    scale: 0.95
                }
            );
        }


        if (confirmationNote) {

            gsap.set(
                confirmationNote,
                {
                    y: 15
                }
            );
        }


        const confirmationTimeline =
            gsap.timeline({
                scrollTrigger: {
                    trigger:
                        confirmationSection,

                    start:
                        "top 70%",

                    toggleActions:
                        "play none none reverse"
                }
            });


        if (confirmationEyebrow) {

            confirmationTimeline.to(
                confirmationEyebrow,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                }
            );
        }


        if (confirmationHeading) {

            confirmationTimeline.to(
                confirmationHeading,
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power3.out"
                },
                0.1
            );
        }


        if (confirmationText) {

            confirmationTimeline.to(
                confirmationText,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "power2.out"
                },
                0.4
            );
        }


        if (confirmationStamp) {

            confirmationTimeline.to(
                confirmationStamp,
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out"
                },
                0.5
            );
        }


        if (confirmationNote) {

            confirmationTimeline.to(
                confirmationNote,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "power2.out"
                },
                0.65
            );
        }


        ScrollTrigger.refresh();
    }


    /*
    ==========================================
    INITIALISE
    ==========================================
    */

    updateBookingSummary();

    renderCalendar();

    setupBookingAnimations();


    console.log(
        "BOOKING.JS IS RUNNING"
    );

});