# Assets

Drop your media here — the app references them by these exact filenames and
degrades gracefully (animated pitch / CSS ball) when they're missing.

| File                  | Used by            | Notes                                          |
| --------------------- | ------------------ | ---------------------------------------------- |
| `goal.mp4`            | Hero               | Looping clip. The "ball hits the net" shake fires at ~1.1s — tune `STRIKE` in `src/components/landing/Hero.jsx` to match your clip. |
| `fifa-ball-2026.png`  | Impact teaser      | Square image, shown in a 96px circle.          |

These come from the original FanFare Claude Design project
(`goal.mp4`, `uploads/fifa-ball-2026.png`). They were too large / gated to pull
through the design tool automatically, so copy them in manually.

Anything in `public/` is served from the site root, so `public/assets/goal.mp4`
is reachable at `/assets/goal.mp4`.
