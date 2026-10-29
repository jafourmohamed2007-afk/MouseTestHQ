# MouseTestHQ

A static website that provides free browser-based mouse and keyboard testing tools, plus original buying guides for gaming and productivity peripherals.

## What's included

**Interactive tools** (run entirely in your browser, no backend):

- **CPS Test** (`cps-test.html`) — measure clicks per second with millisecond precision
- **Keyboard Tester** (`keyboard-test.html`) — visualize every keypress, test anti-ghosting
- **Mouse Polling Rate Checker** (`mouse-polling-rate.html`) — measure real Hz with live graph
- **Click Latency Test** (`latency-test.html`) — benchmark reaction time across multiple rounds

**Content pages:**

- `index.html` — homepage with tool cards
- `blog/` — 8 SEO-optimized articles with affiliate links
- `about.html`, `contact.html` — trust pages
- `privacy-policy.html`, `terms-of-service.html`, `affiliate-disclosure.html` — legal

**SEO infrastructure:**

- `sitemap.xml` — submit to Google Search Console
- `robots.txt` — controls crawler access
- Per-page meta tags, OG tags, JSON-LD on articles

## File structure

```
mousetesthq/
├── index.html
├── cps-test.html
├── keyboard-test.html
├── mouse-polling-rate.html
├── latency-test.html
├── about.html
├── contact.html
├── privacy-policy.html
├── terms-of-service.html
├── affiliate-disclosure.html
├── blog/
│   ├── index.html
│   ├── best-gaming-mouse-2026.html
│   ├── best-mouse-for-fps.html
│   ├── best-mechanical-keyboard-2026.html
│   ├── best-budget-mouse.html
│   ├── what-is-polling-rate.html
│   ├── how-to-test-mouse-latency.html
│   ├── cpi-vs-dpi.html
│   └── logitech-vs-razer-vs-steelseries.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js        # theme, nav, cookie banner
│   ├── cps.js
│   ├── keyboard.js
│   ├── polling.js
│   └── latency.js
├── assets/            # (empty — add product images here)
├── sitemap.xml
└── robots.txt
```

## Local development

This is a static site — no build step required.

1. Open `index.html` in a browser, **or**
2. Serve locally with Python: `python -m http.server 8000`
3. Visit `http://localhost:8000`

For real development, use any static host:

- **Vercel** — drag the folder onto vercel.com/new (free, HTTPS, CDN)
- **Netlify** — same, drag onto app.netlify.com/drop
- **Cloudflare Pages** — connect a Git repo

## Pre-launch checklist

- [x] Replace `mousetesthq.com` references with your real domain
- [x] Contact form uses a client-side success modal (no backend) (`contact.html`)
- [x] Amazon Associates account created — tracking ID `any09eb6-20`
- [ ] **Re-enable Amazon affiliate links** (currently disabled pending regional payment setup — see below)
- [ ] Apply for [Google AdSense](https://www.google.com/adsense/) — pays by bank transfer, works in most countries
- [ ] Set up [Google Search Console](https://search.google.com/search-console/) and submit `sitemap.xml`
- [ ] Verify all internal links work
- [ ] Test the four interactive tools on desktop and mobile
- [ ] Add real product images to `assets/` and reference them in articles
- [ ] Update `mousetesthq.com` email addresses in legal pages if desired

## How to re-enable the Amazon buy buttons

The affiliate links and product buy buttons were removed from all articles while the
regional payment method was being sorted. **All product tables, specifications and prices
were kept** — only the click-through buttons were removed.

To restore them (one command, takes 10 seconds):

```
python restore_affiliate.py
git add -A
git commit -m "Restore Amazon affiliate links"
git push origin main
```

This extracts `affiliate_backup_with_links.zip` over the site and brings back every
"Check price on Amazon" button with tracking ID `any09eb6-20`.

**Why restore them as soon as payment works:** the buttons cost nothing to run and are the
only monetisation channel currently wired up. AdSense pays by bank transfer and is available
in almost every country, so it does not depend on the same payment provider as Stripe.

## Browser support

Tested on latest Chrome, Firefox, Safari, Edge. IE is not supported.

## License

Source code: MIT. Article content: All rights reserved.
