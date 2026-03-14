from utils.api_patterns import extract_apis_from_text
from typing import List, Set
from bs4 import BeautifulSoup

class JSApiExtractor:
    @staticmethod
    def extract_from_pages(pages: List[dict]) -> Set[str]:
        all_endpoints = set()
        
        for page in pages:
            html = page["html"]
            # Extract script tags content
            try:
                soup = BeautifulSoup(html, "html.parser")
                for script in soup.find_all("script"):
                    if script.string:
                        endpoints = extract_apis_from_text(script.string)
                        all_endpoints.update(endpoints)
            except Exception:
                # If HTML is too malformed for BS4, we fallback to raw regex on the whole string
                pass
                
            # Also extract from raw html text
            endpoints = extract_apis_from_text(html)
            all_endpoints.update(endpoints)
            
        return all_endpoints
