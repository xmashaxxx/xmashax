# XmashaX

Portfolio site for XmashaX: aerial and fire performer, character artist, and maker.

Plain HTML, CSS, and JavaScript. No build step.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: loader, hero, intro, disciplines |
| `work.html` | Work: disciplines plus every act |
| `aerial.html`, `fire.html`, `character.html`, `studio.html` | One page per discipline |
| `about.html` | About |
| `contact.html` | Book |

`style.css` and `app.js` are shared by every page.

## Change the brand one piece at a time

All brand decisions are in the `:root` block at the top of `style.css`: fonts, colors, name size, spacing, corner radius, and easing. Change one value, refresh, and see what it does.

## Things to replace before launch

- `bookings@yourdomain.com` (appears in every page footer and on `contact.html`)
- Instagram, YouTube, and TikTok links (`href="#"`)
- Every "Photo goes here" placeholder
- The second paragraph on `about.html`
- The intro sentence on each discipline page (these are drafts)

## Notes

- The nav and footer are repeated in every HTML file. If you change one, change all of them.
- Animations use GSAP, ScrollTrigger, and Lenis, loaded from a CDN.
- The greeting loader plays once per browser session on the Home page. Other page loads use the curtain transition.
- Respects `prefers-reduced-motion`: animations are skipped.
