# España 2026

A countdown to Spain — a rented house in Dénia, on the Costa Blanca,
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
| `place` | Where we are, used by the running "Day 3 in …" counter. |
| `calendar` | Title, location and notes for the "Add to calendar" download. |

Copy, section headings and the six postcard captions are written directly in
`index.html` — search for the words you want to change.

## The three phases

The page reads the clock and picks one of three states by itself, so it
never needs editing mid-trip:

- **before** — counts down to `departure`, "Nos vamos a España".
- **during** — counts *up* from `departure`, "Ya estamos en España", and the
  header pill becomes "Day 3". With a `returnDate` set it also shows
  "Day 3 of 12, 9 to go"; without one the progress bar hides itself.
- **after** — past `returnDate`, "Estuvimos en España", frozen on the length
  of the trip. Only reachable once `returnDate` is filled in.

Copy for each state lives in `index.html` on `data-when="before|during|after"`
elements; the ones that do not apply are removed at load. If the page is left
open across a boundary it reloads itself so the wording keeps up.

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

Live at <https://joncik91.github.io/Holiday/>, already set up — nothing to
configure.

Pages serves the site from the `gh-pages` branch, and
`.github/workflows/publish.yml` mirrors `main` onto that branch on every
push. So: commit to `main`, and a minute later the site updates.

`gh-pages` is generated. Never commit to it directly — anything you put
there is overwritten by the next push to `main`.

Two things worth knowing if this ever needs rebuilding elsewhere. The
Actions-based Pages flow (`actions/deploy-pages`) does *not* work here: the
built-in `GITHUB_TOKEN` cannot create or reconfigure a Pages site, so
`configure-pages` fails with "Resource not accessible by integration". What
did work was pushing a branch literally named `gh-pages`, which makes GitHub
provision the Pages site on its own. And Pages on a **private** repository
needs a paid plan — on the free plan the repository has to be public.

Both hosts serve the site from the repository root, so nothing needs building
and there is no output folder to configure.

## What's in here

```
index.html              the whole page
assets/css/styles.css   design system + layout
assets/js/config.js     trip settings  ← edit this
assets/js/main.js       countdown, parallax, reveals, .ics download
assets/img/hero-*.svg   the three parallax layers behind the countdown
assets/og.jpg           the link preview card for WhatsApp / iMessage
photos/                 the four postcard photographs
```

## Notes

- The four postcards are photographs in `photos/`; see `photos/README.md` to
  swap any of them. The hero backdrop is three hand-drawn SVG layers that
  parallax as you scroll, so it stays sharp at any window size.
- Fonts come from Google Fonts (Fraunces + Inter) with system fallbacks, so the
  page still reads properly if they don't load.
- Respects `prefers-reduced-motion`: the parallax, the marquee, the digit rolls
  and the scroll reveals all stand still for anyone who asks for that.
- The countdown is announced to screen readers once a minute rather than every
  second.
