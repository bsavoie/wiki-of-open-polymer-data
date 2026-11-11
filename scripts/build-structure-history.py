#!/usr/bin/env python3
"""Build isolated, deterministic warning-bearing historical bundle; no raw public molfiles."""
import argparse,hashlib,html,io,json,re,subprocess,zipfile
from pathlib import Path
if not __debug__: raise RuntimeError('History maintenance must not run with assertions disabled')
arg=argparse.ArgumentParser();arg.add_argument('--snapshot',type=Path,default=Path('public-data/wop-publication-snapshot-v2/snapshot.json'));arg.add_argument('--reasons',type=Path,required=True);arg.add_argument('--output',type=Path,required=True);arg.add_argument('--baseline-commit',default='8e9720c4433cd116cd716c6dcb22a819e0d5d337');args=arg.parse_args();o=args.output
if o.exists(): raise SystemExit('History output already exists; use a fresh candidate directory so the prior archive is preserved.')
raw=args.snapshot.read_bytes();current=json.loads(raw);baseline_raw=subprocess.check_output(['git','show',args.baseline_commit+':public-data/wop-publication-snapshot-v2/snapshot.json']);expected='e4ebd225b4ca1446e2198307025d39840504a17bdb43bdeff2504020df32a0b7';assert hashlib.sha256(baseline_raw).hexdigest()==expected, 'Unexpected historical baseline';baseline=json.loads(baseline_raw)
old={x['structureId']:x['molfileV3000'] for x in baseline['chemicalStructures']};active={x['structureId']:x['molfileV3000'] for x in current['chemicalStructures']};reason_map=json.loads(args.reasons.read_text());changed={id for id,data in old.items() if active.get(id)!=data};assert changed==set(reason_map), 'Reason map does not cover exactly the changed or withdrawn baseline IDs'
m={'baselineCommit':args.baseline_commit,'baselineSnapshotSha256':expected,'currentSnapshotSha256':hashlib.sha256(raw).hexdigest()};o.mkdir(parents=True,exist_ok=True);entries=[];members={}
readme='''# Historical structure records\n\nWARNING: These are historical, superseded chemical structures from the public version deployed on 10 November 2026. They may be scientifically incorrect, incomplete, or ambiguous. Do not use them as current scientific references.\n\nThe external registry records each file's SHA-256, reason for withdrawal or historical status, and a successor identifier where established. A successor is a corrected or current reference, not an assertion that the records are interchangeable. These files are preserved for reproducibility only.\n''';members['README.md']=readme.encode()
for ident in sorted(changed):
 assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',ident); data=old[ident].encode();d=reason_map[ident];status=d['status'];reason=d['reason'];successor=d['successorStructureId'];assert reason and (successor is None or successor in active)
 if ident not in active:assert status=='withdrawn';current_hash=None
 else:assert status=='historical-layout' and successor==ident;current_hash=hashlib.sha256(active[ident].encode()).hexdigest()
 historical_hash=hashlib.sha256(data).hexdigest();member='molfiles/'+ident+'.mol';members[member]=data
 used=[]
 for polymer in baseline['polymers']:
  def contains(x):
   if isinstance(x,dict):return any((k=='structureId' and v==ident) or contains(v) for k,v in x.items())
   if isinstance(x,list):return any(contains(v) for v in x)
   return False
  if contains(polymer):used.append(polymer['wopId'])
 entries.append({'structureId':ident,'status':status,'reason':reason,'successorStructureId':successor,'historicalSha256':historical_hash,'currentSha256':current_hash,'baselineEntryIds':used,'archiveMember':member})
buffer=io.BytesIO()
with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_STORED) as z:
 for name in sorted(members):
  info=zipfile.ZipInfo(name,date_time=(2026,11,10,23,22,14));info.compress_type=zipfile.ZIP_STORED;info.create_system=3;info.external_attr=(0o100644 << 16);z.writestr(info,members[name])
archive=buffer.getvalue();archive_sha=hashlib.sha256(archive).hexdigest();(o/'historical-structures.zip').write_bytes(archive)
baseline_structures=[{'structureId':x['structureId'],'sha256':hashlib.sha256(x['molfileV3000'].encode()).hexdigest()} for x in baseline['chemicalStructures']];baseline_structures.sort(key=lambda x:x['structureId'])
registry={'schema':'wop-structure-history-v1','warning':'Historical records may be inaccurate, incomplete, or superseded. Do not use them as current scientific references.','baseline':{'commit':m['baselineCommit'],'snapshotSha256':m['baselineSnapshotSha256'],'publishedAt':'2026-11-10T23:22:15Z'},'baselineStructures':baseline_structures,'comparedSnapshotSha256':m['currentSnapshotSha256'],'archive':{'path':'historical-structures.zip','sha256':archive_sha},'entries':entries};(o/'registry.json').write_text(json.dumps(registry,indent=2,ensure_ascii=False)+'\n',encoding='utf8');(o/'README.md').write_text(readme,encoding='utf8')
e=html.escape;rows=[]
for x in entries:
 succ=e(x['successorStructureId']) if x['successorStructureId'] else 'No single successor';rows.append('<tr><th scope="row">'+e(x['structureId'])+'</th><td>'+e(x['status'])+'</td><td>'+e(x['reason'])+'</td><td>'+succ+'</td><td><code>'+e(x['archiveMember'])+'</code><br><code>'+e(x['historicalSha256'])+'</code></td></tr>')
page='''<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Historical chemical structures — Wiki of Open Polymer Data</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:90rem;margin:2rem auto;padding:0 1rem;color:#1b2431}.warning{border-left:.4rem solid #aa4b00;background:#fff3df;padding:1rem}.table{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:900px}th,td{border:1px solid #aaa;padding:.55rem;text-align:left;vertical-align:top}code,th[scope=row]{overflow-wrap:anywhere}</style></head><body><main><h1>Historical chemical structures</h1><p class="warning"><strong>Warning: historical records may be inaccurate, incomplete, or superseded.</strong> They are preserved for reproducibility and must not be used as current scientific references. A listed successor is not an assertion that two records are interchangeable.</p><p>Baseline: public version deployed 10 November 2026. The archive includes its own warning and historical V3000 records. Current structures are linked from the encyclopedia articles.</p><p><a href="historical-structures.zip" download>Download historical archive (ZIP)</a> · <a href="registry.json">Machine-readable registry</a> · <a href="README.md">Archive explanation</a> · <a href="../../">Encyclopedia home</a></p><p>Archive SHA-256: <code>'''+archive_sha+'''</code></p><p>Scroll the table horizontally to see all columns.</p><div class="table" tabindex="0" role="region" aria-label="Historical structure records; scroll horizontally"><table><thead><tr><th>Former identifier</th><th>Status</th><th>Reason</th><th>Current identifier, if known</th><th>Archive member and SHA-256</th></tr></thead><tbody>'''+''.join(rows)+'''</tbody></table></div></main></body></html>\n''';(o/'index.html').write_text(page,encoding='utf8')
print('Built ZIP containing',len(entries),'historical records; archive sha256',archive_sha,'at',o)
