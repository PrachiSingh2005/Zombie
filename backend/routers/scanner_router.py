from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.scan_schema import ScanRequest, ScanResponse
from models.website_model import Website
from models.api_model import APIEndpoint
from models.scan_history_model import ScanHistory
from services.api_discovery_engine import APIDiscoveryEngine
from services.api_classifier import APIClassifier
from services.risk_scoring_engine import RiskScoringEngine
from datetime import datetime, timezone

router = APIRouter(prefix="/scanner", tags=["scanner"])

@router.post("/scan")
async def run_scan(request: ScanRequest, db: Session = Depends(get_db)):
    url_str = str(request.url)
    
    website = db.query(Website).filter(Website.url == url_str).first()
    if not website:
        website = Website(url=url_str)
        db.add(website)
        db.commit()
        db.refresh(website)
        
    scan_history = ScanHistory(website_id=website.id, status="IN_PROGRESS")
    db.add(scan_history)
    db.commit()
    db.refresh(scan_history)
    
    try:
        discovered_apis = await APIDiscoveryEngine.run_discovery(url_str)
        all_endpoints_str = [api["endpoint"] for api in discovered_apis]
        
        zombie_count = 0
        shadow_count = 0
        
        # --- Clear stale APIs for this website before saving fresh results ---
        # This ensures the DB count always matches what the latest scan found.
        db.query(APIEndpoint).filter(APIEndpoint.website_id == website.id).delete()
        db.commit()
        
        for api_data in discovered_apis:
            classification = APIClassifier.classify(
                api_data["endpoint"], 
                api_data["is_documented"], 
                all_endpoints_str
            )
            api_data["classification"] = classification
            
            if classification == "Zombie API":
                zombie_count += 1
            elif classification == "Shadow API":
                shadow_count += 1
                
            api_record = db.query(APIEndpoint).filter(
                APIEndpoint.website_id == website.id,
                APIEndpoint.endpoint == api_data["endpoint"]
            ).first()
            
            if not api_record:
                api_record = APIEndpoint(
                    website_id=website.id,
                    endpoint=api_data["endpoint"]
                )
                db.add(api_record)
                
            api_record.method = api_data["method"]
            api_record.classification = classification
            api_record.is_documented = api_data["is_documented"]
            api_record.last_seen_at = datetime.now(timezone.utc)
            
        db.commit()
        
        risk_score, risk_level = RiskScoringEngine.calculate_risk(
            zombie_apis=zombie_count,
            shadow_apis=shadow_count,
            missing_authentication=0, 
            unencrypted_api=0,
            missing_rate_limit=0,
            data_exposure=0
        )
        
        scan_history.total_apis = len(discovered_apis)
        scan_history.zombie_apis = zombie_count
        scan_history.shadow_apis = shadow_count
        scan_history.risk_score = risk_score
        scan_history.status = "COMPLETED"
        
        website.last_scan_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(scan_history)
        
        return {
            "success": True,
            "data": {
                "id": scan_history.id,
                "website_id": scan_history.website_id,
                "scan_date": scan_history.scan_date.isoformat() if scan_history.scan_date else None,
                "total_apis": scan_history.total_apis,
                "zombie_apis": scan_history.zombie_apis,
                "shadow_apis": scan_history.shadow_apis,
                "risk_score": scan_history.risk_score,
                "status": scan_history.status
            },
            "error": None
        }
    except Exception as e:
        scan_history.status = f"FAILED: {str(e)}"
        db.commit()
        db.refresh(scan_history)
        return {
            "success": True, # Request succeeded even if scan failed later
            "data": {
                "id": scan_history.id,
                "status": scan_history.status
            },
            "error": None
        }
