/* ─────────────────────────────────────────────────────────────────────────
   Issues open for bank bids.  One object per issue, keyed by `id`.
   The bank bid page (bids/index.html) is opened with  ?issue=<id>&accessCode=<code>
   and reads the issue's terms from here.  The access code itself is NOT in
   this file: it is issued per bank and checked by the intake flow.

   Fields
     id              short slug used in the link
     issuer          legal name
     issue           series / title
     par             par amount in dollars
     purpose         one line on what the proceeds do
     security        how the bonds are paid
     taxStatus       "Tax-exempt" | "Taxable"
     bankQualified   true | false | null (null = to be confirmed)
     datedDate       ISO date interest starts accruing
     firstInterest   ISO date of first interest payment; interest then every 6 months
     maturities      [{date: ISO, principal: dollars}] — principal payment dates
     prepayment      prepayment / call provision shown to bidders
     bidDeadline     ISO local date-time, Central Time, e.g. "2026-11-05T11:00"
     awardDate       when the governing body expects to award
     closingDate     expected closing / delivery
     bidBasis        "single" (one rate for all maturities, the default for bank
                     placements) or "serial" (a rate for each maturity)
     documents       [{label, url}] term sheet, resolution, audits …
     contact         who to call with questions
     notes           anything else bidders should know (array of strings)

   ─── IMPORTANT ─── Items marked TODO below are placeholders taken from the
   August 17, 2026 financing memo; confirm them before any bank link goes out.
   ───────────────────────────────────────────────────────────────────────── */
window.AMKO_ISSUES = {
  "PEMBINA-2026A": {
    id: "PEMBINA-2026A",
    issuer: "City of Pembina, Pembina County, North Dakota",
    issue: "Sales Tax Revenue Bonds, Series 2026A",
    par: 350000,
    purpose: "Repairs to the Stutsman Street bridge over the Pembina River.",
    security: "Payable from the City's 2.5% sales and use tax: the 1% Pledged Sales Tax is pledged directly to debt service and the City covenants to budget so much of the 1.5% Available Sales Tax as is needed for the balance. Issued as Parity Bonds under the resolution for the Sales Tax Revenue Refunding Bonds, Series 2021, which retire May 1, 2027. Not a general obligation; no property tax pledge.",
    taxStatus: "Tax-exempt",
    bankQualified: true,                 // TODO confirm designation
    datedDate: "2026-11-01",             // TODO confirm dated / delivery date
    firstInterest: "2027-05-01",         // interest only through May 1, 2027
    maturities: [                        // TODO confirm principal amounts
      { date: "2028-05-01", principal: 70000 },
      { date: "2029-05-01", principal: 70000 },
      { date: "2030-05-01", principal: 70000 },
      { date: "2031-05-01", principal: 70000 },
      { date: "2032-05-01", principal: 70000 }
    ],
    prepayment: "Bonds may be prepaid in whole or in part on any interest payment date at par plus accrued interest, without premium.",   // TODO confirm
    bidDeadline: "2026-11-05T11:00",     // TODO set
    awardDate: "2026-11-09",             // TODO set (next Council meeting)
    closingDate: "2026-12-01",           // TODO set
    bidBasis: "single",
    documents: [
      // { label: "Term Sheet (PDF)", url: "../os/pembina-2026a-term-sheet.pdf" },
      // { label: "Series 2021 Bond Resolution", url: "" }
    ],
    contact: { name: "Brian D. Osowski", title: "President & Senior Municipal Advisor", phone: "701.540.6821", email: "brian.osowski@amkoadvisors.com" },
    notes: [
      "Interest is payable semiannually each May 1 and November 1, beginning May 1, 2027. Principal is payable annually each May 1, 2028 through 2032.",
      "Sales tax collections averaged $330,363 per year for 2021 through 2025; collections for the twelve months through July 2026 were $336,176.",
      "The purchaser will receive the City's closing transcript, including the authorizing resolution and the approving opinion of bond counsel."
    ]
  }
};
