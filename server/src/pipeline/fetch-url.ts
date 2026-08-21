import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { FastifyBaseLogger } from 'fastify';
import { isRefusedAddress } from '../core/ssrf';
import { MAX_SOURCE_BYTES } from '../limits';
import { AcquisitionError } from './acquisition-error';

// AD-11 fetcher: one plain GET per hop with Node's built-in `fetch`, manual redirects,
// every hop re-validated (scheme + resolved host), 15 s per request, 10 MB streamed cap.
// Residual (documented, accepted): DNS rebinding between `lookup` and fetch's own resolve.

const MAX_HOPS = 5;
const REQUEST_TIMEOUT_MS = 15_000;
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/pdf,image/webp,image/png,image/jpeg,*/*;q=0.8',
  'Accept-Language': 'en,es;q=0.8,*;q=0.5',
};

export interface FetchedSource {
  content_type: string; // media type only, lowercased, parameters dropped
  bytes: Buffer;
  final_url: string;
}

const refused = (url: URL, details: Record<string, unknown>) =>
  new AcquisitionError('unreachable_url', 'ssrf_refused', { ssrf_refused: true, host: url.hostname, ...details });

// Scheme + host gate, run before every request. IP literals are checked directly; names
// are resolved with all addresses and refused if any one is in a blocked range.
async function assertAllowedTarget(url: URL): Promise<void> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw refused(url, { scheme: url.protocol });
  const literal = url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname;
  if (isIP(literal)) {
    if (isRefusedAddress(literal)) throw refused(url, { address: literal });
    return;
  }
  let addresses: { address: string }[];
  try {
    addresses = await lookup(literal, { all: true, verbatim: true });
  } catch (err) {
    throw new AcquisitionError('unreachable_url', 'dns lookup failed', { host: literal, err });
  }
  if (addresses.length === 0) throw new AcquisitionError('unreachable_url', 'dns lookup returned nothing', { host: literal });
  const bad = addresses.find((a) => isRefusedAddress(a.address));
  if (bad) throw refused(url, { address: bad.address });
}

async function readCapped(response: Response, url: string): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_SOURCE_BYTES) {
    await response.body?.cancel();
    throw new AcquisitionError('unreachable_url', 'body exceeds size cap', { final_url: url, content_length: declared });
  }
  if (!response.body) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_SOURCE_BYTES) {
      await reader.cancel();
      throw new AcquisitionError('unreachable_url', 'body exceeds size cap', { final_url: url, bytes_read: total });
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function fetchSource(url: string, log: FastifyBaseLogger): Promise<FetchedSource> {
  let current = new URL(url);
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    await assertAllowedTarget(current);
    let response: Response;
    try {
      response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      throw new AcquisitionError('unreachable_url', 'fetch failed', { final_url: current.href, err });
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) {
        throw new AcquisitionError('unreachable_url', 'redirect without location', { final_url: current.href, status: response.status });
      }
      if (hop === MAX_HOPS) {
        throw new AcquisitionError('unreachable_url', 'too many redirects', { final_url: current.href, hops: hop });
      }
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        throw new AcquisitionError('unreachable_url', 'invalid redirect location', { final_url: current.href, location });
      }
      log.debug({ from: current.href, to: next.href, hop: hop + 1 }, 'following redirect');
      current = next;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new AcquisitionError('unreachable_url', 'non-2xx response', { final_url: current.href, status: response.status });
    }
    const bytes = await readCapped(response, current.href);
    const content_type = (response.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
    return { content_type, bytes, final_url: current.href };
  }
  throw new AcquisitionError('unreachable_url', 'too many redirects', { final_url: current.href });
}
