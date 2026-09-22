#!/usr/bin/env bash
# Create ONLY a Free Azure Static Web App. Refuses any paid SKU.
set -euo pipefail
export PATH="$HOME/.local/bin:$HOME/.azure-cli/bin:$PATH"

NAME="${AZ_SWA_NAME:-vakratund-web}"
RG="${AZ_RESOURCE_GROUP:-rg-vakratund}"
LOC="${AZ_LOCATION:-eastasia}"
SKU="Free"
REPO="${GITHUB_REPO:-}"
INBOX="${ENQUIRY_REPO:-}"
BRANCH="${GITHUB_BRANCH:-main}"

if [[ "$SKU" != "Free" ]]; then
  echo "Refusing SKU=$SKU — this project is locked to Free (billing zero)."
  exit 1
fi

if [[ -z "$REPO" || -z "$INBOX" ]]; then
  echo "Set GITHUB_REPO (public site) and ENQUIRY_REPO (private inbox), as owner/name."
  exit 1
fi

if ! command -v az >/dev/null; then
  echo "Azure CLI not on PATH. Expected $HOME/.local/bin/az"
  exit 1
fi

if ! az account show >/dev/null 2>&1; then
  echo "Not logged in. Run: az login --use-device-code"
  exit 1
fi

echo "Subscription (must stay on Free-tier resources only):"
az account show --query '{name:name,id:id,state:state}' -o table

az group create --name "$RG" --location "$LOC" --tags billing=zero project=vakratund sku=free >/dev/null
echo "Resource group $RG"

if ! az staticwebapp show --name "$NAME" --resource-group "$RG" >/dev/null 2>&1; then
  az staticwebapp create \
    --name "$NAME" \
    --resource-group "$RG" \
    --location "$LOC" \
    --sku "$SKU" \
    --tags billing=zero project=vakratund sku=free
fi

ACTUAL_SKU=$(az staticwebapp show --name "$NAME" --resource-group "$RG" --query "sku.name" -o tsv)
if [[ "$ACTUAL_SKU" != "Free" ]]; then
  echo "ABORT: site SKU is $ACTUAL_SKU, expected Free. No paid SKU is allowed."
  exit 1
fi

TOKEN=$(az staticwebapp secrets list --name "$NAME" --resource-group "$RG" --query "properties.apiKey" -o tsv)
HOST=$(az staticwebapp show --name "$NAME" --resource-group "$RG" --query "defaultHostname" -o tsv)
CMS_PASSWORD="${CMS_PASSWORD:-$(openssl rand -hex 12)}"
ENQUIRY_TOKEN="${ENQUIRY_GITHUB_TOKEN:-$(gh auth token)}"

az staticwebapp appsettings set \
  --name "$NAME" \
  --resource-group "$RG" \
  --setting-names \
    "ENQUIRY_GITHUB_TOKEN=${ENQUIRY_TOKEN}" \
    "GITHUB_REPO=${INBOX}" \
    "CMS_PASSWORD=${CMS_PASSWORD}" \
    "ALLOWED_ORIGINS=https://${HOST},https://vakrtundconstruction.in,https://www.vakrtundconstruction.in" \
  >/dev/null

if command -v gh >/dev/null; then
  gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo "$REPO" --body "$TOKEN"
  gh secret set CMS_PASSWORD --repo "$REPO" --body "$CMS_PASSWORD"
  gh secret set ENQUIRY_GITHUB_TOKEN --repo "$REPO" --body "$ENQUIRY_TOKEN"
fi

echo
echo "SKU: Free"
echo "Host: https://${HOST}"
echo "Inbox repo (private): ${INBOX}"
echo "Admin password stored as GitHub secret CMS_PASSWORD"
echo "Push main (or re-run the Azure Static Web Apps workflow) to deploy."
