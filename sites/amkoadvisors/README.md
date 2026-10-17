# amkoadvisors.com

Source for the AMKO Advisors, LLC website. It is a sibling of the AMKO Capital
site at the root of this repository and shares its design system so the two
read as one family:

| Shared element | Where it comes from |
| --- | --- |
| Color token roles (`--navy`/`--brand`/`--accent` here mirror `--slate`/`--maroon`/`--tan` on amkocap.com) | Same roles and component CSS; values come from the AMKO Advisors master logo file: PANTONE 2728 C blue `#0047BB`, navy `#12264F` derived from it, light-blue accent `#9FBDEB`, black type |
| Fonts | Playfair Display (headings) + Source Sans 3 (body), Google Fonts |
| Nav, hero grid, trust bar, section eyebrow/title/body, service cards, step grid, contact block, footer | Same class names and CSS as amkocap.com |
| Logo | The real AMKO Advisors wordmark, traced from `AMKO_Advisors-Tagline.ai` into an inline SVG `<symbol>` (nav on white, footer reversed to white ink). Header is white so the mark shows in its own colors |

Family colors used on the AMKO Companies cards: Advisors blue `#0047BB`,
Capital maroon `#8B2635`, Bond Services green `#00A651` (from the bond
platform letterhead), RateWorks teal `#0E4A5C` (from `amko-rateworks/brand`).
Family links: amkocap.com, amkobondservices.com (coming soon), amkorateworks.com.

Everything is one static page: `index.html`, two data files in `data/`, and
PDFs in `os/`. No build step.

```
sites/amkoadvisors/
├── index.html                   the site
├── CNAME                        amkoadvisors.com (published with the folder)
├── data/deals.js                "Recent deals closed" — AMKO Core hand-off point
├── data/official-statements.js  Official Statement catalog
└── os/                          Official Statement PDFs (see os/README.md)
```

## Local preview

Open `index.html` in a browser. Nothing needs a server; the data files are
plain scripts so `file://` works.

## Editing content

* **Official Statements** – drop the PDF in `os/`, add a row to
  `data/official-statements.js` with `file: "os/<name>.pdf"`. Rows without a
  file show a "Request a copy" button that pre-fills the contact form.
* **Recent deals** – edit `data/deals.js` (shape documented in the file).
  Rows whose `osId` matches an Official Statement get a Download link.
* **Contact form** – set `CONTACT_ENDPOINT` near the top of the `<script>`
  block in `index.html` to a Power Automate HTTP trigger URL (same pattern as
  amkocap.com). While it is blank the form opens the visitor's mail client
  addressed to info@amkoadvisors.com with the message pre-filled.
* **Nothing in this folder may contain the old address or phone numbers.**
  The deploy workflow fails if `4201 38th`, `364-9884` or `844-733` /
  `733-AMKO` appears in any `.html`/`.js`.

## AMKO Core integration (recent deals)

The deals table reads `window.AMKO_DEALS` from `data/deals.js`. Two ways to
feed it from AMKO Core later, in order of preference:

1. **Push** – have AMKO Core regenerate `data/deals.js` (or a `deals.json`
   with the same array) and commit it to this folder; the workflow deploys it.
2. **Pull** – expose a read-only JSON endpoint and set `AMKO_DEALS_ENDPOINT`
   in `index.html`. The page fetches it on load and silently falls back to
   the static file if the request fails. The endpoint must allow CORS from
   `https://amkoadvisors.com` and should return only closed, public deals.

Field reference is in the header comment of `data/deals.js`.

## Deployment (GitHub Pages, same host as amkocap.com)

GitHub Pages serves one site and one custom domain per repository, and this
repository already serves amkocap.com from its root. So this folder is
published by `.github/workflows/deploy-amkoadvisors.yml` into a sibling
repository that exists only as a Pages target.

One-time setup:

1. Create an empty repository `C71-BrianOsowski/amkoadvisors-site`.
2. In that repo: **Settings → Pages**: Source "Deploy from a branch", branch
   `gh-pages`, folder `/ (root)`. Enter custom domain `amkoadvisors.com`.
   Tick **Enforce HTTPS** after DNS has propagated (see cutover below).
3. Create a fine-grained personal access token scoped to `amkoadvisors-site`
   with **Contents: Read and write**, and add it to *this* repository as the
   Actions secret `AMKOADVISORS_DEPLOY_TOKEN`.
4. Run the workflow once from the Actions tab ("Run workflow") or push a
   change under `sites/amkoadvisors/`.

After that every push to `main` that touches this folder redeploys. Preview
before cutover at `https://c71-brianosowski.github.io/amkoadvisors-site/`.
Because the folder ships a `CNAME`, Pages will redirect that preview URL to
the custom domain once the domain is attached, so review the preview before
entering the custom domain in Pages settings.

## Cutover checklist (aoTek → GitHub Pages)

Leave the aoTek site running until every box is ticked.

- [ ] New site deployed and reviewed at the Pages preview URL.
- [ ] **Confirm email is not on aoTek.** In GoDaddy DNS for amkoadvisors.com,
      note the `MX` records. Mail is on Microsoft 365, so they should point to
      `*.mail.protection.outlook.com`. If any MX, or the `autodiscover` CNAME,
      points at an aoTek host, do not let hosting lapse until mail is moved.
      Also check `TXT` (SPF, DKIM, DMARC) for aoTek hosts.
- [ ] In GoDaddy DNS, replace the web records only:
      * `A` records for `@` → `185.199.108.153`, `185.199.109.153`,
        `185.199.110.153`, `185.199.111.153`
      * `CNAME` for `www` → `c71-brianosowski.github.io`
      Delete any other `A`/`AAAA`/`CNAME` for `@` or `www` that point to aoTek.
      Leave MX/TXT/SRV untouched.
- [ ] Wait for propagation (minutes to a few hours), then in the
      `amkoadvisors-site` Pages settings confirm "DNS check successful" and
      tick **Enforce HTTPS**.
- [ ] Verify `https://amkoadvisors.com` and `https://www.amkoadvisors.com`
      both load the new site, and that `http://` redirects.
- [ ] Update any printed material, email signatures or directory listings that
      still carry the old address or 701.364.9884.
- [ ] Do **not** renew aoTek hosting (paid through June 2027). Ask aoTek to
      confirm nothing else (email forwarding, DNS, backups) runs on their
      account before it lapses.

## Copy provenance — please verify against the live site

This sandbox could not reach amkoadvisors.com, so the live text could not be
copied verbatim. Lines below marked **verbatim** were recovered from search
index snapshots of the live pages and are reproduced exactly; everything else
is written in the same voice and should be checked against the live site and
replaced with the original wording where it differs.

| Section | Status |
| --- | --- |
| Hero paragraph ("AMKO specializes in providing public financial solutions …") | **verbatim** (home page) |
| Registration sentence (MSRB #K0852 / SEC #867-00428) | **verbatim** (home page / email signature) |
| About lede ("As an independent municipal advisor, AMKO puts together the best possible financing structure and pricing …") | close paraphrase of contact page |
| Services intro ("AMKO offers a step-by-step process toward identifying your financing needs") | **verbatim** (services page) |
| Continuing Disclosure ("We will work with you and your community to ensure your existing bonds' disclosure requirements are completed timely and accurately") | **verbatim** (services page) |
| Service names (Debt Issuance, Debt Management, Deposit & Investment Management, Continuing Disclosure, Leasing & Payment Processing, Economic Development) | **verbatim** (services page); Utility Rate Modeling is a new seventh service added for AMKO RateWorks |
| Service descriptions, "Independent / Fiduciary / Registered / Local" tiles, process steps | drafted — replace with live copy |
| Team names and titles (Brian D. Osowski, President & Senior Municipal Advisor; Mark Deraney, Vice President & Municipal Advisor) | **verbatim** (about-us page) |
| Team bios | drafted — replace with live copy |
| AMKO Charitable Endowment Fund paragraph | **verbatim** (firm email signature) |
| "Your Vision. Our Solutions." | **verbatim** (firm tagline, flyers and Capital logo) |
| AMKO Bond Services description | drafted from the MN Small Cities directory profile |

**Retired toll-free number.** 1.844.733.AMKO (844-733-2656) was AMKO's but
was released and has since been reserved by another party (Somos lookup,
October 2026, held by Interactive RespOrg Management, LLC). It must not
appear anywhere on this site; the deploy workflow fails if it does. It still
appears on the old aoTek site, on several marketing flyers in SharePoint, and
in the Zions Bank paying-agent "AMKO Debt Service Notice" template, which
Zions needs to update.
