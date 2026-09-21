# Mirror-grid studio background

Generated with built-in imagegen using the user's artwork/2 mirror bubbles.png as a lighting reference. This replaces the rejected silver studio backgrounds. Native result: 1672×941; the tool returned that size despite requesting 3840×2160. No artificial upscaling.

Site asset: dist/assets/mirror-grid-studio.webp.
Original PNG: /Users/nickrealgod/Documents/Codex/artwork/mirror-grid-studio-native.png.

The reference suggests neutral gray studio illumination with a rectangular softbox and ring flash. The generated environment imagines the unseen rear side: open wall, sky coordinate grid and mirrored floor. It is an interpretation, not recovered original scene geometry.

The source horizon is at 50% image height. studioPlacement() places it exactly midway between the artwork's bottom and the reflection's top, using proportional cover with enough overscan to avoid gaps. The same placement is applied to canvas and page background, and recomputed on resize. This replaces the earlier bottom alignment because the latest request explicitly fixes the horizon to the reflection gap.

Sixth background; white 69% overlay and cached static 3% noise retained. Reflection visibility now fades from 31% to zero, equivalent to hiding it by 69%→100%. Previous actual visibility was 9%, not 38%. The inactive PDF is drawn twice using two references to the same SVG; both hide on hover.

## Prompt

Generate a NEW environment background, based on the attached two chrome mirror bubbles ONLY as a lighting/color reference. Do NOT reproduce bubbles or their reflection. The reference shows a rectangular softbox and a ring flash in FRONT of the reflective objects; now depict the imagined unseen space BEHIND those objects, not those reflected lights themselves. Octane render style, physically based architectural studio, high-key luminous neutral slightly warm gray walls and white ceiling, soft diffuse light consistent with a large rectangular softbox plus ring flash near camera. No visible ring in the center, no centered lamp.
The rear studio wall is entirely absent: beyond the open wall is an immense luminous pale sky carrying a fine gray three-dimensional coordinate grid stretching across the entire sky. Grid perspective lines converge at ONE exact vanishing point horizontally centered on the horizon. Mirror-polished perfectly flat floor reflects that entire sky-coordinate-grid exactly below the horizon, maintaining the same central vanishing point. Side walls only at far edges, ceiling as a restrained light upper canopy, open expanse behind the lettering. Subtle medium-format photographic film feeling and soft optical bloom; gently defocused surroundings, but grid geometry must stay legible. Mostly white, pearl gray, warm gray, no saturated neon or sci-fi props.
CRITICAL GEOMETRY: the exact horizon / sky-to-mirror seam must be at x=50%, y=50% of the generated image, perfectly level. Top and bottom are mirror-related around this center line. Long-lens nearly frontal composition; no wide-angle fisheye distortion. Preserve extra empty margins for responsive cropping; the website will align this horizon with the midpoint between its live lettering and its live reflection. No objects, letters, bubbles, typography, numbers, axis labels, logos or watermark anywhere. Do not bake lettering reflections into this empty background. Max available native resolution, request 3840x2160 landscape. Do not bake the website's white veil or added noise into image.

## Checks

Existing letter/touch/background/particle tests plus horizon alignment and full cover at 390×844, 1280×720 and 2560×1080. ESLint and git diff --check.
