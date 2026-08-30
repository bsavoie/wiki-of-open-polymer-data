import { isIP } from 'node:net';

export const SOURCE_TYPES = new Set([
  'nomenclature_standard',
  'open_textbook',
  'courseware',
  'open_journal',
  'public_report',
  'public_dataset',
  'institutional_reference',
  'research_group_notes',
  'expert_blog',
  'manufacturer_technical_document',
  'patent',
  'thesis',
  'preprint'
]);

export const REUSE_STATUSES = new Set([
  'open_licensed',
  'public_domain',
  'publicly_accessible_citation_only'
]);

const SOURCE_KEYS = new Set([
  'sourceId',
  'lineageId',
  'sourceType',
  'citation',
  'doi',
  'url',
  'contentUrl',
  'locator',
  'accessedDate',
  'accessStatus',
  'reuseStatus',
  'permissionBasis',
  'licenseUrl',
  'supports'
]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOI = /^10\.\d{4,9}\/\S+$/i;
const URL_OR_DOI = /\b[a-z][a-z0-9+.-]*:\/\/|\bwww\.|\b(?:[a-z0-9-]+\.)+[a-z]{2,63}(?::\d+)?\/|\b(?:doi\s*:?\s*)?10\.\d{4,9}\//i;
const PRIVATE_OR_LEGACY = [
  /\b(?:rcr|rce|wor)-\d+\b|file:\/\//i,
  /(?:^|[\s"'(<:=])(?:\/(?=[a-z0-9._~-])|~\/(?=[a-z0-9._~-])|\.\.?\/|[a-z]:[\\/]|\\\\)/i,
  /\$\{?(?:CODEX_HOME|HOME|PWD|USERPROFILE)\}?[\\/]/i,
  /(?:^|[\s"'(<:=])(?:workspace|src|lib|tests?|scripts?|config|secrets?|private|internal|node_modules|\.agents|\.codex|\.git|\.ssh)(?:[\\/][a-z0-9._~-]+)+/i,
  /\b(?:[a-z0-9._-]+[\\/])+(?:[a-z0-9._-]+\.(?:cjs|csv|docx?|env|ini|js|json|jsx|md|mjs|pdf|py|rb|sh|toml|ts|tsx|tsv|txt|ya?ml|xlsx?)|\.env)(?:\b|$)/i
];
const SENSITIVE_URL_KEY = /(?:^|[-_])(?:access[-_]?token|api[-_]?key|auth|authorization|client[-_]?secret|credential|password|passwd|secret|signature|token)(?:$|[-_])/i;

function containsPrivateOrLegacy(value) {
  return PRIVATE_OR_LEGACY.some((pattern) => pattern.test(value));
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isNonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function privateAddress(host) {
  if (isIP(host) === 4) {
    const [a, b] = host.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && [0, 168].includes(b)) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && [18, 19, 51].includes(b)) ||
      (a === 203 && b === 0);
  }
  if (isIP(host) === 6) {
    return host === '::' || host === '::1' ||
      /^(?:fc|fd|fe[89ab]|ff|::ffff:|2001:db8:)/i.test(host);
  }
  return false;
}

export function isPublicSourceUrl(value) {
  if (!isNonemptyString(value) || /[\s\\\x00-\x1f\x7f]/.test(value) ||
      /%(?![0-9a-f]{2})/i.test(value) || !/^https:\/\//i.test(value)) return false;
  try {
    const authority = value.split('://')[1].split(/[/?#]/)[0];
    if (authority.includes('@') || authority.includes('%')) return false;
    const url = new URL(value);
    const host = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
    if (isIP(host) === 4 && authority.split(':')[0] !== host) return false;
    if (isIP(host) === 6 && (!/^[23][0-9a-f]{3}:/i.test(host) || /^3fff:/i.test(host))) return false;
    const validDns = host.length <= 253 && host.split('.').length >= 2 &&
      host.split('.').every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part));
    const sensitiveQuery = [...url.searchParams.keys()].some((key) => SENSITIVE_URL_KEY.test(key));
    const sensitiveFragment = /(?:^|[&;])[^=]*(?:access[-_]?token|api[-_]?key|authorization|client[-_]?secret|credential|password|passwd|secret|signature|token)[^=]*=/i.test(url.hash.slice(1));
    return url.protocol === 'https:' && !url.username && !url.password && !sensitiveQuery && !sensitiveFragment && Boolean(host) &&
      (validDns || isIP(host) !== 0) && (!url.port || Number(url.port) >= 1) &&
      !/(?:^|\.)(?:localhost|local|internal|home|lan|invalid|test)$/.test(host) &&
      !privateAddress(host);
  } catch {
    return false;
  }
}

function decodedRepeatedly(value) {
  let decoded = value;
  for (let index = 0; index < 6; index += 1) {
    const before = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      decoded = decoded.replace(/%([0-9a-f]{2})/gi, (_, byte) =>
        String.fromCharCode(Number.parseInt(byte, 16)));
    }
    if (decoded === before) break;
  }
  return decoded;
}

export function validatePublicText(value, label, errors, { allowUrl = false } = {}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validatePublicText(item, `${label}[${index}]`, errors, { allowUrl }));
    return;
  }
  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, child]) =>
      validatePublicText(child, `${label}.${key}`, errors, { allowUrl }));
    return;
  }
  if (typeof value !== 'string') return;
  const decoded = decodedRepeatedly(value);
  if (!allowUrl && containsPrivateOrLegacy(decoded)) {
    errors.push(`${label} contains a private path or legacy reaction identifier`);
  }
  if (!allowUrl && URL_OR_DOI.test(decoded)) {
    errors.push(`${label} contains a DOI or URL outside a typed source URL field`);
  }
}

function realDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateSourceRecord(source, label, errors, allowedSupports) {
  if (!isPlainObject(source)) {
    errors.push(`${label} must be an object`);
    return;
  }
  for (const key of Object.keys(source)) {
    if (!SOURCE_KEYS.has(key)) errors.push(`${label}.${key} is not permitted`);
  }
  for (const key of [
    'sourceId', 'lineageId', 'sourceType', 'citation', 'url', 'locator',
    'accessedDate', 'accessStatus', 'reuseStatus', 'permissionBasis', 'supports'
  ]) {
    if (!Object.hasOwn(source, key)) errors.push(`${label}.${key} is required`);
  }
  for (const key of ['sourceId', 'lineageId']) {
    if (typeof source[key] !== 'string' || !SLUG.test(source[key])) {
      errors.push(`${label}.${key} must be a lowercase slug`);
    }
  }
  for (const key of ['citation', 'locator', 'permissionBasis']) {
    if (!isNonemptyString(source[key])) errors.push(`${label}.${key} must be a non-empty string`);
  }
  const decodedDoi = typeof source.doi === 'string' ? decodedRepeatedly(source.doi) : '';
  if (Object.hasOwn(source, 'doi') &&
      (typeof source.doi !== 'string' || !DOI.test(source.doi) || /[\s\x00-\x1f\x7f]/.test(source.doi) ||
       /\b[a-z][a-z0-9+.-]*:\/\//i.test(decodedDoi) || containsPrivateOrLegacy(decodedDoi.slice(decodedDoi.indexOf('/') + 1)))) {
    errors.push(`${label}.doi must be a bare DOI beginning with 10.`);
  }
  if (!SOURCE_TYPES.has(source.sourceType)) errors.push(`${label}.sourceType is invalid`);
  if (source.accessStatus !== 'anonymous_full_content') {
    errors.push(`${label}.accessStatus must be anonymous_full_content`);
  }
  if (!REUSE_STATUSES.has(source.reuseStatus)) errors.push(`${label}.reuseStatus is invalid`);
  if (!realDate(source.accessedDate)) errors.push(`${label}.accessedDate must be a real YYYY-MM-DD date`);
  for (const key of ['url', 'contentUrl', 'licenseUrl']) {
    if (Object.hasOwn(source, key) && !isPublicSourceUrl(source[key])) {
      errors.push(`${label}.${key} must be a public HTTPS URL without credentials or private hosts`);
    }
  }
  if (source.reuseStatus === 'open_licensed' && !Object.hasOwn(source, 'licenseUrl')) {
    errors.push(`${label}.licenseUrl is required for open_licensed sources`);
  }
  if (!Array.isArray(source.supports) || source.supports.length === 0 ||
      source.supports.some((item) => !allowedSupports.has(item)) ||
      new Set(source.supports).size !== source.supports.length) {
    errors.push(`${label}.supports must contain unique allowed support keys`);
  }
  for (const [key, value] of Object.entries(source)) {
    validatePublicText(value, `${label}.${key}`, errors, {
      allowUrl: ['doi', 'url', 'contentUrl', 'licenseUrl'].includes(key)
    });
  }
}
