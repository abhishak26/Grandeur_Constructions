# Grandeur Constructions

The public site and the studio desk run as one application with a Postgres database.

## First sign-in

Open **Studio desk** from the footer. The first visit creates the only administrator. After that, registration is closed. Passwords are stored as scrypt hashes. Sessions are http-only cookies.

## Content

Services, the address, the tagline and the ten-year record are already in the database. Projects, testimonials, team profiles and articles stay empty until you publish them. Do not treat the architectural photographs on service cards as completed Grandeur projects; project pages are separate.

## Images

Uploads are kept in the database and served from the site. If the deployment provides `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`, new uploads go to Cloudinary instead.

## Enquiries

Enquiry and consultation forms validate on the server, store a reference, and rate-limit repeats. A consultation request is not a confirmed appointment. Optional HTTPS webhook delivery uses the notification URL in Settings. A notification email can be recorded there, but mail is not sent unless that webhook is connected.

## Analytics and maps

Add a Google Analytics 4 measurement ID in Settings to load the tag. The map uses the embed URL saved with the real Perambur address.

## Publishing

Ship the app with its database migrations. The schema is applied from `migrations/` when the production database is available.
