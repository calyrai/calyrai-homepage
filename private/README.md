# Private section (not deployed)

This folder is intentionally **not** published to GitHub Pages.

- The public website is deployed from `public/` only (see `.github/workflows/pages.yml`).
- Anything placed in `private/` will remain in the repository checkout, but will **not** be included in the Pages artifact and therefore will not be publicly accessible at `https://calyr.ai/`.

## If you need “private but accessible to some people”
GitHub Pages does not support authentication for only parts of a site.

Typical options:
- Put the private section behind an auth proxy (e.g. Cloudflare Access) on `private.calyr.ai` or on path-based rules.
- Host the private section on a platform that supports auth (Netlify/Vercel/S3+CloudFront with auth, etc.).
- Keep it entirely offline (no hosting) and share via other channels.
