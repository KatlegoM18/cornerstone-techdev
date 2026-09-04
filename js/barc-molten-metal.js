/* ==========================================
   CORNERSTONE TECHDEV
   BARC HOUSE — DARKER MOLTEN METAL
   ========================================== */

const canvas = document.getElementById("molten-canvas");

if (!canvas) {

    console.error("Molten canvas not found.");

} else {

    const gl = canvas.getContext("webgl2");

    if (!gl) {

        console.error(
            "WebGL2 is not supported by this browser."
        );

    } else {

        /* ==========================================
           VERTEX SHADER
        ========================================== */

        const vertexShaderSource = `#version 300 es

        in vec2 position;

        void main() {

            gl_Position = vec4(
                position,
                0.0,
                1.0
            );

        }

        `;


        /* ==========================================
           FRAGMENT SHADER
        ========================================== */

        const fragmentShaderSource = `#version 300 es

        precision highp float;

        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 uMouse;

        out vec4 fragColor;


        /* ======================================
           RANDOM
        ====================================== */

        float hash(vec2 p) {

            return fract(
                sin(
                    dot(
                        p,
                        vec2(
                            127.1,
                            311.7
                        )
                    )
                )
                * 43758.5453123
            );

        }


        /* ======================================
           NOISE
        ====================================== */

        float noise(vec2 p) {

            vec2 i = floor(p);
            vec2 f = fract(p);

            f =
                f *
                f *
                (
                    3.0 -
                    2.0 *
                    f
                );


            float a = hash(i);

            float b =
                hash(
                    i +
                    vec2(
                        1.0,
                        0.0
                    )
                );


            float c =
                hash(
                    i +
                    vec2(
                        0.0,
                        1.0
                    )
                );


            float d =
                hash(
                    i +
                    vec2(
                        1.0,
                        1.0
                    )
                );


            return mix(

                mix(
                    a,
                    b,
                    f.x
                ),

                mix(
                    c,
                    d,
                    f.x
                ),

                f.y

            );

        }


        /* ======================================
           FRACTAL BROWNIAN MOTION
        ====================================== */

        float fbm(vec2 p) {

            float value = 0.0;
            float amplitude = 0.5;

            for (
                int i = 0;
                i < 6;
                i++
            ) {

                value +=
                    amplitude *
                    noise(p);

                p *= 2.0;

                amplitude *= 0.5;

            }

            return value;

        }


        /* ======================================
           MAIN
        ====================================== */

        void main() {

            /* ==================================
               NORMALIZED COORDINATES
            ================================== */

            vec2 uv =
                gl_FragCoord.xy /
                iResolution.xy;


            float aspect =
                iResolution.x /
                iResolution.y;


            uv.x *= aspect;


            /* ==================================
               CENTER
            ================================== */

            vec2 center =
                vec2(
                    aspect * 0.5,
                    0.5
                );


            vec2 p =
                uv -
                center;


            /* ==================================
               MOUSE MOVEMENT
            ================================== */

            vec2 mouse =
                uMouse -
                vec2(0.5);


            mouse.x *= aspect;


            p +=
                mouse *
                0.32;


            /* ==================================
               TIME
            ================================== */

            float time =
                iTime *
                0.25;


            /* ==================================
               SWIRL
            ================================== */

            float angle =
                atan(
                    p.y,
                    p.x
                );


            float radius =
                length(p);


            float swirl =
                angle +
                radius * 3.5 -
                time;


            vec2 swirlPosition =
                vec2(

                    cos(swirl),
                    sin(swirl)

                )
                *
                radius;


            /* ==================================
               MOVING NOISE
            ================================== */

            vec2 noisePosition =
                swirlPosition *
                3.0;


            noisePosition.x +=
                time;


            noisePosition.y -=
                time *
                0.5;


            float n =
                fbm(
                    noisePosition
                );


            /* ==================================
               SECONDARY DISTORTION
            ================================== */

            float distortion =
                fbm(

                    noisePosition
                    +
                    n * 2.0
                    +
                    vec2(

                        time * 0.3,
                        -time * 0.2

                    )

                );


            /* ==================================
               INTENSITY
            ================================== */

            float intensity =
                smoothstep(

                    0.18,
                    0.78,

                    n +
                    distortion *
                    0.42

                );


            /* ==================================
               EDGE FADE
            ================================== */

            float edge =
                smoothstep(

                    0.95,
                    0.08,

                    radius

                );


            intensity *= edge;


            /* ======================================
               DARK BARC HOUSE PALETTE
            ====================================== */

            /*
             * Deep espresso brown.
             * This gives the molten effect
             * something strong to contrast
             * against the cream background.
             */

            vec3 black =
                vec3(

                    0.075,
                    0.052,
                    0.037

                );


            /*
             * Dark chocolate brown.
             */

            vec3 darkMetal =
                vec3(

                    0.18,
                    0.115,
                    0.065

                );


            /*
             * Rich bronze.
             */

            vec3 bronze =
                vec3(

                    0.42,
                    0.245,
                    0.095

                );


            /*
             * Dark antique gold.
             */

            vec3 beige =
                vec3(

                    0.68,
                    0.43,
                    0.17

                );


            /* ======================================
               COLOUR MIXING
            ====================================== */

            vec3 color =
                mix(

                    black,
                    darkMetal,
                    intensity

                );


            color =
                mix(

                    color,
                    bronze,

                    smoothstep(

                        0.30,
                        0.62,

                        intensity

                    )

                );


            color =
                mix(

                    color,
                    beige,

                    smoothstep(

                        0.62,
                        0.90,

                        intensity

                    )

                );


            /* ======================================
               STRONGER GOLD GLOW
            ====================================== */

            float glow =
                pow(

                    intensity,
                    2.4

                );


            color +=
                beige *
                glow *
                0.28;


            /* ======================================
               FINAL OPACITY
            ====================================== */

            float alpha =
                intensity *
                0.78;


            fragColor =
                vec4(

                    color,
                    alpha

                );

        }

        `;


        /* ==========================================
           SHADER CREATION
        ========================================== */

        function createShader(
            type,
            source
        ) {

            const shader =
                gl.createShader(
                    type
                );


            gl.shaderSource(
                shader,
                source
            );


            gl.compileShader(
                shader
            );


            if (
                !gl.getShaderParameter(
                    shader,
                    gl.COMPILE_STATUS
                )
            ) {

                console.error(
                    gl.getShaderInfoLog(
                        shader
                    )
                );


                gl.deleteShader(
                    shader
                );


                return null;

            }


            return shader;

        }


        /* ==========================================
           CREATE SHADERS
        ========================================== */

        const vertexShader =
            createShader(

                gl.VERTEX_SHADER,
                vertexShaderSource

            );


        const fragmentShader =
            createShader(

                gl.FRAGMENT_SHADER,
                fragmentShaderSource

            );


        if (
            !vertexShader ||
            !fragmentShader
        ) {

            throw new Error(
                "Failed to create shaders."
            );

        }


        /* ==========================================
           CREATE PROGRAM
        ========================================== */

        const program =
            gl.createProgram();


        gl.attachShader(
            program,
            vertexShader
        );


        gl.attachShader(
            program,
            fragmentShader
        );


        gl.linkProgram(
            program
        );


        if (
            !gl.getProgramParameter(
                program,
                gl.LINK_STATUS
            )
        ) {

            console.error(
                gl.getProgramInfoLog(
                    program
                )
            );

        }


        gl.useProgram(
            program
        );


        /* ==========================================
           FULL SCREEN TRIANGLE
        ========================================== */

        const vertices =
            new Float32Array([

                -1, -1,
                 3, -1,
                -1,  3

            ]);


        const buffer =
            gl.createBuffer();


        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            buffer
        );


        gl.bufferData(

            gl.ARRAY_BUFFER,
            vertices,
            gl.STATIC_DRAW

        );


        const position =
            gl.getAttribLocation(

                program,
                "position"

            );


        gl.enableVertexAttribArray(
            position
        );


        gl.vertexAttribPointer(

            position,

            2,

            gl.FLOAT,

            false,

            0,

            0

        );


        /* ==========================================
           UNIFORMS
        ========================================== */

        const resolutionLocation =
            gl.getUniformLocation(

                program,
                "iResolution"

            );


        const timeLocation =
            gl.getUniformLocation(

                program,
                "iTime"

            );


        const mouseLocation =
            gl.getUniformLocation(

                program,
                "uMouse"

            );


        /* ==========================================
           MOUSE
        ========================================== */

        let mouseX = 0.5;
        let mouseY = 0.5;

        let targetMouseX = 0.5;
        let targetMouseY = 0.5;


        window.addEventListener(

            "mousemove",

            (event) => {

                targetMouseX =
                    event.clientX /
                    window.innerWidth;


                targetMouseY =
                    1.0 -
                    (
                        event.clientY /
                        window.innerHeight
                    );

            }

        );


        /* ==========================================
           RESIZE
        ========================================== */

        function resize() {

            const dpr =
                Math.min(

                    window.devicePixelRatio ||
                    1,

                    2

                );


            const width =
                window.innerWidth *
                dpr;


            const height =
                window.innerHeight *
                dpr;


            canvas.width =
                width;


            canvas.height =
                height;


            canvas.style.width =
                "100%";


            canvas.style.height =
                "100%";


            gl.viewport(

                0,
                0,
                width,
                height

            );

        }


        window.addEventListener(
            "resize",
            resize
        );


        resize();


        /* ==========================================
           ANIMATION
        ========================================== */

        const startTime =
            performance.now();


        function animate() {

            const currentTime =
                (
                    performance.now() -
                    startTime
                ) /
                1000;


            /* ======================================
               SMOOTH MOUSE RESPONSE
            ====================================== */

            mouseX +=
                (
                    targetMouseX -
                    mouseX
                ) *
                0.09;


            mouseY +=
                (
                    targetMouseY -
                    mouseY
                ) *
                0.09;


            /* ======================================
               RENDER
            ====================================== */

            gl.useProgram(
                program
            );


            gl.uniform2f(

                resolutionLocation,

                canvas.width,
                canvas.height

            );


            gl.uniform1f(

                timeLocation,

                currentTime

            );


            gl.uniform2f(

                mouseLocation,

                mouseX,
                mouseY

            );


            gl.drawArrays(

                gl.TRIANGLES,

                0,
                3

            );


            requestAnimationFrame(
                animate
            );

        }


        animate();

    }

}