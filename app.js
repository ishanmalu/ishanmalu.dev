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
  const P = rows.map(r => ({
    el: r,
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
  rows.forEach((r, i) => r.style.setProperty('--c', P[i].c));

  // ---------- highlight colour ----------
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  let target = hex(DEFAULT_HL);
  const col = target.slice();
  function setHL(c) { root.style.setProperty('--hl', c); target = hex(c); }

  // ---------- headline split ----------
  const split = [];
  let n = 0;
  document.querySelectorAll('.split').forEach(el => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = [...text].map(ch => ch === ' '
      ? '<span class="sp" aria-hidden="true"></span>'
      : `<span class="ch" aria-hidden="true" style="--i:${n++}">${ch}</span>`).join('');
    if (el.id === 'title') n += 3;
    el.querySelectorAll('.ch').forEach(c => split.push({ el: c, small: el.classList.contains('by'), w: 500, y: 0, o: .55 }));
  });
  root.classList.add('fonts-pending');
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(() => {
    root.classList.remove('fonts-pending');
    root.classList.add('ready');
  });

  // ---------- rows ----------
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=';
  function scramble(el, text) {
    if (RM) return;
    let i = 0;
    clearInterval(el._s);
    el._s = setInterval(() => {
      el.textContent = [...text].map((c, k) => k < i ? c : CH[Math.random() * CH.length | 0]).join('');
      i += .5;
      if (i > text.length) { el.textContent = text; clearInterval(el._s); }
    }, 28);
  }
  const card = $('#card');
  let cc = fit($('canvas', card));
  let cur = -1;
  function enter(i) {
    if (cur === i) return;
    cur = i;
    rows.forEach((r, k) => r.classList.toggle('on', k === i));
    rowsEl.classList.add('hov');
    $('#cn').textContent = P[i].n;
    $('#cs').textContent = P[i].label;
    card.classList.add('on');
    setHL(P[i].c);
    scramble($('.t', rows[i]), P[i].n);
  }
  function leave() {
    if (cur < 0) return;
    cur = -1;
    rows.forEach(r => r.classList.remove('on'));
    rowsEl.classList.remove('hov');
    card.classList.remove('on');
    setHL(DEFAULT_HL);
  }
  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') enter(i); });
    r.addEventListener('focus', () => enter(i));
    r.addEventListener('blur', leave);
    r.addEventListener('click', e => { e.preventDefault(); open(i, true); });
  });
  rowsEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') leave(); });

  // ---------- project view ----------
  const ov = $('#ov'), main = $('main');
  let ovI = -1, ovc = null, lastFocus = null, pushed = false;

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
    [['Status', p.label], ['Year', p.y], ['Built with', p.stack]].forEach(([a, b]) => {
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
      a.innerHTML = `${label} <span class="arr" aria-hidden="true">↗</span>`;
      magnetic(a);
      btns.append(a);
    });
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'btn'; next.textContent = 'Next project →';
    next.onclick = () => open((ovI + 1) % P.length, false, true);
    magnetic(next);
    btns.append(next);
    setHL(p.c);
  }

  function open(i, push, replace) {
    fill(i);
    const hash = '#' + P[i].k;
    if (push) { history.pushState({ ov: 1 }, '', hash); pushed = true; }
    else if (replace) history.replaceState(history.state, '', hash);
    if (!ov.hidden) { ov.scrollTop = 0; return; }
    lastFocus = document.activeElement;
    leave();
    setHL(P[i].c);
    ov.hidden = false;
    main.inert = true;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      ov.classList.add('on');
      ovc = fit($('.vis canvas', ov));
      $('#ovx').focus({ preventScroll: true });
    });
  }

  function close(fromHistory) {
    if (ov.hidden) return;
    ov.classList.remove('on');
    main.inert = false;
    document.body.style.overflow = '';
    setHL(DEFAULT_HL);
    ovc = null;
    const done = () => { if (!ov.classList.contains('on')) ov.hidden = true; };
    RM ? done() : setTimeout(done, 800);
    if (!fromHistory) {
      if (pushed) history.back();
      else history.replaceState(null, '', location.pathname);
    }
    pushed = false;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  $('#ovx').addEventListener('click', () => close(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(false); });
  const fromHash = () => {
    const i = P.findIndex(p => '#' + p.k === location.hash);
    if (i >= 0) open(i, false); else close(true);
  };
  addEventListener('popstate', fromHash);
  fromHash();

  // ---------- background + motion loop ----------
  const bg = $('#bg');
  let B = fit(bg);
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { B = fit(bg); cc = fit($('canvas', card)); if (ovc) ovc = fit($('.vis canvas', ov)); }, 100);
  });

  let mx = innerWidth * .6, my = innerHeight * .35, cx = mx, cy = my, vx = 0, last = mx, moved = false;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; moved = true; }, { passive: true });

  const t0 = performance.now();
  function frame(now) {
    const t = RM ? 2 : (now - t0) / 1000;

    if (!moved && !RM) { mx = innerWidth * (.55 + .3 * Math.sin(t * .35)); my = innerHeight * (.4 + .2 * Math.sin(t * .5)); }
    cx += (mx - cx) * .09; cy += (my - cy) * .09;
    vx = vx * .85 + (mx - last) * .15; last = mx;
    for (let i = 0; i < 3; i++) col[i] += (target[i] - col[i]) * .06;

    if (cur >= 0) {
      card.style.transform = `translate(${Math.min(innerWidth - 310, cx + 30)}px,${Math.max(16, cy - 240)}px) rotate(${Math.max(-12, Math.min(12, vx * .6))}deg)`;
    }

    // dot grid with a spotlight
    const { x, w, h } = B, rgb = col.map(Math.round).join(',');
    x.globalAlpha = 1; x.fillStyle = '#09090a'; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(320, w * .3));
    g.addColorStop(0, `rgba(${rgb},.07)`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const S = 34, R = 220;
    x.fillStyle = `rgb(${rgb})`;
    for (let yy = S / 2; yy < h; yy += S) {
      for (let xx = S / 2; xx < w; xx += S) {
        const dx = xx - cx, dy = yy - cy, d = Math.hypot(dx, dy);
        const k = Math.max(0, 1 - d / R), kk = k * k, push = kk * 6;
        const px = xx + (d ? dx / d * push : 0), py = yy + (d ? dy / d * push : 0);
        x.globalAlpha = (.05 + .05 * noise(xx * .01 + t * .2, yy * .01)) * .7 + kk * .55;
        const r = 1 + kk * 1.2;
        x.fillRect(px - r / 2, py - r / 2, r, r);
      }
    }

    // headline letters lean toward the cursor: read every box first, then write
    if (FINE && !RM && root.classList.contains('ready') && scrollY < innerHeight) {
      const boxes = split.map(s => s.el.getBoundingClientRect());
      split.forEach((s, i) => {
        const r = boxes[i];
        const k = Math.max(0, 1 - Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) / 380);
        const e = k * k * (3 - 2 * k);
        const w2 = s.w + ((500 + 300 * e) - s.w) * .14;
        const y2 = s.y + ((-e * (s.small ? .22 : .06) * r.height) - s.y) * .14;
        if (Math.abs(w2 - s.w) > .05) { s.w = w2; s.el.style.setProperty('--w', w2.toFixed(1)); }
        if (Math.abs(y2 - s.y) > .02) { s.y = y2; s.el.style.translate = `0 ${y2.toFixed(2)}px`; }
        if (s.small) {
          const o2 = .55 + .45 * e;
          if (Math.abs(o2 - s.o) > .005) { s.o = o2; s.el.style.opacity = o2.toFixed(3); }
        }
      });
    }

    if (cur >= 0) paint(cc, P[cur].k, t, P[cur].c);
    if (ovc) paint(ovc, P[ovI].k, t, P[ovI].c);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
