# Domain: vakratundconstruction.in

The public site name is **Vakratund**. The domain is **vakratundconstruction.in**. Registration and DNS stay at **Wix**. Wix does not host the site. Do not install a Wix app, and do not point the name at `pointing.wixdns.net`.

`public/CNAME` contains exactly:

```text
vakratundconstruction.in
```

Checked on 9 Oct 2026: nameservers are `ns2.wixdns.net` and `ns3.wixdns.net`. The records below for GitHub Pages are already published. `https://vakratundconstruction.in` still fails because GitHub’s certificate is `*.github.io`. The Pages project has not been told this custom domain yet, so it will not issue a certificate until that setting matches `public/CNAME`.

There is no mail on this domain. Do not add MX records. The office uses Gmail.

## Where to edit

1. Log in at [wix.com](https://www.wix.com) → **Settings** → **Domains**.
2. Select **vakratundconstruction.in** → **Manage DNS Records**.
3. Leave the Wix nameservers as they are.

TTL **300** seconds while a record is changing. Apex changes can take up to 72 hours. Usually they answer within an hour.

## Now: GitHub Pages

This is the only host that exists today. Forms and the desk do not run here. Keep these records until the Azure app in the next section is created.

Delete any Wix parking A records (`185.230.63.*` or similar). The apex should have these four, and no others:

| Type | Host | Value |
|------|------|--------|
| A | `@` (blank) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

| Type | Host | Value |
|------|------|--------|
| CNAME | `www` | `sampada-organization.github.io` |

Optional IPv6 on the apex, host blank:

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

Then, in the GitHub repository **sampada-organization/vakratund-construction**:

1. **Settings → Pages → Custom domain**: `vakratundconstruction.in`.
2. Set the Actions variable `PRODUCTION_DOMAIN` to `vakratundconstruction.in`.
3. Publish `main` so `public/CNAME` is on the Pages site.

GitHub issues the certificate after the DNS and that setting agree. HTTPS can take up to an hour after that. If GitHub shows a TXT value for verification, add that TXT in Wix with the host GitHub prints. Do not invent one.

`www.vakratundconstruction.in` follows the CNAME and should open the same site once the certificate exists. Prefer the apex as the address people share.

## Later: Azure Static Web Apps (Free)

Move DNS only after `scripts/azure-bootstrap.sh` has printed an `https://….azurestaticapps.net` host. The Free plan allows **two** custom domains. Use them for `vakratundconstruction.in` and `www.vakratundconstruction.in`. Leave `vakrtundconstruction.com` off this app.

In the Azure portal: Static Web App → **Custom domains** → **Add** → **Custom domain on other DNS**. Add `www.vakratundconstruction.in` first, then the apex. Copy the hostname from **Overview** (no `https://`). If Azure shows a TXT code, paste that code. It is different for every app.

Wix cannot store an ALIAS or a CNAME on the apex. Use the www name as the real host.

### `www`

Delete the GitHub CNAME first.

| Type | Host | Value |
|------|------|--------|
| CNAME | `www` | The Overview hostname, such as `vakratund-web.azurestaticapps.net` |

### Apex

Delete all four GitHub A records (`185.199.108.153` through `185.199.111.153`) and any AAAA records. Do not leave them in place beside the new records.

**Preferred.** In Wix, forward only the naked domain to `https://www.vakratundconstruction.in` (301). Traffic then stays on Azure’s global edge. In the Static Web App, set **www** as the default domain so the apex and the `azurestaticapps.net` name send people to `www`.

**If Wix will not forward while these DNS records exist.** On the Static Web App **Overview**, open **JSON View** and copy `stableInboundIP`. Add:

| Type | Host | Value |
|------|------|--------|
| A | `@` | That IP, one record only |
| TXT | `@` | The code Azure generates when you add the apex |

An A record pins the apex to one region. The www CNAME does not.

Azure validates the name after the records answer, then issues HTTPS. Allow up to an hour, sometimes longer.

Forms (`/api/enquiry`, `/api/onboard`, `/api/meeting`) and the desk at `/admin` work on this host. They do not work on GitHub Pages.

## The older name

`vakrtundconstruction.com` is a different registration, also at Wix. Its records are in [wix.md](wix.md). When `vakratundconstruction.in` answers on HTTPS, forward the `.com` name to `https://vakratundconstruction.in` at Wix so there is one address. That forward does not use an Azure custom-domain slot.
