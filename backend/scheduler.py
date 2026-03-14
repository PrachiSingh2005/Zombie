from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging
from services.monitoring_engine import MonitoringEngine

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def start_scheduler():
    # Monitoring: detect new APIs every 5 minutes
    scheduler.add_job(MonitoringEngine.monitor_scanned_websites, 'interval', minutes=5)
    
    # Auto-defense: block zombie/risky APIs every 10 minutes
    scheduler.add_job(MonitoringEngine.auto_defense_pipeline, 'interval', minutes=10)
    
    scheduler.start()
    logger.info("APScheduler started. Monitoring + Auto-Defense jobs added.")

def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("APScheduler shutdown.")
