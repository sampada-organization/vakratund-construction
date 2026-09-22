# Azure host — Free SKU only

Production is an Azure Static Web App on the Free SKU, plus GitHub Actions. Forms file issues on a **private** inbox repository. There is no database and no paid mail or WhatsApp gateway.

```bash
az login --use-device-code
export GITHUB_REPO=owner/vakratund-construction
export ENQUIRY_REPO=owner/vakratund-inbox
bash scripts/azure-bootstrap.sh
```

`ENQUIRY_REPO` must be private. The public site repository only receives the deploy token.

The public domain is `vakrtundconstruction.com`. DNS notes are in `docs/wix.md`. `public/CNAME` carries that name for GitHub Pages.

Visit alerts stay on the visitor’s phone: a browser notification in the open tab, a WhatsApp draft, an email draft, and a calendar file. Nothing is sent by a paid gateway.

The desk password is the `CMS_PASSWORD` app setting. On Azure the desk can read content and cannot write it. Edit `src/content`, keep `api/content` in step, and push.
