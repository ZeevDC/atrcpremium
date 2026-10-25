/**
 * Shared storage helpers for uploaded learning materials.
 *
 * IMPORTANT: nothing in here touches the disk when this file is imported.
 * Folders are created lazily, the first time they are needed, and any failure
 * is caught. (Creating folders at import time used to crash the whole server
 * whenever /private was missing or read-only.)
 */
import fs from 'node:fs';
import path from 'node:path';

const PRIMARY_MATERIALS_DIR = '/private/materials';
const FALLBACK_MATERIALS_DIR = path.join(process.cwd(), 'private', 'materials');

let resolvedDir: string | null = null;

function tryEnsureWritable(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the folder where uploaded files are stored (and creates it if needed).
 * Prefers /private/materials; falls back to ./private/materials next to the app
 * if /private cannot be used. Never throws.
 */
export function getMaterialsDir(): string {
  if (resolvedDir && fs.existsSync(resolvedDir)) return resolvedDir;

  if (tryEnsureWritable(PRIMARY_MATERIALS_DIR)) {
    resolvedDir = PRIMARY_MATERIALS_DIR;
  } else if (tryEnsureWritable(FALLBACK_MATERIALS_DIR)) {
    console.warn(
      `[storage] ${PRIMARY_MATERIALS_DIR} is not writable — using ${FALLBACK_MATERIALS_DIR}. ` +
        'Files stored here may not survive a redeploy.',
    );
    resolvedDir = FALLBACK_MATERIALS_DIR;
  } else {
    // Last resort: return the primary path so the caller gets a clear error
    // (inside its own try/catch) instead of crashing the server.
    resolvedDir = PRIMARY_MATERIALS_DIR;
  }
  return resolvedDir;
}

/** Absolute path of a stored material file. Blocks "../" path tricks. */
export function materialFilePath(filename: string): string {
  return path.join(getMaterialsDir(), path.basename(filename));
}
