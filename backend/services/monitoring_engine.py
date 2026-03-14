import asyncio
from sqlalchemy.orm import Session
from database import SessionLocal
from models.website_model import Website
from models.api_model import APIEndpoint
from services.api_discovery_engine import APIDiscoveryEngine
from services.defense_engine import DefenseEngine
from services.api_classifier import APIClassifier
from utils.logger import logger
from datetime import datetime, timezone

# In-memory storage for alerts
recent_alerts = []


class MonitoringEngine:
    @staticmethod
    async def monitor_scanned_websites():
        """Monitoring cycle: detect new APIs and auto-classify them."""
        logger.info("Starting monitoring cycle...")
        db: Session = SessionLocal()
        try:
            websites = db.query(Website).all()
            for website in websites:
                logger.info(f"Monitoring: {website.url}")
                # 1. Discover APIs again
                discovered_apis = await APIDiscoveryEngine.run_discovery(website.url)
                
                # 2. Get existing endpoints
                existing_apis = db.query(APIEndpoint).filter(
                    APIEndpoint.website_id == website.id
                ).all()
                existing_endpoints = {api.endpoint for api in existing_apis}
                all_endpoints = [api["endpoint"] for api in discovered_apis]
                
                # 3. Compare and add new ones
                for api_data in discovered_apis:
                    endpoint = api_data["endpoint"]
                    if endpoint not in existing_endpoints:
                        # Classify the new API
                        classification = APIClassifier.classify(
                            endpoint, api_data["is_documented"], all_endpoints
                        )
                        
                        logger.warning(f"NEW API FOUND: {endpoint} on {website.url} → {classification}")
                        
                        alert = {
                            "type": "NEW_API",
                            "website": website.url,
                            "endpoint": endpoint,
                            "classification": classification,
                            "message": f"New {classification} detected: {endpoint} on {website.url}",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        recent_alerts.append(alert)
                        
                        new_api_record = APIEndpoint(
                            website_id=website.id,
                            endpoint=endpoint,
                            method=api_data["method"],
                            classification=classification,
                            is_documented=api_data["is_documented"],
                            status="ACTIVE",
                        )
                        db.add(new_api_record)
                
                db.commit()
                        
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
        finally:
            db.close()
            logger.info("Monitoring cycle completed.")

    @staticmethod
    async def auto_defense_pipeline():
        """
        Automated defense pipeline:
        Scan all websites → auto-block zombie/risky APIs → generate alerts.
        """
        logger.info("🛡️ Starting auto-defense pipeline...")
        db: Session = SessionLocal()
        try:
            websites = db.query(Website).all()
            total_blocked = 0
            total_quarantined = 0

            for website in websites:
                result = DefenseEngine.auto_remediate(db, website.id)
                if "error" not in result:
                    blocked = result["blocked"]
                    quarantined = result["quarantined"]
                    total_blocked += blocked
                    total_quarantined += quarantined

                    if blocked > 0 or quarantined > 0:
                        alert = {
                            "type": "AUTO_DEFENSE",
                            "website": website.url,
                            "message": f"Auto-defense: {blocked} blocked, {quarantined} quarantined on {website.url}",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        recent_alerts.append(alert)
                        logger.warning(
                            f"🛡️ Auto-defense on {website.url}: "
                            f"{blocked} blocked, {quarantined} quarantined"
                        )

            logger.info(
                f"🛡️ Auto-defense pipeline complete: "
                f"{total_blocked} blocked, {total_quarantined} quarantined across all websites"
            )

        except Exception as e:
            logger.error(f"Error in auto-defense pipeline: {e}")
        finally:
            db.close()
