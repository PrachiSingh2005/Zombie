import aiohttp
from bs4 import BeautifulSoup
from typing import Set, List
import asyncio
from utils.logger import logger

# Realistic browser headers to avoid being blocked by WAFs
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

class CrawlerService:
    def __init__(self, base_url: str, max_depth: int = 3):
        self.base_url = base_url.rstrip("/")
        self.max_depth = max_depth
        self.visited_urls: Set[str] = set()
        self.discovered_pages: List[dict] = []  # List of {"url": url, "html": html}

    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> str:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15), ssl=False) as response:
                if response.status == 200:
                    content_type = response.headers.get("Content-Type", "")
                    if "text/html" in content_type or "application/json" in content_type or "javascript" in content_type:
                        return await response.text()
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
        return ""

    async def crawl(self, url: str, depth: int, session: aiohttp.ClientSession):
        if depth > self.max_depth or url in self.visited_urls:
            return
            
        self.visited_urls.add(url)
        logger.info(f"Crawling depth {depth}: {url}")
        
        html = await self.fetch_page(session, url)
        if not html:
            return
            
        self.discovered_pages.append({"url": url, "html": html})
        
        # Extract links
        try:
            soup = BeautifulSoup(html, "html.parser")
            tasks = []
    
            # Extract <a> tag links
            for a_tag in soup.find_all("a", href=True):
                link = self._resolve_link(a_tag["href"])
                if link and link not in self.visited_urls:
                    tasks.append(self.crawl(link, depth + 1, session))
    
            # Also extract linked JavaScript files for API endpoint mining
            for script_tag in soup.find_all("script", src=True):
                src = script_tag.get("src")
                if src:
                    js_url = self._resolve_link(src)
                    if js_url and js_url not in self.visited_urls:
                        tasks.append(self._fetch_js(js_url, session))
                    
            if tasks:
                await asyncio.gather(*tasks)
        except Exception as e:
            logger.warning(f"Failed to parse HTML from {url}: {e}")
            # Continue crawling other URLs even if this page couldn't be parsed


    def _resolve_link(self, href: str) -> str:
        """Resolve relative/absolute URLs to full URLs within the same domain."""
        if href.startswith("//"):
            return "https:" + href
        if href.startswith(self.base_url):
            return href
        if href.startswith("/"):
            return self.base_url + href
        if href.startswith("http"):
            return ""  # External link, skip
        return ""

    async def _fetch_js(self, url: str, session: aiohttp.ClientSession):
        """Fetch external JS files for API endpoint extraction."""
        if url in self.visited_urls:
            return
        self.visited_urls.add(url)
        logger.info(f"Fetching JS: {url}")
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10), ssl=False) as response:
                if response.status == 200:
                    text = await response.text()
                    self.discovered_pages.append({"url": url, "html": text})
        except Exception as e:
            logger.error(f"Error fetching JS {url}: {e}")

    async def start_crawl(self) -> List[dict]:
        connector = aiohttp.TCPConnector(limit=10, ssl=False)
        async with aiohttp.ClientSession(headers=BROWSER_HEADERS, connector=connector) as session:
            await self.crawl(self.base_url, 0, session)
        return self.discovered_pages
