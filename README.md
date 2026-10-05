# CornerStone TechDev: websites for South African businesses

**Live site:** [cornerstonetechdev.co.za](https://cornerstonetechdev.co.za/)

## The problem

Many small businesses in South Africa have no website, or one that's years
out of date. Customers search for them, find nothing (or a broken page), and
go elsewhere. Owners know they need a site but don't know who to trust, what
it should cost, or what a good one even looks like.

## Who it's for

Small and growing businesses in Cape Town and across South Africa that need a
modern website or web app: guesthouses, student accommodation, hospitality,
service businesses and more.

## How it solves it

- **Shows the work, not just a sales pitch.** Real client projects sit under
  Projects; self-initiated concepts (Paddle Out, Lesedi, Six Strings Higher,
  Hut Nine) sit under Portfolio, each with a write-up of the idea and the
  build, so a business owner can see what's possible before they enquire.
- **Makes it easy to get in touch.** The contact form sends enquiries
  straight to the business inbox through a serverless function, with a
  WhatsApp link for people who'd rather message.
- **Hosts live products.** [Paddle Out](https://github.com/KatlegoM18/paddle-out),
  a live beach and surf conditions page for 34 SA beaches, runs from this
  site with its own cached data endpoint.

## Under the hood

- **Contact form:** a Netlify Function validates and size-limits each
  enquiry, escapes all input, quietly drops bot submissions with a
  honeypot field, rate-limits by IP, and sends the email through
  [Resend](https://resend.com/) without exposing the API key.
- **Paddle Out endpoint:** a Netlify Function fetches marine and weather data
  for every beach in two calls and lets the CDN cache it for 20 minutes, so
  API usage stays flat however busy the site gets.
- **Found in search:** sitemap, robots.txt, canonical links, Open Graph
  previews for WhatsApp and social, a web manifest and a custom 404 page.

## Tech stack

HTML, CSS and vanilla JavaScript (ES modules), Three.js for the 3D logo,
Netlify hosting and Functions, Resend for email.

## Status

Live and in use as the CornerStone TechDev business site. Updated as new
client projects and concepts are finished.

## Run it locally

Open the folder in VS Code and start **Live Server**. The contact form and
Paddle Out's data endpoint run as Netlify Functions, so test those with the
Netlify CLI (`netlify dev`). The contact form needs `RESEND_API_KEY` set in
Netlify's environment variables.

---

Built by [Katlego Mokgofa](https://github.com/KatlegoM18), founder of
CornerStone TechDev.
