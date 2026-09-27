"""Writes one page per project (seedscape.html, daisy.html, ...) plus sitemap.xml.

Each page is index.html with its own title, description and address, so a
project can be shared and found on its own. app.js reads the address and opens
that project's view, so the pages look exactly like the home page with the
project open. Run after editing index.html:

    python3 scripts/pages.py
"""
import html
import re
from pathlib import Path

SITE = 'https://ishanmalu.dev'
root = Path(__file__).resolve().parent.parent
index = (root / 'index.html').read_text()

rows = re.findall(
    r'<a class="row" href="/([a-z0-9-]+)".*?<span class="t">(.*?)</span>.*?<span class="d">(.*?)</span>',
    index, re.S)


def set_meta(page, attr, name, value):
    pattern = rf'(<meta {attr}="{re.escape(name)}" content=")[^"]*(")'
    page, n = re.subn(pattern, lambda m: m.group(1) + value + m.group(2), page)
    assert n == 1, name
    return page


written = []
for slug, name, desc in rows:
    name, desc = html.unescape(name), html.unescape(desc)
    title = f'{name} · Side quests by Ishan Malu'
    page = re.sub(r'<title>.*?</title>', f'<title>{html.escape(title)}</title>', index, count=1)
    page = set_meta(page, 'name', 'description', html.escape(desc, quote=True))
    page = set_meta(page, 'property', 'og:title', html.escape(title, quote=True))
    page = set_meta(page, 'property', 'og:description', html.escape(desc, quote=True))
    page = set_meta(page, 'property', 'og:url', f'{SITE}/{slug}')
    page = page.replace(f'<link rel="canonical" href="{SITE}/">', f'<link rel="canonical" href="{SITE}/{slug}">')
    assert f'href="{SITE}/{slug}"' in page, slug
    (root / f'{slug}.html').write_text(page)
    written.append(slug)

urls = [SITE + '/'] + [f'{SITE}/{s}' for s in written]
(root / 'sitemap.xml').write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls)
    + '</urlset>\n')
print('wrote', ', '.join(f'{s}.html' for s in written), '+ sitemap.xml')
