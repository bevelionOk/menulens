# luna 2026-08-22 (before the B10/B14/B45 fixes) vs luna 2026-08-23 (after), row by row.
import json, glob, os, collections
S = os.path.dirname(os.path.abspath(__file__))
OLD = os.path.join(os.path.dirname(S), 'measurement-2026-08-22')
PRICE = (0.20, 1.20)  # luna, $/M tokens in, out (D3)
MODEL = 'gpt-5.6-luna'

def load(folder):
    usage = {}
    for l in open(f'{folder}/model-usage.jsonl'):
        r = json.loads(l)
        if r.get('model') == MODEL: usage.setdefault(r['run_id'], []).append(r)
    runs = {}
    for f in sorted(glob.glob(f'{folder}/{MODEL}--*.json')):
        runs[os.path.basename(f)[:-5].split('--')[1]] = json.load(open(f))
    return usage, runs

def row(label, name, r, usage):
    run = r.get('run', r); dishes = r.get('dishes', [])
    u = usage.get(run.get('id'), [])
    ti = sum(x['input_tokens'] for x in u); to = sum(x['output_tokens'] for x in u); ms = sum(x.get('elapsed_ms', 0) for x in u)
    cost = ti * PRICE[0] / 1e6 + to * PRICE[1] / 1e6
    rel = sum(1 for d in dishes if d.get('flag') == 'reliable')
    rules = collections.Counter(t['rule'] for d in dishes for t in (d.get('confidence_reasons') or []))
    print(f"{label:10} {name:10} {run.get('status'):8} {len(dishes):4} {rel:4} {len(u):3} {ti:6} {to:5} {ms:6} {cost:8.4f}  {dict(sorted(rules.items()))}")

def allergens(d):
    return sorted((a['id'], a['provenance']) for a in d.get('allergens', []))

oldU, old = load(OLD); newU, new = load(S)
print(f"{'date':10} {'menu':10} {'status':8} {'rows':>4} {'rel':>4} {'att':>3} {'in':>6} {'out':>5} {'ms':>6} {'cost$':>8}  rules")
for name in sorted(set(old) | set(new)):
    if name in old: row('2026-08-22', name, old[name], oldU)
    if name in new: row('2026-08-23', name, new[name], newU)

for name in sorted(set(old) & set(new)):
    da = {d['name']: d for d in old[name]['dishes']}; db = {d['name']: d for d in new[name]['dishes']}
    print(f"\n## {name}: names only on 08-22: {sorted(set(da) - set(db))} | only on 08-23: {sorted(set(db) - set(da))}")
    for n in sorted(set(da) & set(db)):
        x, y = da[n], db[n]; diffs = []
        for k in ('price_value', 'price_raw', 'flag'):
            if x.get(k) != y.get(k): diffs.append(f"{k}: {x.get(k)!r} -> {y.get(k)!r}")
        if allergens(x) != allergens(y): diffs.append(f"allergens: {allergens(x)} -> {allergens(y)}")
        rx = sorted(t['rule'] for t in x['confidence_reasons']); ry = sorted(t['rule'] for t in y['confidence_reasons'])
        if rx != ry: diffs.append(f"rules: {rx} -> {ry}")
        if diffs: print(f"  - {n}: " + " | ".join(diffs))
    t6 = [(d['name'], t['detail']) for d in new[name]['dishes'] for t in d['confidence_reasons'] if t['rule'] == 'T6']
    if t6:
        print(f"  T6 reasons on 08-23 ({len(t6)}):")
        for n, det in t6: print(f"    {n}: {det}")
