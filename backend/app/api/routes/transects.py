# Transect API endpoints
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, PaginationParams
from app.models import Transect, ShorelinePosition, Sensor, ErosionPrediction, RiskScore
from app.schemas import (
    TransectResponse, TransectDetail, ShorelinePositionResponse,
    SensorResponse, ErosionPredictionResponse, RiskScoreResponse, MapLayerResponse
)

router = APIRouter()


@router.get("/transects", response_model=List[TransectResponse])
async def list_transects(
    beach_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """List all monitoring transects with optional filtering."""
    query = select(Transect)
    if beach_name:
        query = query.where(Transect.beach_name == beach_name)
    query = query.order_by(Transect.beach_name, Transect.name).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    transects = result.scalars().all()
    
    return [
        TransectResponse(
            id=t.id,
            name=t.name,
            geometry_wkt=t.geometry_wkt,
            latitude=t.latitude,
            longitude=t.longitude,
            beach_name=t.beach_name,
            baseline_distance_m=t.baseline_distance_m,
            created_at=t.created_at,
        )
        for t in transects
    ]


@router.get("/transects/{transect_id}", response_model=TransectDetail)
async def get_transect(
    transect_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed transect information with latest data."""
    query = select(Transect).where(Transect.id == transect_id).options(
        selectinload(Transect.sensors),
        selectinload(Transect.shorelines).limit(10),
        selectinload(Transect.risk_scores).limit(1),
    )
    result = await db.execute(query)
    transect = result.scalar_one_or_none()
    
    if not transect:
        raise HTTPException(status_code=404, detail="Transect not found")
    
    # Get latest shoreline
    latest_shoreline = transect.shorelines[0] if transect.shorelines else None
    
    # Get latest risk score
    latest_risk = transect.risk_scores[0] if transect.risk_scores else None
    
    # Get active sensors
    active_sensors = [s for s in transect.sensors if s.status.value == "active"]
    
    return TransectDetail(
        id=transect.id,
        name=transect.name,
        geometry_wkt=transect.geometry_wkt,
        latitude=transect.latitude,
        longitude=transect.longitude,
        beach_name=transect.beach_name,
        baseline_distance_m=transect.baseline_distance_m,
        latest_shoreline=ShorelinePositionResponse.model_validate(latest_shoreline) if latest_shoreline else None,
        latest_risk=RiskScoreResponse.model_validate(latest_risk) if latest_risk else None,
        active_sensors=[SensorResponse.model_validate(s) for s in active_sensors],
        created_at=transect.created_at,
    )


@router.get("/transects/{transect_id}/shorelines", response_model=List[ShorelinePositionResponse])
async def get_shoreline_history(
    transect_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    source: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """Get historical shoreline positions for a transect."""
    query = select(ShorelinePosition).where(ShorelinePosition.transect_id == transect_id)
    
    if start_date:
        query = query.where(ShorelinePosition.date >= start_date)
    if end_date:
        query = query.where(ShorelinePosition.date <= end_date)
    if source:
        query = query.where(ShorelinePosition.source == source)
    
    query = query.order_by(ShorelinePosition.date.desc()).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    shorelines = result.scalars().all()
    
    return [ShorelinePositionResponse.model_validate(s) for s in shorelines]


@router.get("/transects/{transect_id}/predictions", response_model=List[ErosionPredictionResponse])
async def get_predictions(
    transect_id: str,
    horizon_days: Optional[int] = None,
    model_version: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """Get erosion predictions for a transect."""
    query = select(ErosionPrediction).where(ErosionPrediction.transect_id == transect_id)
    
    if horizon_days:
        query = query.where(ErosionPrediction.horizon_days == horizon_days)
    if model_version:
        query = query.where(ErosionPrediction.model_version == model_version)
    
    query = query.order_by(ErosionPrediction.prediction_date.desc()).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    predictions = result.scalars().all()
    
    return [ErosionPredictionResponse.model_validate(p) for p in predictions]


@router.get("/transects/{transect_id}/risk", response_model=RiskScoreResponse)
async def get_risk_score(
    transect_id: str,
    date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get current or historical risk score for a transect."""
    query = select(RiskScore).where(RiskScore.transect_id == transect_id)
    
    if date:
        query = query.where(RiskScore.date <= date).order_by(RiskScore.date.desc())
    else:
        query = query.order_by(RiskScore.date.desc())
    
    query = query.limit(1)
    
    result = await db.execute(query)
    risk = result.scalar_one_or_none()
    
    if not risk:
        raise HTTPException(status_code=404, detail="Risk score not found")
    
    return RiskScoreResponse.model_validate(risk)


@router.get("/beaches", response_model=List[str])
async def list_beaches(db: AsyncSession = Depends(get_db)):
    """List all monitored beaches."""
    query = select(Transect.beach_name).distinct().order_by(Transect.beach_name)
    result = await db.execute(query)
    return [row[0] for row in result.all()]


@router.get("/map/transects", response_model=MapLayerResponse)
async def get_transects_geojson(db: AsyncSession = Depends(get_db)):
    """Get all transects as GeoJSON for map display."""
    query = select(Transect).where(Transect.geometry_wkt.isnot(None))
    result = await db.execute(query)
    transects = result.scalars().all()
    
    features = []
    for t in transects:
        features.append({
            "type": "Feature",
            "geometry": json.loads(t.geometry_wkt) if t.geometry_wkt.startswith("{") else {
                "type": "LineString",
                "coordinates": [
                    [t.longitude, t.latitude],
                    [t.longitude + 0.002, t.latitude - 0.002]
                ]
            },
            "properties": {
                "id": t.id,
                "name": t.name,
                "beach_name": t.beach_name,
                "baseline_distance_m": t.baseline_distance_m,
            }
        })
    
    return MapLayerResponse(
        type="geojson",
        data={"type": "FeatureCollection", "features": features},
        style={
            "color": "#3b82f6",
            "weight": 3,
            "opacity": 0.8,
        }
    )