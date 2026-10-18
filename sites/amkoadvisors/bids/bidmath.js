/* AMKO Advisors — bid ranking math shared by the bank bid page and the tabulation page.
   Conventions: 30/360 day count, semiannual interest, principal on the maturity dates
   given.  True Interest Cost (TIC) is the annual rate, compounded semiannually, that
   discounts all debt service back to the dated date so that its present value equals
   the net proceeds (par less the bidder's one-time fees).  Lowest TIC wins.
   Net Interest Cost (NIC) = (total interest + fees) / total bond-years, shown for
   reference only.  All functions are pure; nothing touches the page. */
(function (global) {
  function parseISO(s) { var p = s.split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function days360(a, b) {               // US 30/360
    var d1 = Math.min(a.d, 30), d2 = b.d; if (d1 === 30 && d2 === 31) d2 = 30;
    return (b.y - a.y) * 360 + (b.m - a.m) * 30 + (d2 - d1);
  }
  function addMonths(iso, n) {
    var p = parseISO(iso); var m = p.m - 1 + n; var y = p.y + Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    var dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); var d = Math.min(p.d, dim);
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }
  /* Build the payment schedule for an issue at the given coupon(s).
     rates: a number (single rate for every maturity, in percent) or an object {maturityDate: percent}. */
  function schedule(issue, rates) {
    var dated = issue.datedDate, first = issue.firstInterest;
    var mats = issue.maturities.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var last = mats[mats.length - 1].date;
    var dates = []; var d = first; while (d <= last) { dates.push(d); d = addMonths(d, 6); }
    if (dates.indexOf(last) < 0) dates.push(last);
    var rateFor = function (mat) { return typeof rates === 'number' ? rates : Number(rates[mat.date] || 0); };
    var rows = [], outstanding = mats.map(function (m) { return { date: m.date, bal: m.principal, rate: rateFor(m) }; });
    var prev = dated, totalInterest = 0, totalPrincipal = 0;
    dates.forEach(function (pd) {
      var frac = days360(parseISO(prev), parseISO(pd)) / 360;
      var interest = 0, principal = 0;
      outstanding.forEach(function (o) {
        if (o.bal > 0) { interest += o.bal * (o.rate / 100) * frac; }
        if (o.date === pd) { principal += o.bal; o.bal = 0; }
      });
      totalInterest += interest; totalPrincipal += principal;
      rows.push({ date: pd, days: days360(parseISO(dated), parseISO(pd)), interest: interest, principal: principal, total: interest + principal });
      prev = pd;
    });
    var bondYears = 0; mats.forEach(function (m) { bondYears += m.principal * days360(parseISO(dated), parseISO(m.date)) / 360; });
    return { rows: rows, totalInterest: totalInterest, totalPrincipal: totalPrincipal, totalDebtService: totalInterest + totalPrincipal, bondYears: bondYears };
  }
  function pv(rows, annualRate) {        // semiannual compounding, periods measured in 180-day units on 30/360
    var s = 0; rows.forEach(function (r) { s += r.total / Math.pow(1 + annualRate / 2, r.days / 180); }); return s;
  }
  /* TIC in percent.  fees are one-time dollars the bidder charges; they reduce net proceeds. */
  function tic(issue, rates, fees) {
    var sch = schedule(issue, rates), target = sch.totalPrincipal - (Number(fees) || 0);
    if (target <= 0) return NaN;
    var lo = -0.5, hi = 2.0;               // bisection on annual rate (decimal)
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (pv(sch.rows, mid) > target) lo = mid; else hi = mid; }
    return ((lo + hi) / 2) * 100;
  }
  function nic(issue, rates, fees) {
    var sch = schedule(issue, rates); return sch.bondYears > 0 ? ((sch.totalInterest + (Number(fees) || 0)) / sch.bondYears) * 100 : NaN;
  }
  /* Rank an array of bids. Each bid: {bank, rate (percent) or rates {date:percent}, fees, ...}. Adds tic, nic,
     totalInterest, totalDebtService and rank; returns a new array sorted lowest TIC first. */
  function rank(issue, bids) {
    var out = bids.map(function (b) {
      var rates = (b.rates && Object.keys(b.rates).length) ? b.rates : Number(b.rate);
      var sch = schedule(issue, rates);
      return Object.assign({}, b, { tic: tic(issue, rates, b.fees), nic: nic(issue, rates, b.fees), totalInterest: sch.totalInterest, totalDebtService: sch.totalDebtService, schedule: sch });
    });
    out.sort(function (a, b) { return (isNaN(a.tic) ? 1e9 : a.tic) - (isNaN(b.tic) ? 1e9 : b.tic); });
    out.forEach(function (b, i) { b.rank = i + 1; });
    return out;
  }
  function fmtUSD(n, cents) { var v = cents ? n.toFixed(2) : Math.round(n).toString(); return '$' + v.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtDate(iso) { if (!iso) return ''; var p = iso.slice(0, 10).split('-'); var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1]; return m + ' ' + (+p[2]) + ', ' + p[0]; }
  function fmtPct(x, d) { return isNaN(x) ? '—' : x.toFixed(d == null ? 3 : d) + '%'; }
  global.AMKOBid = { schedule: schedule, tic: tic, nic: nic, rank: rank, fmtUSD: fmtUSD, fmtDate: fmtDate, fmtPct: fmtPct, addMonths: addMonths };
})(window);
