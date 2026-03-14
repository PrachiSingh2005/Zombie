/**
 * Centralized API service for ZombieDefend.
 *
 * All requests go through the `request()` helper which:
 *  1. Retries up to MAX_RETRIES times with exponential back-off if the
 *     backend is temporarily down (network error / 502 / 503 / 504).
 *  2. Throws a clean Error with the FastAPI `detail` message on failures.
 *
 * In development, Vite's proxy rewrites /api/* → http://127.0.0.1:8000/*
 * so no CORS issues ever occur on the frontend side.
 */

const API_BASE   = '/api';
const MAX_RETRIES = 4;          // total attempts = 1 + 4 retries
const BASE_DELAY  = 800;        // ms – doubles each retry (0.8s, 1.6s, 3.2s, 6.4s)

// Errors that indicate the server is momentarily unavailable (reload / cold start)
const RETRYABLE_STATUSES = new Set([0, 502, 503, 504]);

/**
 * Sleep helper.
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core request helper with automatic retry on transient failures.
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      // Success path
      if (res.ok) {
        const body = await res.json();
        // If the backend has already been standardized, extract .data
        if (body && typeof body === 'object' && 'success' in body) {
          if (body.success) return body.data;
          throw new Error(body.error || 'API Error');
        }
        // Fallback for not-yet-standardized endpoints
        return body;
      }

      // Non-retryable HTTP error (e.g. 404, 422, 400)
      if (!RETRYABLE_STATUSES.has(res.status)) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        // Handle standardized error format if present
        if (body && body.error) throw new Error(body.error);
        throw new Error(body.detail || body.message || `HTTP ${res.status}`);
      }

      // Retryable HTTP status — fall through to retry
      lastError = new Error(`Server returned ${res.status}`);

    } catch (err) {
      // Network-level error (fetch() itself threw — backend is down)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        lastError = new Error('Backend temporarily unavailable — retrying…');
      } else if (lastError === undefined) {
        // Non-network error already has clean message — don't swallow it
        throw err;
      }
    }

    // Back-off before next attempt (skip delay on last attempt)
    if (attempt < MAX_RETRIES) {
      await sleep(BASE_DELAY * Math.pow(2, attempt));
    }
  }

  throw lastError ?? new Error('Failed to fetch');
}

/**
 * Ping the backend health endpoint.
 * Resolves `true` when healthy, `false` on timeout.
 * @param {number} timeoutMs
 */
export async function checkBackendHealth(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) return true;
    } catch {
      /* backend not up yet */
    }
    await sleep(1000);
  }
  return false;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export function fetchDashboardOverview() {
  return request('/dashboard/overview');
}

export function fetchDashboardWebsites() {
  return request('/dashboard/websites');
}

// ── Scanner ────────────────────────────────────────────────────────────────
export function postScan(url) {
  return request('/scanner/scan', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// ── History ────────────────────────────────────────────────────────────────
export function fetchScanHistory() {
  return request('/history/scans');
}

export function fetchWebsiteScans(websiteId) {
  return request(`/history/${websiteId}`);
}

// ── Compliance ─────────────────────────────────────────────────────────────
export function postComplianceCheck(apiId) {
  return request('/compliance/check', {
    method: 'POST',
    body: JSON.stringify({ api_id: apiId }),
  });
}

export function postComplianceCheckWebsite(websiteId) {
  return request('/compliance/check', {
    method: 'POST',
    body: JSON.stringify({ website_id: websiteId }),
  });
}

export function fetchAuditableWebsites() {
  return request('/compliance/websites');
}

// ── Monitoring ─────────────────────────────────────────────────────────────
export function fetchMonitoringAlerts() {
  return request('/monitoring/alerts');
}

// ── Active Defense ─────────────────────────────────────────────────────────
export function postAutoRemediate(websiteId) {
  return request('/defense/auto-remediate', {
    method: 'POST',
    body: JSON.stringify({ website_id: websiteId }),
  });
}

export function postBlockApi(apiId, reason) {
  return request(`/defense/block/${apiId}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function postUnblockApi(apiId) {
  return request(`/defense/unblock/${apiId}`, { method: 'POST' });
}

export function fetchBlockedApis() {
  return request('/defense/blocked');
}

export function fetchDefenseStats() {
  return request('/defense/stats');
}
