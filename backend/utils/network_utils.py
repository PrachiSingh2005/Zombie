import aiohttp
from typing import Optional

async def async_fetch(url: str, session: aiohttp.ClientSession) -> Optional[str]:
    try:
        async with session.get(url, timeout=10) as response:
            if response.status == 200:
                return await response.text()
    except Exception:
        pass
    return None
