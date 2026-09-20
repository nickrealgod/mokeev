# Silver bokeh background

Generated with the built-in image generation tool, 20 September 2026.
Asset: `dist/assets/silver-bokeh.webp` (1536 × 1024). Sixth background in the collection, displayed without a white overlay, proportionally covering the viewport and aligned bottom-center. The scaled image is cached at viewport size. The environment is an artistic interpretation of the silver letters' reflections, not a reconstruction of the original lighting map.

## Original generation prompt (the white overlay was subsequently removed)

Use case: photorealistic-natural. Asset type: wide website background, 1536x1024 or larger landscape. Generate a photographic environment that could plausibly produce the pale silver chrome reflections of inflated metallic typography: a luminous neutral photographic studio, huge soft white window lights, soft pearl gray and pale warm gray surroundings, a few very soft charcoal reflection shapes. This is only the environment, NO letters or objects in focus. Extremely defocused medium-format long-telephoto lens photograph, aperture wide open, maximum creamy optical bokeh, giant diffused out-of-focus highlights and flowing tonal masses, absolutely no sharp edges, no visible grain, no recognizable furniture, no text, no watermarks. Quiet elegant neutral silver/ivory tones, restrained natural contrast, composition works cropped landscape and portrait. Keep the original image normally exposed; a 93% white overlay will be applied separately in the website.

## Performance changes

- Eleven byte-identical image duplicates removed after updating references: 1,209,998 bytes saved in the repository; 166,972 bytes were duplicate WebP letter downloads.
- Shared decoded images and hit masks for repeated assets.
- Static photo scaled only after loading or resizing.
- Reflection artwork reused throughout the camera introduction and while reduced motion keeps letters still.
- Flash effects and their tint caches removed.

Potential further improvements: draw the faint reflection at lower resolution, update it and particles at 30 fps, and separate the static background from the full-screen animation canvas. These tradeoffs should be measured on target phones before reducing visual quality.

## Checks

`node tools/check.cjs` and `node tools/atmosphere-check.cjs` cover letter variants, touch brushing, vertical and background gestures, timing, shared images, background transitions, and particle respawns. `python3 tools/dedupe-assets.py` audits exact duplicate images; `--apply` updates references and removes only verified byte-identical copies.
