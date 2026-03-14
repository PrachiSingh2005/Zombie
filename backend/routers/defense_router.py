from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.defense_engine import DefenseEngine
from typing import Optional

router = APIRouter(prefix="/defense", tags=["defense"])


class BlockRequest(BaseModel):
    reason: Optional[str] = None


class RemediateRequest(BaseModel):
    website_id: int


@router.post("/auto-remediate")
def auto_remediate(request: RemediateRequest, db: Session = Depends(get_db)):
    """Auto-scan and block/quarantine all risky APIs for a website."""
    result = DefenseEngine.auto_remediate(db, request.website_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return {
        "success": True,
        "data": result,
        "error": None
    }


@router.post("/block/{api_id}")
def block_api(api_id: int, request: BlockRequest = BlockRequest(), db: Session = Depends(get_db)):
    """Manually block a specific API endpoint."""
    reason = request.reason or "Manually blocked by admin"
    result = DefenseEngine.block_api(db, api_id, reason)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "success": True,
        "data": result,
        "error": None
    }


@router.post("/quarantine/{api_id}")
def quarantine_api(api_id: int, request: BlockRequest = BlockRequest(), db: Session = Depends(get_db)):
    """Quarantine a specific API endpoint for review."""
    reason = request.reason or "Quarantined for review"
    result = DefenseEngine.quarantine_api(db, api_id, reason)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "success": True,
        "data": result,
        "error": None
    }


@router.post("/unblock/{api_id}")
def unblock_api(api_id: int, db: Session = Depends(get_db)):
    """Restore a blocked/quarantined API to active status."""
    result = DefenseEngine.unblock_api(db, api_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "success": True,
        "data": result,
        "error": None
    }


@router.get("/blocked")
def get_blocked_apis(db: Session = Depends(get_db)):
    """List all blocked and quarantined APIs."""
    return {
        "success": True,
        "data": DefenseEngine.get_blocked_apis(db),
        "error": None
    }


@router.get("/stats")
def get_defense_stats(db: Session = Depends(get_db)):
    """Get defense statistics and recent action log."""
    return {
        "success": True,
        "data": DefenseEngine.get_defense_stats(db),
        "error": None
    }
