# Rajasthan Jewels · Heritage Discovery Studio

An original, responsive, concept-stage jewellery discovery MVP built for **RajasthanJewels.com**.

**Project status:** working static prototype, not yet an operating e-commerce store. The editorial photography is third-party illustrative imagery and does not depict actual sellable items. All twelve jewellery names are original design concepts, **not inventory**. The recommendation quiz is fully implemented using deterministic JavaScript rules; there is **no currently running Claude/Anthropic integration**.

## Features

- Multi-page editorial website (home, discover, concept detail, style studio, story, technology, contact, privacy, custom 404).
- Searchable, sortable, category-filterable concept catalogue.
- Concept detail views with product provenance and non-commerce disclaimers.
- Locally saved items (browser `localStorage`), viewable by filter and persistent across visits.
- Three-question style matcher, ranking the catalogue by occasion, mood and metal colour.
- Accessible mobile navigation, semantic landmarks, reduced-motion settings, visible focus states, keyboard-friendly interactions.
- Metadata, open graph, canonical URLs, sitemap, robots.txt and branded favicon.
- Zero JavaScript dependencies or build pipeline. Static and free-host compatible.
- Contact form opens the visitor's email client (no backend or contact submissions stored).

## Run locally

```bash
python -m http.server 4173
```

Open http://localhost:4173 . No installs needed. You can also open `index.html` directly.

## Tests

```bash
node --test tests/*.test.js
```

Tests validate quiz ranking logic, HTML escaping, website pages and SEO metadata, catalogue consistency, and broken internal navigation.

## Deployment

### GitHub Pages

1. Create a **public** GitHub repository `rajasthanjewels` under `ashish12147`.
2. Upload the **contents of this folder** to the root of the default (`main`) branch (not the parent folder).
3. In **Settings → Pages**, choose **Deploy from a branch**, `main`, `/(root)` and Save. GitHub Pages should give a public URL such as `https://ashish12147.github.io/rajasthanjewels/`.
4. The included `CNAME.example` contains `rajasthanjewels.com`. **Important**: Keep it named `CNAME.example` until the GitHub Pages preview works. When you are ready to connect the custom domain, rename it to `CNAME` and configure DNS.
5. When ready, in the domain DNS dashboard configure appropriate A/AAAA records and a `www` CNAME to the GitHub Pages host; use GitHub's current official guidance for exact values. Configure **Settings → Pages → Custom domain** then enable **Enforce HTTPS** once the certificate issues.
6. GitHub Pages with a custom domain serves content from `https://rajasthanjewels.com`. The included sitemap, robots.txt and canonical URLs target this production domain.

### Netlify / Cloudflare Pages

This folder can also be deployed directly as a static site. In those services, publish directory = root (`.`), build command = none. Connect the domain only after DNS ownership and deploy are confirmed. On non-GitHub host, `CNAME` is ignored.

## Configure a real email address before applying to programs

The contact page points to **hello@rajasthanjewels.com** as a *proposed* inbox. You must set up forwarding or email hosting and verify that it receives mail, then remove the setup notice. A second alias such as `founder@rajasthanjewels.com` is appropriate for sign-up forms, but it needs actual reception and verification.

## Anthropic / Claude planned integration

### Currently shipped

- Deterministic, private style finder with a matching algorithm in `app.js`.
- A future-facing technology page that clearly distinguishes implemented and planned features.

### Planned when API credits/credentials are available

- Add a secure server endpoint, e.g. Cloudflare Worker `POST /api/concierge`.
- Set `ANTHROPIC_API_KEY` as a **server-side secret**, never bundled into browser JavaScript, source code or a static page.
- Validate and rate-limit requests, set token budgets and abuse controls.
- Use Claude to interpret visitor style language and return structured suggestions referencing **only real internal catalogue ids**, so output doesn't invent products, prices, quality certificates or availability.
- Provide human-reviewable explanations and clear AI use disclosure.
- Update the privacy policy before sending message content to third parties.

**Application integrity:** A live site, a new GitHub repo and a domain alone do not guarantee eligibility for Claude startup credits. Use accurate company status; do not imply a working AI API integration, inventory, sales or incorporation until those become true.

## Asset and licence notes

- UI, written content, catalog concept names and ornamental SVGs were authored for this project.
- Editorial photos load from Unsplash CDN and are subject to the [Unsplash License](https://unsplash.com/license). Product photography should be replaced with actual licensed images before any products are sold.
- Fonts load via Google Fonts with system font fallbacks.
- Original website **code is MIT licensed** (see `LICENSE`). Third-party photos remain under the Unsplash License; Google Fonts follow their individual licence terms. The jewellery concept text and brand names are not separately licensed as merchandise or trade marks.

## Product handoff checklist

- [ ] Confirm the real company name, contact address, and domain ownership.
- [ ] Configure and test email delivery.
- [ ] Deploy the repo and verify HTTPS, mobile rendering and assets.
- [ ] Replace editorial image references with correctly licensed photos of any real merchandise before selling.
- [ ] Review content and policies before introducing payments or personal accounts.
- [ ] Integrate Claude via secured backend only when actually ready.
