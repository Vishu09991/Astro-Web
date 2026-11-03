# Shri Parashar Guruji

Next.js App Router, TypeScript, Tailwind CSS, Motion and Lucide. Includes 92 catalogue entries, bilingual descriptions, service dialogs, gallery, location-aware Panchang integration, consultation enquiries, and a separate `/about` introduction with a slideshow.

## Run

Use Node.js 20.9+ (Node 24 was used during development).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: `npm run build` then `npm start`.

Checks: `npm run lint`, `npm run typecheck`, `npm test`.

## Enable Formspree email enquiries

1. Create a form in your Formspree account and verify **contact@parasharguruji.com** as the recipient.
2. Copy `.env.example` to `.env.local`.
3. Set `FORMSPREE_FORM_ID` to the ID from `https://formspree.io/f/YOUR_ID`.
4. Restart Next.js. Set the same environment variable in your hosting dashboard for deployment.
5. Submit a test enquiry and verify its receipt in Formspree and the recipient mailbox.

The server validates input and forwards name, phone, optional email, selected service, and message to Formspree. Only an HTTP success response with `{ "ok": true }` is treated as accepted; this does not promise inbox delivery or confirm a booking. No credentials or endpoint were supplied during development, so real delivery has not been verified. Without configuration the form explains this and offers working phone, email, and WhatsApp links. Existing `CONTACT_WEBHOOK_URL` remains supported as an alternative; it must return 2xx only when it accepts an enquiry. Use your provider's spam protection and host rate limiting before public launch.

## Edit content and photos

- `data/site.ts`: phone, WhatsApp, email, address, map link, default city, portrait and gallery.
- `data/translations/about.ts`: approved biography and philosophy in English and Hindi.
- `data/translations/site.ts`: interface translations. Language is shared across routes and remembered on the device.
- `data/services/index.ts`: complete bilingual service catalogue.
- `public/images/`: original SVG artwork and your photographs. Add real photos here and set gallery `src` values such as `/images/guruji-puja.jpg`; update captions and alt text. The `/about` slideshow uses this same editable collection. It includes previous/next, arrow-key navigation, slide buttons and optional playback. Playback pauses on hover/focus and is disabled with reduced motion.

No personal photographs, qualifications, lineage or years of experience have been invented. Supply the approved introduction and actual photographs to replace the explicit placeholders.

## Panchang

Set `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` for the Prokerala advanced Panchang API. The adapter uses Lahiri ayanamsa, IANA location timezones (including DST), local noon requests, and interval containment at sunrise. It preserves all returned Tithi, Nakshatra, Yoga and Karana transitions. The language selection is passed to the provider. Missing, malformed or failed data is shown as unavailable, never fabricated. Live provider credentials are required for end-to-end verification.

Festival dates need a verified location- and tradition-aware feed at `PANCHANG_FESTIVALS_URL`, optionally secured by `PANCHANG_FESTIVALS_TOKEN`. GET query parameters: `year`, `month`, `latitude`, `longitude`, `timezone`, `tradition` (`amanta` or `purnimanta`), and `language` (`en` or `hi`). Return JSON:

```json
{"tradition":"purnimanta","timezone":"Asia/Kolkata","festivals":[]}
```

Each festival is `{ "date": "YYYY-MM-DD", "name": "localized verified name", "kind": "localized category" }`. Dates must belong to the requested month. An empty array means the feed verified that no observances apply. An absent/failed feed means unknown, not no festivals. Include regional festivals, Jayantis, Ekadashi, Pradosh, Purnima, Amavasya, Sankashti and Navratri using the source's observance rules. Amanta/Purnimanta affects festival/month rules, not the astronomical angular intervals. Configure your provider quota, host request limits and long-running request timeout for month loading.

## Remaining owner inputs

Formspree form ID and verified recipient; actual photos and approved introduction; address/map link; Panchang credentials and verified festival feed. The requested reference PDF and calendar reference image were not supplied.
