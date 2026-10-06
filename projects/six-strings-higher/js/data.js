/* =========================================
   SIX STRINGS HIGHER
   LESSON PATHS
   One path per string, low E to high E.
   Used by the strings menu and the booking flow.
========================================= */

window.SSH = window.SSH || {};

SSH.paths = {
    foundations: {
        title: "Foundations",
        level: "Beginner",
        price: "R450",
        note: "E2",
        description: "Build a strong foundation in posture, picking, basic chords and the fundamentals every guitarist needs.",
        learn: ["Holding the guitar and the pick", "Your first open chords", "Tuning by ear and with a tuner", "Your first full song"]
    },
    chords: {
        title: "Chords",
        level: "Beginner → Intermediate",
        price: "R550",
        note: "A2",
        description: "Learn the essential chord shapes, transitions and progressions that form the foundation of real songs.",
        learn: ["Open and barre chord shapes", "Clean, quick chord changes", "The progressions behind popular songs", "Capo and key changes"]
    },
    rhythm: {
        title: "Rhythm",
        level: "Beginner → Intermediate",
        price: "R550",
        note: "D3",
        description: "Develop your timing, strumming patterns and groove so you can confidently play along with music.",
        learn: ["Strumming patterns that groove", "Playing to a metronome", "Muting and dynamics", "Playing along with records"]
    },
    scales: {
        title: "Scales",
        level: "Intermediate",
        price: "R650",
        note: "G3",
        description: "Learn the essential scales, patterns and techniques that unlock the fretboard and improve your playing.",
        learn: ["Major and pentatonic shapes", "Finding notes across the neck", "Alternate picking", "Connecting positions"]
    },
    lead: {
        title: "Lead guitar",
        level: "Intermediate → Advanced",
        price: "R750",
        note: "B3",
        description: "Develop lead playing through melodies, phrasing, improvisation and confident movement across the fretboard.",
        learn: ["Bends, slides and vibrato", "Phrasing a melody", "Improvising over chords", "Learning solos by ear"]
    },
    advanced: {
        title: "Advanced",
        level: "Advanced",
        price: "R850",
        note: "E4",
        description: "Push your playing further with advanced technique, musicality, improvisation and personalised development.",
        learn: ["Fingerstyle and hybrid picking", "Arranging songs for solo guitar", "Advanced harmony", "A plan built around you"]
    }
};

SSH.pathOrder = ["foundations", "chords", "rhythm", "scales", "lead", "advanced"];

// the chosen path is shared between the strings menu and booking
SSH.selectedPath = "foundations";
