# Older domain: vakrtundconstruction.com

This file is only for **vakrtundconstruction.com**. The domain to use is **vakratundconstruction.in**. Its records are in [dns.md](dns.md).

Wix holds the registration for the `.com` name. It does not host the site. Do not install a GitHub or Pages plugin inside Wix.

`public/CNAME` now contains `vakratundconstruction.in`. GitHub Pages serves one custom domain from that file. The `.com` name should forward to the `.in` name once that certificate is live. Until then, the records below keep the `.com` name on GitHub Pages.

## Records in Wix

1. Log in at [wix.com](https://www.wix.com) → **Settings** → **Domains**.
2. Next to `vakrtundconstruction.com`, **Domain Actions** → **Manage DNS Records**.
3. Leave the Wix nameservers as they are.

### Apex (`vakrtundconstruction.com`)

Delete A records that point at Wix (`185.230.63.*` or similar). Add:

| Type | Host name | Value |
|---|---|---|
| A | (leave blank, or `@`) | `185.199.108.153` |
| A | (leave blank, or `@`) | `185.199.109.153` |
| A | (leave blank, or `@`) | `185.199.110.153` |
| A | (leave blank, or `@`) | `185.199.111.153` |

Optional IPv6, host blank:

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

### `www`

Point `www` at GitHub, not `pointing.wixdns.net`.

| Type | Host name | Value |
|---|---|---|
| CNAME | `www` | `sampada-organization.github.io` |

TTL 300 seconds is enough while this is launching.

## After the records answer

The GitHub variable for this older name is `PRODUCTION_DOMAIN=vakrtundconstruction.com`. GitHub issues the certificate after the CNAME file published on Pages matches the domain in the Pages setting. HTTPS can take up to an hour.

Call, WhatsApp, and email links work on Pages. The contact forms and the desk do not: Pages has no API. Those run on a computer with `npm run dev:full`, and on the free Azure host once [dns.md](dns.md) points `vakratundconstruction.in` there.
