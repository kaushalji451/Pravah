import { Agent } from 'undici';
import https from 'node:https';
import crypto from 'node:crypto';

/** Error raised when an external data provider fails. Never crashes the app. */
export class UpstreamError extends Error {
  constructor(service, message, { status } = {}) {
    super(`${service}: ${message}`);
    this.name = 'UpstreamError';
    this.service = service;
    this.status = status;
  }
}

export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
  }
}

function fetchGmda(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const req = https.request(
      parsed,
      {
        method: options.method || 'GET',
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },

        // Allow this legacy GMDA server to connect.
        // Certificate verification remains enabled.
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      },
      (res) => {
        let data = '';

        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage || '',
            text: async () => data,
          });
        });
      },
    );

    req.on('error', reject);

    if (options.signal) {
      const abort = () => {
        req.destroy(new Error('Request aborted'));
      };

      if (options.signal.aborted) {
        abort();
      } else {
        options.signal.addEventListener('abort', abort, { once: true });
      }
    }

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/*
 * GMDA's server uses legacy TLS renegotiation.
 *
 * Modern Node/OpenSSL rejects this by default.
 * SSL_OP_LEGACY_SERVER_CONNECT allows the connection without
 * disabling certificate verification globally.
 */
const gmdaDispatcher =
  process.env.GMDA_ALLOW_LEGACY_TLS === 'true'
    ? new Agent({
        connect: {
          secureOptions: 0x4, // SSL_OP_LEGACY_SERVER_CONNECT
        },
      })
    : undefined;

/**
 * fetch + JSON with a hard timeout and one retry on network/5xx errors.
 * Node 18+ ships a global fetch.
 */
export async function fetchJson(
  url,
  {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 10000,
    service = 'Upstream',
    retries = 1,
  } = {},
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const isGmda = service === 'GMDA';

      const res =
  service === 'GMDA'
    ? await fetchGmda(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      })
    : await fetch(url, {
        method,
        headers: { Accept: 'application/json', ...headers },
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new UpstreamError(
          service,
          `HTTP ${res.status} ${res.statusText}`.trim(),
          { status: res.status },
        );
      }

      const text = await res.text();

      try {
        return JSON.parse(text);
      } catch {
        throw new UpstreamError(
          service,
          'response was not valid JSON',
        );
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        lastError = new UpstreamError(
          service,
          `timed out after ${timeoutMs} ms`,
        );
      } else if (err instanceof UpstreamError) {
        lastError = err;
      } else {
        lastError = new UpstreamError(
          service,
          err.cause?.code || err.message || 'network error',
        );
      }

      // Client errors won't fix themselves on retry.
      if (
        lastError.status &&
        lastError.status < 500 &&
        lastError.status !== 429
      ) {
        break;
      }
    } finally {
      clearTimeout(timer);
    }

    if (attempt < retries) {
      await sleep(400 * (attempt + 1));
    }
  }

  throw lastError;
}

export const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));