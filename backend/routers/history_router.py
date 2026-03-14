from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.scan_history_model import ScanHistory
from models.website_model import Website
from schemas.scan_schema import ScanResponse
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/history", tags=["history"])

def _ensure_utc(dt):
    """Ensure a datetime is UTC-aware so JSON serialization includes timezone info."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Naive datetime from DB — treat as UTC and attach timezone
        return dt.replace(tzinfo=timezone.utc)
    return dt

@router.get("/scans")
def get_all_scans(db: Session = Depends(get_db)):
    scans = db.query(ScanHistory).options(joinedload(ScanHistory.website)).order_by(ScanHistory.scan_date.desc()).all()
    results = []
    for scan in scans:
        results.append({
            "id": scan.id,
            "website_id": scan.website_id,
            "website_url": scan.website.url if scan.website else "Unknown",
            "scan_date": _ensure_utc(scan.scan_date).isoformat() if scan.scan_date else None,
            "total_apis": scan.total_apis,
            "zombie_apis": scan.zombie_apis,
            "shadow_apis": scan.shadow_apis,
            "risk_score": scan.risk_score,
            "status": scan.status,
        })
    return {
        "success": True,
        "data": results,
        "error": None
    }

