import aiohttp
import asyncio
from typing import List, Dict
from services.crawler_service import CrawlerService, BROWSER_HEADERS
from services.js_api_extractor import JSApiExtractor
from services.swagger_parser import SwaggerParser
from utils.logger import logger

class APIDiscoveryEngine:
    # Extended list of common API patterns to probe
    COMMON_PATTERNS = [
        # Standard API health/info
        "/api/v1/health", "/api/v2/users", "/api/health", "/api/status",
        "/health", "/healthcheck", "/status", "/ping", "/info", "/version",
        
        # Admin / internal
        "/internal/metrics", "/v1/admin", "/admin", "/admin/api",
        "/internal/status", "/internal/health", "/_internal",
        
        # Auth endpoints
        "/api/v1/auth", "/api/v1/login", "/auth/login", "/auth/token",
        "/oauth/token", "/api/auth/session",
        
        # Common REST resources
        "/api/v1/accounts", "/api/v1/users", "/api/v1/profile",
        "/api/v1/transactions", "/api/v1/payments",
        "/api/v2/accounts", "/api/v2/users",
        
        # Banking specific
        "/api/v1/balance", "/api/v1/statement", "/api/v1/transfer",
        "/api/v1/beneficiary", "/api/v1/cards", "/api/v1/loans",
        "/api/fund-transfer", "/api/bill-payment", "/api/upi",
        "/api/neft", "/api/rtgs", "/api/imps",
        "/api/kyc", "/api/otp", "/api/mini-statement",
        
        # Legacy / deprecated / zombie candidates
        "/api/v0/users", "/api/v0/auth", "/api/v0/data",
        "/api/old/login", "/api/legacy/transfer",
        "/api/test", "/api/debug", "/api/dev",
        "/v0/api", "/v1/api", "/v2/api",
        
        # GraphQL
        "/graphql", "/api/graphql",
        
        # Config / docs leak
        "/swagger.json", "/openapi.json", "/api-docs",
        "/.env", "/config.json", "/api/config",
        "/robots.txt", "/sitemap.xml",
        
        # WebSocket
        "/ws", "/socket.io", "/api/ws",
    ]

    @staticmethod
    async def _test_endpoint(session: aiohttp.ClientSession, base_url: str, endpoint: str) -> str:
        url = f"{base_url.rstrip('/')}{endpoint}"
        methods = ["GET", "POST", "OPTIONS"]
        for method in methods:
            try:
                async with session.request(method, url, timeout=aiohttp.ClientTimeout(total=5), ssl=False) as response:
                    # Anything other than 404/405 usually indicates endpoint exists
                    if response.status not in [404, 405, 502, 503, 504]:
                        return method
            except Exception:
                pass
        return ""

    @staticmethod
    async def run_discovery(base_url: str) -> List[Dict]:
        # Pre-flight check: Ensure base URL is reachable
        try:
            async with aiohttp.ClientSession(headers=BROWSER_HEADERS) as session:
                async with session.get(base_url, timeout=aiohttp.ClientTimeout(total=5), ssl=False) as response:
                    pass # We only care that the connection succeeded
        except Exception as e:
            raise Exception(f"Base URL unreachable: {str(e)}")
            
        apis = []
        
        # 1. Documented APIs (Swagger/OpenAPI)
        documented_apis = await SwaggerParser.discover_documented_apis(base_url)
        apis.extend(documented_apis)
        
        # 2. Crawl and Extract from HTML/JS
        extracted_endpoints = set()
        try:
            crawler = CrawlerService(base_url, max_depth=3)
            pages = await crawler.start_crawl()
            extracted_endpoints = set(JSApiExtractor.extract_from_pages(pages))
        except Exception as e:
            logger.warning(f"Error during HTML crawling for {base_url}: {e}")
            # Proceed even if HTML parsing fails, we still have Swagger & Common Patterns
        
        
        doc_endpoints = set(api["endpoint"] for api in documented_apis)
        
        connector = aiohttp.TCPConnector(limit=15, ssl=False)
        async with aiohttp.ClientSession(headers=BROWSER_HEADERS, connector=connector) as session:
            # Active test extracted endpoints to find supported method
            for ep in extracted_endpoints:
                if ep not in doc_endpoints:
                    method = await APIDiscoveryEngine._test_endpoint(session, base_url, ep)
                    apis.append({
                        "endpoint": ep,
                        "method": method if method else "GET",
                        "is_documented": False
                    })
                    
            # 3. Probe common/hidden/shadow endpoints
            tasks = []
            for ep in APIDiscoveryEngine.COMMON_PATTERNS:
                if ep not in doc_endpoints and ep not in extracted_endpoints:
                    tasks.append(APIDiscoveryEngine._probe_endpoint(session, base_url, ep))
            
            results = await asyncio.gather(*tasks)
            for result in results:
                if result:
                    apis.append(result)
                
        logger.info(f"Discovery complete for {base_url}: {len(apis)} APIs found")
        return apis

    @staticmethod
    async def _probe_endpoint(session, base_url, ep):
        """Probe a single endpoint and return its data if it exists."""
        method = await APIDiscoveryEngine._test_endpoint(session, base_url, ep)
        if method:
            return {
                "endpoint": ep,
                "method": method,
                "is_documented": False
            }
        return None
