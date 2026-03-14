from fastapi import APIRouter
from services.monitoring_engine import recent_alerts

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/alerts")
def get_monitoring_alerts():
    return {
        "success": True,
        "data": recent_alerts[-50:],
        "error": None
    }
