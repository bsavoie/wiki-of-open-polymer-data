import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Keep isolated research artifacts out of the release suite, including on
// platforms whose shell does not expand globs in npm scripts.
const testDirectory = path.resolve('test');
const tests = (await fs.readdir(testDirectory))
  .filter((name) => name.endsWith('.test.mjs'))
  .sort()
  .map((name) => path.join(testDirectory, name));
if (!tests.length) throw new Error('No maintained tests found in test/');
const result = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' });
if (result.error) throw result.error;
if (result.signal) throw new Error(`Test runner terminated by ${result.signal}`);
process.exitCode = result.status ?? 1;
