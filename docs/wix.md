# Domain at Wix, site on GitHub Pages

Wix cannot host this Astro site. Do not rebuild it in the Wix editor, and do not connect the domain to a Wix site. If `vakrtundconstruction.in` was bought at Wix, Wix stays the registrar. You only change DNS records. Wix does not let you change nameservers on a domain it sold.

Until those records answer, the site is:

https://sampada-organization.github.io/vakratund-construction/

There is no `CNAME` file in the project yet. Adding one before DNS answers would make that GitHub address jump to a domain that does not point here.

## Records in Wix

1. Log in at [wix.com](https://www.wix.com) → **Settings** → **Domains**.
2. Next to `vakrtundconstruction.in`, **Domain Actions** → **Manage DNS Records**.
3. Leave the Wix nameservers as they are.

### Apex (`vakrtundconstruction.in`)

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
gh variable set PRODUCTION_DOMAIN --repo sampada-organization/vakratund-construction --body vakrtundconstruction.in
printf 'vakrtundconstruction.in\n' > public/CNAME
git add public/CNAME && git commit -m "Attach vakrtundconstruction.in" && git push
```

GitHub then issues a free certificate. HTTPS can take up to an hour. The public address becomes `https://vakrtundconstruction.in`. The GitHub Pages address keeps working as well.

Call, WhatsApp, and email links work on Pages. The contact forms and the desk do not: Pages has no API. Those run on the computer with `npm run dev:full`, and later on the free Azure host if you turn that on.
