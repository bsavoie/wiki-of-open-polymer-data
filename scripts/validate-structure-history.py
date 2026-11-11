#!/usr/bin/env python3
"""Validate checked-in ZIP history against a snapshot; no git history required."""
import argparse,hashlib,json,re,zipfile
from pathlib import Path
if not __debug__: raise RuntimeError('History validation must not run with assertions disabled')
arg=argparse.ArgumentParser();arg.add_argument('--snapshot',type=Path,default=Path('public-data/wop-publication-snapshot-v2/snapshot.json'));arg.add_argument('--bundle',type=Path,required=True);args=arg.parse_args();p=args.bundle;s=json.loads(args.snapshot.read_text());active={x['structureId']:x['molfileV3000'] for x in s['chemicalStructures']};r=json.loads((p/'registry.json').read_text()); sha=lambda b:hashlib.sha256(b).hexdigest()
assert set(x.name for x in p.iterdir())=={'README.md','index.html','registry.json','historical-structures.zip'}
assert r['schema']=='wop-structure-history-v1' and r['baseline']['commit']=='8e9720c4433cd116cd716c6dcb22a819e0d5d337' and r['baseline']['snapshotSha256']=='e4ebd225b4ca1446e2198307025d39840504a17bdb43bdeff2504020df32a0b7'
assert r['archive']['path']=='historical-structures.zip' and sha((p/'historical-structures.zip').read_bytes())==r['archive']['sha256']
assert 'must not be used as current scientific references' in (p/'index.html').read_text() and 'href="historical-structures.zip"' in (p/'index.html').read_text() and not re.search(r'href="[^"]+\.mol"',(p/'index.html').read_text(),re.I)
entries={x['structureId']:x for x in r['entries']};assert len(entries)==len(r['entries']);base={x['structureId']:x['sha256'] for x in r['baselineStructures']};assert len(base)==len(r['baselineStructures'])
inventory=''.join(f'{ident}\t{base[ident]}\n' for ident in sorted(base)).encode()
assert sha(inventory)=='48a80a7143009c898b9ab3d8a3bef8c152e3e6225c4e369545e391f3cd4dec16', 'Historical baseline inventory changed'
with zipfile.ZipFile(p/'historical-structures.zip') as z:
 names=z.namelist()
 assert len(names)==len(set(names)), 'Duplicate historical archive member'
 assert z.testzip() is None and set(names)=={'README.md'}|{x['archiveMember'] for x in r['entries']} and 'Do not use them as current scientific references' in z.read('README.md').decode()
 for ident,x in entries.items():
  assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',ident) and x['archiveMember']=='molfiles/'+ident+'.mol' and ident in base and x['historicalSha256']==base[ident] and sha(z.read(x['archiveMember']))==x['historicalSha256'] and x['reason']
  assert x['successorStructureId'] is None or x['successorStructureId'] in active
  if x['status']=='withdrawn':assert ident not in active and x['currentSha256'] is None
  else:assert x['status']=='historical-layout' and x['successorStructureId']==ident and ident in active and sha(active[ident].encode())==x['currentSha256']
for ident,oldhash in base.items():assert bool(active.get(ident) is None or sha(active[ident].encode())!=oldhash)==(ident in entries)
print('Validated',len(entries),'historical records and',len(base),'baseline definitions without git history')
