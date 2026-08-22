# España 2026

A countdown to two weeks in Spain — a rented house an hour from Valencia,
leaving on the 2nd of September 2026.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no tracking.
Open `index.html` and it works.

---

## Editing it

Everything you're likely to change lives in **`assets/js/config.js`**:

| Setting | What it does |
| --- | --- |
| `departure` | The moment the countdown runs to. ISO 8601 **with an offset** (`+02:00` is CEST — both Poland and Spain in September) so it reads the same for everyone, wherever they open the page. Swap in the real flight time once you have it. |
| `returnDate` | When you fly home. Leave it `null` until it's booked — the site just hides the "nights" line. |
| `anchor` | Where the progress bar starts filling from. |
| `you` | Your name, as it appears in the hero and the crew card. |
| `calendar` | Title, location and notes for the "Add to calendar" download. |

Copy, section headings and the six postcard captions are written directly in
`index.html` — search for the words you want to change.

## Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(You can also just double-click `index.html`; the only thing that needs a
server is nothing in particular, but a server is closer to how it'll behave
once deployed.)

## Deploying

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. No build command, no output directory —
   it's a static site and `vercel.json` already sets the cache headers.
3. Deploy. Every push to `main` republishes.

### GitHub Pages

One-time setup: **Settings → Pages → Source: GitHub Actions.** The built-in
`GITHUB_TOKEN` is not permitted to create a Pages site on its own, so that
switch has to be flipped by hand once.

After that, every push to `main` runs
`.github/workflows/deploy-pages.yml`, which publishes the repository root
as-is to <https://joncik91.github.io/Holiday/>.

Pages on a **private** repository also requires a paid GitHub plan; on the
free plan the repository has to be public.

Both hosts serve the site from the repository root, so nothing needs building
and there is no output folder to configure.

## What's in here

```
index.html              the whole page
assets/css/styles.css   design system + layout
assets/js/config.js     trip settings  ← edit this
assets/js/main.js       countdown, parallax, reveals, .ics download
assets/img/*.svg        hero layers and the six postcard scenes
assets/og.jpg           the link preview card for WhatsApp / iMessage
photos/                 drop real photographs here (see photos/README.md)
```

## Notes

- The six postcards and the hero are hand-drawn SVG, so they're a few KB each,
  stay sharp on any display and can't break. `photos/README.md` explains how to
  swap in real photographs if you'd rather.
- Fonts come from Google Fonts (Fraunces + Inter) with system fallbacks, so the
  page still reads properly if they don't load.
- Respects `prefers-reduced-motion`: the parallax, the marquee, the digit rolls
  and the scroll reveals all stand still for anyone who asks for that.
- The countdown is announced to screen readers once a minute rather than every
  second.
