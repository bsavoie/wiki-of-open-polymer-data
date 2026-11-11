#!/usr/bin/env python3
"""Issue a sanitized release assertion only after local audit reconciliation."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

from structure_audit_attestation import SCHEMA, presentation_digest, snapshot_facts, verify_attestation

root = Path(__file__).resolve().parents[1]
snapshot_path = root / 'public-data/wop-publication-snapshot-v2/snapshot.json'
ledger_path = root / 'outputs/structure-audit/ledger.json'
gate = root / 'outputs/structure-audit/check-release-readiness.py'
destination = root / '.github/structure-audit-attestation.json'
quarantine = root / 'outputs/structure-audit/quarantined-attestations'


def quarantine_existing_assertion():
    """Move an old assertion out of the CI-consumed path without discarding it."""
    if not os.path.lexists(destination):
        return None
    quarantine.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=quarantine, prefix='structure-audit-attestation-', suffix='.json')
    os.close(fd)
    try:
        os.replace(destination, temporary)
    except OSError:
        os.unlink(temporary)
        raise
    return temporary

try:
    snapshot_raw = snapshot_path.read_bytes()
    ledger_raw = ledger_path.read_bytes()
    presentation = presentation_digest(root)
    result = subprocess.run([sys.executable, str(gate)], cwd=root, check=False)
    if result.returncode:
        raise ValueError('local structure-audit readiness check did not pass')
    if snapshot_path.read_bytes() != snapshot_raw or ledger_path.read_bytes() != ledger_raw or presentation_digest(root) != presentation:
        raise ValueError('snapshot, ledger, or presentation inputs changed during review; retry after edits finish')
    ledger = json.loads(ledger_raw)
    digest, total = snapshot_facts(snapshot_raw)
    live = [use for use in ledger['uses'] if use.get('state') != 'superseded']
    if ledger.get('currentSha256') != digest or len(live) != total or any(use.get('state') != 'accepted' for use in live):
        raise ValueError('ledger does not represent a complete audit of the current snapshot')
    assertion = {'schema': SCHEMA, 'snapshot_sha256': digest, 'presentation_sha256': presentation, 'live_uses': total,
                 'accepted_uses': len(live), 'review_complete': True}
    verify_attestation(snapshot_raw, assertion, root)
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=destination.parent, prefix='.structure-audit-attestation-')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as output:
            json.dump(assertion, output, indent=2)
            output.write('\n')
        if snapshot_path.read_bytes() != snapshot_raw or ledger_path.read_bytes() != ledger_raw or presentation_digest(root) != presentation:
            raise ValueError('snapshot, ledger, or presentation inputs changed before attestation; retry after edits finish')
        os.replace(temporary, destination)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
    print(f'Structure-audit attestation was not issued: {exc}', file=sys.stderr)
    try:
        saved = quarantine_existing_assertion()
        if saved:
            print(f'Previous assertion moved out of the release path to {saved}.', file=sys.stderr)
            print('A staged copy may remain in the Git index; stage the deletion before committing.',
                  file=sys.stderr)
    except OSError as quarantine_error:
        print(f'WARNING: Could not quarantine the previous assertion: {quarantine_error}. '
              'The CI-consumed assertion may still be present; do not deploy.', file=sys.stderr)
    raise SystemExit(1)

print(f'Wrote sanitized release assertion for {total} audited uses to {destination}.')
