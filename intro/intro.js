// Motion for the intro pages: scroll reveals plus the small live details in the mockups.
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const all = s => document.querySelectorAll(s);
  const pad = n => String(n).padStart(2, '0');

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  all('.rv, .mac').forEach(el => io.observe(el));

  // CSP allows no inline styles, so per-element custom properties come from data-css="--h:40%;--w:10%"
  all('[data-css]').forEach(el => el.dataset.css.split(';').forEach(p => { const [k, v] = p.split(':'); el.style.setProperty(k.trim(), v.trim()); }));

  // stagger children marked with data-stagger
  all('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--d', `${i * 0.08}s`)));

  // Kulku: leave-by ring counts down and loops
  all('[data-countdown]').forEach(el => {
    const total = +el.dataset.countdown, fg = el.querySelector('.fg'), out = el.querySelector('b');
    let left = total - 37;
    const tick = () => {
      left = left <= 0 ? total : left - 1;
      out.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
      fg.style.setProperty('stroke-dashoffset', String(471 * (1 - left / total)));
    };
    tick(); if (!RM) setInterval(tick, 1000);
  });

  // Dash: live clock
  all('[data-clock]').forEach(el => {
    const tick = () => { const d = new Date(); el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    tick(); setInterval(tick, 10000);
  });

  // Dash: the brief types itself once it is on screen
  all('[data-type]').forEach(el => {
    const text = el.textContent.trim();
    if (RM) return;
    el.textContent = ''; el.classList.add('typing');
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; o.disconnect();
      let i = 0;
      const step = () => { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, 18 + Math.random() * 30); };
      step();
    });
    o.observe(el);
  });

  // Brew: shot timer pours a cup, holds, then starts again
  all('[data-shot]').forEach(el => {
    const out = el.querySelector('b'), cup = el.querySelector('.cup i'), end = +el.dataset.shot;
    let t = 0;
    const tick = () => {
      t = t >= end + 3 ? 0 : t + .1;
      const s = Math.min(t, end);
      out.textContent = s.toFixed(1);
      cup.style.setProperty('--fill', `${4 + 76 * (s / end)}%`);
    };
    if (RM) { t = end; tick(); return; }
    setInterval(tick, 100);
  });

  // Brew: taste chips cycle through how the shot tasted and what changes
  all('[data-taste]').forEach(el => {
    const chips = [...el.querySelectorAll('span')], tip = el.querySelector('p b');
    const tips = el.dataset.taste.split('|');
    let i = 0;
    const show = () => { chips.forEach((c, k) => c.classList.toggle('on', k === i)); tip.textContent = tips[i]; i = (i + 1) % chips.length; };
    show(); if (!RM) setInterval(show, 2200);
  });
});
