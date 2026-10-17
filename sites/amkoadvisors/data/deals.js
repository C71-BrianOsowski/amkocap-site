/* ─────────────────────────────────────────────────────────────────────────
   Recent deals closed — static stub.
   This file is the hand-off point for AMKO Core. Replace it (or have AMKO
   Core regenerate it) with the same shape. The page reads window.AMKO_DEALS
   and renders the newest `limit` rows (set in index.html).

   Shape (one object per closed deal):
     closed  : ISO date the deal closed (YYYY-MM-DD) — used for sorting/display
     issuer  : legal name of the issuer
     issue   : series / title of the obligation
     par     : par amount in dollars (number, no formatting)
     type    : short category label, e.g. "General Obligation", "Revenue",
               "Refunding", "Lease", "Improvement"
     state   : two-letter state code
     role    : AMKO's role, e.g. "Municipal Advisor"
     method  : "Competitive" | "Negotiated" | "Private Placement"
     osId    : optional — matches an `id` in official-statements.js so the
               row can link to the OS download

   Alternatively set AMKO_DEALS_ENDPOINT in index.html to a URL that returns
   this same array as JSON; the page will fetch it and fall back to this
   file if the request fails.
   ───────────────────────────────────────────────────────────────────────── */
window.AMKO_DEALS = [
  { closed: "2026-08-27", issuer: "City of New Town, North Dakota", issue: "Sales Tax Revenue Bonds, Series 2026A", par: 7000000, type: "Revenue", state: "ND", role: "Municipal Advisor", method: "Competitive", osId: "newtown-2026a" },
  { closed: "2024-11-12", issuer: "Williston Basin School District #7, Williams County, North Dakota", issue: "General Obligation School Building Bonds, Series 2024", par: 35000000, type: "General Obligation", state: "ND", role: "Municipal Advisor", method: "Competitive", osId: "wbsd7-2024" },
  { closed: "2021-10-05", issuer: "City of Mapleton, Cass County, North Dakota", issue: "Refunding Improvement Bonds, Series 2021", par: 3555000, type: "Refunding", state: "ND", role: "Municipal Advisor", method: "Competitive", osId: "mapleton-2021" }
];
