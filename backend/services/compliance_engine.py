import aiohttp
from typing import Dict, List
from services.crawler_service import BROWSER_HEADERS
from utils.logger import logger
import re


class ComplianceEngine:
    """Real-time compliance engine that performs actual security analysis on API endpoints."""

    # Sensitive data patterns (PII / secrets)
    SENSITIVE_PATTERNS = [
        re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),        # SSN
        re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'),  # Credit card
        re.compile(r'["\']?password["\']?\s*[:=]\s*["\'][^"\']+["\']', re.IGNORECASE),
        re.compile(r'["\']?api[_-]?key["\']?\s*[:=]\s*["\'][^"\']+["\']', re.IGNORECASE),
        re.compile(r'["\']?secret[_-]?key["\']?\s*[:=]\s*["\'][^"\']+["\']', re.IGNORECASE),
        re.compile(r'["\']?access[_-]?token["\']?\s*[:=]\s*["\'][^"\']+["\']', re.IGNORECASE),
        re.compile(r'["\']?private[_-]?key["\']?\s*[:=]', re.IGNORECASE),
        re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),  # Email
    ]

    # Required security headers
    SECURITY_HEADERS = {
        "strict-transport-security": "HSTS",
        "x-content-type-options": "X-Content-Type-Options",
        "x-frame-options": "X-Frame-Options",
        "content-security-policy": "CSP",
        "x-xss-protection": "X-XSS-Protection",
    }

    @staticmethod
    async def check_single_api(base_url: str, endpoint: str, method: str,
                                classification: str, is_documented: bool,
                                risk_score: float) -> Dict:
        """
        Perform comprehensive compliance checks on a single API endpoint.
        Uses both the stored classification data AND live HTTP probing.
        """
        url = f"{base_url.rstrip('/')}{endpoint}"

        results = {
            "endpoint": endpoint,
            "method": method,
            "classification": classification,
            "checks": {},
            "overall_status": "FAIL",
            "issues": [],
        }

        # ─── Check 1: HTTPS Enforced ───
        if url.startswith("https://"):
            results["checks"]["https_enforced"] = "PASS"
        else:
            results["checks"]["https_enforced"] = "FAIL"
            results["issues"].append("Endpoint is not using HTTPS encryption")

        # ─── Check 2: Classification-Based Checks ───
        # Zombie / Shadow / Orphaned APIs inherently fail certain compliance rules
        if classification in ["Zombie API", "Orphaned API"]:
            results["checks"]["api_lifecycle"] = "FAIL"
            results["issues"].append(f"Endpoint classified as '{classification}' — deprecated or abandoned, no active maintenance")
        elif classification == "Shadow API":
            results["checks"]["api_lifecycle"] = "FAIL"
            results["issues"].append("Endpoint classified as 'Shadow API' — undocumented and potentially unsecured")
        elif classification == "Deprecated API":
            results["checks"]["api_lifecycle"] = "FAIL"
            results["issues"].append("Endpoint classified as 'Deprecated API' — superseded by a newer version")
        else:
            results["checks"]["api_lifecycle"] = "PASS"

        # ─── Check 3: Documentation Status ───
        if is_documented:
            results["checks"]["documentation"] = "PASS"
        else:
            results["checks"]["documentation"] = "FAIL"
            results["issues"].append("Endpoint is not documented in any Swagger/OpenAPI spec")

        # ─── Live HTTP Probing ───
        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(headers=BROWSER_HEADERS, connector=connector) as session:
            try:
                async with session.request(
                    method if method in ["GET", "OPTIONS", "HEAD"] else "GET",
                    url,
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=True,
                    ssl=False
                ) as response:

                    # ─── Check 4: Authentication Required ───
                    if response.status in [401, 403]:
                        results["checks"]["auth_required"] = "PASS"
                    elif response.status == 200:
                        results["checks"]["auth_required"] = "FAIL"
                        results["issues"].append("Endpoint accessible without authentication — returns 200 OK with no credentials")
                    else:
                        results["checks"]["auth_required"] = "WARN"
                        results["issues"].append(f"Endpoint returned status {response.status} — authentication status unclear")

                    # ─── Check 5: Security Headers ───
                    resp_headers = response.headers
                    missing_headers = []
                    for header_key, header_name in ComplianceEngine.SECURITY_HEADERS.items():
                        if header_key not in [h.lower() for h in resp_headers.keys()]:
                            missing_headers.append(header_name)

                    if not missing_headers:
                        results["checks"]["security_headers"] = "PASS"
                    elif len(missing_headers) <= 2:
                        results["checks"]["security_headers"] = "WARN"
                        results["issues"].append(f"Missing security headers: {', '.join(missing_headers)}")
                    else:
                        results["checks"]["security_headers"] = "FAIL"
                        results["issues"].append(f"Missing critical security headers: {', '.join(missing_headers)}")

                    # ─── Check 6: Rate Limiting ───
                    rate_limit_headers = [h for h in resp_headers.keys()
                                         if "ratelimit" in h.lower() or "x-rate" in h.lower()
                                         or "retry-after" in h.lower()]
                    if rate_limit_headers:
                        results["checks"]["rate_limiting"] = "PASS"
                    else:
                        results["checks"]["rate_limiting"] = "FAIL"
                        results["issues"].append("No rate limiting headers detected — endpoint may be vulnerable to DDoS/brute-force")

                    # ─── Check 7: Sensitive Data Exposure ───
                    if response.status == 200:
                        try:
                            body_text = await response.text()
                            exposed_data = []
                            for pattern in ComplianceEngine.SENSITIVE_PATTERNS:
                                if pattern.search(body_text[:10000]):  # Check first 10KB
                                    exposed_data.append(pattern.pattern[:30] + "...")
                            if exposed_data:
                                results["checks"]["data_exposure"] = "FAIL"
                                results["issues"].append("Potential sensitive data exposed in response (PII/credentials detected)")
                            else:
                                results["checks"]["data_exposure"] = "PASS"
                        except Exception:
                            results["checks"]["data_exposure"] = "WARN"
                    else:
                        results["checks"]["data_exposure"] = "PASS"

                    # ─── Check 8: CORS Misconfiguration ───
                    cors_origin = resp_headers.get("Access-Control-Allow-Origin", "")
                    if cors_origin == "*":
                        results["checks"]["cors_policy"] = "FAIL"
                        results["issues"].append("CORS allows any origin (*) — potential cross-origin data theft risk")
                    elif cors_origin:
                        results["checks"]["cors_policy"] = "PASS"
                    else:
                        results["checks"]["cors_policy"] = "PASS"  # No CORS = same-origin only

            except aiohttp.ClientError as e:
                logger.error(f"Compliance check error for {url}: {e}")
                results["checks"]["auth_required"] = "ERROR"
                results["checks"]["security_headers"] = "ERROR"
                results["checks"]["rate_limiting"] = "ERROR"
                results["checks"]["data_exposure"] = "ERROR"
                results["checks"]["cors_policy"] = "ERROR"
                results["issues"].append(f"Could not connect to endpoint: {str(e)[:100]}")
            except Exception as e:
                logger.error(f"Unexpected compliance check error for {url}: {e}")
                results["checks"]["auth_required"] = "ERROR"
                results["checks"]["security_headers"] = "ERROR"
                results["checks"]["rate_limiting"] = "ERROR"
                results["checks"]["data_exposure"] = "ERROR"
                results["checks"]["cors_policy"] = "ERROR"
                results["issues"].append(f"Compliance check error: {str(e)[:100]}")

        # ─── Check 9: Risk Score Assessment ───
        if risk_score > 50:
            results["checks"]["risk_assessment"] = "FAIL"
            results["issues"].append(f"High risk score ({risk_score}) — exceeds acceptable threshold")
        elif risk_score > 20:
            results["checks"]["risk_assessment"] = "WARN"
            results["issues"].append(f"Moderate risk score ({risk_score})")
        else:
            results["checks"]["risk_assessment"] = "PASS"

        # ─── Calculate Overall Status ───
        all_statuses = list(results["checks"].values())
        fail_count = all_statuses.count("FAIL")
        warn_count = all_statuses.count("WARN")
        pass_count = all_statuses.count("PASS")

        if fail_count == 0 and warn_count == 0:
            results["overall_status"] = "PASS"
        elif fail_count == 0 and warn_count > 0:
            results["overall_status"] = "PARTIAL"
        elif fail_count <= 2:
            results["overall_status"] = "PARTIAL"
        else:
            results["overall_status"] = "FAIL"

        return results

    @staticmethod
    async def check_api(base_url: str, endpoint: str) -> Dict[str, str]:
        """Legacy single-API check (backwards compatible)."""
        result = await ComplianceEngine.check_single_api(
            base_url, endpoint, "GET", "Unknown", False, 0.0
        )
        # Convert to legacy format
        checks = result["checks"]
        return {
            "https_enforced": checks.get("https_enforced", "UNKNOWN"),
            "auth_required": checks.get("auth_required", "UNKNOWN"),
            "encryption_enabled": checks.get("https_enforced", "UNKNOWN"),
            "rate_limit_enabled": checks.get("rate_limiting", "UNKNOWN"),
            "no_sensitive_data_exposure": checks.get("data_exposure", "UNKNOWN"),
            "overall_status": result["overall_status"],
        }
