import fs from 'node:fs/promises';
import path from 'node:path';
import { SNAPSHOT_IMPORT_LOCK } from './importer.mjs';

// Use the importer's cooperative lock only for the final canonical build
// check and swap. Arbitrary direct writes do not participate in this lock.
export async function acquireSnapshotBuildGuard(snapshotDirectory) {
  const parent = await fs.realpath(path.dirname(path.resolve(snapshotDirectory)));
  const lockPath = path.join(parent, SNAPSHOT_IMPORT_LOCK);
  const lock = await fs.open(lockPath, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('Another snapshot operation holds the import lock; wait for it to finish');
    throw error;
  });
  let identity;
  try {
    identity = await lock.stat();
  } catch (error) {
    await lock.close().catch(() => {});
    // Without identity, do not risk removing another operation's lock.
    console.warn(`Snapshot guard could not identify its lock; inspect ${lockPath} before removal.`);
    throw error;
  }
  return {
    lockPath,
    async release() {
      let failure;
      try { await lock.close(); } catch (error) { failure = error; }
      try {
        const current = await fs.lstat(lockPath);
        if (current.dev === identity.dev && current.ino === identity.ino) await fs.unlink(lockPath);
        else failure ||= new Error('Snapshot guard lock was replaced');
      } catch (error) {
        if (error.code !== 'ENOENT') failure ||= error;
      }
      if (failure) throw failure;
    }
  };
}
