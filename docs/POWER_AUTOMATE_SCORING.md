# Application Scoring — Power Automate Build Guide

This guide adds an automatic credit score to every submitted application. The
website already sends every input the score needs — **no website changes are
required**. All work happens inside the existing **application submission flow**
(the flow whose HTTP trigger URL contains workflow ID `7e43ea0bc89643b6a70c08c211beb696`).

---

## 1. The scoring model (100 points)

| Factor | Field(s) used | Points |
|---|---|---|
| Debt capacity — lease amount as % of taxable value | `leaseAmount`, `taxableValue` | 30 |
| Prior default / non-appropriation | `priorDefault` | 25 |
| Entity type (strength of taxing authority) | `entityType` | 15 |
| Bank Qualified status | `bankQualified` | 10 |
| Insurance (commercial vs. self-insured) | `selfInsure` | 10 |
| Term vs. asset useful life | `leaseTerm`, `equipmentType` | 10 |
| **Total** | | **100** |

### Factor detail

**Debt capacity (30 pts).** Ratio = leaseAmount ÷ taxableValue.

| Ratio | Points |
|---|---|
| ≤ 0.5% | 30 |
| ≤ 1% | 24 |
| ≤ 2% | 18 |
| ≤ 4% | 10 |
| > 4% (or taxable value missing) | 4 |

**Prior default (25 pts).** No = 25. Yes = 0, **and** the application is
forced into the *Manual Review* tier regardless of total score.

**Entity type (15 pts).** City / County / School District = 15 ·
Town / Township / State Agency = 12 · Special District = 8 · Other = 5.

**Bank Qualified (10 pts).** Bank Qualified = 10 · Nonbank Qualified = 6.

**Insurance (10 pts).** Commercially insured (self-insure = No) = 10 ·
Self-insured = 5.

**Term vs. useful life (10 pts).** Requested term within the maximum typical
useful life for the equipment type = 10 · beyond it = 4 · term "other" = 5
(the specified custom term is not currently transmitted, so it can't be
checked). Maximum terms mirror the site's suggestions: Technology 5,
Light Vehicles 6, Buses 12, Public Safety Vehicles 7, Fire Apparatus 12,
Heavy Equipment 10, Parks 15, Water/Utility 25, Communications 10,
Energy/HVAC 15, Facilities 20, Other 20.

### Tiers

| Score | Tier | Suggested handling |
|---|---|---|
| 85–100 | **Strong** | Forward to bank network same day |
| 70–84 | **Standard** | Normal review, forward within one business day |
| 55–69 | **Watch** | Review financial statements closely before forwarding |
| < 55 or any prior default | **Manual Review** | Analyst review before any bank contact |

---

## 2. Build steps in Power Automate

Open the submission flow (**When an HTTP request is received** trigger that the
Apply form posts to) and add the following actions **immediately after the
trigger**, before the email/storage actions. Each is a **Compose** action
(Built-in → Data Operation → Compose). **Rename each action exactly as shown**
— the later expressions reference these names.

> Tip: to rename an action, click its "…" menu → Rename. Power Automate
> replaces spaces with underscores in expressions, so naming an action
> `Score_Capacity` keeps the references below working verbatim.

### Action 1 — Compose, rename to `Ratio`

```
if(greater(float(coalesce(triggerBody()?['taxableValue'],'0')), 0), div(float(coalesce(triggerBody()?['leaseAmount'],'0')), float(coalesce(triggerBody()?['taxableValue'],'0'))), 1)
```

### Action 2 — Compose, rename to `Score_Capacity`

```
if(lessOrEquals(outputs('Ratio'), 0.005), 30, if(lessOrEquals(outputs('Ratio'), 0.01), 24, if(lessOrEquals(outputs('Ratio'), 0.02), 18, if(lessOrEquals(outputs('Ratio'), 0.04), 10, 4))))
```

### Action 3 — Compose, rename to `Score_PriorDefault`

```
if(equals(toLower(coalesce(triggerBody()?['priorDefault'],'')), 'no'), 25, 0)
```

### Action 4 — Compose, rename to `Score_EntityType`

```
if(contains(createArray('City','County','School District'), coalesce(triggerBody()?['entityType'],'')), 15, if(contains(createArray('Town','Township','State Agency'), coalesce(triggerBody()?['entityType'],'')), 12, if(equals(coalesce(triggerBody()?['entityType'],''), 'Special District'), 8, 5)))
```

### Action 5 — Compose, rename to `Score_BankQualified`

```
if(equals(coalesce(triggerBody()?['bankQualified'],''), 'Bank Qualified'), 10, 6)
```

### Action 6 — Compose, rename to `Score_Insurance`

```
if(equals(toLower(coalesce(triggerBody()?['selfInsure'],'')), 'no'), 10, 5)
```

### Action 7 — Compose, rename to `TermYears`

```
if(equals(coalesce(triggerBody()?['leaseTerm'],''), 'other'), -1, int(coalesce(triggerBody()?['leaseTerm'],'0')))
```

### Action 8 — Compose, rename to `MaxTerm`

The form submits the equipment type's full label text, so this matches on how
the label starts:

```
if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Technology'), 5, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Light Vehicles'), 6, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Buses'), 12, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Public Safety'), 7, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Fire'), 12, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Heavy'), 10, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Parks'), 15, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Water'), 25, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Communications'), 10, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Energy'), 15, if(startsWith(coalesce(triggerBody()?['equipmentType'],''), 'Facilities'), 20, 20)))))))))))
```

### Action 9 — Compose, rename to `Score_Term`

```
if(equals(outputs('TermYears'), -1), 5, if(lessOrEquals(outputs('TermYears'), outputs('MaxTerm')), 10, 4))
```

### Action 10 — Compose, rename to `Score_Total`

```
add(add(add(add(add(outputs('Score_Capacity'), outputs('Score_EntityType')), outputs('Score_PriorDefault')), outputs('Score_BankQualified')), outputs('Score_Insurance')), outputs('Score_Term'))
```

### Action 11 — Compose, rename to `Score_Tier`

```
if(equals(toLower(coalesce(triggerBody()?['priorDefault'],'')), 'yes'), 'Manual Review', if(greaterOrEquals(outputs('Score_Total'), 85), 'Strong', if(greaterOrEquals(outputs('Score_Total'), 70), 'Standard', if(greaterOrEquals(outputs('Score_Total'), 55), 'Watch', 'Manual Review'))))
```

---

## 3. Use the score in the flow's outputs

### In the notification email

Edit the existing "Send an email" action:

- **Subject:** `New Application — @{outputs('Score_Tier')} (@{outputs('Score_Total')}/100) — @{triggerBody()?['entityName']}`
- **Body:** add a scoring block, for example:

```
CREDIT SCORE: @{outputs('Score_Total')} / 100 — @{outputs('Score_Tier')}
  Debt capacity:   @{outputs('Score_Capacity')}/30 (lease = @{formatNumber(mul(outputs('Ratio'),100),'0.00')}% of taxable value)
  Prior default:   @{outputs('Score_PriorDefault')}/25
  Entity type:     @{outputs('Score_EntityType')}/15
  Bank qualified:  @{outputs('Score_BankQualified')}/10
  Insurance:       @{outputs('Score_Insurance')}/10
  Term vs. life:   @{outputs('Score_Term')}/10
```

### If applications are saved to SharePoint / Excel / Dataverse

Add two columns — **Score** (number) and **Tier** (text) — and map them to
`outputs('Score_Total')` and `outputs('Score_Tier')` in the existing
create-item / add-row action.

### Optional routing

Add a **Condition** on `outputs('Score_Tier')`:

- equals `Manual Review` → send the notification to the analyst queue only
  (do not auto-forward to the bank network), flagged high importance.
- otherwise → normal processing.

Test submissions (`isTestEntity` = true in the trigger body) still get scored;
if you want them excluded from routing, add
`and(equals(triggerBody()?['isTestEntity'], false), ...)` to the condition.

---

## 4. Testing

1. Save the flow and submit a test application through the site using a test
   access code.
2. In the flow's run history, open the run and confirm each `Score_*` action
   shows the expected output.
3. Sanity cases:
   - City, $250,000 lease, $45,000,000 taxable value (0.56%), no default,
     Bank Qualified, commercially insured, 5-year tech lease →
     24 + 25 + 15 + 10 + 10 + 10 = **94, Strong**.
   - Same but prior default = Yes → 69 points and forced **Manual Review**.
   - Special District, lease at 5% of taxable value, Nonbank Qualified,
     self-insured, 20-year term on light vehicles →
     4 + 25 + 8 + 6 + 5 + 4 = **52, Manual Review**.

## 5. Known limits / future improvements

- When the applicant picks lease term "Other", the custom year count typed in
  the form is not included in the submission payload, so term alignment scores
  a neutral 5. Adding `otherTerm` to the payload in `index.html` (`fSubmit`)
  would close this gap.
- The score uses application data only. The three uploaded financial
  statements are not machine-read; the tier system assumes an analyst reviews
  financials for anything below Strong.
- Thresholds and weights are starting points — adjust the point values in the
  Compose actions as underwriting experience accumulates.
