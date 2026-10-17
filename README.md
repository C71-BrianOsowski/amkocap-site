# AMKO company websites

| Site | Source | Hosting |
| --- | --- | --- |
| amkocap.com (AMKO Capital) | `/index.html` | GitHub Pages, this repository, `main` branch root (`/CNAME`) |
| amkoadvisors.com (AMKO Advisors) | `/sites/amkoadvisors/` | GitHub Pages via `.github/workflows/deploy-amkoadvisors.yml` → `amkoadvisors-site` repo |

Both sites share one design system (tokens, fonts, nav/footer, components).
When you change a shared token or component in one, mirror it in the other.
See `sites/amkoadvisors/README.md` for editing, deployment and the DNS
cutover checklist.
