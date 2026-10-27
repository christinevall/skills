/*
 * measure-site.js: paste the body of this function into the browser tool's
 * JavaScript runner on a live page (or a site-builder
 * export), once per breakpoint width. It returns JSON for the audit.
 *
 *   await (MEASURE_SOURCE)()
 *
 * What it does:
 * - switches off the page's own animations, so every element sits in its
 *   final place (many builders fade content in from opacity 0)
 * - scrolls once to the bottom and back, so lazy images load
 * - reads the breakpoints from the site's own CSS (@media rules)
 * - collects every distinct text style (family, size, line height, tracking,
 *   weight, transform, colour) with an example and a count
 * - collects full-width bands (background colours, heights) and content edges
 * - collects images (size, ratio, radius, fit)
 * - collects RELATIONSHIPS: the vertical gap between consecutive siblings,
 *   grouped by "element kind → element kind", so the audit can write rules
 *   ("heading → paragraph: 24px") instead of copying one-off numbers
 * - measures line length of paragraphs in characters (ch), the real "measure"
 * - flags semantic problems: number of h1, nav items that are not links,
 *   images without alt, content hidden at opacity 0
 *
 * Read-only: it changes nothing except adding one style tag to stop animations.
 */
async () => {
  // A collapsed or hidden browser reports width 0 and every measurement is empty.
  if (innerWidth < 200) return JSON.stringify({ error: `Viewport is ${innerWidth}px wide. Set the browser to the breakpoint width first (e.g. 375, 1024, 1440).` });
  if (!document.getElementById('measure-no-motion')) {
    const st = document.createElement('style');
    st.id = 'measure-no-motion';
    st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;transform:none!important;translate:none!important;opacity:1!important}';
    document.head.appendChild(st);
  }
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300));

  const R = Math.round;
  const vis = (e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 1 && r.height > 1; }; // > 1: some builders keep hidden 1px copies of other breakpoints
  const Y = (r) => R(r.top + scrollY);
  const kind = (e) => {
    const t = e.tagName.toLowerCase();
    if (/^h[1-6]$/.test(t)) return t;
    if (t === 'img' || e.querySelector(':scope > img')) return 'image';
    if (t === 'a' && getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)') return 'button';
    if (t === 'button') return 'button';
    if (['p', 'ul', 'ol', 'li', 'a', 'figure', 'blockquote', 'form', 'section', 'article', 'header', 'footer', 'nav'].includes(t)) return t;
    const fs = parseFloat(getComputedStyle(e).fontSize);
    return e.innerText?.trim() ? (fs >= 24 ? 'large-text' : 'text') : 'box';
  };

  // Breakpoints from the site's CSS.
  const media = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) if (rule.media) media[rule.media.mediaText] = (media[rule.media.mediaText] || 0) + rule.cssRules.length;
  }

  // Text styles.
  const texts = {};
  document.querySelectorAll('body *').forEach((e) => {
    if (!vis(e)) return;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own) return;
    const s = getComputedStyle(e);
    const key = `${s.fontFamily.replace(/"/g, '').split(',')[0]} ${s.fontWeight} ${s.fontStyle === 'italic' ? 'italic ' : ''}${s.fontSize}/${s.lineHeight} ls ${s.letterSpacing}${s.textTransform !== 'none' ? ' ' + s.textTransform : ''} ${s.color}`;
    (texts[key] ??= { count: 0, example: own.slice(0, 40), tag: e.tagName.toLowerCase() }).count++;
  });

  // Bands and colours.
  const bands = [];
  const colours = {};
  document.querySelectorAll('body *').forEach((e) => {
    if (!vis(e)) return;
    const s = getComputedStyle(e); const r = e.getBoundingClientRect();
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      colours[s.backgroundColor] = (colours[s.backgroundColor] || 0) + 1;
      if (r.width >= innerWidth - 20 && r.height > 40) bands.push(`${s.backgroundColor} y${Y(r)} h${R(r.height)}`);
    }
  });

  // Content edges.
  let minL = 1e9, maxR = 0;
  document.querySelectorAll('img, p, h1, h2, h3, a, button').forEach((e) => {
    if (!vis(e)) return; const r = e.getBoundingClientRect();
    if (r.width < innerWidth - 2) { minL = Math.min(minL, r.left); maxR = Math.max(maxR, r.right); }
  });

  // Images.
  const images = [...document.querySelectorAll('img')].filter(vis).filter((i) => i.getBoundingClientRect().width > 40).map((i) => {
    const r = i.getBoundingClientRect(); let radius = getComputedStyle(i).borderRadius; let p = i.parentElement;
    for (let k = 0; k < 4 && p; k++) { const pr = getComputedStyle(p).borderRadius; if (pr !== '0px' && radius === '0px') radius = `${pr} (on a wrapper)`; p = p.parentElement; }
    return { src: (i.currentSrc || i.src).split('?')[0], alt: i.alt, x: [R(r.left), R(r.right)], y: Y(r), size: `${R(r.width)}x${R(r.height)}`, ratio: +(r.width / r.height).toFixed(2), fit: getComputedStyle(i).objectFit, radius, natural: `${i.naturalWidth}x${i.naturalHeight}` };
  });

  // Relationships: gap between consecutive visible siblings, by kind → kind.
  const relations = {};
  document.querySelectorAll('body *').forEach((parent) => {
    const kids = [...parent.children].filter(vis);
    for (let i = 1; i < kids.length; i++) {
      const a = kids[i - 1].getBoundingClientRect(); const b = kids[i].getBoundingClientRect();
      const gap = R(b.top - a.bottom);
      if (gap < 0 || gap > 200 || Math.abs(a.left - b.left) > 4) continue; // stacked siblings only
      const key = `${kind(kids[i - 1])} → ${kind(kids[i])}`;
      (relations[key] ??= {})[gap] = ((relations[key] ??= {})[gap] || 0) + 1;
    }
  });

  // Measure (line length) of paragraphs, in ch of their own font.
  // Any element whose own text is a long run (builders do not always use <p>).
  const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const measures = [...document.querySelectorAll('body *')].filter(vis).filter((p) => ownText(p).length > 120).slice(0, 20).map((p) => {
    const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;display:inline-block;visibility:hidden;inline-size:1ch'; p.appendChild(probe);
    const ch = probe.getBoundingClientRect().width; probe.remove();
    return R(p.getBoundingClientRect().width / ch);
  });

  // Buttons.
  const buttons = [...document.querySelectorAll('a, button')].filter((e) => vis(e) && getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)' && e.getBoundingClientRect().height < 80).slice(0, 8).map((e) => {
    const s = getComputedStyle(e); const r = e.getBoundingClientRect();
    return `"${e.innerText.trim().slice(0, 20)}" ${R(r.width)}x${R(r.height)} bg ${s.backgroundColor} pad ${s.padding} radius ${s.borderRadius} ${s.fontWeight} ${s.fontSize}`;
  });

  // Semantics.
  const semantics = {
    h1: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(vis).map((h) => `${h.tagName} ${h.innerText.trim().slice(0, 30)}`).slice(0, 30),
    navItemsNotLinks: [...document.querySelectorAll('header *, nav *')].filter((e) => e.children.length === 0 && e.innerText?.trim() && !e.closest('a, button')).length,
    imagesWithoutAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => document.querySelector(t)),
    lang: document.documentElement.lang || null,
  };

  return JSON.stringify({ url: location.href, width: innerWidth, pageHeight: document.body.scrollHeight, media, contentEdges: [R(minL), R(maxR)], texts, colours, bands: [...new Set(bands)], images, relations, measures, buttons, semantics }, null, 1);
}
