# Shri Parashar Guruji

Next.js App Router, TypeScript, Tailwind CSS, Motion and Lucide. Includes 92 catalogue entries, bilingual descriptions, service dialogs, gallery, location-aware Panchang integration, consultation enquiries, and single-page anchor navigation. Legacy `/about` links redirect to `/#about`.

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

- `data/site.ts`: phone, WhatsApp, email, address, map link, default city, portrait and legacy photo metadata.
- `data/translations/about.ts`: approved biography and philosophy in English and Hindi.
- `data/translations/site.ts`: interface translations. Language is shared across routes and remembered on the device.
- `data/services/index.ts`: complete bilingual service catalogue.
- `public/images/gallery/`: add or remove JPEG, PNG, WebP or AVIF photographs here for the homepage gallery. `npm run dev` and `npm run build` discover files in natural filename order. Run `npm run gallery:sync` to refresh the list during development. Numbered filenames control the order, and the fullscreen viewer uses the originals.

No personal photographs, qualifications, lineage or years of experience have been invented. Supply the approved introduction and actual photographs to replace the explicit placeholders.

## Panchang

Set the server-only `SHUBH_API_KEY` in the ignored `.env.local` file. On Vercel, add the same variable in the project Environment Variables and redeploy. Restart the development server after adding it locally.

The [ShubhAI Developer API](https://shubh.live/developers) uses local sunrise values and Amanta lunar months. The daily route maps ShubhAI’s daily Panchang and day periods, preserves the supplied ISO timestamps and timezone, and omits values the server cannot validate. The dedicated solar endpoint is used only when the daily and period responses lack solar timings. The calendar date dialog uses that same daily route. City selection is shared and curated cities are remembered locally. GPS is only used after clicking **Use my location**, and those coordinates are not persisted. Worldwide city search optionally uses `GEOCODING_API_KEY`.

The monthly route uses the ShubhAI month, festivals and Ekadashi endpoints. It preserves provider dates and markers, including separate Smarta and Vaishnava dates and Parana timings. The Gregorian grid remains browsable during a provider outage. Run `node scripts/check-shubh.mjs` to inspect response shapes or `node --import tsx scripts/smoke-shubh.ts` to verify the app routes with the configured key. Both commands avoid logging the credential.

The server client caches requests by endpoint, coordinates, and date range. It coalesces simultaneous requests and respects provider cooldowns. Caches and quota guards are per process. On a multi-instance deployment, enforce an appropriate shared quota at the hosting layer.
