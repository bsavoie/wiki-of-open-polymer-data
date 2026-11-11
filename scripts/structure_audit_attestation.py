"""Minimal public-safe structure-audit release assertion helpers.

The assertion records a maintainer's bookkeeping result. It is not a
signature and does not independently verify scientific or visual evidence.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import stat

SCHEMA = 'wop-structure-audit-attestation-v2'
FIELDS = {'schema', 'snapshot_sha256', 'presentation_sha256', 'live_uses', 'accepted_uses', 'review_complete'}


def presentation_digest(root):
    """Hash paths and bytes of all reviewed presentation and build inputs."""
    root = Path(root)
    paths = []
    def raise_walk_error(error):
        raise error
    for directory_name in ('lib', 'site-assets', 'public-data/structure-history/2026-11-10'):
        directory = root / directory_name
        if any((root / Path(*Path(directory_name).parts[:i])).is_symlink()
               for i in range(1, len(Path(directory_name).parts) + 1)) or not directory.is_dir():
            raise ValueError(f'required input directory is missing or a symlink: {directory_name}')
        found = []
        for current, dirs, files in os.walk(directory, followlinks=False, onerror=raise_walk_error):
            for name in dirs:
                path = Path(current) / name
                if path.is_symlink():
                    raise ValueError('symlinks are not allowed in presentation inputs')
            for name in files:
                path = Path(current) / name
                if path.is_symlink() or not path.is_file():
                    raise ValueError('nonregular files are not allowed in presentation inputs')
                found.append(path)
        if not found:
            raise ValueError(f'required input directory is empty: {directory_name}')
        paths.extend(found)
    for relative in ('scripts/build.mjs', 'scripts/validate-structure-history.py', 'package.json', 'package-lock.json',
                     '.github/workflows/pages.yml',
                     'scripts/create-structure-audit-attestation.py',
                     'scripts/structure_audit_attestation.py',
                     'scripts/verify-structure-audit-attestation.py'):
        path = root / relative
        if any((root / Path(*Path(relative).parts[:i])).is_symlink()
               for i in range(1, len(Path(relative).parts) + 1)) or not path.is_file():
            raise ValueError(f'required input is missing, nonregular, or a symlink: {relative}')
        paths.append(path)
    digest = hashlib.sha256(b'wop-presentation-inputs-v1\0')
    for path in sorted(paths, key=lambda p: p.relative_to(root).as_posix()):
        relative = path.relative_to(root).as_posix().encode('utf-8')
        flags = os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0)
        fd = os.open(path, flags)
        with os.fdopen(fd, 'rb') as source:
            if not stat.S_ISREG(os.fstat(source.fileno()).st_mode):
                raise ValueError('nonregular file in presentation inputs')
            content = hashlib.sha256()
            for chunk in iter(lambda: source.read(1024 * 1024), b''):
                content.update(chunk)
            content_hash = content.digest()
        digest.update(len(relative).to_bytes(8, 'big'))
        digest.update(relative)
        digest.update(content_hash)
    return digest.hexdigest()


def parse_attestation(raw):
    def unique_pairs(pairs):
        obj = {}
        for key, value in pairs:
            if key in obj:
                raise ValueError('duplicate attestation field')
            obj[key] = value
        return obj
    return json.loads(raw, object_pairs_hook=unique_pairs)


def live_use_count(snapshot):
    """Count hero, contextual and route occurrences as the local ledger does."""
    polymers = snapshot['polymers']
    if not isinstance(polymers, list) or not polymers:
        raise ValueError('snapshot must contain polymer entries')
    count = 0
    for polymer in polymers:
        items = polymer.get('structuralDepictions', {}).get('items', [])
        count += max(1, len(items))
        for context in polymer.get('contextualStructures', {}).values():
            count += len(context.get('items', []))
        for route in polymer.get('synthesisRoutes', []):
            for role in ('inputs', 'products', 'reagents'):
                count += sum(bool(item.get('structureId')) for item in route.get(role, []))
    return count


def snapshot_facts(raw):
    return hashlib.sha256(raw).hexdigest(), live_use_count(json.loads(raw))


def verify_attestation(snapshot_raw, attestation, root):
    if not isinstance(attestation, dict) or set(attestation) != FIELDS:
        raise ValueError('attestation fields do not match the release schema')
    if attestation['schema'] != SCHEMA or attestation['review_complete'] is not True:
        raise ValueError('attestation is not a completed structure audit')
    digest = attestation['snapshot_sha256']
    if not isinstance(digest, str) or not re.fullmatch(r'[0-9a-f]{64}', digest):
        raise ValueError('attestation snapshot hash is invalid')
    presentation = attestation['presentation_sha256']
    if not isinstance(presentation, str) or not re.fullmatch(r'[0-9a-f]{64}', presentation):
        raise ValueError('attestation presentation hash is invalid')
    total, accepted = attestation['live_uses'], attestation['accepted_uses']
    if type(total) is not int or type(accepted) is not int or total <= 0 or accepted != total:
        raise ValueError('attestation counts do not indicate a complete audit')
    actual_digest, actual_total = snapshot_facts(snapshot_raw)
    if digest != actual_digest or total != actual_total:
        raise ValueError('attestation does not match the current snapshot or live-use count')
    if presentation != presentation_digest(root):
        raise ValueError('attestation does not match current presentation and build inputs')
    return total
