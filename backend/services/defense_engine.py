from sqlalchemy.orm import Session
from models.api_model import APIEndpoint
from models.website_model import Website
from datetime import datetime, timezone
from utils.logger import logger
from typing import List, Dict

# In-memory defense activity log
defense_log: List[Dict] = []


class DefenseEngine:
    """Active defense engine — blocks, quarantines, and auto-remediates risky APIs."""

    # Auto-block criteria
    DANGEROUS_CLASSIFICATIONS = {"Zombie API", "Orphaned API"}
    QUARANTINE_CLASSIFICATIONS = {"Shadow API", "Deprecated API"}
    RISK_THRESHOLD_BLOCK = 70
    RISK_THRESHOLD_QUARANTINE = 40

    @staticmethod
    def block_api(db: Session, api_id: int, reason: str = "Manual block") -> Dict:
        api = db.query(APIEndpoint).filter(APIEndpoint.id == api_id).first()
        if not api:
            return {"error": "API not found"}
        if api.status == "BLOCKED":
            return {"error": "API is already blocked"}

        api.status = "BLOCKED"
        api.blocked_at = datetime.now(timezone.utc)
        api.blocked_reason = reason
        db.commit()

        action = {
            "action": "BLOCKED",
            "api_id": api.id,
            "endpoint": api.endpoint,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        defense_log.append(action)
        logger.warning(f"🛡️ BLOCKED API #{api.id}: {api.endpoint} — {reason}")
        return action

    @staticmethod
    def quarantine_api(db: Session, api_id: int, reason: str = "Manual quarantine") -> Dict:
        api = db.query(APIEndpoint).filter(APIEndpoint.id == api_id).first()
        if not api:
            return {"error": "API not found"}

        api.status = "QUARANTINED"
        api.blocked_at = datetime.now(timezone.utc)
        api.blocked_reason = reason
        db.commit()

        action = {
            "action": "QUARANTINED",
            "api_id": api.id,
            "endpoint": api.endpoint,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        defense_log.append(action)
        logger.warning(f"⚠️ QUARANTINED API #{api.id}: {api.endpoint} — {reason}")
        return action

    @staticmethod
    def unblock_api(db: Session, api_id: int) -> Dict:
        api = db.query(APIEndpoint).filter(APIEndpoint.id == api_id).first()
        if not api:
            return {"error": "API not found"}

        old_status = api.status
        api.status = "ACTIVE"
        api.blocked_at = None
        api.blocked_reason = None
        db.commit()

        action = {
            "action": "UNBLOCKED",
            "api_id": api.id,
            "endpoint": api.endpoint,
            "reason": f"Restored from {old_status}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        defense_log.append(action)
        logger.info(f"✅ UNBLOCKED API #{api.id}: {api.endpoint}")
        return action

    @staticmethod
    def auto_remediate(db: Session, website_id: int) -> Dict:
        """
        Auto-remediate all APIs for a website:
        - Zombie/Orphaned APIs → BLOCKED
        - Shadow/Deprecated APIs → QUARANTINED
        - Risk score > 70 → BLOCKED
        - Risk score > 40 → QUARANTINED
        """
        website = db.query(Website).filter(Website.id == website_id).first()
        if not website:
            return {"error": "Website not found"}

        apis = db.query(APIEndpoint).filter(
            APIEndpoint.website_id == website_id,
            APIEndpoint.status == "ACTIVE"
        ).all()

        blocked_count = 0
        quarantined_count = 0
        actions = []

        for api in apis:
            reason = None
            action_type = None

            # Check classification
            if api.classification in DefenseEngine.DANGEROUS_CLASSIFICATIONS:
                reason = f"Auto-blocked: classified as '{api.classification}'"
                action_type = "BLOCKED"
            elif api.classification in DefenseEngine.QUARANTINE_CLASSIFICATIONS:
                reason = f"Auto-quarantined: classified as '{api.classification}'"
                action_type = "QUARANTINED"

            # Check risk score (override if higher severity)
            if api.risk_score and api.risk_score >= DefenseEngine.RISK_THRESHOLD_BLOCK:
                reason = f"Auto-blocked: risk score {api.risk_score} exceeds threshold ({DefenseEngine.RISK_THRESHOLD_BLOCK})"
                action_type = "BLOCKED"
            elif not action_type and api.risk_score and api.risk_score >= DefenseEngine.RISK_THRESHOLD_QUARANTINE:
                reason = f"Auto-quarantined: risk score {api.risk_score} exceeds threshold ({DefenseEngine.RISK_THRESHOLD_QUARANTINE})"
                action_type = "QUARANTINED"

            if action_type and reason:
                api.status = action_type
                api.blocked_at = datetime.now(timezone.utc)
                api.blocked_reason = reason

                action = {
                    "action": action_type,
                    "api_id": api.id,
                    "endpoint": api.endpoint,
                    "classification": api.classification,
                    "risk_score": api.risk_score,
                    "reason": reason,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                actions.append(action)
                defense_log.append(action)

                if action_type == "BLOCKED":
                    blocked_count += 1
                else:
                    quarantined_count += 1

                logger.warning(f"🛡️ {action_type} API #{api.id}: {api.endpoint} — {reason}")

        db.commit()

        return {
            "website_url": website.url,
            "total_scanned": len(apis),
            "blocked": blocked_count,
            "quarantined": quarantined_count,
            "safe": len(apis) - blocked_count - quarantined_count,
            "actions": actions,
        }

    @staticmethod
    def get_blocked_apis(db: Session) -> List[Dict]:
        apis = db.query(APIEndpoint).filter(
            APIEndpoint.status.in_(["BLOCKED", "QUARANTINED"])
        ).all()

        results = []
        for api in apis:
            website = db.query(Website).filter(Website.id == api.website_id).first()
            results.append({
                "id": api.id,
                "endpoint": api.endpoint,
                "method": api.method,
                "classification": api.classification,
                "risk_score": api.risk_score,
                "status": api.status,
                "blocked_at": api.blocked_at.isoformat() if api.blocked_at else None,
                "blocked_reason": api.blocked_reason,
                "website_url": website.url if website else "Unknown",
                "website_id": api.website_id,
            })
        return results

    @staticmethod
    def get_defense_stats(db: Session) -> Dict:
        total = db.query(APIEndpoint).count()
        active = db.query(APIEndpoint).filter(APIEndpoint.status == "ACTIVE").count()
        blocked = db.query(APIEndpoint).filter(APIEndpoint.status == "BLOCKED").count()
        quarantined = db.query(APIEndpoint).filter(APIEndpoint.status == "QUARANTINED").count()

        return {
            "total_apis": total,
            "active": active,
            "blocked": blocked,
            "quarantined": quarantined,
            "recent_actions": defense_log[-20:],
        }
