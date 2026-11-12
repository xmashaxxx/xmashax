# Project notes for Claude Code

This is the portfolio site for **xmasha** (aerial and fire performer, character artist, maker). Plain HTML, CSS, and JS with no build step.

## Hard rules

- The only name used anywhere on the site is **xmasha**. Never add a legal or full name to any page, metadata, alt text, comment, or commit message.
- The studio is called **xmasha Studio**.
- Do not copy code, copy text, imagery, or typefaces from other people's websites. Layout patterns and motion ideas are fine as inspiration; the implementation and content must be original.

## Working style

- Brand decisions live in the `:root` tokens at the top of `style.css`. Prefer changing a token to adding one-off values.
- The nav and footer are duplicated in every HTML file. Update all pages together.
- Explain the reason for a change, not just the change. The owner wants to understand why.
- No emojis and no em-dashes in site copy.
- Keep animation code in `app.js`. Starting states are set in JS so the page stays visible if scripts fail.
- Respect `prefers-reduced-motion`.

## Check before finishing

- Search the repo for any full-name leaks.
- Click through every page and confirm the curtain transition does not get stuck.
- Check mobile width (about 390px) and desktop.
