# Homepage content

Edit `content/homepage.json` for the current homepage text, news and math explanations. This is the canonical homepage copy; `content/calyr.md` records the older expanded concept and is not the homepage input.

`web/index.html` contains the layout and content placeholders. `web/content-plugin.js` fills them at build time and escapes text. This keeps the published homepage static and avoids an extra content fetch. Missing values fail the build.

Run `npm --prefix web run build` to validate edits. `npm --prefix web run dev` also resolves the content file and reloads when it changes.

The Aorta page already reads its separate `web/public/research/aorta/aorta-content.md` file. The other research entry pages are outside this homepage extraction.
