# Kilele Radio — Website (Kilele cha Maendeleo)

Modern radio-station website for Kilele Media Production: live 24/7 stream, breaking-news ticker,
512-story newsroom, on-demand podcasts, programme schedule, presenters, advertising zones and a
shift-based staff workspace (demo mode in this phase).

## Deploy on Netlify
1. New site from Git → pick this repo. Netlify reads `netlify.toml` automatically.
2. Build command (from netlify.toml): `mkdir -p dist && cp -r *.html assets a c robots.txt sitemap.xml dist/`
3. Publish directory: `dist`
4. If the Netlify dashboard shows cached UI build settings, clear them (Build command / Publish / Base all blank)
   so `commandOrigin: config` wins.
5. No `_redirects` file on purpose — this is a multi-page static site.

## Project phases
- Stage 1 (this build): full site + first content migration + open demo staff login.
- Stage 3 (after contract signing): Clerk authentication with passwords; Supabase backend for
  articles, images, ticker, ads and the shift/section access tables (the demo logic in
  `assets/js/admin.js` becomes server-enforced).

Built by NexaFlow Digital — https://www.nexaflow-digital.com
