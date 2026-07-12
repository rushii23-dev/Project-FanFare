# Assets

Media served from the site root — `public/assets/hero-stadium.jpg` is reachable
at `/assets/hero-stadium.jpg`.

| File                 | Used by                    | Notes                                                     |
| -------------------- | -------------------------- | --------------------------------------------------------- |
| `hero-stadium.jpg`   | Landing hero               | Background still. The hero tries several extensions (`.jpg` / `.jpeg` / `.png` / `.webp`) and falls back to an animated CSS pitch if none resolve. |
| `fifa-trophy.png`    | Landing hero              | Trophy motif.                                              |
| `fifa-ball-2026.png` | Impact teaser, marquee     | Square image, shown in a 96px circle.                      |

Every asset is optional. The app degrades gracefully — an animated pitch stands
in for the hero, and a CSS ball for the match ball — so it runs fine on a fresh
clone with this folder empty.
