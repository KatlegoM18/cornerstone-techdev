/* ==================================================
   CORNERSTONE TECHDEV
   PORTFOLIO FOLDER
   VANILLA JAVASCRIPT
================================================== */


/* ==================================================
   CONFIGURATION
================================================== */

const FOLDER_COLOR = "#C88A3D";

const PAPER_MAGNET_STRENGTH = 0.15;


/* ==================================================
   DARKEN COLOR
================================================== */

function darkenColor(hex, percent) {

    let color =
        hex.startsWith("#")
            ? hex.slice(1)
            : hex;


    if (color.length === 3) {

        color =
            color
                .split("")
                .map(
                    (character) =>
                        character + character
                )
                .join("");

    }


    const number =
        parseInt(
            color.slice(0, 6),
            16
        );


    let red =
        (number >> 16) & 255;

    let green =
        (number >> 8) & 255;

    let blue =
        number & 255;


    red =
        Math.max(
            0,
            Math.min(
                255,
                Math.floor(
                    red * (1 - percent)
                )
            )
        );


    green =
        Math.max(
            0,
            Math.min(
                255,
                Math.floor(
                    green * (1 - percent)
                )
            )
        );


    blue =
        Math.max(
            0,
            Math.min(
                255,
                Math.floor(
                    blue * (1 - percent)
                )
            )
        );


    return (
        "#" +
        (
            (1 << 24) +
            (red << 16) +
            (green << 8) +
            blue
        )
            .toString(16)
            .slice(1)
            .toUpperCase()
    );

}


/* ==================================================
   INITIALISE FOLDER
================================================== */

function initialiseFolder() {

    const folder =
        document.getElementById(
            "portfolio-folder"
        );


    if (!folder) {

        console.error(
            "CornerStone: portfolio folder not found."
        );

        return null;

    }


    /* ==========================================
       FOLDER COLOURS
    ========================================== */

    folder.style.setProperty(
        "--folder-color",
        FOLDER_COLOR
    );


    folder.style.setProperty(
        "--folder-back-color",
        darkenColor(
            FOLDER_COLOR,
            0.08
        )
    );


    folder.style.setProperty(
        "--paper-1",
        darkenColor(
            "#ffffff",
            0.10
        )
    );


    folder.style.setProperty(
        "--paper-2",
        darkenColor(
            "#ffffff",
            0.05
        )
    );


    folder.style.setProperty(
        "--paper-3",
        "#ffffff"
    );


    /* ==========================================
       PAPERS
    ========================================== */

    const papers =
        folder.querySelectorAll(
            ".paper"
        );


    /* ==========================================
       RESET PAPER POSITIONS
    ========================================== */

    function resetPaperPositions() {

        papers.forEach(
            (paper) => {

                paper.style.setProperty(
                    "--magnet-x",
                    "0px"
                );


                paper.style.setProperty(
                    "--magnet-y",
                    "0px"
                );

            }
        );

    }


    /* ==========================================
       TOGGLE FOLDER
    ========================================== */

    function toggleFolder() {

        const isOpen =
            folder.classList.toggle(
                "open"
            );


        folder.setAttribute(
            "aria-expanded",
            String(isOpen)
        );


        if (!isOpen) {

            resetPaperPositions();

        }

    }


    /* ==========================================
       CLICK
    ========================================== */

    folder.addEventListener(
        "click",
        toggleFolder
    );


    /* ==========================================
       KEYBOARD
    ========================================== */

    folder.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                toggleFolder();

            }

        }
    );


    /* ==========================================
       PAPER MAGNET EFFECT
    ========================================== */

    papers.forEach(
        (paper) => {

            paper.addEventListener(
                "mousemove",
                (event) => {

                    if (
                        !folder.classList.contains(
                            "open"
                        )
                    ) {

                        return;

                    }


                    const rectangle =
                        paper.getBoundingClientRect();


                    const centerX =
                        rectangle.left +
                        rectangle.width / 2;


                    const centerY =
                        rectangle.top +
                        rectangle.height / 2;


                    const offsetX =
                        (
                            event.clientX -
                            centerX
                        ) *
                        PAPER_MAGNET_STRENGTH;


                    const offsetY =
                        (
                            event.clientY -
                            centerY
                        ) *
                        PAPER_MAGNET_STRENGTH;


                    paper.style.setProperty(
                        "--magnet-x",
                        `${offsetX}px`
                    );


                    paper.style.setProperty(
                        "--magnet-y",
                        `${offsetY}px`
                    );

                }
            );


            paper.addEventListener(
                "mouseleave",
                () => {

                    paper.style.setProperty(
                        "--magnet-x",
                        "0px"
                    );


                    paper.style.setProperty(
                        "--magnet-y",
                        "0px"
                    );

                }
            );

        }
    );


    return {

        close: () => {

            folder.classList.remove(
                "open"
            );


            folder.setAttribute(
                "aria-expanded",
                "false"
            );


            resetPaperPositions();

        }

    };

}


/* ==================================================
   PORTFOLIO POPUP
================================================== */

function initialisePortfolioPopup(
    folderController
) {

    const viewWorkButton =
        document.getElementById(
            "view-work-btn"
        );


    const portfolioNavButton =
        document.getElementById(
            "portfolio-nav-btn"
        );


    const overlay =
        document.getElementById(
            "portfolio-overlay"
        );


    const closeButton =
        document.getElementById(
            "portfolio-close"
        );


    if (!overlay) {

        console.error(
            "CornerStone: portfolio overlay not found."
        );

        return;

    }


    /* ==========================================
       OPEN POPUP
    ========================================== */

    function openPortfolio() {

        overlay.classList.add(
            "active"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "portfolio-open"
        );

    }


    /* ==========================================
       CLOSE POPUP
    ========================================== */

    function closePortfolio() {

        overlay.classList.remove(
            "active"
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "portfolio-open"
        );


        if (folderController) {

            folderController.close();

        }

    }


    /* ==========================================
       OPEN FROM BUTTON
    ========================================== */

    function openPortfolioFromButton(
        event
    ) {

        event.preventDefault();

        openPortfolio();

    }


    /* ==========================================
       VIEW MY WORK
    ========================================== */

    if (viewWorkButton) {

        viewWorkButton.addEventListener(
            "click",
            openPortfolioFromButton
        );

    }


    /* ==========================================
       NAVBAR PORTFOLIO
    ========================================== */

    if (portfolioNavButton) {

        portfolioNavButton.addEventListener(
            "click",
            openPortfolioFromButton
        );

    }


    /* ==========================================
       CLOSE BUTTON
    ========================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePortfolio
        );

    }


    /* ==========================================
       CLICK OUTSIDE
    ========================================== */

    overlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === overlay
            ) {

                closePortfolio();

            }

        }
    );


    /* ==========================================
       ESCAPE KEY
    ========================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                overlay.classList.contains(
                    "active"
                )
            ) {

                closePortfolio();

            }

        }
    );

}


/* ==================================================
   START
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const folderController =
            initialiseFolder();


        initialisePortfolioPopup(
            folderController
        );

    }
);