from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class WebsiteCreate(BaseModel):
    url: HttpUrl

class WebsiteResponse(BaseModel):
    id: int
    url: str
    created_at: datetime
    last_scan_at: Optional[datetime] = None

    class Config:
        orm_mode = True
