from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class APIEndpointCreate(BaseModel):
    endpoint: str
    method: str
    classification: str
    risk_score: float
    is_documented: bool

class APIEndpointResponse(BaseModel):
    id: int
    website_id: int
    endpoint: str
    method: str
    classification: str
    risk_score: float
    is_documented: bool
    created_at: datetime
    last_seen_at: datetime

    class Config:
        orm_mode = True
        
class RiskScoreDetails(BaseModel):
    zombie_apis: int = 0
    shadow_apis: int = 0
    missing_authentication: int = 0
    unencrypted_api: int = 0
    missing_rate_limit: int = 0
    data_exposure: int = 0
    total_score: float = 0.0
    risk_level: str = "Low"
