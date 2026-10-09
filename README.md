# Numora — free online calculators

A complete, deployable, monetizable website: **16 calculators** (loan/EMI, mortgage, compound interest, BMI, unit converter, date difference, date add/subtract, discount, tip, percentage, VAT, salary, rent split, fuel cost, grade, age), zero dependencies, static hosting, instant results in the browser.

- **Stack:** plain HTML/CSS/JS. No build step, no framework, no runtime cost.
- **Privacy by design:** calculations run client-side; nothing the user types is transmitted.
- **SEO-ready:** unique title/description per page, canonical URLs, JSON-LD (FAQ + breadcrumbs), sitemap, internal linking.
- **Monetization-ready:** AdSense slots (placeholders), affiliate-disclosure page, ad-unit layout.

## Local preview

```bash
cd numora
python3 -m http.server 8080
# open http://localhost:8080
```

## Go-live checklist (≈ 20 minutes)

1. **Rename the brand if you want.** Search `Numora` across the HTML files and replace it, then verify the name is not trademarked in your country.
2. **Create the GitHub repo and push:**
   ```bash
   cd numora
   git init -b main
   git add .
   git commit -m "Initial release"
   git remote add origin git@github.com:YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:** repo → Settings → Pages → Source: *Deploy from a branch* → branch `main`, folder `/ (root)`. Every push to `main` republishes automatically.
4. **Replace `YOUR-DOMAIN.example`** in: `sitemap.xml`, `robots.txt`, every `<link rel="canonical">`, every `og:url`, and the contact `mailto:`. (Free option: skip the custom domain and use `https://YOUR-USER.github.io/YOUR-REPO/` — then use relative URLs only and drop the canonical/sitemap domain.)
5. **Fill in the legal pages:** `privacy.html` and `disclosure.html` have `[BRACKETED]` placeholders. AdSense requires both to exist and be accurate.
6. **Google Search Console:** add the property, submit `sitemap.xml`, request indexing of the 14 pages.
7. **Google AdSense:** apply once the site has content and traffic (see reality check below). After approval:
   - paste your publisher ID into the `<script>` comment and every `<ins class="adsbygoogle">` unit,
   - rename `ads.txt.example` → `ads.txt` with your real publisher line.
8. **Google Analytics 4 (optional):** uncomment the GA4 snippet in `index.html` and set your `G-XXXXXXXXXX` ID.

## Monetization — honest numbers

- **Display ads (AdSense):** calculator/finance niches typically see RPM (revenue per 1000 pageviews) of roughly **$5–$30** on desktop traffic from Tier-1 countries, lower on mobile-heavy or emerging-market traffic. 10k pageviews/month ≈ $50–$300.
- **Affiliate:** loan, insurance and banking comparisons pay **$20–$100+ per qualified lead**, which can outdisplay ads at far lower traffic — but requires an actual comparison section and compliance with financial-promotion rules in your jurisdiction.
- **Timeline:** calculator sites usually rank slowly (3–9 months) because the niche is competitive. Growth levers, in order: Search Console iterations, adding 10–20 more long-tail calculators, adding genuinely useful explainer content, multilingual versions.

### How to grow it
- The 16 launch calculators cover the highest-intent keywords in this niche. Keep adding one page at a time (each new page = new indexable keyword). Next candidates by search demand: split bill with unequal orders, ideal body weight, tip by country, loan early-repayment savings, retirement drawdown, emergency-fund goal, currency converter (needs a daily-rates source).
- Interlink pages (already scaffolded) — internal links are the fastest ranking lever on a new site.
- Translate the top pages: same content, `hreflang` tags, doubled addressable market.
- Post genuinely useful answers linking back on forums/Reddit/Quora — real engagement, never automation.

## Ethics and legality — non-negotiable

This project is designed to earn through **real traffic and real utility**. Specifically:

- **Never generate fake traffic, clicks or impressions.** Ad fraud is a crime in most jurisdictions (e.g. French penal code fraud provisions, US CFAA/wire fraud), it invalidates AdSense accounts, and networks detect it via behavioural and datacentre-IP analysis. There is no "undetectable" version of it.
- **Never circumvent CAPTCHAs, bot protections or ToS.** It is unlawful access in many jurisdictions and permanently bans the accounts involved.
- **Affiliate links must be declared** (`rel="sponsored nofollow"` plus the disclosure page) — required by FTC guides and the EU UCPD.
- **AdSense requires a real identity, bank account and KYC.** There is no legitimate way around that, and using someone else's identity is fraud.
- **AdSense policies:** no incentivised clicks ("click my ad"), no placing ads misleadingly, no AI-generated content farms with no added value. This site's content is written to be genuinely useful — keep new pages at that bar.

## License

Code: MIT (see `LICENSE`). Content: your own once you publish.
