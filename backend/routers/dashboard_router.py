from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.website_model import Website
from models.api_model import APIEndpoint
from models.scan_history_model import ScanHistory
from datetime import timezone

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def _ensure_utc(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    total_websites = db.query(Website).count()
    total_scans = db.query(ScanHistory).count()
    total_apis = db.query(APIEndpoint).count()
    zombie_apis = db.query(APIEndpoint).filter(APIEndpoint.classification == "Zombie API").count()
    
    security_risks = db.query(APIEndpoint).filter(APIEndpoint.risk_score > 70).count()
    
    return {
        "success": True,
        "data": {
            "total_websites": total_websites,
            "total_scans": total_scans,
            "total_apis": total_apis,
            "zombie_apis": zombie_apis,
            "security_risks": security_risks
        },
        "error": None
    }

@router.get("/websites")
def get_dashboard_websites(db: Session = Depends(get_db)):
    websites = db.query(Website).all()
    result = []
    for w in websites:
        api_count = db.query(APIEndpoint).filter(APIEndpoint.website_id == w.id).count()
        result.append({
            "id": w.id,
            "url": w.url,
            "last_scan": _ensure_utc(w.last_scan_at).isoformat() if w.last_scan_at else None,
            "total_apis": api_count
        })
    return {
        "success": True,
        "data": result,
        "error": None
    }

