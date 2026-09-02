import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


/* ==================================================
   CORNERSTONE TECHDEV
   3D CT LOGO
   SINGLE CANVAS / DESKTOP + MOBILE
================================================== */


/* ==================================================
   CONFIGURATION
================================================== */

const LOGO_IMAGE =
    "../images/CT logo.png";


const ROTATION_SPEED =
    0.02;


const LOGO_DEPTH =
    0.16;


const LAYER_COUNT =
    14;


/* ==================================================
   INITIALISE AFTER HTML LOADS
================================================== */

function initialiseLogo() {


    /* ==================================================
       FIND EXISTING CANVAS
    ================================================== */

    const canvas =
        document.getElementById(
            "ct-logo-canvas"
        );


    if (!canvas) {

        console.error(
            "CornerStone: #ct-logo-canvas was not found."
        );

        return;

    }


    /* ==================================================
       FIND EXISTING DESKTOP CONTAINER
    ================================================== */

    const desktopContainer =
        canvas.closest(
            ".ct-3d-logo"
        );


    if (!desktopContainer) {

        console.error(
            "CornerStone: .ct-3d-logo container was not found."
        );

        return;

    }


    /* ==================================================
       FIND MOBILE MENU
    ================================================== */

    const menuToggle =
        document.getElementById(
            "menu-toggle"
        );


    const navLinks =
        document.getElementById(
            "nav-links"
        );


    if (!menuToggle || !navLinks) {

        console.error(
            "CornerStone: mobile navigation elements were not found."
        );

        return;

    }


    /* ==================================================
       CREATE MOBILE LOGO CONTAINER
       IF IT DOESN'T EXIST
    ================================================== */

    let mobileContainer =
        document.getElementById(
            "mobile-menu-logo"
        );


    if (!mobileContainer) {

        mobileContainer =
            document.createElement(
                "div"
            );


        mobileContainer.id =
            "mobile-menu-logo";


        mobileContainer.className =
            "mobile-menu-logo";


        document.body.appendChild(
            mobileContainer
        );

    }


    /* ==================================================
       SCENE
    ================================================== */

    const scene =
        new THREE.Scene();


    /* ==================================================
       CAMERA
    ================================================== */

    const camera =
        new THREE.PerspectiveCamera(
            35,
            1,
            0.1,
            100
        );


    camera.position.z =
        5;


    /* ==================================================
       RENDERER
    ================================================== */

    const renderer =
        new THREE.WebGLRenderer({

            canvas,

            alpha:
                true,

            antialias:
                true

        });


    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            2
        )

    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    /* ==================================================
       LOGO GROUP
    ================================================== */

    const logoGroup =
        new THREE.Group();


    scene.add(
        logoGroup
    );


    /* ==================================================
       LOAD LOGO
    ================================================== */

    const textureLoader =
        new THREE.TextureLoader();


    textureLoader.load(

        LOGO_IMAGE,


        (texture) => {

            texture.colorSpace =
                THREE.SRGBColorSpace;


            /* ==========================================
               GEOMETRY
            ========================================== */

            const geometry =
                new THREE.PlaneGeometry(
                    2.8,
                    2.8
                );


            /* ==========================================
               3D LAYERS
            ========================================== */

            for (
                let i = 0;
                i < LAYER_COUNT;
                i++
            ) {

                const material =
                    new THREE.MeshStandardMaterial({

                        map:
                            texture,

                        transparent:
                            true,

                        alphaTest:
                            0.01,

                        side:
                            THREE.DoubleSide,

                        metalness:
                            0.65,

                        roughness:
                            0.20

                    });


                const layer =
                    new THREE.Mesh(
                        geometry,
                        material
                    );


                layer.position.z =
                    (
                        i /
                        (LAYER_COUNT - 1)
                        - 0.5
                    ) *
                    LOGO_DEPTH;


                logoGroup.add(
                    layer
                );

            }


            /* ==========================================
               NATURAL TILT
            ========================================== */

            logoGroup.rotation.x =
                -0.08;

        },


        undefined,


        (error) => {

            console.error(
                "CornerStone: unable to load CT logo.",
                error
            );

        }

    );


    /* ==================================================
       LIGHTING
    ================================================== */

    const keyLight =
        new THREE.DirectionalLight(
            0xffe8c9,
            5.5
        );


    keyLight.position.set(
        3,
        5,
        7
    );


    scene.add(
        keyLight
    );


    const fillLight =
        new THREE.DirectionalLight(
            0xd8cbbd,
            4
        );


    fillLight.position.set(
        -5,
        3,
        5
    );


    scene.add(
        fillLight
    );


    const frontLight =
        new THREE.PointLight(
            0xffffff,
            3.5,
            15
        );


    frontLight.position.set(
        0,
        1,
        6
    );


    scene.add(
        frontLight
    );


    /* ==================================================
       SIZES
    ================================================== */

    const DESKTOP_SIZE =
        60;


    const MOBILE_SIZE =
        300;


    /* ==================================================
       RESIZE RENDERER
    ================================================== */

    function resize(
        size
    ) {

        camera.aspect =
            1;


        camera.updateProjectionMatrix();


        renderer.setSize(
            size,
            size,
            false
        );


        canvas.style.width =
            `${size}px`;


        canvas.style.height =
            `${size}px`;

    }


    /* ==================================================
       MOVE LOGO TO MOBILE MENU
    ================================================== */

    function moveLogoToMobileMenu() {

        /*
         * Prevent the canvas from affecting
         * the navbar layout.
         */

        mobileContainer.appendChild(
            canvas
        );


        resize(
            MOBILE_SIZE
        );


        canvas.style.display =
            "block";


        mobileContainer.style.display =
            "flex";

    }


    /* ==================================================
       MOVE LOGO BACK TO NAVBAR
    ================================================== */

    function moveLogoToNavbar() {

        desktopContainer.appendChild(
            canvas
        );


        resize(
            DESKTOP_SIZE
        );


        canvas.style.display =
            "block";

    }


    /* ==================================================
       MOBILE CONTAINER STYLING
    ================================================== */

    Object.assign(
        mobileContainer.style,
        {

            position:
                "fixed",

            top:
                "58vh",

            left:
                "50%",

            width:
                `${MOBILE_SIZE}px`,

            height:
                `${MOBILE_SIZE}px`,

            transform:
                "translate(-50%, -50%)",

            display:
                "none",

            alignItems:
                "center",

            justifyContent:
                "center",

            zIndex:
                "1002",

            opacity:
                "0",

            visibility:
                "hidden",

            pointerEvents:
                "none",

            transition:
                "opacity 0.35s ease, transform 0.4s ease"

        }

    );


    /* ==================================================
       SHOW MOBILE LOGO
    ================================================== */

    function showMobileLogo() {

        moveLogoToMobileMenu();


        requestAnimationFrame(
            () => {

                mobileContainer.style.opacity =
                    "1";

                mobileContainer.style.visibility =
                    "visible";

                mobileContainer.style.transform =
                    "translate(-50%, -50%) scale(1)";

            }
        );

    }


    /* ==================================================
       HIDE MOBILE LOGO
    ================================================== */

    function hideMobileLogo() {

        mobileContainer.style.opacity =
            "0";

        mobileContainer.style.visibility =
            "hidden";

        mobileContainer.style.transform =
            "translate(-50%, -50%) scale(0.8)";


        /*
         * Wait until the fade-out has started
         * before moving the canvas back.
         */

        setTimeout(
            () => {

                if (
                    !navLinks.classList.contains(
                        "active"
                    )
                ) {

                    moveLogoToNavbar();

                }

            },
            200
        );

    }


    /* ==================================================
       MENU CLICK
    ================================================== */

    menuToggle.addEventListener(
        "click",
        () => {

            /*
             * Your existing HTML JavaScript
             * toggles .active first.
             *
             * Wait one frame.
             */

            requestAnimationFrame(
                () => {

                    const menuOpen =
                        navLinks.classList.contains(
                            "active"
                        );


                    if (menuOpen) {

                        showMobileLogo();

                    } else {

                        hideMobileLogo();

                    }

                }
            );

        }
    );


    /* ==================================================
       MENU LINK CLICK
    ================================================== */

    navLinks
        .querySelectorAll("a")
        .forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    () => {

                        hideMobileLogo();

                    }
                );

            }
        );


    /* ==================================================
       INITIAL STATE
    ================================================== */

    moveLogoToNavbar();


    /* ==================================================
       RESIZE
    ================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                navLinks.classList.contains(
                    "active"
                )
            ) {

                resize(
                    MOBILE_SIZE
                );

            } else {

                resize(
                    DESKTOP_SIZE
                );

            }

        }
    );


    /* ==================================================
       ANIMATION LOOP
    ================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        /*
         * Continuous 3D revolution.
         */

        logoGroup.rotation.y +=
            ROTATION_SPEED;


        renderer.render(
            scene,
            camera
        );

    }


    resize(
        DESKTOP_SIZE
    );


    animate();

}


/* ==================================================
   DOM READY
================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseLogo,
        {
            once: true
        }
    );

} else {

    initialiseLogo();

}