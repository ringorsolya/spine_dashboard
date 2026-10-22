/*
 * spine-data.js — adatadapter a GitHub Pages-tükörhöz.
 *
 * Az eredeti oldal (agendaz-spine.vercel.app) a saját szerveréről kérte az adatot
 * (/api-data/..., /network-data/..., /api/data). Ez a szkript a fetch hívásokat
 * elfogja, és a Supabase-re irányítja:
 *   - összesítő JSON / .json.gz fájlok      -> Supabase Storage (site-data bucket)
 *   - Data Explorer lapok és keresés        -> RPC: explorer_query
 *   - egy fiók posztjai (All posts)         -> RPC: account_posts_for
 * Az oldalak saját kódja így változatlan maradhat.
 */
(function () {
  const C = window.SPINE_CONFIG;
  const nativeFetch = window.fetch.bind(window);
  const H = { apikey: C.supabaseKey, Authorization: 'Bearer ' + C.supabaseKey };

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

  async function rpc(name, args) {
    const r = await nativeFetch(`${C.supabaseUrl}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { ...H, 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!r.ok) {
      let msg = `HTTP ${r.status}`;
      try { msg = (await r.json()).message || msg; } catch (_) {}
      return json({ error: msg }, r.status);
    }
    return json(await r.json());
  }

  function storage(path) {
    return nativeFetch(
      `${C.supabaseUrl}/storage/v1/object/authenticated/${C.bucket}/${path}`,
      { headers: H }
    );
  }

  // filters.json -> index -> címke visszafejtés a statikus Explorer-fájlnevekhez
  let filtersPromise = null;
  function filters() {
    if (!filtersPromise) filtersPromise = storage('api-data/filters.json').then((r) => r.json());
    return filtersPromise;
  }
  const invert = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [String(v), k]));

  const PREFIX = {
    pros: ['proselytismLabelIndex', 'proselytismLabel'],
    lgbtq: ['lgbtqLabelIndex', 'lgbtqLabel'],
    ukraine: ['ukraineLabelIndex', 'ukraineLabel'],
    ineq: ['inequalityLabelIndex', 'inequalityLabel'],
    ph: ['publicHealthLabelIndex', 'publicHealthLabel'],
    cl: ['climateLabelIndex', 'climateLabel'],
    sec: ['securityLabelIndex', 'securityLabel'],
    cor: ['corruptionLabelIndex', 'corruptionLabel'],
    nl: ['labelIndex', 'narrativeLabel'],
  };

  async function explorerFromStaticName(name) {
    // pl. data.p3 | pl.facebook.p1 | nl.5.p2 | mig.901.p1 | lgbtq.0.p1
    const m = name.match(/^(.*)\.p(\d+)$/);
    if (!m) return null;
    const [, prefix, page] = m;
    const args = { page: Number(page), pageSize: 50 };
    if (prefix === 'data') return args;
    const [kind, ...rest] = prefix.split('.');
    const val = rest.join('.');
    if (kind === 'pl') { args.platform = val; return args; }
    if (kind === 'mig') { args.predCode = val; return args; }
    const spec = PREFIX[kind];
    if (!spec) return null;
    const label = invert((await filters())[spec[0]])[val];
    if (label === undefined) return null;
    args[spec[1]] = label;
    return args;
  }

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : '';
    // Az eredeti oldalkód gyökér-relatív útvonalakat kér (/api-data/..., /api/data?...)
    if (!url.startsWith('/') || url.startsWith('//')) return nativeFetch(input, init);
    const u = new URL(url, location.origin);
    const p = u.pathname;

    // 1) Élő API (keresés, kombinált szűrők, fiók-fallback)
    if (p === '/api/data') {
      const q = Object.fromEntries(u.searchParams.entries());
      if (q.mode === 'filters') return storage('api-data/filters.json');
      if (q.accountId) return rpc('account_posts_for', { acc: q.accountId, lim: Number(q.pageSize || 200) });
      const args = {};
      for (const [k, v] of Object.entries(q)) if (v !== '') args[k] = k === 'page' || k === 'pageSize' ? Number(v) : v;
      return rpc('explorer_query', { p: args });
    }

    // 2) Egy fiók posztjai
    let m = p.match(/^\/api-data\/account\/(.+)\.json$/);
    if (m) return rpc('account_posts_for', { acc: decodeURIComponent(m[1]), lim: 200 });

    // 3) Előre lapozott Explorer-fájlok
    m = p.match(/^\/api-data\/([^/]+)\.json$/);
    if (m && /\.p\d+$/.test(m[1])) {
      const args = await explorerFromStaticName(m[1]);
      if (!args) return json({ error: 'not found' }, 404);
      return rpc('explorer_query', { p: args });
    }

    // 4) Minden más összesítő fájl a Storage-ból
    if (p.startsWith('/api-data/') || p.startsWith('/network-data/')) return storage(p.slice(1));

    return nativeFetch(input, init);
  };
})();
