from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class ScanHistory(Base):
    __tablename__ = "scan_histories"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"))
    scan_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    total_apis = Column(Integer, default=0)
    zombie_apis = Column(Integer, default=0)
    shadow_apis = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    status = Column(String, default="COMPLETED") # PENDING, COMPLETED, FAILED

    website = relationship("Website", backref="scans")
