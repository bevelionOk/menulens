import json, glob, os, collections, re
S=os.path.dirname(os.path.abspath(__file__))
PRICE={'gpt-5.6-luna':(0.20,1.20),'gpt-5.6-terra':(2.0,12.0)}
usage={}
for f in glob.glob(f'{S}/results/server-*.log'):
    for l in open(f):
        if '"model usage"' in l:
            r=json.loads(l); usage.setdefault(r['run_id'],[]).append(r)
runs={}
for f in sorted(glob.glob(f'{S}/results/*--*.json')):
    model,name=os.path.basename(f)[:-5].split('--'); runs[(model,name)]=json.load(open(f))
print(f"{'model':14} {'menu':10} {'status':8} {'rows':>4} {'rel':>4} {'att':>3} {'in':>6} {'out':>5} {'ms':>6} {'cost$':>8}  rules")
for (model,name),r in runs.items():
    run=r.get('run',r); dishes=r.get('dishes',[])
    rid=run.get('id'); u=usage.get(rid,[])
    ti=sum(x['input_tokens'] for x in u); to=sum(x['output_tokens'] for x in u); ms=sum(x.get('elapsed_ms',0) for x in u)
    pi,po=PRICE[model]; cost=ti*pi/1e6+to*po/1e6
    rel=sum(1 for d in dishes if d.get('flag')=='reliable')
    rules=collections.Counter(t.get('rule') or t.get('id') or str(t) for d in dishes for t in (d.get('confidence_reasons') or []))
    print(f"{model:14} {name:10} {run.get('status'):8} {len(dishes):4} {rel:4} {len(u):3} {ti:6} {to:5} {ms:6} {cost:8.4f}  {dict(rules)}")
# field-level diff per menu
for name in sorted({n for _,n in runs}):
    a=runs.get(('gpt-5.6-luna',name)); b=runs.get(('gpt-5.6-terra',name))
    if not a or not b: continue
    da={d['name']:d for d in a.get('dishes',[])}; db={d['name']:d for d in b.get('dishes',[])}
    print(f"\n## {name}: names only in luna: {sorted(set(da)-set(db))[:8]} | only in terra: {sorted(set(db)-set(da))[:8]}")
    for n in sorted(set(da)&set(db)):
        x,y=da[n],db[n]
        diffs=[]
        for k in ('price_value','price_raw','flag'):
            if x.get(k)!=y.get(k): diffs.append(f"{k}: {x.get(k)!r} -> {y.get(k)!r}")
        ax=sorted((al.get('id') or str(al), al.get('provenance')) for al in x.get('allergens',[]) ) if isinstance(x.get('allergens'),list) else x.get('allergens')
        ay=sorted((al.get('id') or str(al), al.get('provenance')) for al in y.get('allergens',[]) ) if isinstance(y.get('allergens'),list) else y.get('allergens')
        if ax!=ay: diffs.append(f"allergens: {ax} -> {ay}")
        if diffs: print(f"  - {n}: " + " | ".join(diffs))
