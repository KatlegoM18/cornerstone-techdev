# Lesedi Wine Estate: read the bottle before you buy it

**Live demo:** [cornerstonetechdev.co.za/projects/lesedi](https://cornerstonetechdev.co.za/projects/lesedi/)

## The problem

Wine is bought in the hand. In a shop you pick up a bottle, turn it over and
read the back: the tasting note, where it was grown, what to eat with it.
Online, most wine estate websites skip that moment and show a small
thumbnail and a paragraph of text, so buyers can't get a feel for the wine
before they order.

## Who it's for

Wine estates that sell online, and the people buying from them, especially
buyers who don't know the estate yet. Lesedi is a fictional Stellenbosch
estate, built as a concept for real ones.

## How it solves it

- **The bottle is back in your hand.** A 3D bottle you can drag to turn.
  Each quarter-turn brings a new panel of the label to the front: the wine,
  the tasting note, the vineyard block and food pairings.
- **Easy to read.** A reader beside the bottle shows the panel facing you at
  full size.
- **Each wine feels different.** Choose another wine and the bottle spins,
  changes shape and colour, and the evening sky shifts from golden hour to
  dusk.
- **Works for everyone.** Mouse, touch or keyboard; it settles on the
  nearest panel when you let go, respects reduced-motion settings, and falls
  back to a flat bottle if 3D isn't available.

## Under the hood

There's no 3D model file. Each bottle is drawn as a side profile in code and
spun into shape, so a Burgundy bottle can morph smoothly into a Bordeaux or
a sparkling bottle. The labels are drawn live onto a canvas and wrapped
around the glass as a texture, and the highlights stay fixed to the "studio
lights" while the bottle turns, which is what makes it read as real glass.

## Tech stack

HTML, CSS and JavaScript (ES modules), [Three.js](https://threejs.org/) for
the 3D bottle, Canvas 2D for the labels.

## Status

Finished concept, shown in the CornerStone TechDev portfolio. The name is
Setswana for "light", for the last hour of sun on the Helderberg slopes.

## Run it locally

Open the folder in VS Code and start **Live Server**. Three.js loads from a
CDN, so you need an internet connection.

---

Built by [Katlego Mokgofa](https://github.com/KatlegoM18) /
[CornerStone TechDev](https://cornerstonetechdev.co.za).
