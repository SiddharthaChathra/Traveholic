# Sensor API endpoints
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, PaginationParams
from app.models import Sensor, SensorReading, SensorType, SensorStatus
from app.schemas import SensorResponse, SensorReadingResponse

router = APIRouter()


@router.get("/sensors", response_model=List[SensorResponse])
async def list_sensors(
    type: Optional[SensorType] = None,
    status: Optional[SensorStatus] = None,
    transect_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """List all sensors with optional filtering."""
    query = select(Sensor)
    
    if type:
        query = query.where(Sensor.type == type)
    if status:
        query = query.where(Sensor.status == status)
    if transect_id:
        query = query.where(Sensor.transect_id == transect_id)
    
    query = query.order_by(Sensor.name).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    sensors = result.scalars().all()
    
    return [SensorResponse.model_validate(s) for s in sensors]


@router.get("/sensors/{sensor_id}", response_model=SensorResponse)
async def get_sensor(
    sensor_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get sensor details."""
    query = select(Sensor).where(Sensor.id == sensor_id)
    result = await db.execute(query)
    sensor = result.scalar_one_or_none()
    
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    return SensorResponse.model_validate(sensor)


@router.get("/sensors/{sensor_id}/readings", response_model=List[SensorReadingResponse])
async def get_sensor_readings(
    sensor_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
):
    """Get time-series readings for a sensor."""
    query = select(SensorReading).where(SensorReading.sensor_id == sensor_id)
    
    if start_time:
        query = query.where(SensorReading.timestamp >= start_time)
    if end_time:
        query = query.where(SensorReading.timestamp <= end_time)
    
    query = query.order_by(desc(SensorReading.timestamp)).limit(limit)
    
    result = await db.execute(query)
    readings = result.scalars().all()
    
    return [SensorReadingResponse.model_validate(r) for r in reversed(readings)]


@router.get("/sensors/{sensor_id}/latest", response_model=SensorReadingResponse)
async def get_latest_reading(
    sensor_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the most recent reading for a sensor."""
    query = select(SensorReading).where(SensorReading.sensor_id == sensor_id).order_by(
        desc(SensorReading.timestamp)
    ).limit(1)
    
    result = await db.execute(query)
    reading = result.scalar_one_or_none()
    
    if not reading:
        raise HTTPException(status_code=404, detail="No readings found")
    
    return SensorReadingResponse.model_validate(reading)


@router.get("/sensors/stats/summary")
async def get_sensor_summary(db: AsyncSession = Depends(get_db)):
    """Get sensor network summary statistics."""
    # Count by type
    type_counts = {}
    for s_type in SensorType:
        query = select(func.count(Sensor.id)).where(Sensor.type == s_type)
        result = await db.execute(query)
        type_counts[s_type.value] = result.scalar()
    
    # Count by status
    status_counts = {}
    for s_status in SensorStatus:
        query = select(func.count(Sensor.id)).where(Sensor.status == s_status)
        result = await db.execute(query)
        status_counts[s_status.value] = result.scalar()
    
    # Recent activity (last 24 hours)
    cutoff = datetime.utcnow() - timedelta(hours=24)
    query = select(func.count(SensorReading.id)).where(SensorReading.timestamp >= cutoff)
    result = await db.execute(query)
    recent_readings = result.scalar()
    
    return {
        "by_type": type_counts,
        "by_status": status_counts,
        "total_sensors": sum(type_counts.values()),
        "readings_last_24h": recent_readings,
    }