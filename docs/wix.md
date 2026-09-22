# Domain at Wix, site on GitHub Pages

Wix cannot host this site, and no Wix plugin is required. Wix only holds the domain `vakrtundconstruction.com`. The site itself is GitHub Pages. DNS for that name already points at GitHub. Do not install a GitHub or Pages plugin inside Wix.

The live address is https://vakrtundconstruction.com. `public/CNAME` contains that name. GitHub Pages was returning “There isn't a GitHub Pages site here” until this file was published.

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

From this repo:

```bash
The domain variable is `PRODUCTION_DOMAIN=vakrtundconstruction.com`. GitHub issues the certificate after the CNAME file is published. HTTPS can take up to an hour.

Call, WhatsApp, and email links work on Pages. The contact forms and the desk do not: Pages has no API. Those run on the computer with `npm run dev:full`, and later on the free Azure host if you turn that on.
