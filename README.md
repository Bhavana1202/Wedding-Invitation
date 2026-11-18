# Manoj & Lavanya Wedding Website

A responsive Svelte + Vite wedding invitation website starter based on the details in the supplied invitation PDF.

## Run locally

1. Install Node.js (LTS).
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite (usually http://localhost:5173).

## Add the couple's photographs

- Put the main couple portrait at `public/images/couple.jpg`.
- Add gallery images as `public/images/gallery-1.jpg`, `gallery-2.jpg`, etc.
- The current version displays designed placeholders. Once the photos are supplied, update the couple and gallery markup in `src/App.svelte` to use these image paths.

## Optional background music

Add a licensed audio file named `wedding-music.mp3` to `public/music/`. The music button works after the file is added. Browsers require a user click before audio can play.

## Guest wishes

The guestbook currently stores wishes in the visitor's browser only. Before publishing, connect Supabase (or another backend) if wishes must be visible to all visitors. Do not treat local browser storage as a shared guestbook.

## Deploy

Run `npm run build`. Upload the generated `dist/` folder to Cloudflare Pages, or connect the repository to Cloudflare Pages with build command `npm run build` and output directory `dist`.

## Event details included

- Reception: 2 December 2026, 7:00 PM onwards.
- Wedding Muhurtham: 3 December 2026, 8:10 AM–9:15 AM; Dhanur Lagna.
- Family gathering / Bhojana: 13 December 2026, 12:00 noon onwards.

Please verify the translated venue spelling and event wording with the family before publishing.


## Couple photographs
The five supplied photographs are stored in `public/images/`:
- `couple-hero.jpg` — featured couple portrait
- `couple-portrait-1.jpg` through `couple-portrait-4.jpg` — gallery images

To replace a photograph later, keep the same filename and overwrite the image in `public/images/`.
