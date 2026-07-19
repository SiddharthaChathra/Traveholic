# Dashboard API Routes
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_

from app.api.deps import get_db
from app.models import (
    Transect, ShorelinePosition, Sensor, SensorReading,
    CrowdsourcePhoto, Alert, RiskScore, ErosionPrediction,
    SensorType, SensorStatus, PhotoStatus, AlertSeverity, AlertType
)

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get overview statistics for dashboard."""
    
    # Total transects
    total_transects = await db.scalar(select(func.count(Transect.id)))
    
    # Active sensors
    active_sensors = await db.scalar(
        select(func.count(Sensor.id)).where(Sensor.status == SensorStatus.ACTIVE)
    )
    
    # Total crowdsourced photos
    total_photos = await db.scalar(select(func.count(CrowdsourcePhoto.id)))
    pending_photos = await db.scalar(
        select(func.count(CrowdsourcePhoto.id)).where(CrowdsourcePhoto.status == PhotoStatus.PENDING)
    )
    
    # Active alerts
    active_alerts = await db.scalar(
        select(func.count(Alert.id)).where(Alert.acknowledged == False)
    )
    critical_alerts = await db.scalar(
        select(func.count(Alert.id)).where(
            and_(Alert.acknowledged == False, Alert.severity == AlertSeverity.CRITICAL)
        )
    )
    
    # Average erosion rate (last year)
    from app.models import ShorelinePosition
    one_year_ago = datetime.utcnow() - timedelta(days=365)
    recent_shorelines = await db.execute(
        select(ShorelinePosition)
        .where(ShorelinePosition.date >= one_year_ago)
        .order_by(ShorelinePosition.transect_id, ShorelinePosition.date)
    )
    shorelines = recent_shorelines.scalars().all()
    
    # Calculate average erosion rate
    erosion_rates = []
    by_transect = {}
    for s in shorelines:
        if s.transect_id not in by_transect:
            by_transect[s.transect_id] = []
        by_transect[s.transect_id].append(s)
    
    for tid, series in by_transect.items():
        if len(series) >= 2:
            series.sort(key=lambda x: x.date)
            first = series[0]
            last = series[-1]
            days = (last.date - first.date).days
            if days > 0:
                rate = (last.position - first.position) / days * 365  # m/yr
                erosion_rates.append(rate)
    
    avg_erosion_rate = sum(erosion_rates) / len(erosion_rates) if erosion_rates else 0.0
    
    return {
        "total_transects": total_transects,
        "active_sensors": active_sensors,
        "total_photos": total_photos,
        "pending_photos": pending_photos,
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "avg_erosion_rate_m_yr": round(avg_erosion_rate, 2),
    }


@router.get("/dashboard/transects-summary")
async def get_transects_summary(db: AsyncSession = Depends(get_db)):
    """Get summary for all transects."""
    from app.models import Transect
    
    query = select(Transect).order_by(Transect.beach_name, Transect.name)
    result = await db.execute(query)
    transects = result.scalars().all()
    
    summaries = []
    for t in transects:
        # Latest shoreline
        latest_shoreline = await db.scalar(
            select(ShorelinePosition)
            .where(ShorelinePosition.transect_id == t.id)
            .order_by(desc(ShorelinePosition.date))
            .limit(1)
        )
        
        # Latest risk
        latest_risk = await db.scalar(
            select(RiskScore)
            .where(RiskScore.transect_id == t.id)
            .order_by(desc(RiskScore.date))
            .limit(1)
        )
        
        # Active alerts count
        alert_count = await db.scalar(
            select(func.count(Alert.id))
            .where(and_(Alert.transect_id == t.id, Alert.acknowledged == False))
        )
        
        # Active sensors
        sensors = await db.execute(
            select(Sensor).where(
                and_(Sensor.transect_id == t.id, Sensor.status == SensorStatus.ACTIVE)
            )
        )
        active_sensors = sensors.scalars().all()
        
        summaries.append({
            "transect": {
                "id": t.id,
                "name": t.name,
                "beach_name": t.beach_name,
                "latitude": t.latitude,
                "longitude": t.longitude,
            },
            "latest_shoreline": {
                "date": latest_shoreline.date.isoformat() if latest_shoreline else None,
                "position": latest_shoreline.position if latest_shoreline else None,
                "source": latest_shoreline.source if latest_shoreline else None,
            } if latest_shoreline else None,
            "latest_risk": {
                "composite_score": latest_risk.composite_score,
                "category": "high" if latest_risk.composite_score > 0.7 else "moderate" if latest_risk.composite_score > 0.4 else "low",
                "rank": latest_risk.rank,
            } if latest_risk else None,
            "active_alerts": alert_count,
            "sensors": len(active_sensors),
        })
    
    return summaries


@router.get("/dashboard/map/layers")
async def get_map_layers(
    layer: str = Query("all", regex="^(transects|shorelines|risk|sensors|alerts|all)$"),
    db: AsyncSession = Depends(get_db),
):
    """Get GeoJSON layers for map display."""
    
    layers = {}
    
    if layer in ["transects", "all"]:
        # Transects as lines
        query = select(Transect).where(Transect.geometry_wkt.is_not(None))
        result = await db.execute(query)
        transects = result.scalars().all()
        
        features = []
        for t in transects:
            features.append({
                "type": "Feature",
                "geometry": eval(t.geometry_wkt) if t.geometry_wkt.startswith("{") 
                           else {"type": "LineString", "coordinates": [[t.longitude, t.latitude], [t.longitude + 0.002, t.latitude - 0.002]]},
                "properties": {
                    "id": t.id,
                    "name": t.name,
                    "beach_name": t.beach_name,
                    "baseline_distance_m": t.baseline_distance_m,
                }
            })
        
        layers["transects"] = {
            "type": "geojson",
            "data": {"type": "FeatureCollection", "features": features},
            "style": {"color": "#3b82f6", "weight": 3, "opacity": 0.8},
        }
    
    if layer in ["sensors", "all"]:
        # Sensors as points
        query = select(Sensor).where(Sensor.status == SensorStatus.ACTIVE)
        result = await db.execute(query)
        sensors = result.scalars().all()
        
        features = []
        for s in sensors:
            color = {
                "tide_gauge": "#06b6d4",
                "wave_buoy": "#0ea5e9",
                "camera": "#22c55e",
                "weather": "#f59e0b",
            }.get(s.type.value, "#6366f1")
            
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [s.longitude, s.latitude]},
                "properties": {
                    "id": s.id,
                    "name": s.name,
                    "type": s.type.value,
                    "status": s.status.value,
                }
            })
        
        layers["sensors"] = {
            "type": "geojson",
            "data": {"type": "FeatureCollection", "features": features},
            "style": {"radius": 8, "color": "white", "fillColor": color, "fillOpacity": 0.8},
        }
    
    if layer in ["alerts", "all"]:
        # Active alerts as points
        query = select(Alert).where(Alert.acknowledged == False)
        result = await db.execute(query)
        alerts = result.scalars().all()
        
        # Get transect locations
        features = []
        for a in alerts:
            t = await db.get(Transect, a.transect_id)
            if t:
                severity_color = {
                    AlertSeverity.INFO: "#3b82f6",
                    AlertSeverity.WARNING: "#f59e0b",
                    AlertSeverity.CRITICAL: "#ef4444",
                }.get(a.severity, "#6366f1")
                
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [t.longitude, t.latitude]},
                    "properties": {
                        "id": a.id,
                        "type": a.type.value,
                        "severity": a.severity.value,
                        "message": a.message,
                        "created_at": a.created_at.isoformat(),
                    }
                })
        
        layers["alerts"] = {
            "type": "geojson",
            "data": {"type": "FeatureCollection", "features": features},
            "style": {"radius": 10, "color": "white", "fillColor": severity_color},
        }
    
    if layer in ["risk", "all"]:
        # Risk heatmap as points with color by score
        query = select(RiskScore).order_by(RiskScore.date.desc())
        result = await db.execute(query)
        risks = result.scalars().all()
        
        # Get latest per transect
        latest_risks = {}
        for r in risks:
            if r.transect_id not in latest_risks:
                latest_risks[r.transect_id] = r
        
        features = []
        for r in latest_risks.values():
            t = await db.get(Transect, r.transect_id)
            if t:
                # Color by risk category
                score = r.composite_score
                if score >= 0.7:
                    color = "#ef4444"
                elif score >= 0.4:
                    color = "#f59e0b"
                else:
                    color = "#22c55e"
                
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [t.longitude, t.latitude]},
                    "properties": {
                        "transect_id": r.transect_id,
                        "score": score,
                        "category": "critical" if score >= 0.7 else "high" if score >= 0.55 else "moderate" if score >= 0.4 else "low",
                        "rank": r.rank,
                    }
                })
        
        layers["risk"] = {
            "type": "geojson",
            "data": {"type": "FeatureCollection", "features": features},
            "style": {"radius": 12, "color": "white", "fillColor": color, "fillOpacity": 0.7},
        }
    
    return layers


@router.get("/dashboard/charts/erosion-rates")
async def get_erosion_rates_chart(
    transect_id: Optional[str] = None,
    days: int = 365,
    db: AsyncSession = Depends(get_db),
):
    """Get erosion rates for charting."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    query = select(ShorelinePosition).where(ShorelinePosition.date >= cutoff)
    if transect_id:
        query = query.where(ShorelinePosition.transect_id == transect_id)
    query = query.order_by(ShorelinePosition.transect_id, ShorelinePosition.date)
    
    result = await db.execute(query)
    positions = result.scalars().all()
    
    # Group by transect
    by_transect = {}
    for p in positions:
        if p.transect_id not in by_transect:
            by_transect[p.transect_id] = []
        by_transect[p.transect_id].append({
            "date": p.date.isoformat(),
            "position": p.position,
            "source": p.source,
        })
    
    return by_transect


@router.get("/dashboard/charts/risk-trends")
async def get_risk_trends(
    transect_id: Optional[str] = None,
    days: int = 365,
    db: AsyncSession = Depends(get_db),
):
    """Get risk score trends."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    query = select(RiskScore).where(RiskScore.date >= cutoff)
    if transect_id:
        query = query.where(RiskScore.transect_id == transect_id)
    query = query.order_by(RiskScore.transect_id, RiskScore.date)
    
    result = await db.execute(query)
    risks = result.scalars().all()
    
    by_transect = {}
    for r in risks:
        if r.transect_id not in by_transect:
            by_transect[r.transect_id] = []
        by_transect[r.transect_id].append({
            "date": r.date.isoformat(),
            "composite_score": r.composite_score,
            "erosion_risk": r.erosion_risk,
            "population_exposure": r.population_exposure,
        })
    
    return by_transect


@router.get("/dashboard/recent-activity")
async def get_recent_activity(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Get recent activity across all sources."""
    activities = []
    
    # Recent shoreline measurements
    shorelines = await db.execute(
        select(ShorelinePosition)
        .order_by(desc(ShorelinePosition.created_at))
        .limit(limit)
    )
    for s in shorelines.scalars().all():
        t = await db.get(Transect, s.transect_id)
        activities.append({
            "type": "shoreline",
            "timestamp": s.created_at.isoformat(),
            "transect": t.name if t else "Unknown",
            "beach": t.beach_name if t else "",
            "description": f"Shoreline measured at {s.position:.1f}m ({s.source})",
            "source": s.source,
        })
    
    # Recent photos
    photos = await db.execute(
        select(CrowdsourcePhoto)
        .order_by(desc(CrowdsourcePhoto.uploaded_at))
        .limit(limit)
    )
    for p in photos.scalars().all():
        activities.append({
            "type": "photo",
            "timestamp": p.uploaded_at.isoformat(),
            "transect": "Nearby",
            "description": f"Crowdsourced photo uploaded ({p.status.value})",
            "status": p.status.value,
        })
    
    # Recent alerts
    alerts = await db.execute(
        select(Alert)
        .order_by(desc(Alert.created_at))
        .limit(limit)
    )
    for a in alerts.scalars().all():
        t = await db.get(Transect, a.transect_id)
        activities.append({
            "type": "alert",
            "timestamp": a.created_at.isoformat(),
            "transect": t.name if t else "Unknown",
            "description": f"{a.severity.value.upper()}: {a.message[:100]}",
            "severity": a.severity.value,
            "acknowledged": a.acknowledged,
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return activities[:limit]