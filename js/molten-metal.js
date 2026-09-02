/* ==========================================
   CORNERSTONE TECHDEV
   MOLTEN METAL BACKGROUND
========================================== */


const canvas =
    document.getElementById("molten-canvas");


if (!canvas) {

    console.error(
        "Molten canvas not found."
    );

} else {

    const gl =
        canvas.getContext("webgl2");


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

            gl_Position =
                vec4(
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


        /* ------------------------------------------
           UNIFORMS
        ------------------------------------------ */

        uniform vec2 iResolution;

        uniform float iTime;

        uniform vec2 uMouse;


        out vec4 fragColor;



        /* ==========================================
           RANDOM / NOISE
        ========================================== */

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



        /* ==========================================
           SMOOTH NOISE
        ========================================== */

        float noise(vec2 p) {

            vec2 i =
                floor(p);

            vec2 f =
                fract(p);


            f =
                f *
                f *
                (
                    3.0 -
                    2.0 *
                    f
                );


            float a =
                hash(i);

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



        /* ==========================================
           FRACTAL BROWNIAN MOTION
        ========================================== */

        float fbm(vec2 p) {

            float value =
                0.0;

            float amplitude =
                0.5;


            for (
                int i = 0;
                i < 6;
                i++
            ) {

                value +=
                    amplitude *
                    noise(p);


                p *=
                    2.0;


                amplitude *=
                    0.5;

            }


            return value;

        }



        /* ==========================================
           MAIN
        ========================================== */

        void main() {


            /* --------------------------------------
               NORMALIZED COORDINATES
            -------------------------------------- */

            vec2 uv =
                gl_FragCoord.xy /
                iResolution.xy;


            float aspect =
                iResolution.x /
                iResolution.y;


            uv.x *=
                aspect;



            /* ======================================
               CENTER
            ====================================== */

            vec2 center =
                vec2(
                    aspect * 0.5,
                    0.5
                );


            vec2 p =
                uv -
                center;



            /* ======================================
               MOUSE MOVEMENT
            ====================================== */

            vec2 mouse =
                uMouse -
                vec2(
                    0.5
                );


            mouse.x *=
                aspect;


            /*
             * Stronger cursor influence.
             *
             * 0.32 gives the mouse a much
             * more noticeable effect.
             */

            p +=
                mouse *
                0.32;



            /* ======================================
               TIME
            ====================================== */

            /*
             * Faster molten movement.
             *
             * 0.25 gives approximately twice
             * the flow speed of the original.
             */

            float time =
                iTime *
                0.25;



            /* ======================================
               SWIRLING DISTORTION
            ====================================== */

            float angle =
                atan(
                    p.y,
                    p.x
                );


            float radius =
                length(p);


            float swirl =
                angle
                +
                radius * 3.5
                -
                time;



            vec2 swirlPosition =
                vec2(

                    cos(swirl),

                    sin(swirl)

                )
                *
                radius;



            /* ======================================
               MOVING NOISE
            ====================================== */

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



            /* ======================================
               SECONDARY DISTORTION
            ====================================== */

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



            /* ======================================
               INTENSITY
            ====================================== */

            float intensity =
                smoothstep(

                    0.25,

                    0.85,

                    n +
                    distortion *
                    0.35

                );



            /* ======================================
               EDGE FADE
            ====================================== */

            float edge =
                smoothstep(

                    0.95,

                    0.15,

                    radius

                );


            intensity *=
                edge;



            /* ======================================
               CORNERSTONE COLOURS
            ====================================== */

            /*
             * Deep warm background.
             */

            vec3 black =
                vec3(

                    0.035,
                    0.028,
                    0.022

                );


            /*
             * Dark bronze.
             */

            vec3 darkMetal =
                vec3(

                    0.16,
                    0.12,
                    0.075

                );


            /*
             * Warm bronze.
             */

            vec3 bronze =
                vec3(

                    0.52,
                    0.35,
                    0.17

                );


            /*
             * Bright warm gold.
             */

            vec3 beige =
                vec3(

                    0.82,
                    0.63,
                    0.35

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

                        0.35,

                        0.70,

                        intensity

                    )

                );


            color =
                mix(

                    color,

                    beige,

                    smoothstep(

                        0.70,

                        1.0,

                        intensity

                    )

                );



            /* ======================================
               SUBTLE GOLD GLOW
            ====================================== */

            float glow =
                pow(

                    intensity,

                    3.0

                );


            color +=
                beige *
                glow *
                0.18;



            /* ======================================
               FINAL OPACITY
            ====================================== */

            /*
             * Increased from 0.55.
             *
             * This makes the molten metal
             * substantially more visible.
             */

            float alpha =
                intensity *
                0.72;



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

        let mouseX =
            0.5;

        let mouseY =
            0.5;


        let targetMouseX =
            0.5;

        let targetMouseY =
            0.5;


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



            /* --------------------------------------
               SMOOTH MOUSE RESPONSE
            -------------------------------------- */

            /*
             * Increased from 0.04 to 0.09.
             *
             * This makes the molten effect
             * catch up to the cursor faster.
             */

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



            /* --------------------------------------
               RENDER
            -------------------------------------- */

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