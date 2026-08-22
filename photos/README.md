# Real photos

The postcards on the site are hand-drawn SVG scenes, so nothing can 404 and
everything stays sharp on any screen. If you'd rather use real photographs:

1. Drop your images in this folder, e.g. `photos/albufera.jpg`.
   Aim for roughly 1600&times;1000 px and keep each one under ~400 KB.
2. Open `index.html`, find the postcard you want to replace, and swap the
   `src` (and the `alt` text, which is what screen readers and search engines
   read):

   ```html
   <img src="photos/albufera.jpg" width="1600" height="1000" loading="lazy" decoding="async"
        alt="Sunset over the Albufera lagoon">
   ```

3. The frame crops to a fixed aspect ratio with `object-fit: cover`, so keep
   the subject near the middle of the frame.

The hero background is a stack of three layers in `assets/img/`
(`hero-sky.svg`, `hero-hills.svg`, `hero-fore.svg`) that move at different
speeds as you scroll. To use a photo there instead, point
`.hero__layer--sky` in `assets/css/styles.css` at your image and delete the
other two layers from `index.html`.
