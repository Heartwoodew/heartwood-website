# Heartwood Earthworx

Static marketing site for Heartwood Earthworx Pty Ltd (ABN 31 667 738 098), an earthworks and site-services subcontractor based in New Beith, Queensland.

Plain HTML, CSS and a small script. No build step, no server, no secrets. It is meant to be hosted on GitHub Pages, or any other static host, on **heartwoodew.com**.

## Preview locally

From this folder:

```bash
python3 -m http.server 47321
```

Open http://127.0.0.1:47321/

Use a local server. Opening the HTML files directly (`file://`) will not load the fonts and scripts reliably.

## Edit the phone, email and form

### Phone

The public number is 0499 802 812.

- `phoneDisplay` in `js/config.js` is `0499 802 812`. That is what people see when JavaScript runs.
- `phoneTel` in `js/config.js` is `+61499802812`. That is the tap-to-call link.
- The same number is in the HTML `tel:` links, and in the LocalBusiness `telephone` field in `index.html`, so it is still there with JavaScript off.

If the number changes, update `js/config.js`, the `tel:` links, and that schema field together.

### Email

`email` in `js/config.js` is what the form and the on-page addresses use when JavaScript runs.

The same address is also written into the HTML so it still works with JavaScript off. If you change the address, update `email` in `js/config.js` and search the project for `alex@heartwoodew.com`.

### Contact form

`formEndpoint` in `js/config.js` is the only place the form posts to.

While it contains `TODO`, the form opens an email to the address above. Nothing is sent to a server.

To switch it to [Formspree](https://formspree.io):

1. Create a form and copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
2. Set `formEndpoint` to that URL.
3. In Formspree, set the form’s reply address if you want replies to go to the person who enquired.

The Formspree id is public by design. It is not a secret, and it does not belong in a private env file. There is no backend in this repo.

## Replace the other placeholders before launch

Search the project for `TODO_`.

| Placeholder | File | What to put there |
| --- | --- | --- |
| `TODO_FORMSPREE_ID` | `js/config.js` (`formEndpoint`) | Your Formspree form id, or leave it and keep the email fallback |
| `TODO_STREET_ADDRESS` | `index.html`, inside the LocalBusiness schema | Street address, or remove the `streetAddress` line if you do not want it public |
| `TODO_POSTCODE` | `index.html`, same schema block | The postcode for that address |

`TODO_STREET_ADDRESS` and `TODO_POSTCODE` are only in the hidden search-engine data, not on the visible page. Replace them before the site is public so they never show up in a search result.

The suburb (New Beith), state (QLD) and ABN are already filled in. Do not invent a street.

## Add job photos

See `images/README.md`. The job photos are already on the home page, the services page and the about page. Replace a file in `images/jobs/` only if you keep the same name, or the page will show the old shot.

The social share image is `images/og-image.png` (1200×630), with the badge centred on charcoal. Replace that file if you want a different preview in iMessage, LinkedIn or Facebook. Keep the same file name.

The header and tab icon use the circular Heartwood Earthworx badge: `images/logo.png` and `images/logo.webp` (400px, transparent outside the circle), `images/logo-mark.png` (512px, also used as the schema.org logo), plus `favicon-32.png`, `favicon-192.png`, `favicon.ico` and `apple-touch-icon.png`.

## Deploy to GitHub Pages

This does not deploy anything by itself. Do this when you are ready.

1. Push this folder to a GitHub repository.
2. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: `main`. Folder: `/ (root)`. Save.
4. Under **Custom domain**, enter `heartwoodew.com` and save. The repo already contains a `CNAME` file with that name, and a `.nojekyll` file so GitHub will not run Jekyll over the site. Saving the domain in GitHub does not change the rest of your DNS.

Use a user/organisation site, or this custom domain. Asset links are relative, so a project site (`username.github.io/repo-name/`) also works, but the canonical URLs and the sitemap assume `https://heartwoodew.com/`.

Turn on **Enforce HTTPS** after the certificate is issued. If it fails the first time, check the DNS records below and try again. Do not turn it on before the domain points at GitHub.

## Point heartwoodew.com at the site without touching email

The domain already sends and receives mail through Resend and Google. The website and the email use different DNS records. Change only the website records.

**Do not change nameservers.** Stay at the DNS host you already use. Do not run a “connect your website” or “set up email” wizard that rewrites the whole zone.

### Write the mail records down first

```bash
dig heartwoodew.com MX
dig heartwoodew.com TXT
dig heartwoodew.com NS
dig heartwoodew.com A
dig heartwoodew.com AAAA
dig www.heartwoodew.com CNAME
dig heartwoodew.com CNAME
```

Also note every DKIM record. Resend and Google usually put these on names like `resend._domainkey`, `s1._domainkey`, `s2._domainkey` or `google._domainkey`. They are often CNAMEs, sometimes TXT. Leave every one of them exactly as it is.

### What you may change

These are the website records only.

**Apex (`@` / `heartwoodew.com`) — four A records:**

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Apex — four AAAA records:**

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

If old website A or AAAA records are already on `@`, replace those website records with the eight addresses above. If there is no website yet, add them. Do not delete anything else in the zone while you do it.

**`www` only — one CNAME:**

```text
www.heartwoodew.com.  CNAME  <your-github-username>.github.io.
```

Use the GitHub Pages host GitHub shows you (the `*.github.io` name), not `heartwoodew.com`. If the DNS host has a proxy switch (Cloudflare’s orange cloud), leave this record DNS-only. Proxying breaks the GitHub certificate.

GitHub will redirect `www` to the apex once both are in place. The site’s canonical URLs use `https://heartwoodew.com/`.

### What you must not change

- **MX records.** These deliver mail to Google. Leave the hosts and the priorities as they are.
- **Existing TXT records.** That includes SPF, DMARC, Google verification and any Resend verification TXT. Do not edit, merge or delete them.
- **DKIM CNAMEs or TXT records** for Resend and Google. They are not the `www` record.
- **Nameservers.**

Do **not** put a CNAME on the apex (`@` / `heartwoodew.com`). A CNAME on the root cannot sit next to MX records at a normal DNS host, and replacing the apex with a CNAME is a common way to break mail. The A and AAAA records above are how the root domain points at GitHub and leaves email alone.

Some DNS hosts offer an ALIAS or ANAME on the apex that can coexist with MX. Only use that if the host guarantees the MX and TXT records stay. The four A records plus the four AAAA records are the safer choice.

If GitHub asks you to verify the domain, it gives you a **new** TXT name such as `_github-pages-challenge-yourname`. Add that as an extra record. Do not paste it into the existing SPF TXT.

### Check mail after the change

```bash
dig +short heartwoodew.com MX
dig +short heartwoodew.com TXT
```

The answers should match what you wrote down. Then:

```bash
dig +short heartwoodew.com A
dig +short www.heartwoodew.com CNAME
```

The A answers should be the four GitHub addresses. `www` should be your `*.github.io` host.

Resend keeps sending, and Google keeps receiving, because those paths use MX, SPF, DKIM and DMARC. They do not use the website A records.

## Fonts

Barlow Condensed (copyright 2017 The Barlow Project Authors) and Source Sans 3 (copyright 2023 Adobe, reserved font name “Source”) are under the SIL Open Font License. The licence texts are `fonts/OFL-barlow.txt` and `fonts/OFL-source-sans-3.txt`.
