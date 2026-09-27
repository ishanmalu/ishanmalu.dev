(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const root = document.documentElement;
  const DEFAULT_HL = '#f3f1ec';

  // ---------- noise ----------
  const perm = new Uint8Array(512);
  {
    const p = [...Array(256).keys()];
    let s = 7;
    for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  }
  const fd = t => t * t * (3 - 2 * t);
  const hs = (x, y) => perm[(perm[x & 255] + (y & 255)) & 511] / 255;
  function noise(x, y) {
    const a = Math.floor(x), b = Math.floor(y), u = fd(x - a), v = fd(y - b);
    const A = hs(a, b), B = hs(a + 1, b), C = hs(a, b + 1), D = hs(a + 1, b + 1);
    return A + (B - A) * u + (C - A) * v + (A - B - C + D) * u * v;
  }

  // ---------- per-project animations ----------
  const G = {
    seedscape(x, w, h, t, c) {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f1a12'); g.addColorStop(1, '#1d2f1c');
      x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = c; x.lineWidth = 1.2;
      for (let k = 0; k < 14; k++) {
        x.beginPath();
        for (let i = 0; i <= 80; i++) {
          const px = i / 80 * w, py = h * .12 + k * h * .06 + (noise(i * .07 + t * .15, k * .4) - .5) * h * .22;
          i ? x.lineTo(px, py) : x.moveTo(px, py);
        }
        x.globalAlpha = .15 + k * .05; x.stroke();
      }
    },
    daisy(x, w, h, t, c) {
      x.fillStyle = '#16150f'; x.fillRect(0, 0, w, h);
      x.save(); x.translate(w / 2, h / 2); x.rotate(t * .25);
      const R = h * .2; x.fillStyle = '#f5f3ea'; x.globalAlpha = .9;
      for (let i = 0; i < 12; i++) {
        x.rotate(Math.PI / 6);
        const p = 1 + .08 * Math.sin(t * 2 + i);
        x.beginPath(); x.ellipse(0, -R * 1.05 * p, R * .33, R * .8, 0, 0, 7); x.fill();
      }
      x.restore(); x.globalAlpha = 1; x.fillStyle = c;
      x.beginPath(); x.arc(w / 2, h / 2, R * .42, 0, 7); x.fill();
    },
    cadence(x, w, h, t) {
      x.fillStyle = '#130f1b'; x.fillRect(0, 0, w, h); x.lineWidth = 2; x.globalAlpha = .85;
      ['#c9a7ff', '#9fe8cf', '#ffb38a'].forEach((col, k) => {
        x.beginPath();
        for (let i = 0; i <= w; i += 3) {
          const py = h / 2 + Math.sin(i * .018 * (k + 1) + t * (1 + k * .5)) * h * .2 * (1 - k * .2);
          i ? x.lineTo(i, py) : x.moveTo(i, py);
        }
        x.strokeStyle = col; x.stroke();
      });
    },
    perch(x, w, h, t, c) {
      x.fillStyle = '#0e1614'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffffff14'; x.fillRect(0, 0, w, h * .1);
      x.fillStyle = c; x.globalAlpha = Math.sin(t * 2.2) > 0 ? 1 : .35;
      x.beginPath(); x.arc(w * .86, h * .05, 4, 0, 7); x.fill();
      const o = Math.max(0, Math.sin(t * .9));
      x.globalAlpha = o; x.fillStyle = '#1b2a26'; x.fillRect(w * .56, h * .13, w * .36, h * .5 * o);
      x.strokeStyle = c; x.strokeRect(w * .56, h * .13, w * .36, h * .5 * o);
    },
    transcriber(x, w, h, t, c) {
      x.fillStyle = '#1a120c'; x.fillRect(0, 0, w, h); x.fillStyle = c;
      const n = 56, bw = w / n;
      for (let i = 0; i < n; i++) {
        const a = noise(i * .25, t * 1.6) * h * .6 + 3;
        x.globalAlpha = .35 + .65 * (i / n); x.fillRect(i * bw + 1, h / 2 - a / 2, bw - 2.5, a);
      }
    },
    hookmine(x, w, h, t, c) {
      x.fillStyle = '#1a0e12'; x.fillRect(0, 0, w, h); x.strokeStyle = c; x.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const px = w * (.1 + i * .1), v = noise(i * 1.3, t * .5), py = h * .85 - v * h * .65;
        x.globalAlpha = .35 + v * .65;
        x.beginPath(); x.moveTo(px, h * .88); x.lineTo(px, py); x.arc(px + 7, py, 7, Math.PI, 0, false); x.stroke();
      }
    },
    prompter(x, w, h, t, c) {
      x.fillStyle = '#121211'; x.fillRect(0, 0, w, h); x.fillStyle = c;
      const L = 16, sp = h / 9;
      for (let i = 0; i < L; i++) {
        const y = ((i * sp - t * 30) % (L * sp) + L * sp) % (L * sp) - sp;
        const lw = w * (.3 + noise(i, 3) * .45), f = 1 - Math.abs(y - h / 2) / (h / 2);
        x.globalAlpha = Math.max(0, f) ** 1.5; x.fillRect((w - lw) / 2, y, lw, 6);
      }
    },
  };
  const paint = (surf, k, t, c) => { surf.x.save(); G[k](surf.x, surf.w, surf.h, t, c); surf.x.restore(); };

  // Size a canvas from its layout box (offset size ignores CSS scale, so the card stays sharp).
  function fit(cv) {
    const w = cv.offsetWidth, h = cv.offsetHeight, d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(w * d)); cv.height = Math.max(1, Math.round(h * d));
    const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    return { x, w, h };
  }

  // ---------- data from the markup ----------
  const rowsEl = $('#rows');
  const rows = [...rowsEl.querySelectorAll('.row')];
  const STATUS = { live: 'Live', soon: 'Coming soon', tool: 'Runs locally' };
  const P = rows.map(r => ({
    k: r.dataset.k,
    n: $('.t', r).textContent,
    d: $('.d', r).textContent,
    c: r.dataset.c,
    g: r.dataset.group,
    y: r.dataset.year,
    status: r.dataset.status,
    label: r.dataset.label,
    stack: r.dataset.stack,
    story: r.dataset.story.split(','),
    links: r.dataset.links ? r.dataset.links.split(';').map(s => s.split('|')) : [],
  }));
  rows.forEach((r, i) => { r.style.setProperty('--c', P[i].c); r.parentElement.style.setProperty('--c', P[i].c); });
  const statusText = p => p.status === 'tool' ? p.label[0].toUpperCase() + p.label.slice(1) : STATUS[p.status];

  // frame-rate independent easing toward a target
  const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

  // ---------- highlight colour ----------
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  let target = hex(DEFAULT_HL);
  const col = target.slice();
  function setHL(c) { root.style.setProperty('--hl', c); target = hex(c); }
  // when nothing is hovered or open, the world takes the colour of the last project the quest line reached
  let storyC = DEFAULT_HL;
  const rest = () => setHL(storyC);

  // ---------- headline split ----------
  // Letters get their own spans for the animation; a hidden copy keeps the text readable to screen readers.
  const split = [];
  let n = 0;
  document.querySelectorAll('.split').forEach(el => {
    const text = el.textContent;
    const small = el.classList.contains('by');
    const hidden = document.createElement('span');
    hidden.className = 'vh';
    hidden.textContent = text;
    const letters = document.createElement('span');
    letters.setAttribute('aria-hidden', 'true');
    for (const ch of text) {
      const box = document.createElement('span');
      if (ch === ' ') { box.className = 'sp'; letters.append(box); continue; }
      const g = document.createElement('b');
      g.textContent = ch;
      box.className = 'ch';
      box.style.setProperty('--i', n++);
      box.append(g);
      letters.append(box);
      split.push({ el: box, g, small, w: 500, y: 0, o: .55 });
    }
    el.replaceChildren(hidden, letters);
    if (el.id === 'title') n += 3;
  });
  // Lock each letter's box to its regular-weight width (in em, so it scales with the viewport).
  // When a letter gets bolder it grows inside that box and the line never shifts.
  function lockWidths() {
    split.forEach(s => { s.el.style.width = ''; s.w = 500; s.g.style.setProperty('--w', 500); });
    const fs = new Map();
    const ws = split.map(s => s.el.getBoundingClientRect().width);
    split.forEach((s, i) => {
      const p = s.el.parentElement.parentElement;
      if (!fs.has(p)) fs.set(p, parseFloat(getComputedStyle(p).fontSize));
      s.el.style.width = (ws[i] / fs.get(p)).toFixed(4) + 'em';
    });
  }
  root.classList.add('fonts-pending');
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(() => {
    lockWidths();
    root.classList.remove('fonts-pending');
    root.classList.add('ready');
  });

  // ---------- smooth scrolling ----------
  const lenis = window.Lenis && !RM ? new window.Lenis({ lerp: .08, wheelMultiplier: .8, autoRaf: false }) : null;

  // ---------- scroll cue ----------
  const cue = $('#cue');
  cue.addEventListener('click', e => {
    e.preventDefault();
    const top = $('#rows').getBoundingClientRect().top + scrollY - innerHeight * .18;
    lenis ? lenis.scrollTo(top, { duration: 1.8 }) : scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
  });
  const cueState = () => cue.classList.toggle('gone', scrollY > 40);
  addEventListener('scroll', cueState, { passive: true });
  cueState();

  // ---------- rows reveal as they scroll in ----------
  // A plain position check (no IntersectionObserver) plus a safety timer, so rows can never stay hidden.
  if (!RM) {
    root.classList.add('reveal');
    const items = rows.map(r => r.parentElement);
    const check = () => {
      let k = 0;
      const line = innerHeight * .94;
      items.forEach(li => {
        if (li.classList.contains('seen')) return;
        if (li.getBoundingClientRect().top < line) { li.style.setProperty('--r', k++); li.classList.add('seen'); }
      });
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
    setTimeout(() => items.forEach(li => li.classList.add('seen')), 4000);
  }

  // ---------- rows ----------
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=';
  function scramble(el, text) {
    if (RM) return;
    let i = 0;
    clearInterval(el._s);
    el._s = setInterval(() => {
      el.textContent = [...text].map((c, k) => k < i || c === ' ' ? c : CH[Math.random() * CH.length | 0]).join('');
      i += .6;
      if (i > text.length) { el.textContent = text; clearInterval(el._s); }
    }, 30);
  }
  const card = $('#card'), cardCanvas = $('canvas', card);
  let cc = fit(cardCanvas);
  let cur = -1, dwell = 0;
  function enter(i) {
    if (cur === i) return;
    const first = cur < 0;
    cur = i;
    rows.forEach((r, k) => r.classList.toggle('on', k === i));
    rowsEl.classList.add('hov');
    $('#cn').textContent = P[i].n;
    $('#cs').textContent = P[i].label;
    card.classList.add('on');
    if (!first) { card.classList.remove('sw'); void card.offsetWidth; card.classList.add('sw'); }
    setHL(P[i].c);
    // only scramble once the cursor settles, so sweeping the list stays calm
    clearTimeout(dwell);
    dwell = setTimeout(() => scramble($('.t', rows[i]), P[i].n), 120);
  }
  function leave() {
    clearTimeout(dwell);
    if (cur < 0) return;
    cur = -1;
    rows.forEach(r => r.classList.remove('on'));
    rowsEl.classList.remove('hov');
    card.classList.remove('on');
    rest();
  }
  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') enter(i); });
    r.addEventListener('focus', () => { if (r.matches(':focus-visible')) enter(i); });
    r.addEventListener('blur', leave);
    r.addEventListener('click', e => { e.preventDefault(); open(i, true); });
  });
  rowsEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') leave(); });

  // ---------- next quest teaser ----------
  // Hovering "next quest" shows a blurred glimpse of that project; clicking opens it.
  const nextLink = $('#next');
  const teaseI = P.findIndex(p => p.k === nextLink.dataset.k);
  let teasing = false;
  function tease(on) {
    if (on === teasing || teaseI < 0) return;
    teasing = on;
    card.classList.toggle('tease', on);
    card.classList.toggle('on', on);
    if (on) { $('#cn').textContent = 'Next quest'; $('#cs').textContent = 'coming soon'; setHL(P[teaseI].c); }
    else rest();
  }
  nextLink.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') tease(true); });
  nextLink.addEventListener('pointerleave', () => tease(false));
  nextLink.addEventListener('click', e => { e.preventDefault(); tease(false); if (teaseI >= 0) open(teaseI, true); });

  // ---------- project view ----------
  const ov = $('#ov'), main = $('main'), ovBody = $('.body', ov);
  let ovI = -1, ovc = null, lastFocus = null, pushed = false, swapT = 0, covered = false;

  function magnetic(el) {
    if (!FINE || RM) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }
  document.querySelectorAll('[data-mag]').forEach(magnetic);

  function fill(i) {
    const p = P[i];
    ovI = i;
    ov.style.setProperty('--c', p.c);
    $('#ovn').textContent = `${String(i + 1).padStart(2, '0')} / ${String(P.length).padStart(2, '0')} · ${p.g}`;
    $('#ovt').textContent = p.n;
    $('#ovd').textContent = p.d;
    const story = $('#ovs');
    story.replaceChildren();
    p.story.forEach((s, k) => {
      if (k) { const b = document.createElement('b'); b.textContent = '→'; b.style.setProperty('--k', k); story.append(b); }
      const sp = document.createElement('span'); sp.textContent = s; sp.style.setProperty('--k', k); story.append(sp);
    });
    const dl = $('#ovl');
    dl.replaceChildren();
    [['Status', statusText(p)], ['Year', p.y], ['Built with', p.stack]].forEach(([a, b]) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = a; dd.textContent = b; dl.append(dt, dd);
    });
    $('#ovsoon').hidden = p.status !== 'soon';
    const btns = $('#ovbtn');
    btns.replaceChildren();
    p.links.forEach(([label, url], k) => {
      const a = document.createElement('a');
      a.className = k ? 'btn' : 'btn solid';
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      const arr = document.createElement('span');
      arr.className = 'arr';
      arr.setAttribute('aria-hidden', 'true');
      arr.textContent = '↗';
      a.append(label + ' ', arr);
      magnetic(a);
      btns.append(a);
    });
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'btn'; next.textContent = 'Next project →';
    next.onclick = () => swapTo((ovI + 1) % P.length);
    magnetic(next);
    btns.append(next);
    setHL(p.c);
    // replay the staggered entrance
    ovBody.classList.remove('enter'); void ovBody.offsetWidth; ovBody.classList.add('enter');
  }

  // Each project has its own address (/seedscape). Old #seedscape links still work.
  const pathOf = i => '/' + P[i].k;
  const routeIndex = () => {
    const slug = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '') || location.hash.slice(1);
    return P.findIndex(p => p.k === slug);
  };

  // Next project: slide the current one out, then bring the new one in.
  function swapTo(i) {
    history.replaceState(history.state, '', pathOf(i));
    if (RM) { fill(i); return; }
    clearTimeout(swapT);
    ovBody.classList.add('leaving');
    swapT = setTimeout(() => {
      ov.scrollTo({ top: 0 });
      ovBody.classList.remove('leaving');
      fill(i);
      $('#ovbtn .btn:last-child').focus({ preventScroll: true });
    }, 260);
  }

  function open(i, push) {
    if (push) { history.pushState({ ov: 1 }, '', pathOf(i)); pushed = true; }
    if (!ov.hidden && ov.classList.contains('on')) { swapTo(i); return; }
    fill(i);
    lastFocus = document.activeElement;
    leave();
    setHL(P[i].c);
    ov.classList.remove('out');
    ov.hidden = false;
    main.inert = true;
    lenis && lenis.stop();
    root.classList.add('locked');
    ov.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ov.classList.add('on');
      ovc = fit($('.vis canvas', ov));
      $('#ovx').focus({ preventScroll: true });
      setTimeout(() => { if (ov.classList.contains('on')) covered = true; }, RM ? 0 : 850);
    }));
  }

  function close(fromHistory) {
    if (ov.hidden || !ov.classList.contains('on')) return;
    clearTimeout(swapT);
    ovBody.classList.remove('leaving');
    covered = false;
    ov.classList.remove('on');
    ov.classList.add('out');
    main.inert = false;
    root.classList.remove('locked');
    lenis && lenis.start();
    rest();
    const done = () => { if (!ov.classList.contains('on')) { ov.hidden = true; ov.classList.remove('out'); ovc = null; } };
    RM ? done() : setTimeout(done, 900);
    if (!fromHistory) {
      if (pushed) history.back();
      else history.replaceState(null, '', '/');
    }
    pushed = false;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  $('#ovx').addEventListener('click', () => close(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(false); });
  // (4) landing on a project address opens it without adding history, and closing returns to "/"
  const fromRoute = () => {
    const i = routeIndex();
    if (i >= 0) {
      if (location.hash) history.replaceState(null, '', pathOf(i));
      open(i, false);
    } else close(true);
  };
  addEventListener('popstate', fromRoute);
  fromRoute();

  // ---------- background + motion loop ----------
  const bg = $('#bg');
  let B = fit(bg);
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      B = fit(bg); cc = fit(cardCanvas); bgDirty = true;
      if (ovc) ovc = fit($('.vis canvas', ov));
      if (root.classList.contains('ready')) lockWidths();
    }, 120);
  });

  // Only a real mouse takes over the spotlight; on touch screens it keeps drifting on its own.
  let mx = innerWidth * .6, my = innerHeight * .35, cx = mx, cy = my, kx = mx, ky = my, vx = 0, last = mx, moved = false;
  let bgDirty = true;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY; moved = true; bgDirty = true;
  }, { passive: true });

  // ---------- the scroll story ----------
  const lift = $('#lift'), quest = $('#quest'), nextEl = $('#next'), work = $('.work');
  // The list pins in the middle of the screen and the quest line moves one project at a time:
  // each project is a stop with about half a screen of scroll, and the page settles on the
  // nearest stop when you stop scrolling. Skipped when the list is too tall to fit.
  const railEnd = parseFloat(getComputedStyle(quest).getPropertyValue('--rail-end')) || 28;
  let pinned = false, pinTop = 0, pinExtra = 0, seg = 0, stops = [];
  function layoutPin() {
    work.classList.remove('pinned');
    const qh = quest.offsetHeight, vh = innerHeight;
    pinned = qh < vh * .86;
    if (!pinned) return;
    pinTop = Math.round((vh - qh) / 2);
    seg = Math.round(vh * .5);
    pinExtra = seg * P.length;
    // where the line stops: each checkpoint's centre, then the next-quest ring at the very end
    const railLen = qh - railEnd;
    stops = rows.map(r => { const li = r.parentElement; return (li.offsetTop + li.offsetHeight / 2) / railLen; });
    stops.push(1);
    work.style.setProperty('--pin-top', pinTop + 'px');
    // the extra pinTop at the end lets the last stop be reached before the page runs out
    work.style.setProperty('--pin-h', qh + pinExtra + pinTop + 'px');
    work.classList.add('pinned');
  }
  const pinStart = () => work.getBoundingClientRect().top + scrollY - pinTop;
  const ease = f => f * f * f * (f * (f * 6 - 15) + 10);
  layoutPin();
  const items = rows.map(r => r.parentElement);
  let liftP = -1, questP = -1, lastLit = -2, endLit = false, stepAt = -1, lastStep = -2;
  // (6) only re-measure when the scroll position or the page size actually changed
  let seenY = NaN, seenH = 0, seenDoc = 0;
  function story() {
    const vh = innerHeight, doc = document.documentElement.scrollHeight;
    if (scrollY === seenY && vh === seenH && doc === seenDoc) return;
    seenY = scrollY; seenH = vh; seenDoc = doc;
    // 1. the title lifts, shrinks a touch and dissolves as you leave the first screen
    if (!RM) {
      const p = Math.min(1, Math.max(0, scrollY / (vh * .75)));
      if (Math.abs(p - liftP) > .001) {
        liftP = p;
        const e = p * p * (3 - 2 * p);
        lift.style.transform = `translateY(${(-e * vh * .12).toFixed(1)}px) scale(${(1 - e * .07).toFixed(4)})`;
        lift.style.opacity = (1 - e).toFixed(3);
        lift.style.filter = e > .01 ? `blur(${(e * 10).toFixed(2)}px)` : '';
      }
    }
    // 2. the quest line draws down through the projects
    const qr = quest.getBoundingClientRect();
    const head = vh * .62;
    const railH = qr.height - railEnd;
    // progress runs from "line reaches the list" to the very bottom of the page, so it always finishes
    let qp;
    if (pinned) {
      // s counts stops: 0 = first project ... P.length = next quest. The line eases between stops.
      const sPos = Math.min(P.length, Math.max(0, (scrollY - pinStart()) / seg));
      const k = Math.min(P.length - 1, Math.floor(sPos));
      qp = scrollY < pinStart() ? 0 : stops[k] + (stops[k + 1] - stops[k]) * ease(sPos - k);
      // before the first stop the line grows from the top to the first checkpoint
      if (scrollY < pinStart()) {
        const pre = Math.min(1, Math.max(0, (scrollY - pinStart() + vh * .35) / (vh * .35)));
        qp = stops[0] * ease(pre);
      }
      stepAt = scrollY >= pinStart() - 2 ? Math.round(sPos) : -1;
    } else {
      const start = qr.top + scrollY - head;
      const endY = Math.max(start + 1, document.documentElement.scrollHeight - vh);
      qp = Math.min(1, Math.max(0, (scrollY - start) / (endY - start)));
    }
    if (Math.abs(qp - questP) > .0005) { questP = qp; quest.style.setProperty('--p', qp.toFixed(4)); }
    // 3. each project lights up as the line reaches it, and the world takes its colour
    const reach = qr.top + qp * railH;
    let lit = -1;
    items.forEach((li, i) => {
      // layout position, not the on-screen one, so the rise-in animation can't delay a checkpoint
      const on = reach >= qr.top + li.offsetTop + li.offsetHeight / 2 - 1;
      if (on) lit = i;
      if (on !== li.classList.contains('lit')) li.classList.toggle('lit', on);
    });
    if (lit !== lastLit) {
      lastLit = lit;
      storyC = lit >= 0 ? P[lit].c : DEFAULT_HL;
      if (cur < 0 && ov.hidden) rest();
    }
    // one project at a time: the current stop is bright, the rest dim
    if (stepAt !== lastStep) {
      lastStep = stepAt;
      rowsEl.classList.toggle('step', pinned && stepAt >= 0 && stepAt < P.length);
      items.forEach((li, i) => li.classList.toggle('cur', i === stepAt));
    }
    // 4. the line ends at an open checkpoint: the next quest
    const end = qp > .995;
    if (end !== endLit) { endLit = end; nextEl.classList.toggle('lit', end); }
  }

  addEventListener('scroll', story, { passive: true });
  addEventListener('resize', () => { layoutPin(); seenY = NaN; story(); });

  let settleT = 0, touching = false;
  addEventListener('touchstart', () => { touching = true; clearTimeout(settleT); }, { passive: true });
  addEventListener('touchend', () => { touching = false; queueSettle(); }, { passive: true });
  function settle() {
    if (!pinned || touching || !ov.hidden) return;
    if (lenis && Math.abs(lenis.velocity) > .15) { queueSettle(); return; }
    const start = pinStart(), sPos = (scrollY - start) / seg;
    if (sPos < -.02 || sPos > P.length + .02) return;
    const target = start + Math.round(Math.min(P.length, Math.max(0, sPos))) * seg;
    if (Math.abs(target - scrollY) < 2) return;
    if (lenis) lenis.scrollTo(target, { duration: .55, easing: t => 1 - Math.pow(1 - t, 3) });
    else scrollTo({ top: target, behavior: RM ? 'auto' : 'smooth' });
  }
  function queueSettle() { clearTimeout(settleT); settleT = setTimeout(settle, 120); }
  addEventListener('scroll', () => { if (!touching) queueSettle(); }, { passive: true });
  document.fonts.ready.then(() => { layoutPin(); seenY = NaN; story(); });
  story();

  const t0 = performance.now();
  let prev = t0, fade = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - prev) / 1000);
    prev = now;
    const t = RM ? 2 : (now - t0) / 1000;

    if (!moved && !RM) { mx = innerWidth * (.55 + .3 * Math.sin(t * .35)); my = innerHeight * (.4 + .2 * Math.sin(t * .5)); }
    cx = damp(cx, mx, 5, dt); cy = damp(cy, my, 5, dt);
    kx = damp(kx, mx, 9, dt); ky = damp(ky, my, 9, dt);
    vx = damp(vx, mx - last, 10, dt); last = mx;
    for (let i = 0; i < 3; i++) col[i] = damp(col[i], target[i], 4, dt);
    fade = RM ? 1 : Math.min(1, fade + dt / 1.4);

    if (lenis) lenis.raf(now);

    // headline letters lean toward the cursor (or a slow wave on touch screens): read every box first, then write
    if (!RM && root.classList.contains('ready') && scrollY < innerHeight && split.length) {
      const boxes = split.map(s => s.el.getBoundingClientRect());
      const tb = boxes[0], te = boxes[boxes.length - 1];
      const ax = FINE ? mx : tb.left + (te.right - tb.left) * (.5 + .5 * Math.sin(t * .45));
      const ay = FINE ? my : null;
      const reach = FINE ? 380 : innerWidth * .28, amp = FINE ? 1 : .55;
      split.forEach((s, i) => {
        const r = boxes[i];
        const d = ay === null ? Math.abs(ax - (r.left + r.width / 2)) : Math.hypot(ax - (r.left + r.width / 2), ay - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / reach);
        const e = k * k * (3 - 2 * k) * amp;
        const w2 = damp(s.w, 500 + 300 * e, 7, dt);
        const y2 = damp(s.y, -e * (s.small ? .22 : .06) * r.height, 7, dt);
        if (Math.abs(w2 - s.w) > .05) { s.w = w2; s.g.style.setProperty('--w', w2.toFixed(1)); }
        if (Math.abs(y2 - s.y) > .02) { s.y = y2; s.g.style.translate = `0 ${y2.toFixed(2)}px`; }
        if (s.small) {
          const o2 = damp(s.o, .55 + .45 * e, 7, dt);
          if (Math.abs(o2 - s.o) > .004) { s.o = o2; s.g.style.opacity = o2.toFixed(3); }
        }
      });
    }

    story();

    const shown = cur >= 0 ? cur : teasing ? teaseI : -1;
    if (shown >= 0) {
      card.style.transform = `translate(${Math.min(innerWidth - 316, kx + 28)}px,${Math.max(16, ky - 250)}px) rotate(${Math.max(-10, Math.min(10, vx * .5))}deg)`;
    }

    // (5) dot grid with a spotlight: paused while a project covers it, and only redrawn on change under reduced motion
    const colMoving = Math.abs(col[0] - target[0]) + Math.abs(col[1] - target[1]) + Math.abs(col[2] - target[2]) > .5;
    const spotMoving = Math.abs(cx - mx) + Math.abs(cy - my) > .5;
    if (!covered && (!RM || bgDirty || colMoving || spotMoving)) {
      bgDirty = false;
      const { x, w, h } = B, rgb = col.map(Math.round).join(',');
      x.globalAlpha = 1; x.fillStyle = '#09090a'; x.fillRect(0, 0, w, h);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(320, w * .3));
      g.addColorStop(0, `rgba(${rgb},${.07 * fade})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      const S = 34, R = 220;
      x.fillStyle = `rgb(${rgb})`;
      for (let yy = S / 2; yy < h; yy += S) {
        for (let xx = S / 2; xx < w; xx += S) {
          const dx = xx - cx, dy = yy - cy, d = Math.hypot(dx, dy);
          const k = Math.max(0, 1 - d / R), kk = k * k, push = kk * 6;
          const px = xx + (d ? dx / d * push : 0), py = yy + (d ? dy / d * push : 0);
          x.globalAlpha = ((.05 + .05 * noise(xx * .01 + t * .2, yy * .01)) * .7 + kk * .55) * fade;
          const r = 1 + kk * 1.2;
          x.fillRect(px - r / 2, py - r / 2, r, r);
        }
      }
    }

    if (shown >= 0) paint(cc, P[shown].k, t, P[shown].c);
    if (ovc) paint(ovc, P[ovI].k, t, P[ovI].c);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
