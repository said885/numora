/*
 * Numora — shared front-end logic.
 * Zero dependencies. Dispatched by <body data-page="...">.
 */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  function $(sel, root) { return (root || document).querySelector(sel); }

  function toNum(value) {
    var n = parseFloat(String(value).trim().replace(",", "."));
    return isFinite(n) ? n : NaN;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function eachInput(ids, fn) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", fn);
    });
  }

  /* ---------- Loan / EMI ---------- */
  function initLoan() {
    function compute() {
      var P = toNum($("#loan-amount").value);
      var annual = toNum($("#loan-rate").value);
      var years = toNum($("#loan-years").value);
      if (!(P > 0) || !(years > 0) || !isFinite(annual) || annual < 0) {
        setText("loan-monthly", "—");
        setText("loan-total", "—");
        setText("loan-interest", "—");
        return;
      }
      var n = Math.round(years * 12);
      var r = annual / 1200;
      var monthly = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
      var total = monthly * n;
      setText("loan-monthly", money(monthly));
      setText("loan-total", money(total));
      setText("loan-interest", money(total - P));
    }
    eachInput(["loan-amount", "loan-rate", "loan-years"], compute);
    compute();
  }

  /* ---------- BMI ---------- */
  function initBmi() {
    var metricFields = $("#bmi-metric");
    var imperialFields = $("#bmi-imperial");

    function mode() {
      var r = document.querySelector('input[name="bmi-unit"]:checked');
      return r ? r.value : "metric";
    }

    function blank() {
      setText("bmi-value", "—");
      setText("bmi-label", "Enter your numbers above");
    }

    function compute() {
      var bmi;
      if (mode() === "metric") {
        var kg = toNum($("#bmi-weight").value);
        var cm = toNum($("#bmi-height").value);
        if (!(kg > 0) || !(cm > 0)) return blank();
        bmi = kg / Math.pow(cm / 100, 2);
      } else {
        var lb = toNum($("#bmi-weight").value);
        var totalIn = (toNum($("#bmi-ft").value) || 0) * 12 + (toNum($("#bmi-in").value) || 0);
        if (!(lb > 0) || !(totalIn > 0)) return blank();
        bmi = (703 * lb) / (totalIn * totalIn);
      }
      var label =
        bmi < 18.5 ? "Underweight" :
        bmi < 25 ? "Healthy weight" :
        bmi < 30 ? "Overweight" :
        "Obese";
      setText("bmi-value", bmi.toFixed(1));
      setText("bmi-label", label);
    }

    function refresh() {
      var m = mode();
      if (metricFields) metricFields.hidden = m !== "metric";
      if (imperialFields) imperialFields.hidden = m !== "imperial";
      compute();
    }

    eachInput(["bmi-weight", "bmi-height", "bmi-ft", "bmi-in"], compute);
    Array.prototype.forEach.call(document.querySelectorAll('input[name="bmi-unit"]'), function (el) {
      el.addEventListener("change", refresh);
    });
    refresh();
  }

  /* ---------- Unit converter ---------- */
  var UNIT_DATA = {
    length: {
      units: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
      labels: { km: "Kilometers (km)", m: "Meters (m)", cm: "Centimeters (cm)", mm: "Millimeters (mm)", mi: "Miles (mi)", yd: "Yards (yd)", ft: "Feet (ft)", in: "Inches (in)" },
      preset: ["km", "mi"]
    },
    weight: {
      units: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318 },
      labels: { kg: "Kilograms (kg)", g: "Grams (g)", lb: "Pounds (lb)", oz: "Ounces (oz)", st: "Stone (st)" },
      preset: ["kg", "lb"]
    },
    temperature: {
      special: true,
      preset: ["c", "f"],
      labels: { c: "Celsius (°C)", f: "Fahrenheit (°F)", k: "Kelvin (K)" }
    }
  };

  function tempToC(v, from) {
    return from === "c" ? v : from === "f" ? ((v - 32) * 5) / 9 : v - 273.15;
  }
  function tempFromC(v, to) {
    return to === "c" ? v : to === "f" ? (v * 9) / 5 + 32 : v + 273.15;
  }

  function initUnits() {
    var typeSel = $("#unit-type");
    var fromSel = $("#unit-from");
    var toSel = $("#unit-to");
    var valueIn = $("#unit-value");

    function compute() {
      var d = UNIT_DATA[typeSel.value];
      var v = toNum(valueIn.value);
      if (!isFinite(v)) {
        setText("unit-result", "—");
        return;
      }
      var out = d.special
        ? tempFromC(tempToC(v, fromSel.value), toSel.value)
        : (v * d.units[fromSel.value]) / d.units[toSel.value];
      if (Math.abs(out) < 1e-9) out = 0;
      setText("unit-result", out.toLocaleString("en-US", { maximumFractionDigits: 6 }));
      setText("unit-formula", d.labels[fromSel.value] + " → " + d.labels[toSel.value]);
    }

    function fill() {
      var d = UNIT_DATA[typeSel.value];
      [fromSel, toSel].forEach(function (sel) {
        sel.innerHTML = "";
        Object.keys(d.labels).forEach(function (k) {
          var o = document.createElement("option");
          o.value = k;
          o.textContent = d.labels[k];
          sel.appendChild(o);
        });
      });
      fromSel.value = d.preset[0];
      toSel.value = d.preset[1];
      compute();
    }

    typeSel.addEventListener("change", fill);
    [fromSel, toSel, valueIn].forEach(function (el) { el.addEventListener("input", compute); });
    fill();
  }

  /* ---------- Tip ---------- */
  function initTip() {
    var bill = $("#tip-bill");
    var pct = $("#tip-pct");
    var range = $("#tip-range");
    var people = $("#tip-people");

    function blank() {
      setText("tip-tip", "—");
      setText("tip-total", "—");
      setText("tip-per", "—");
    }

    function compute() {
      var b = toNum(bill.value);
      var p = toNum(pct.value);
      var n = Math.max(1, Math.floor(toNum(people.value) || 1));
      if (!isFinite(b) || b < 0 || !isFinite(p)) return blank();
      var tip = (b * p) / 100;
      var total = b + tip;
      setText("tip-tip", money(tip));
      setText("tip-total", money(total));
      setText("tip-per", money(total / n));
    }

    pct.addEventListener("input", function () { range.value = pct.value; compute(); });
    range.addEventListener("input", function () { pct.value = range.value; compute(); });
    eachInput(["tip-bill", "tip-people"], compute);

    Array.prototype.forEach.call(document.querySelectorAll("[data-pct]"), function (btn) {
      btn.addEventListener("click", function () {
        pct.value = btn.getAttribute("data-pct");
        range.value = btn.getAttribute("data-pct");
        Array.prototype.forEach.call(document.querySelectorAll("[data-pct]"), function (b) {
          b.classList.toggle("active", b === btn);
        });
        compute();
      });
    });
    compute();
  }

  /* ---------- Percentage ---------- */
  function initPercent() {
    function compute1() {
      var x = toNum($("#p1-x").value), y = toNum($("#p1-y").value);
      setText("p1-out", isFinite(x) && isFinite(y) ? ((x * y) / 100).toLocaleString("en-US", { maximumFractionDigits: 6 }) : "—");
    }
    function compute2() {
      var x = toNum($("#p2-x").value), y = toNum($("#p2-y").value);
      setText("p2-out", isFinite(x) && isFinite(y) && y !== 0 ? (((x / y) * 100).toLocaleString("en-US", { maximumFractionDigits: 4 }) + "%") : "—");
    }
    function compute3() {
      var x = toNum($("#p3-x").value), y = toNum($("#p3-y").value);
      var out = "—";
      if (isFinite(x) && isFinite(y) && x !== 0) {
        var pctChange = ((y - x) / Math.abs(x)) * 100;
        out = (pctChange > 0 ? "+" : "") + pctChange.toLocaleString("en-US", { maximumFractionDigits: 4 }) + "%";
      }
      setText("p3-out", out);
    }
    eachInput(["p1-x", "p1-y"], compute1);
    eachInput(["p2-x", "p2-y"], compute2);
    eachInput(["p3-x", "p3-y"], compute3);
    compute1(); compute2(); compute3();
  }

  /* ---------- Age ---------- */
  function initAge() {
    var dob = $("#age-dob");
    var asof = $("#age-asof");

    function blank() {
      setText("age-result", "—");
      setText("age-days", "—");
      setText("age-next", "—");
    }

    function compute() {
      var start = dob.value ? new Date(dob.value + "T00:00:00") : null;
      var end = asof.value ? new Date(asof.value + "T00:00:00") : new Date();
      if (!start || isNaN(start) || isNaN(end) || end < start) return blank();

      var y = end.getFullYear() - start.getFullYear();
      var m = end.getMonth() - start.getMonth();
      var d = end.getDate() - start.getDate();
      if (d < 0) {
        m--;
        d += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (m < 0) { y--; m += 12; }

      var totalDays = Math.round((end - start) / 86400000);
      setText("age-result", y + " years, " + m + " months, " + d + " days");
      setText("age-days", totalDays.toLocaleString("en-US") + " days");

      var next = new Date(end.getFullYear(), start.getMonth(), start.getDate());
      if (next < end) next = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
      var until = Math.round((next - end) / 86400000);
      setText("age-next", until === 0 ? "Today" : "In " + until + " day" + (until === 1 ? "" : "s"));
    }

    eachInput(["age-dob", "age-asof"], compute);
    compute();
  }

  /* ---------- Compound interest ---------- */
  function initCompound() {
    function fvAt(P, C, mr, months) {
      return mr > 0
        ? P * Math.pow(1 + mr, months) + C * ((Math.pow(1 + mr, months) - 1) / mr)
        : P + C * months;
    }

    function blank() {
      setText("c-final", "—");
      setText("c-invested", "—");
      setText("c-interest", "—");
      var tb = document.getElementById("c-tbody");
      if (tb) tb.innerHTML = "";
    }

    function compute() {
      var P = toNum($("#c-initial").value); if (!isFinite(P) || P < 0) P = 0;
      var C = toNum($("#c-monthly").value); if (!isFinite(C) || C < 0) C = 0;
      var r = toNum($("#c-rate").value);
      var t = toNum($("#c-years").value);
      if (!isFinite(r) || r < 0 || !isFinite(t) || t <= 0 || t > 100) return blank();
      var mr = r / 1200;
      var n = Math.round(t * 12);
      var fv = fvAt(P, C, mr, n);
      var invested = P + C * n;
      setText("c-final", money(fv));
      setText("c-invested", money(invested));
      setText("c-interest", money(fv - invested));
      var tb = document.getElementById("c-tbody");
      if (tb) {
        tb.innerHTML = "";
        var rows = Math.min(Math.ceil(t), 60);
        for (var y = 1; y <= rows; y++) {
          var months = Math.round(y * 12);
          var v = fvAt(P, C, mr, months);
          var inv = P + C * months;
          var tr = document.createElement("tr");
          tr.innerHTML = "<td>Year " + y + "</td><td>" + money(inv) + "</td><td>" + money(v) + "</td>";
          tb.appendChild(tr);
        }
      }
    }
    eachInput(["c-initial", "c-monthly", "c-rate", "c-years"], compute);
    compute();
  }

  /* ---------- Mortgage ---------- */
  function initMortgage() {
    function blank() {
      ["m-total", "m-loan", "m-pi", "m-taxout", "m-insout", "m-hoaout", "m-interest", "m-downpct"].forEach(function (id) {
        setText(id, "—");
      });
    }

    function compute() {
      var price = toNum($("#m-price").value);
      var down = toNum($("#m-down").value);
      var rate = toNum($("#m-rate").value);
      var term = toNum($("#m-term").value);
      var taxPct = toNum($("#m-tax").value); if (!isFinite(taxPct)) taxPct = 0;
      var insYear = toNum($("#m-insurance").value); if (!isFinite(insYear)) insYear = 0;
      var hoa = toNum($("#m-hoa").value); if (!isFinite(hoa)) hoa = 0;
      if (!(price > 0) || !isFinite(down) || down < 0 || down >= price ||
          !isFinite(rate) || rate < 0 || !isFinite(term) || term <= 0) return blank();
      var loan = price - down;
      var n = Math.round(term * 12);
      var r = rate / 1200;
      var pi = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
      var taxM = (price * taxPct) / 100 / 12;
      var insM = insYear / 12;
      setText("m-total", money(pi + taxM + insM + hoa));
      setText("m-loan", money(loan));
      setText("m-pi", money(pi));
      setText("m-taxout", money(taxM));
      setText("m-insout", money(insM));
      setText("m-hoaout", money(hoa));
      setText("m-interest", money(pi * n - loan));
      setText("m-downpct", ((down / price) * 100).toFixed(1) + "%");
    }
    eachInput(["m-price", "m-down", "m-rate", "m-term", "m-tax", "m-insurance", "m-hoa"], compute);
    compute();
  }

  /* ---------- Date difference ---------- */
  function initDates() {
    function blank() {
      setText("d-result", "—");
      setText("d-days", "—");
      setText("d-weekdays", "—");
      setText("d-weekends", "—");
    }

    function compute() {
      var sVal = $("#d-start").value, eVal = $("#d-end").value;
      var s = sVal ? new Date(sVal + "T00:00:00") : null;
      var e = eVal ? new Date(eVal + "T00:00:00") : null;
      if (!s || isNaN(s) || !e || isNaN(e)) return blank();
      if (e < s) { var tmp = s; s = e; e = tmp; }
      var y = e.getFullYear() - s.getFullYear();
      var m = e.getMonth() - s.getMonth();
      var d = e.getDate() - s.getDate();
      if (d < 0) { m--; d += new Date(e.getFullYear(), e.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      var total = Math.round((e - s) / 86400000);
      setText("d-result", y + " years, " + m + " months, " + d + " days");
      setText("d-days", total.toLocaleString("en-US") + " days");
      if (total > 200000) {
        setText("d-weekdays", "—");
        setText("d-weekends", "—");
        return;
      }
      var wd = 0, we = 0;
      var cur = new Date(s.getTime());
      while (cur < e) {
        cur.setDate(cur.getDate() + 1);
        var day = cur.getDay();
        if (day === 0 || day === 6) we++; else wd++;
      }
      setText("d-weekdays", wd.toLocaleString("en-US"));
      setText("d-weekends", we.toLocaleString("en-US"));
    }
    eachInput(["d-start", "d-end"], compute);
    compute();
  }

  /* ---------- Discount ---------- */
  function initDiscount() {
    function t1() {
      var price = toNum($("#dis-price").value);
      var pct = toNum($("#dis-pct").value);
      if (!isFinite(price) || !isFinite(pct)) { setText("dis-final", "—"); setText("dis-save", "—"); return; }
      var final = price * (1 - pct / 100);
      setText("dis-final", money(final));
      setText("dis-save", money(price - final));
    }
    function t2() {
      var paid = toNum($("#dis-paid").value);
      var pct = toNum($("#dis-pct2").value);
      if (!isFinite(paid) || !isFinite(pct) || pct < 0 || pct >= 100) { setText("dis-original", "—"); return; }
      setText("dis-original", money(paid / (1 - pct / 100)));
    }
    eachInput(["dis-price", "dis-pct"], t1);
    eachInput(["dis-paid", "dis-pct2"], t2);
    t1(); t2();
  }

  /* ---------- Rent split ---------- */
  function initRent() {
    var rentEl = $("#r-total");
    var peopleEl = $("#r-people");
    var container = $("#r-incomes");

    function compute() {
      var rent = toNum(rentEl.value);
      var incomes = [], total = 0;
      Array.prototype.forEach.call(container.querySelectorAll("input"), function (inp) {
        var v = toNum(inp.value);
        if (!isFinite(v) || v < 0) v = 0;
        incomes.push(v);
        total += v;
      });
      var list = document.getElementById("r-shares");
      if (!list) return;
      list.innerHTML = "";
      if (!isFinite(rent) || rent <= 0 || incomes.length === 0) { setText("r-equal", "—"); return; }
      for (var i = 0; i < incomes.length; i++) {
        var share = total > 0 ? (rent * incomes[i]) / total : rent / incomes.length;
        var li = document.createElement("div");
        li.className = "item";
        li.innerHTML = "<span>Roommate " + (i + 1) +
          (total > 0 ? " (" + Math.round((incomes[i] / total) * 100) + "% of income)" : "") +
          "</span><b>" + money(share) + "</b>";
        list.appendChild(li);
      }
      setText("r-equal", money(rent / incomes.length));
    }

    function build() {
      var count = Math.max(2, Math.min(6, Math.floor(toNum(peopleEl.value) || 2)));
      var existing = [];
      Array.prototype.forEach.call(container.querySelectorAll("input"), function (inp) { existing.push(inp.value); });
      container.innerHTML = "";
      for (var i = 0; i < count; i++) {
        var field = document.createElement("div");
        field.className = "field";
        field.innerHTML = '<label for="r-inc-' + i + '">Roommate ' + (i + 1) + ' — monthly income ($)</label>' +
          '<input id="r-inc-' + i + '" type="number" inputmode="decimal" min="0" step="50" value="' + (existing[i] || "4000") + '">';
        container.appendChild(field);
      }
      compute();
    }

    peopleEl.addEventListener("change", build);
    rentEl.addEventListener("input", compute);
    container.addEventListener("input", compute);
    build();
  }

  /* ---------- Fuel cost ---------- */
  function initFuel() {
    function blank() {
      ["f-cost", "f-liters", "f-perkm", "f-per100"].forEach(function (id) { setText(id, "—"); });
    }

    function compute() {
      var dist = toNum($("#f-distance").value);
      var eff = toNum($("#f-eff").value);
      var price = toNum($("#f-price").value);
      if (!isFinite(dist) || dist <= 0 || !isFinite(eff) || eff <= 0 || !isFinite(price) || price <= 0) return blank();
      var km = $("#f-dist-unit").value === "mi" ? dist * 1.609344 : dist;
      var eu = $("#f-eff-unit").value;
      var liters;
      if (eu === "l100") liters = (km / 100) * eff;
      else if (eu === "kml") liters = km / eff;
      else liters = (km / 1.609344 / eff) * 3.785411784;
      var gallons = liters / 3.785411784;
      var cost = $("#f-price-unit").value === "gal" ? gallons * price : liters * price;
      setText("f-cost", money(cost));
      setText("f-liters", liters.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " L");
      setText("f-perkm", "$" + (cost / km).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      setText("f-per100", ((liters / km) * 100).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " L/100km");
    }

    ["f-distance", "f-dist-unit", "f-eff", "f-eff-unit", "f-price", "f-price-unit"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", compute);
        el.addEventListener("change", compute);
      }
    });
    compute();
  }

  /* ---------- Grade ---------- */
  function initGrade() {
    function weighted() {
      var sum = 0, wsum = 0;
      for (var i = 1; i <= 5; i++) {
        var s = toNum((document.getElementById("g-s" + i) || {}).value);
        var w = toNum((document.getElementById("g-w" + i) || {}).value);
        if (isFinite(s) && isFinite(w) && w > 0) {
          sum += s * w;
          wsum += w;
        }
      }
      if (wsum <= 0) {
        setText("g-average", "—");
        setText("g-wsum", "—");
        return;
      }
      setText("g-average", (sum / wsum).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "%");
      setText("g-wsum", wsum + "% entered" + (Math.abs(wsum - 100) > 0.01 ? " — set weights to 100% for a true overall grade" : " — weights total 100%"));
    }

    function finalExam() {
      var cur = toNum($("#g-current").value);
      var want = toNum($("#g-desired").value);
      var w = toNum($("#g-fw").value);
      if (!isFinite(cur) || !isFinite(want) || !isFinite(w) || w <= 0 || w > 100) {
        setText("g-required", "—");
        setText("g-feasible", "");
        return;
      }
      var req = (want - cur * (1 - w / 100)) / (w / 100);
      setText("g-required", req.toLocaleString("en-US", { maximumFractionDigits: 2 }) + "%");
      var max = cur * (1 - w / 100) + 100 * (w / 100);
      var note = document.getElementById("g-feasible");
      if (note) {
        note.textContent =
          req > 100 ? "Not achievable — with " + w + "% weight on the final, the maximum possible grade is " + max.toFixed(2) + "%."
          : req <= 0 ? "Already secured — even a zero on the final leaves you at " + max.toFixed(2) + "%."
          : "";
      }
    }

    var ids = [];
    for (var i = 1; i <= 5; i++) { ids.push("g-s" + i, "g-w" + i); }
    eachInput(ids, weighted);
    eachInput(["g-current", "g-desired", "g-fw"], finalExam);
    weighted(); finalExam();
  }

  /* ---------- VAT ---------- */
  function initVat() {
    function t1() {
      var net = toNum($("#v1-net").value);
      var rate = toNum($("#v1-rate").value);
      if (!isFinite(net) || !isFinite(rate)) { setText("v1-amount", "—"); setText("v1-total", "—"); return; }
      var amount = (net * rate) / 100;
      setText("v1-amount", money(amount));
      setText("v1-total", money(net + amount));
    }
    function t2() {
      var gross = toNum($("#v2-gross").value);
      var rate = toNum($("#v2-rate").value);
      if (!isFinite(gross) || !isFinite(rate) || rate <= -100) { setText("v2-net", "—"); setText("v2-amount", "—"); return; }
      var net = gross / (1 + rate / 100);
      setText("v2-net", money(net));
      setText("v2-amount", money(gross - net));
    }
    eachInput(["v1-net", "v1-rate"], t1);
    eachInput(["v2-gross", "v2-rate"], t2);
    Array.prototype.forEach.call(document.querySelectorAll("[data-vat]"), function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.parentElement;
        Array.prototype.forEach.call(group.querySelectorAll("[data-vat]"), function (b) {
          b.classList.toggle("active", b === btn);
        });
        var which = btn.getAttribute("data-vat-target");
        var input = document.getElementById(which + "-rate");
        if (input) input.value = btn.getAttribute("data-vat");
        if (which === "v1") t1(); else t2();
      });
    });
    t1(); t2();
  }

  /* ---------- Salary ---------- */
  function initSalary() {
    function blank() {
      ["s-hourly", "s-daily", "s-weekly", "s-monthly", "s-annual"].forEach(function (id) { setText(id, "—"); });
    }
    function compute() {
      var v = toNum($("#s-value").value);
      var basis = $("#s-basis").value;
      var hpw = toNum($("#s-hours").value);
      var wpy = toNum($("#s-weeks").value);
      if (!isFinite(v) || v < 0 || !isFinite(hpw) || hpw <= 0 || !isFinite(wpy) || wpy <= 0 || wpy > 52) return blank();
      var annual;
      if (basis === "hourly") annual = v * hpw * wpy;
      else if (basis === "daily") annual = v * (hpw / 5) * wpy;
      else if (basis === "weekly") annual = v * wpy;
      else if (basis === "monthly") annual = v * 12;
      else annual = v;
      var hourly = annual / (hpw * wpy);
      setText("s-hourly", money(hourly));
      setText("s-daily", money(hourly * (hpw / 5)));
      setText("s-weekly", money(hourly * hpw));
      setText("s-monthly", money(annual / 12));
      setText("s-annual", money(annual));
    }
    ["s-value", "s-basis", "s-hours", "s-weeks"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", compute);
        el.addEventListener("change", compute);
      }
    });
    compute();
  }

  /* ---------- Date + / − days ---------- */
  function initDateCalc() {
    function blank() {
      setText("dc-result", "—");
      setText("dc-span", "—");
    }
    function compute() {
      var dVal = $("#dc-date").value;
      var n = toNum($("#dc-days").value);
      var working = $("#dc-working").checked;
      if (!dVal || !isFinite(n)) return blank();
      var start = new Date(dVal + "T00:00:00");
      if (isNaN(start)) return blank();
      n = Math.trunc(n);
      if (Math.abs(n) > 200000) return blank();
      var d = new Date(start.getTime());
      if (!working) {
        d.setDate(d.getDate() + n);
      } else {
        var step = n > 0 ? 1 : -1;
        var left = Math.abs(n);
        var guard = 0;
        while (left > 0 && guard++ < 500000) {
          d.setDate(d.getDate() + step);
          var day = d.getDay();
          if (day !== 0 && day !== 6) left--;
        }
      }
      setText("dc-result", d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
      var span = Math.round((d - start) / 86400000);
      setText("dc-span", span.toLocaleString("en-US") + " calendar days after the start date" + (working ? " (weekends skipped while counting)" : ""));
    }
    eachInput(["dc-date", "dc-days"], compute);
    var cb = document.getElementById("dc-working");
    if (cb) cb.addEventListener("change", compute);
    compute();
  }

  var pages = {
    loan: initLoan,
    mortgage: initMortgage,
    compound: initCompound,
    bmi: initBmi,
    units: initUnits,
    dates: initDates,
    discount: initDiscount,
    tip: initTip,
    percent: initPercent,
    rent: initRent,
    fuel: initFuel,
    grade: initGrade,
    age: initAge,
    vat: initVat,
    salary: initSalary,
    datecalc: initDateCalc
  };
  if (pages[page]) pages[page]();

  /* Close the nav dropdown when clicking outside it */
  document.addEventListener("click", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll("details.nav-menu[open]"), function (d) {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });
})();
