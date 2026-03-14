from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.api_model import APIEndpoint
from models.website_model import Website
from models.compliance_model import ComplianceCheck
from models.scan_history_model import ScanHistory
from services.compliance_engine import ComplianceEngine
from typing import Optional
import asyncio

router = APIRouter(prefix="/compliance", tags=["compliance"])

class ComplianceRequest(BaseModel):
    api_id: Optional[int] = None
    website_id: Optional[int] = None

@router.post("/check")
async def run_compliance_check(request: ComplianceRequest, db: Session = Depends(get_db)):
    """
    Run compliance audit. Accepts either:
    - api_id: check a single API endpoint
    - website_id: check ALL API endpoints for that website
    """
    
    # --- Single API check ---
    if request.api_id and not request.website_id:
        api = db.query(APIEndpoint).filter(APIEndpoint.id == request.api_id).first()
        if not api:
            raise HTTPException(status_code=404, detail="API not found")
        website = db.query(Website).filter(Website.id == api.website_id).first()
        if not website:
            raise HTTPException(status_code=404, detail="Website not found for this API")

        result = await ComplianceEngine.check_single_api(
            base_url=website.url,
            endpoint=api.endpoint,
            method=api.method or "GET",
            classification=api.classification or "Unknown",
            is_documented=api.is_documented or False,
            risk_score=api.risk_score or 0.0,
        )

        # Save to DB (legacy format)
        checks = result["checks"]
        compliance_record = ComplianceCheck(
            api_id=api.id,
            https_enforced=checks.get("https_enforced", "UNKNOWN"),
            auth_required=checks.get("auth_required", "UNKNOWN"),
            encryption_enabled=checks.get("https_enforced", "UNKNOWN"),
            rate_limit_enabled=checks.get("rate_limiting", "UNKNOWN"),
            no_sensitive_data_exposure=checks.get("data_exposure", "UNKNOWN"),
            overall_status=result["overall_status"],
        )
        db.add(compliance_record)
        db.commit()

        return {
            "success": True,
            "data": {
                "website_url": website.url,
                "api_results": [result],
                "summary": {
                    "total_apis": 1,
                    "pass_count": 1 if result["overall_status"] == "PASS" else 0,
                    "partial_count": 1 if result["overall_status"] == "PARTIAL" else 0,
                    "fail_count": 1 if result["overall_status"] == "FAIL" else 0,
                    "overall_verdict": result["overall_status"],
                }
            },
            "error": None
        }

    # --- Website-level audit ---
    if request.website_id:
        website = None
        
        # Priority 1: Treat the ID as a ScanHistory ID (matches what user sees in "API History" table)
        scan = db.query(ScanHistory).filter(ScanHistory.id == request.website_id).first()
        if scan:
            website = db.query(Website).filter(Website.id == scan.website_id).first()
        
        # Priority 2: Fall back to treating it as a direct Website ID
        if not website:
            website = db.query(Website).filter(Website.id == request.website_id).first()
                
        if not website:
            raise HTTPException(status_code=404, detail="Website or Scan not found")

        
        apis = db.query(APIEndpoint).filter(APIEndpoint.website_id == website.id).all()
        if not apis:
            raise HTTPException(status_code=404, detail="No APIs found for this website. Run a scan first.")

        api_results = []
        for api in apis:
            result = await ComplianceEngine.check_single_api(
                base_url=website.url,
                endpoint=api.endpoint,
                method=api.method or "GET",
                classification=api.classification or "Unknown",
                is_documented=api.is_documented or False,
                risk_score=api.risk_score or 0.0,
            )
            api_results.append(result)

            # Save each check to DB
            checks = result["checks"]
            compliance_record = ComplianceCheck(
                api_id=api.id,
                https_enforced=checks.get("https_enforced", "UNKNOWN"),
                auth_required=checks.get("auth_required", "UNKNOWN"),
                encryption_enabled=checks.get("https_enforced", "UNKNOWN"),
                rate_limit_enabled=checks.get("rate_limiting", "UNKNOWN"),
                no_sensitive_data_exposure=checks.get("data_exposure", "UNKNOWN"),
                overall_status=result["overall_status"],
            )
            db.add(compliance_record)

        db.commit()

        # Calculate summary
        pass_count = sum(1 for r in api_results if r["overall_status"] == "PASS")
        partial_count = sum(1 for r in api_results if r["overall_status"] == "PARTIAL")
        fail_count = sum(1 for r in api_results if r["overall_status"] == "FAIL")

        if fail_count > 0:
            overall = "FAIL"
        elif partial_count > 0:
            overall = "PARTIAL"
        else:
            overall = "PASS"

        return {
            "success": True,
            "data": {
                "website_url": website.url,
                "api_results": api_results,
                "summary": {
                    "total_apis": len(api_results),
                    "pass_count": pass_count,
                    "partial_count": partial_count,
                    "fail_count": fail_count,
                    "overall_verdict": overall,
                }
            },
            "error": None
        }

    raise HTTPException(status_code=400, detail="Provide either api_id or website_id")


@router.get("/websites")
def get_auditable_websites(db: Session = Depends(get_db)):
    """Return websites that have been scanned and have APIs to audit."""
    websites = db.query(Website).all()
    result = []
    for w in websites:
        api_count = db.query(APIEndpoint).filter(APIEndpoint.website_id == w.id).count()
        if api_count > 0:
            result.append({
                "id": w.id,
                "url": w.url,
                "api_count": api_count,
            })
    return {
        "success": True,
        "data": result,
        "error": None
    }
