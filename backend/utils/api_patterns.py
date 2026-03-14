import re

API_PATTERNS = [
    # Standard API paths
    re.compile(r'[\'"](\\/api\\/[a-zA-Z0-9_\\-\\/\\.]+)[\'"]'),
    re.compile(r'[\'"](\\/v[0-9]+\\/[a-zA-Z0-9_\\-\\/\\.]+)[\'"]'),
    re.compile(r'[\'"](\\/auth\\/[a-zA-Z0-9_\\-\\/]+)[\'"]'),

    # Common JavaScript HTTP calls
    re.compile(r'fetch\([\'"]([^\'"]+)[\'"]'),
    re.compile(r'axios\.(?:get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]'),
    re.compile(r'\.(?:get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]'),
    re.compile(r'XMLHttpRequest.*open\([\'"][A-Z]+[\'"],\s*[\'"]([^\'"]+)[\'"]'),

    # URL pattern assignments  
    re.compile(r'(?:url|endpoint|baseUrl|apiUrl|apiBase|API_URL|BASE_URL|api_url)\s*[:=]\s*[\'"]([^\'"]+)[\'"]'),

    # REST-style resource paths
    re.compile(r'[\'"](\\/(?:users|accounts|payments|transactions|transfer|cards|loans|auth|login|register|admin|dashboard|service|gateway|internal|webhook|callback|notification)\\/[a-zA-Z0-9_\\-\\/]*)[\'"]'),

    # Banking / fintech specific patterns
    re.compile(r'[\'"](\\/(?:sbi|neft|rtgs|imps|upi|fund|demat|mutual|insurance|kyc|otp|beneficiary|statement|balance|enquiry|mini)[a-zA-Z0-9_\\-\\/]*)[\'"]'),

    # Common hidden/undocumented API paths
    re.compile(r'[\'"](\\/(?:graphql|ws|socket|health|status|ping|info|version|config|settings|debug|test|dev|staging|internal|private|hidden|legacy|deprecated|old|v0)\\/[a-zA-Z0-9_\\-\\/]*)[\'"]'),

    # Ajax/XHR URL patterns
    re.compile(r'(?:ajax|xhr)\s*\(\s*\{[^}]*url\s*:\s*[\'"]([^\'"]+)[\'"]'),

    # Action/href attributes pointing to APIs
    re.compile(r'action=[\'"](\\/[a-zA-Z0-9_\\-\\/]+\\.(?:do|action|json|xml|jsp|aspx|php|cgi))[\'"]'),
]

def extract_apis_from_text(text: str) -> set:
    endpoints = set()
    for pattern in API_PATTERNS:
        matches = pattern.findall(text)
        for match in matches:
            # Filter: must start with / and not be a static asset
            if match.startswith("/"):
                # Exclude known static asset paths
                static_exts = ('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map')
                if not any(match.lower().endswith(ext) for ext in static_exts):
                    endpoints.add(match)
    return endpoints
