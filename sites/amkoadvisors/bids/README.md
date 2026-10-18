# Bank Bid Portal (direct bank placements)

The AMKO Advisors counterpart to the AMKO Capital bank bid portal, for bond and
note issues that are sent straight to banks to bid on. Three pieces:

| File | Who uses it | What it does |
| --- | --- | --- |
| `index.html` | Banks | Shows the terms of one issue and takes a bid: one fixed rate (default) or a rate per maturity, plus one-time fees, rate hold, prepayment acceptance and notes. Shows the bidder its own TIC live. Posts the bid to a Power Automate flow. |
| `tabulation.html` | AMKO staff | Paste or load the bids for an issue and get them ranked by True Interest Cost, with a recommended award and the winning debt service schedule. Printable. Nothing leaves the browser. |
| `bidmath.js` | both pages | The ranking math (30/360, semiannual, TIC by bisection; NIC for reference). One copy, so a bank's preview and AMKO's tabulation always agree. |

Issue terms live in `../data/issues.js`, one entry per issue. The access codes
do **not** live there: they are issued per bank and checked by the flow.

## Running an issue

1. **Add the issue** to `data/issues.js` (copy the Pembina entry). Fill in the
   dated date, first interest date, maturity schedule, prepayment language,
   bid deadline (Central Time), expected award and closing, and any documents
   (drop PDFs in `os/` or link to them). Commit and push; the site deploys.
2. **Create the invitations.** In the *Bond Bid Invitations* SharePoint list
   (below), add one row per bank: issue ID, bank, contact, email, and a code
   such as `PEM-FNB-7K2Q`. Each bank gets its own code so a bid can be traced
   and a code can be shut off.
3. **Send each bank its link.** The link carries the issue and that bank's code
   and may pre-fill the contact fields:

   ```
   https://amkoadvisors.com/bids/?issue=PEMBINA-2026A&accessCode=PEM-FNB-7K2Q
     &bankName=First%20National%20Bank&contactName=Jane%20Smith
     &contactEmail=jsmith%40fnb.com&contactPhone=7015550123
   ```

   A link with no `accessCode` opens in **preview mode**: the form shows but
   cannot be submitted. That is how you review the page before invitations go out.
4. **After the deadline**, the page refuses new bids on its own (it compares the
   deadline with the current Central time). Export the *Bond Bids* list to CSV,
   open `tabulation.html`, pick the issue, load the file, print the tabulation
   for the council packet.

## How bids are ranked

**True Interest Cost**: the annual rate, compounded semiannually, that discounts
every principal and interest payment back to the dated date so that the present
value equals par less the bidder's one-time fees. Lowest TIC wins. Day count is
30/360. Interest accrues from the dated date, is paid on the first interest date
and every six months after, and principal is paid on the maturity dates in the
issue. A bank's fees therefore count against it exactly as a discount would.
NIC (total interest plus fees, divided by bond-years), total interest and total
debt service are shown for reference.

The bank page and the tabulation page compute from the same `bidmath.js`, so the
TIC a bank sees before submitting is the TIC AMKO ranks on.

## Power Automate setup (mirrors the Capital portal)

### SharePoint lists (AMKO Advisors Team Site)

**Bond Bid Invitations** — one row per bank per issue

| Column | Type |
| --- | --- |
| Title | Access code (e.g. `PEM-FNB-7K2Q`) |
| `IssueID` | Single line (`PEMBINA-2026A`) |
| `BankName`, `ContactName`, `ContactEmail` | Single line |
| `Status` | Choice: Active, Used, Revoked (default Active) |

**Bond Bids** — one row per bid received

| Column | Type |
| --- | --- |
| Title | Issue ID |
| `AccessCode`, `BankName`, `ContactName`, `ContactTitle`, `ContactEmail`, `ContactPhone`, `BankCity` | Single line |
| `BidBasis` | Choice: single, serial |
| `Rate` | Number (3 decimals; blank for serial bids) |
| `Rates` | Multiple lines (JSON `{"2028-05-01":3.9,…}` for serial bids) |
| `Fees` | Currency |
| `TIC`, `NIC` | Number (4 decimals, as computed by the page) |
| `TotalInterest` | Currency |
| `RateHold`, `PrepaymentAccepted` | Single line |
| `Notes` | Multiple lines |
| `TermsVersion`, `SubmittedAt`, `SubmittedAtCentral` | Single line |

### Flow: "Bond Bids - Intake"

Instant cloud flow, trigger **When an HTTP request is received**, "Who can
trigger" = Anyone. Request body schema: an object with the string properties
`issueId, issuer, issue, bidDeadline, accessCode, bankName, contactName,
contactTitle, contactPhone, contactEmail, bankCity, bidBasis, rateHold,
prepaymentAccepted, notes, termsAccepted, termsVersion, submittedAt,
submittedAtCentral`, number properties `par, rate, fees, tic, nic,
totalInterest`, and `rates` as an object.

Steps:

1. **Get items** from *Bond Bid Invitations*, filter
   `Title eq '@{triggerBody()?['accessCode']}' and IssueID eq '@{triggerBody()?['issueId']}' and Status eq 'Active'`, top 1.
2. **Condition**: if no row → **Response** status `403` (the page then shows
   "Access Not Authorized"). Otherwise continue.
3. **Condition**: if `utcNow()` converted to Central is after `bidDeadline` →
   Response `409`; the page treats any non-2xx as an error and tells the bank to call.
4. **Create item** in *Bond Bids* from the trigger body (`rates` via `string(triggerBody()?['rates'])`).
5. Optionally **Update item** on the invitation: Status = Used (one bid per code),
   or leave Active to allow a revised bid before the deadline.
6. **Send an email (V2)** to the bank: confirmation with the rate, fees and TIC
   they submitted and the time received. **Send an email** to
   brian.osowski@amkoadvisors.com with the same details.
7. **Response** status `200`.

Copy the trigger's HTTP URL into `index.html` as `BID_FLOW_URL`. Until that is
set, the Submit button opens the bank's mail program with the bid as text
addressed to info@amkoadvisors.com, so the page is usable on day one.

### Optional later: award notices

The Capital portal has an applicant decision page and flow. The same pattern
works here if you want the issuer to click Accept on the award; for now the
tabulation printout goes into the council packet.

## The Pembina issue, as entered

Everything in the `PEMBINA-2026A` entry comes from the August 17, 2026 financing
options memo and your note that the issue is $350,000 maturing in 2032. Items
marked `TODO` in `data/issues.js` are placeholders to confirm before any bank
link goes out: dated date, principal by maturity (entered as five equal
$70,000 maturities 2028–2032), prepayment provision, bank-qualified
designation, bid deadline, award date and closing date.
