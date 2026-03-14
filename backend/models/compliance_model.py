from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(Integer, primary_key=True, index=True)
    api_id = Column(Integer, ForeignKey("api_endpoints.id"))
    https_enforced = Column(String, default="UNKNOWN")  # PASS, FAIL, UNKNOWN
    auth_required = Column(String, default="UNKNOWN")
    encryption_enabled = Column(String, default="UNKNOWN")
    rate_limit_enabled = Column(String, default="UNKNOWN")
    no_sensitive_data_exposure = Column(String, default="UNKNOWN")
    overall_status = Column(String, default="UNKNOWN") # PASS, FAIL, PARTIAL
    check_date = Column(DateTime, default=datetime.datetime.utcnow)

    api = relationship("APIEndpoint", backref="compliance_checks")
