from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class APIEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"))
    endpoint = Column(String, index=True)
    method = Column(String) # GET, POST, OPTIONS, etc
    classification = Column(String) # Active API, Zombie API, Shadow API, Deprecated API, Orphaned API
    risk_score = Column(Float, default=0.0)
    is_documented = Column(Boolean, default=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, BLOCKED, QUARANTINED
    blocked_at = Column(DateTime, nullable=True)
    blocked_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    website = relationship("Website", backref="apis")
