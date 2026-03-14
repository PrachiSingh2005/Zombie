from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ScanRequest(BaseModel):
    url: HttpUrl

class ScanResponse(BaseModel):
    id: int
    website_id: int
    scan_date: datetime
    total_apis: int
    zombie_apis: int
    shadow_apis: int
    risk_score: float
    status: str

    class Config:
        orm_mode = True
