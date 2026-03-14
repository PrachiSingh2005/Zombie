import aiohttp
from typing import List, Dict
from utils.logger import logger

# Realistic browser headers
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

class SwaggerParser:
    COMMON_PATHS = [
        "/openapi.json", "/swagger.json", "/api-docs", "/v1/api-docs",
        "/v2/api-docs", "/v3/api-docs", "/api/swagger.json", "/api/openapi.json",
        "/swagger/v1/swagger.json", "/api/v1/openapi.json",
        "/docs/openapi.json", "/.well-known/openapi.json",
    ]

    @staticmethod
    async def discover_documented_apis(base_url: str) -> List[Dict]:
        discovered_apis = []
        base = base_url.rstrip("/")
        
        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(headers=BROWSER_HEADERS, connector=connector) as session:
            for path in SwaggerParser.COMMON_PATHS:
                url = f"{base}{path}"
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as response:
                        if response.status == 200:
                            try:
                                data = await response.json()
                                if "paths" in data:
                                    logger.info(f"Found Swagger docs at {url}")
                                    for endpoint, methods in data["paths"].items():
                                        for method in methods.keys():
                                            if method.lower() in ["get", "post", "put", "delete", "patch"]:
                                                discovered_apis.append({
                                                    "endpoint": endpoint,
                                                    "method": method.upper(),
                                                    "is_documented": True
                                                })
                                    return discovered_apis  # Assume one valid doc is enough
                            except Exception:
                                pass  # Not valid json
                except Exception as e:
                    pass
                    
        return discovered_apis
