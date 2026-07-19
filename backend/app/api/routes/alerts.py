# Alerts API endpoints
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, PaginationParams
from app.models import Alert, AlertType, AlertSeverity, Transect
from app.schemas import AlertResponse, AlertUpdate

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                self.disconnect(connection)


manager = ConnectionManager()


@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    type: Optional[AlertType] = None,
    severity: Optional[AlertSeverity] = None,
    acknowledged: Optional[bool] = None,
    transect_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """List alerts with filtering."""
    query = select(Alert).options(selectinload(Alert.transect))
    
    if type:
        query = query.where(Alert.type == type)
    if severity:
        query = query.where(Alert.severity == severity)
    if acknowledged is not None:
        query = query.where(Alert.acknowledged == acknowledged)
    if transect_id:
        query = query.where(Alert.transect_id == transect_id)
    if start_date:
        query = query.where(Alert.created_at >= start_date)
    if end_date:
        query = query.where(Alert.created_at <= end_date)
    
    query = query.order_by(desc(Alert.created_at)).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return [AlertResponse.model_validate(a) for a in alerts]


@router.get("/alerts/stats")
async def get_alert_stats(db: AsyncSession = Depends(get_db)):
    """Get alert statistics."""
    # By severity
    severity_counts = {}
    for sev in AlertSeverity:
        count = await db.scalar(
            select(func.count(Alert.id)).where(and_(Alert.severity == sev, Alert.acknowledged == False))
        )
        severity_counts[sev.value] = count
    
    # By type
    type_counts = {}
    for t in AlertType:
        count = await db.scalar(
            select(func.count(Alert.id)).where(and_(Alert.type == t, Alert.acknowledged == False))
        )
        type_counts[t.value] = count
    
    # Recent alerts (24h)
    cutoff = datetime.utcnow() - timedelta(hours=24)
    recent = await db.scalar(
        select(func.count(Alert.id)).where(Alert.created_at >= cutoff)
    )
    
    return {
        "active_by_severity": severity_counts,
        "active_by_type": type_counts,
        "recent_24h": recent,
        "total_unacknowledged": sum(severity_counts.values()),
    }


@router.post("/alerts/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    acknowledged_by: str = "admin",  # In production, get from auth
    db: AsyncSession = Depends(get_db),
):
    """Acknowledge an alert."""
    query = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(query)
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.acknowledged = True
    alert.acknowledged_by = acknowledged_by
    alert.acknowledged_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(alert)
    
    return AlertResponse.model_validate(alert)


@router.websocket("/alerts/stream")
async def alerts_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time alerts."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, send heartbeat
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def broadcast_alert(alert: Alert):
    """Broadcast new alert to all connected clients."""
    await manager.broadcast({
        "type": "new_alert",
        "alert": AlertResponse.model_validate(alert).model_dump()
    })


async def check_erosion_thresholds(db: AsyncSession):
    """Background task to check erosion predictions against thresholds."""
    from app.core.config import get_settings
    settings = get_settings()
    
    # Get latest predictions for all transects
    query = select(Transect).options(selectinload(Transect.risk_scores))
    result = await db.execute(query)
    transects = result.scalars().all()
    
    for transect in transects:
        if transect.risk_scores:
            latest_risk = transect.risk_scores[0]
            
            # Check if erosion risk exceeds threshold
            if latest_risk.erosion_risk > settings.ALERT_EROSION_THRESHOLD_M:
                # Check if similar alert exists recently
                cutoff = datetime.utcnow() - timedelta(hours=settings.ALERT_COOLDOWN_HOURS)
                existing = await db.scalar(
                    select(Alert).where(
                        and_(
                            Alert.transect_id == transect.id,
                            Alert.type == AlertType.EROSION_THRESHOLD,
                            Alert.created_at >= cutoff,
                            Alert.acknowledged == False
                        )
                    )
                )
                
                if not existing:
                    alert = Alert(
                        transect_id=transect.id,
                        type=AlertType.EROSION_THRESHOLD,
                        severity=AlertSeverity.WARNING if latest_risk.erosion_risk < 5 else AlertSeverity.CRITICAL,
                        message=f"Erosion rate at {transect.name} exceeds threshold: {latest_risk.erosion_risk:.1f}m/month",
                        data={
                            "transect_name": transect.name,
                            "beach_name": transect.beach_name,
                            "erosion_rate": latest_risk.erosion_risk,
                            "threshold": settings.ALERT_EROSION_THRESHOLD_M,
                        }
                    )
                    db.add(alert)
                    await db.commit()
                    await broadcast_alert(alert)