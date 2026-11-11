#!/usr/bin/env python3
"""Fail closed unless the tracked release assertion matches this snapshot."""
from pathlib import Path
import sys

from structure_audit_attestation import parse_attestation, verify_attestation

root = Path(__file__).resolve().parents[1]
snapshot = root / 'public-data/wop-publication-snapshot-v2/snapshot.json'
attestation = root / '.github/structure-audit-attestation.json'

try:
    count = verify_attestation(snapshot.read_bytes(), parse_attestation(attestation.read_text(encoding='utf-8')), root)
except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
    print(f'Structure-audit release attestation failed: {exc}', file=sys.stderr)
    raise SystemExit(1)

print(f'Structure-audit release assertion matches the snapshot and {count} live uses.')
