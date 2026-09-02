/* =================================================================
   España 2026 — countdown behaviour
   ================================================================= */
(function () {
  'use strict';

  var CFG = window.TRIP || {};
  var DEPARTURE = new Date(CFG.departure || '2026-09-02T00:00:00+02:00');
  var RETURN = CFG.returnDate ? new Date(CFG.returnDate) : null;
  var ANCHOR = new Date(CFG.anchor || '2026-06-01T00:00:00+02:00');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------------------------------------------------------------
     Which part of the trip are we in?
     before  — still waiting            during — we are there
     after   — home again (needs a returnDate to ever be reached)
     --------------------------------------------------------------- */
  function phaseAt(now) {
    if (now < DEPARTURE.getTime()) return 'before';
    if (!RETURN || now < RETURN.getTime()) return 'during';
    return 'after';
  }

  var phase = phaseAt(Date.now());
  document.documentElement.setAttribute('data-phase', phase);

  $$('[data-when]').forEach(function (el) {
    var when = (el.getAttribute('data-when') || '').split(/\s+/);
    if (when.indexOf(phase) === -1) {
      if (el.parentNode) el.parentNode.removeChild(el);
    } else {
      el.removeAttribute('hidden');
    }
  });

  /* ---------------------------------------------------------------
     Names from config
     --------------------------------------------------------------- */
  (function names() {
    var you = (CFG.you || 'You').trim();
    $$('[data-you]').forEach(function (el) { el.textContent = you; });
    var initial = $('[data-you-initial]');
    if (initial) initial.textContent = you.charAt(0).toUpperCase();
  })();

  /* ---------------------------------------------------------------
     Departure date, written out
     --------------------------------------------------------------- */
  (function whenMeta() {
    var el = $('[data-when-meta]');
    if (!el) return;
    try {
      el.textContent = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'Europe/Madrid'
      }).format(DEPARTURE);
    } catch (e) { /* keep the markup fallback */ }
  })();

  /* ---------------------------------------------------------------
     Odometer digits
     --------------------------------------------------------------- */
  function Odometer(host) {
    this.host = host;
    this.digits = [];
    this.value = null;
  }
  Odometer.prototype.set = function (str) {
    if (str === this.value) return;
    var chars = String(str).split('');

    // rebuild if the number of digits changed (e.g. 100 -> 99)
    if (chars.length !== this.digits.length) {
      this.host.textContent = '';
      this.digits = chars.map(function (ch) {
        var cell = document.createElement('span');
        cell.className = 'digit';
        var cur = document.createElement('span');
        cur.className = 'digit__cur';
        cur.textContent = ch;
        cell.appendChild(cur);
        this.host.appendChild(cell);
        return { cell: cell, cur: cur, char: ch };
      }, this);
      this.value = str;
      return;
    }

    chars.forEach(function (ch, i) {
      var d = this.digits[i];
      if (d.char === ch) return;
      d.char = ch;

      if (reduceMotion) { d.cur.textContent = ch; return; }

      var next = document.createElement('span');
      next.className = 'digit__next';
      next.textContent = ch;
      d.cell.appendChild(next);
      // restart the animation cleanly if one is already running
      d.cell.classList.remove('is-rolling');
      void d.cell.offsetWidth;
      d.cell.classList.add('is-rolling');

      var settle = function () {
        d.cur.textContent = ch;
        d.cell.classList.remove('is-rolling');
        if (next.parentNode) next.parentNode.removeChild(next);
      };
      next.addEventListener('animationend', settle, { once: true });
      window.setTimeout(settle, 600); // safety net if the event is missed
    }, this);

    this.value = str;
  };

  var odos = {};
  $$('[data-odo]').forEach(function (el) { odos[el.getAttribute('data-odo')] = new Odometer(el); });

  /* ---------------------------------------------------------------
     The countdown
     --------------------------------------------------------------- */
  var miniEls    = $$('[data-mini]');
  var miniBigEls = $$('[data-mini-big]');
  var srEl       = $('[data-sr-count]');
  var fillEl     = $('[data-progress-fill]');
  var progressEl = $('[data-progress-text]');
  var outroSub   = $('[data-outro-sub]');
  var lastMinuteAnnounced = -1;
  var PLACE = (CFG.place || 'Spain');

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function tick() {
    var now = Date.now();

    // crossing a boundary while the page sits open: re-render with the right copy
    if (phaseAt(now) !== phase) { window.location.reload(); return; }

    var ms;
    if (phase === 'before')      ms = DEPARTURE.getTime() - now;
    else if (phase === 'during') ms = now - DEPARTURE.getTime();
    else                         ms = RETURN.getTime() - DEPARTURE.getTime();
    if (ms < 0) ms = 0;

    var total = Math.floor(ms / 1000);
    var days = Math.floor(total / 86400);
    var hours = Math.floor(total % 86400 / 3600);
    var minutes = Math.floor(total % 3600 / 60);
    var seconds = total % 60;

    if (odos.days)    odos.days.set(days < 100 ? pad(days) : String(days));
    if (odos.hours)   odos.hours.set(pad(hours));
    if (odos.minutes) odos.minutes.set(pad(minutes));
    if (odos.seconds) odos.seconds.set(pad(seconds));

    var dayNo = days + 1;               // the day you land is day one
    var mini, big, sr;

    if (phase === 'before') {
      mini = days + 'd ' + pad(hours) + 'h ' + pad(minutes) + 'm';
      big = days > 0
        ? plural(days, 'day', 'days') + ', ' + plural(hours, 'hour', 'hours')
        : plural(hours, 'hour', 'hours') + ', ' + plural(minutes, 'minute', 'minutes');
      sr = big + ' until we leave for ' + PLACE + '.';
    } else if (phase === 'during') {
      mini = 'Day ' + dayNo;
      big = 'Day ' + dayNo + ' in ' + PLACE;
      sr = 'Day ' + dayNo + ' in ' + PLACE + '.';
    } else {
      mini = 'Ya está';
      big = plural(days, 'day', 'days') + ' in ' + PLACE;
      sr = 'The trip is over.';
    }

    miniEls.forEach(function (el) { el.textContent = mini; });
    miniBigEls.forEach(function (el) { el.textContent = big; });
    if (srEl && minutes !== lastMinuteAnnounced) {
      lastMinuteAnnounced = minutes;
      srEl.textContent = sr;
    }

    progress(now, dayNo, days);
  }

  function progress(now, dayNo, daysElapsed) {
    var pct, text;

    if (phase === 'before') {
      var span = DEPARTURE.getTime() - ANCHOR.getTime();
      pct = span > 0 ? (now - ANCHOR.getTime()) / span * 100 : 0;
      text = pct < 1 ? 'The wait has barely begun.'
                     : Math.round(pct) + '% of the wait is behind us.';
    } else if (phase === 'during') {
      if (RETURN) {
        var trip = RETURN.getTime() - DEPARTURE.getTime();
        pct = trip > 0 ? (now - DEPARTURE.getTime()) / trip * 100 : 0;
        var totalDays = Math.round(trip / 86400000);
        text = 'Day ' + dayNo + ' of ' + totalDays + '. ' +
               Math.max(0, totalDays - daysElapsed) + ' to go.';
      } else {
        pct = 0;
        // no return date configured, so there is no bar to fill
        text = 'Day ' + dayNo + '. This site does not know when we fly home yet.';
      }
    } else {
      pct = 100;
      text = 'Se acabó.';
    }

    // an empty track reads as broken, so hide it when there is nothing to measure
    var track = fillEl && fillEl.parentNode;
    if (track) track.hidden = (phase === 'during' && !RETURN);

    pct = Math.min(100, Math.max(0, pct));
    if (fillEl) fillEl.style.width = pct.toFixed(2) + '%';
    if (progressEl) progressEl.textContent = text;
  }

  if (outroSub) {
    outroSub.textContent =
      phase === 'before' ? 'until we leave for ' + PLACE
      : phase === 'during' ? 'and in no hurry whatsoever'
      : 'and already missed';
  }

  tick();
  window.setInterval(tick, 1000);

  /* ---------------------------------------------------------------
     Add to calendar (.ics)
     --------------------------------------------------------------- */
  function icsDate(iso, addDays) {
    // take the calendar date straight off the config string, no timezone maths
    var parts = String(iso).slice(0, 10).split('-');
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    d.setUTCDate(d.getUTCDate() + (addDays || 0));
    return d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate());
  }

  /* RFC 5545 says content lines are at most 75 octets, continued with CRLF
     plus one space. Accented characters and the em dash push us over. */
  function fold(line) {
    if (typeof TextEncoder === 'undefined') return line;
    var enc = new TextEncoder();
    var out = [], cur = '', len = 0;
    Array.prototype.forEach.call(line, function (ch) {
      var n = enc.encode(ch).length;
      if (len + n > 74) { out.push(cur); cur = ' '; len = 1; }
      cur += ch;
      len += n;
    });
    out.push(cur);
    return out.join('\r\n');
  }

  function buildICS() {
    var cal = CFG.calendar || {};
    var start = icsDate(CFG.departure, 0);
    var end = CFG.returnDate ? icsDate(CFG.returnDate, 1) : icsDate(CFG.departure, 1);
    var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    var esc = function (s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//espana-2026//countdown//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:espana-2026-' + start + '@countdown',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + start,
      'DTEND;VALUE=DATE:' + end,
      'SUMMARY:' + esc(cal.title || 'Spain'),
      'LOCATION:' + esc(cal.location || 'Valencia, Spain'),
      'DESCRIPTION:' + esc(cal.notes || ''),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
      'END:VCALENDAR'
    ].map(fold).join('\r\n') + '\r\n';
  }

  $$('[data-ics]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'espana-2026.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

      var label = btn.textContent;
      btn.classList.add('is-done');
      btn.textContent = 'Saved — see you there';
      window.setTimeout(function () {
        btn.classList.remove('is-done');
        btn.textContent = label;
      }, 2600);
    });
  });

  /* ---------------------------------------------------------------
     Sticky header + hero parallax
     --------------------------------------------------------------- */
  var header = $('#siteHeader');
  var hero = $('#hero');
  var layers = $$('.hero__layer');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-stuck', y > 40);

    if (!reduceMotion && hero) {
      var h = hero.offsetHeight;
      if (y < h) {
        layers.forEach(function (layer) {
          var depth = parseFloat(layer.getAttribute('data-depth')) || 0;
          layer.style.setProperty('--shift', (y * depth).toFixed(1) + 'px');
        });
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------- */
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // stagger siblings within the same container
    var seen = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentNode;
      var i = seen.get(parent) || 0;
      el.style.setProperty('--i', Math.min(i, 5));
      seen.set(parent, i + 1);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  }
})();
