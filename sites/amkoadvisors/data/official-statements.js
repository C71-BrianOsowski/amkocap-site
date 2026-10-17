/* ─────────────────────────────────────────────────────────────────────────
   Official Statements available for download.
   Drop the PDF into sites/amkoadvisors/os/ and add a row here.

   Shape:
     id      : short unique slug (deals.js rows can reference it via osId)
     issuer  : issuer name
     issue   : series / title
     dated   : ISO date of the Official Statement (YYYY-MM-DD)
     par     : par amount in dollars (number)
     state   : two-letter state code
     file    : path relative to this site's root, e.g. "os/newtown-2026a-os.pdf"
               Leave file empty ("") to show the row without a download link.
     emma    : optional — EMMA (MSRB) URL for the issue
     status  : "Final" | "Preliminary"
   ───────────────────────────────────────────────────────────────────────── */
window.AMKO_OFFICIAL_STATEMENTS = [
  { id: "newtown-2026a", issuer: "City of New Town, North Dakota", issue: "Sales Tax Revenue Bonds, Series 2026A", dated: "2026-08-25", par: 7000000, state: "ND", file: "", emma: "", status: "Final" },
  { id: "wbsd7-2024", issuer: "Williston Basin School District #7, Williams County, North Dakota", issue: "General Obligation School Building Bonds, Series 2024", dated: "2024-10-07", par: 35000000, state: "ND", file: "", emma: "", status: "Final" },
  { id: "mapleton-2021", issuer: "City of Mapleton, Cass County, North Dakota", issue: "Refunding Improvement Bonds, Series 2021", dated: "2021-09-21", par: 3555000, state: "ND", file: "", emma: "", status: "Final" }
];
