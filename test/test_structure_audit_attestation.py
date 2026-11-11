#!/usr/bin/env python3
"""Exercise the CI attestation gate in disposable clean-checkout fixtures."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

source = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(source / 'scripts'))
from structure_audit_attestation import live_use_count


class AttestationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        scripts = self.root / 'scripts'
        scripts.mkdir()
        for name in ('structure_audit_attestation.py', 'verify-structure-audit-attestation.py',
                     'create-structure-audit-attestation.py'):
            shutil.copyfile(source / 'scripts' / name, scripts / name)
        (scripts / 'build.mjs').write_text('build code')
        (scripts / 'validate-structure-history.py').write_text('# history validator')
        (self.root / 'lib').mkdir()
        (self.root / 'lib' / 'structure-renderer.mjs').write_text('renderer code')
        (self.root / 'site-assets').mkdir()
        (self.root / 'site-assets' / 'article.css').write_text('article styles')
        (self.root / 'package.json').write_text('{}')
        (self.root / 'package-lock.json').write_text('{}')
        (self.root / '.github/workflows').mkdir(parents=True)
        (self.root / '.github/workflows/pages.yml').write_text('node-version: 22')
        (self.root / 'public-data/structure-history/2026-11-10').mkdir(parents=True)
        (self.root / 'public-data/structure-history/2026-11-10/index.html').write_text('history')
        audit = self.root / 'outputs/structure-audit'
        audit.mkdir(parents=True)
        # The real readiness gate is intentionally local/ignored. A synthetic
        # gate exercises this script's pass/fail contract in a clean checkout.
        (audit / 'check-release-readiness.py').write_text(
            "import json, pathlib, sys\n"
            "l=json.loads(pathlib.Path('outputs/structure-audit/ledger.json').read_text())\n"
            "sys.exit(0 if len(l['uses']) == 4 and all(u['state'] == 'accepted' for u in l['uses']) else 1)\n")
        self.snapshot_path = self.root / 'public-data/wop-publication-snapshot-v2/snapshot.json'
        self.snapshot_path.parent.mkdir(parents=True)
        self.attestation = self.root / '.github/structure-audit-attestation.json'
        self.snapshot = {
            'polymers': [{'wopId': 'wop-000001',
                'structuralDepictions': {'items': [{'structureId': 'example'}]},
                'contextualStructures': {'feedstocksAndSynthesis': {'items': [{'structureId': 'example'}]}},
                'synthesisRoutes': [{'routeId': 'example-route', 'inputs': [{'structureId': 'example'}],
                    'products': [{'structureId': 'example'}], 'reagents': [{'name': 'no structure'}]}]}],
            'chemicalStructures': [{'structureId': 'example', 'molfileV3000': 'example mol'}],
        }
        self.raw = json.dumps(self.snapshot).encode()
        self.snapshot_path.write_bytes(self.raw)
        base = {'wopId': 'wop-000001', 'structureId': 'example', 'state': 'accepted',
                'reason': 'Synthetic reviewed occurrence.',
                'definitionSha256': hashlib.sha256(b'example mol').hexdigest(),
                'definitionBaselineSnapshotSha256': 'a' * 64}
        self.uses = [{**base, 'group': 'hero'}, {**base, 'group': 'feedstocksAndSynthesis'},
                     {**base, 'group': 'synthesis-route', 'routeId': 'example-route', 'role': 'inputs', 'index': 0},
                     {**base, 'group': 'synthesis-route', 'routeId': 'example-route', 'role': 'products', 'index': 0}]
        self.write_ledger(self.uses)

    def tearDown(self):
        self.tmp.cleanup()

    def write_ledger(self, uses):
        (self.root / 'outputs/structure-audit/ledger.json').write_text(json.dumps({
            'currentSha256': hashlib.sha256(self.raw).hexdigest(), 'uses': uses}))

    def run_script(self, name):
        return subprocess.run([sys.executable, str(self.root / 'scripts' / name)],
                              cwd=self.root, capture_output=True, text=True)

    def generate(self):
        return self.run_script('create-structure-audit-attestation.py')

    def verify(self):
        return self.run_script('verify-structure-audit-attestation.py')

    def test_incomplete_audit_quarantines_a_prior_valid_assertion(self):
        self.assertEqual(self.generate().returncode, 0)
        old_assertion = self.attestation.read_bytes()
        self.assertEqual(self.verify().returncode, 0)
        self.write_ledger([{**self.uses[0], 'state': 'unresolved'}, *self.uses[1:]])
        result = self.generate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Git index', result.stderr)
        self.assertIn('stage the deletion before committing', result.stderr)
        self.assertFalse(self.attestation.exists())
        self.assertNotEqual(self.verify().returncode, 0)
        saved = list((self.root / 'outputs/structure-audit/quarantined-attestations').glob('*.json'))
        self.assertEqual(len(saved), 1)
        self.assertEqual(saved[0].read_bytes(), old_assertion)

    def test_quarantine_failure_warns_that_old_assertion_may_remain(self):
        self.assertEqual(self.generate().returncode, 0)
        old_assertion = self.attestation.read_bytes()
        self.write_ledger([{**self.uses[0], 'state': 'unresolved'}, *self.uses[1:]])
        (self.root / 'outputs/structure-audit/quarantined-attestations').write_text('not a directory')
        result = self.generate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Could not quarantine', result.stderr)
        self.assertIn('do not deploy', result.stderr)
        self.assertEqual(self.attestation.read_bytes(), old_assertion)

    def test_incomplete_audit_without_prior_assertion_writes_nothing(self):
        self.write_ledger([{**self.uses[0], 'state': 'unresolved'}, *self.uses[1:]])
        self.assertNotEqual(self.generate().returncode, 0)
        self.assertFalse(self.attestation.exists())

    def test_complete_audit_generates_sanitized_verifiable_assertion(self):
        self.assertEqual(self.generate().returncode, 0)
        assertion = json.loads(self.attestation.read_text())
        self.assertEqual(set(assertion), {'schema', 'snapshot_sha256', 'presentation_sha256',
                                          'live_uses', 'accepted_uses', 'review_complete'})
        self.assertEqual(assertion['live_uses'], 4)
        self.assertEqual(assertion['accepted_uses'], 4)
        self.assertNotIn('example', self.attestation.read_text())
        self.assertNotIn('wop-000001', self.attestation.read_text())
        self.assertEqual(self.verify().returncode, 0)

    def test_verifier_fails_closed_for_missing_malformed_stale_and_wrong_counts(self):
        self.assertNotEqual(self.verify().returncode, 0)
        self.assertEqual(self.generate().returncode, 0)
        good = json.loads(self.attestation.read_text())
        cases = ['{', '{"schema":"x","schema":"y"}',
                 json.dumps({**good, 'snapshot_sha256': '0' * 64}),
                 json.dumps({**good, 'live_uses': 5, 'accepted_uses': 5}),
                 json.dumps({**good, 'accepted_uses': 3}),
                 json.dumps({**good, 'review_complete': False}),
                 json.dumps({**good, 'live_uses': True, 'accepted_uses': True}),
                 json.dumps({**good, 'extra': 'not allowed'})]
        for case in cases:
            with self.subTest(case=case):
                self.attestation.write_text(case)
                self.assertNotEqual(self.verify().returncode, 0)
        self.attestation.write_text(json.dumps(good))
        self.snapshot_path.write_bytes(self.raw + b' ')
        self.assertNotEqual(self.verify().returncode, 0)

    def test_missing_ledger_and_inconsistent_inventory_refuse_attestation(self):
        (self.root / 'outputs/structure-audit/ledger.json').unlink()
        self.assertNotEqual(self.generate().returncode, 0)
        self.write_ledger(self.uses[:-1])
        self.assertNotEqual(self.generate().returncode, 0)
        self.assertFalse(self.attestation.exists())

    def test_counts_no_unique_repeat_and_all_structured_route_roles(self):
        polymer = self.snapshot['polymers'][0]
        polymer['structuralDepictions']['items'] = []
        polymer['synthesisRoutes'][0]['reagents'].append({'structureId': 'example'})
        # Empty hero still has one auditable use; the text-only reagent does not.
        self.assertEqual(live_use_count(self.snapshot), 5)

    def test_presentation_changes_and_missing_or_linked_inputs_fail(self):
        self.assertEqual(self.generate().returncode, 0)
        for relative in ('site-assets/article.css', 'lib/structure-renderer.mjs',
                         'scripts/build.mjs', 'scripts/validate-structure-history.py', 'package.json', 'package-lock.json',
                         '.github/workflows/pages.yml', 'public-data/structure-history/2026-11-10/index.html',
                         'scripts/create-structure-audit-attestation.py',
                         'scripts/structure_audit_attestation.py',
                         'scripts/verify-structure-audit-attestation.py'):
            with self.subTest(relative=relative):
                path = self.root / relative
                original = path.read_bytes()
                path.write_bytes(original + b'\n# modified for test\n')
                self.assertNotEqual(self.verify().returncode, 0)
                path.write_bytes(original)
                self.assertEqual(self.verify().returncode, 0)
        added = self.root / 'site-assets' / 'new.css'
        added.write_text('new')
        self.assertNotEqual(self.verify().returncode, 0)
        added.unlink()
        required = self.root / 'package-lock.json'
        original = required.read_bytes()
        required.unlink()
        self.assertNotEqual(self.verify().returncode, 0)
        required.write_bytes(original)
        linked = self.root / 'lib' / 'linked.mjs'
        linked.symlink_to(self.root / 'lib' / 'structure-renderer.mjs')
        self.assertNotEqual(self.verify().returncode, 0)
        linked.unlink()
        linked_dir = self.root / 'site-assets' / 'linked-dir'
        linked_dir.symlink_to(self.root / 'lib', target_is_directory=True)
        self.assertNotEqual(self.verify().returncode, 0)
        linked_dir.unlink()
        self.assertEqual(self.verify().returncode, 0)


if __name__ == '__main__':
    unittest.main()
