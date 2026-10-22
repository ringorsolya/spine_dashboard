# SPINE Dashboard

Az [AgendaZ SPINE](https://agendaz-spine.vercel.app/) kutatási felület (poltextLAB, SPINE WP4) tükre
GitHub Pages-en, Supabase adatháttérrel.

A repó **csak a felület kódját** tartalmazza. Minden adat a `spine-dashboard` Supabase-projektben van,
csak olvasható hozzáféréssel (RLS), ugyanazzal a mintával, mint az ElitData esetében.

## Felépítés

| Fájl | Szerep |
| --- | --- |
| `*.html`, `styles.css`, `script.js`, `d3.min.js`, `img/` | Az eredeti oldal, gyökér-relatív linkek nélkül (alútvonal alatt is működik) |
| `spine-config.js` | Supabase URL és nyilvános (publishable/anon) kulcs |
| `spine-data.js` | Adatadapter: az eredeti `fetch('/api-data/...')` hívásokat a Supabase-re irányítja |

## Adatok a Supabase-ben

| Hely | Tartalom |
| --- | --- |
| Storage `site-data/api-data/` | `filters.json`, `stats.json`, `proselytism-*.json`, `t42.json`, `t43.json`, `net-posts/{téma}.json.gz` |
| Storage `site-data/network-data/` | `{téma}.json.gz` (co-sharing hálózatok), `community-summary/*.json` |
| `public.account_posts`, `public.account_totals` | A hálózati fiókok posztjai (Networks / Communities „All posts”) |
| `public.posts` | A Data Explorer posztjai |
| RPC `explorer_query(p jsonb)` | Szűrés, keresés, lapozás az Explorerhez |
| RPC `account_posts_for(acc text, lim int)` | Egy fiók posztjai |

Az eredeti oldal útvonalai és az adapter megfeleltetése:

| Eredeti kérés | Tükörben |
| --- | --- |
| `/api-data/*.json`, `/network-data/*` | Storage objektum (`/storage/v1/object/authenticated/site-data/...`) |
| `/api-data/{szűrő}.p{n}.json`, `/api/data?...` | `rpc/explorer_query` |
| `/api-data/account/{id}.json`, `/api/data?accountId=` | `rpc/account_posts_for` |

## Helyi futtatás

    python -m http.server 8000

majd `http://localhost:8000/`.

## Korlátok

- Az ingyenes Supabase-csomag 500 MB-os, ezért a Data Explorer nem a teljes 2,29 millió posztot tartalmazza
  (lásd a `posts` tábla tartalmát).
- A forrásadat a SPINE D4.1 replikációs csomagjából és az eredeti oldal publikált adatfájljaiból származik.
