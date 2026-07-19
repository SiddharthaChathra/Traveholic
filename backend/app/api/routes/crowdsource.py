# Crowdsourcing API endpoints
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, PaginationParams
from app.models import CrowdsourcePhoto, User, PhotoStatus
from app.schemas import (
    CrowdsourcePhotoResponse, CrowdsourcePhotoCreate, CrowdsourcePhotoUpdate,
    UserResponse, UserCreate
)
from app.services.image_processing import process_crowdsource_image
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()


@router.post("/crowdsource/upload", response_model=CrowdsourcePhotoResponse)
async def upload_photo(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    altitude: Optional[float] = Form(None),
    heading: Optional[float] = Form(None),
    pitch: Optional[float] = Form(None),
    taken_at: Optional[datetime] = Form(None),
    user_email: str = Form(...),
    user_name: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a crowdsourced beach photo."""
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_IMAGE_TYPES}"
        )
    
    # Validate coordinates
    if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    # Get or create user
    query = select(User).where(User.email == user_email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(email=user_email, name=user_name, role="citizen")
        db.add(user)
        await db.flush()
    
    # Save file (in production, upload to S3/R2)
    # For now, store locally with timestamped name
    import uuid
    import os
    from pathlib import Path
    
    upload_dir = Path("uploads/crowdsource")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = upload_dir / filename
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Process image for shoreline extraction
    try:
        processed = await process_crowdsource_image(
            str(file_path),
            latitude, longitude,
            heading, pitch, altitude
        )
        shoreline_geojson = processed.get("shoreline_geojson")
    except Exception as e:
        shoreline_geojson = None
    
    # Create record
    photo = CrowdsourcePhoto(
        user_id=user.id,
        image_url=f"/uploads/crowdsource/{filename}",
        thumbnail_url=f"/uploads/crowdsource/thumb_{filename}",
        latitude=latitude,
        longitude=longitude,
        altitude=altitude,
        heading=heading,
        pitch=pitch,
        taken_at=taken_at or datetime.utcnow(),
        status=PhotoStatus.PENDING,
        shoreline_geojson=shoreline_geojson,
    )
    
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    
    return CrowdsourcePhotoResponse.model_validate(photo)


@router.get("/crowdsource/photos", response_model=List[CrowdsourcePhotoResponse])
async def list_photos(
    status: Optional[PhotoStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
):
    """List crowdsourced photos with filtering."""
    query = select(CrowdsourcePhoto).options(selectinload(CrowdsourcePhoto.user))
    
    if status:
        query = query.where(CrowdsourcePhoto.status == status)
    if start_date:
        query = query.where(CrowdsourcePhoto.taken_at >= start_date)
    if end_date:
        query = query.where(CrowdsourcePhoto.taken_at <= end_date)
    if user_id:
        query = query.where(CrowdsourcePhoto.user_id == user_id)
    
    query = query.order_by(desc(CrowdsourcePhoto.taken_at)).offset(pagination.offset).limit(pagination.limit)
    
    result = await db.execute(query)
    photos = result.scalars().all()
    
    return [CrowdsourcePhotoResponse.model_validate(p) for p in photos]


@router.get("/crowdsource/photos/{photo_id}", response_model=CrowdsourcePhotoResponse)
async def get_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific crowdsourced photo."""
    query = select(CrowdsourcePhoto).where(CrowdsourcePhoto.id == photo_id).options(
        selectinload(CrowdsourcePhoto.user)
    )
    result = await db.execute(query)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return CrowdsourcePhotoResponse.model_validate(photo)


@router.post("/crowdsource/photos/{photo_id}/validate", response_model=CrowdsourcePhotoResponse)
async def validate_photo(
    photo_id: str,
    update: CrowdsourcePhotoUpdate,
    validated_by: str = "researcher",  # In production, get from auth
    db: AsyncSession = Depends(get_db),
):
    """Validate or reject a crowdsourced photo."""
    query = select(CrowdsourcePhoto).where(CrowdsourcePhoto.id == photo_id)
    result = await db.execute(query)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    if update.status:
        photo.status = update.status
        photo.validated_by = validated_by
        photo.validated_at = datetime.utcnow()
    
    if update.validation_notes:
        photo.validation_notes = update.validation_notes
    
    if update.shoreline_geojson:
        photo.shoreline_geojson = update.shoreline_geojson
    
    await db.commit()
    await db.refresh(photo)
    
    return CrowdsourcePhotoResponse.model_validate(photo)


@router.get("/crowdsource/stats")
async def get_crowdsource_stats(db: AsyncSession = Depends(get_db)):
    """Get crowdsourcing statistics."""
    # Total photos
    total = await db.scalar(select(func.count(CrowdsourcePhoto.id)))
    
    # By status
    status_counts = {}
    for status in PhotoStatus:
        count = await db.scalar(
            select(func.count(CrowdsourcePhoto.id)).where(CrowdsourcePhoto.status == status)
        )
        status_counts[status.value] = count
    
    # By user
    user_count = await db.scalar(select(func.count(func.distinct(CrowdsourcePhoto.user_id))))
    
    # Recent activity (last 7 days)
    cutoff = datetime.utcnow() - timedelta(days=7)
    recent = await db.scalar(
        select(func.count(CrowdsourcePhoto.id)).where(CrowdsourcePhoto.uploaded_at >= cutoff)
    )
    
    # Top contributors
    top_contributors = await db.execute(
        select(
            User.id, User.name, User.email,
            func.count(CrowdsourcePhoto.id).label("count")
        )
        .join(CrowdsourcePhoto, User.id == CrowdsourcePhoto.user_id)
        .group_by(User.id, User.name, User.email)
        .order_by(desc("count"))
        .limit(10)
    )
    
    return {
        "total_photos": total,
        "by_status": status_counts,
        "unique_contributors": user_count,
        "photos_last_7_days": recent,
        "top_contributors": [
            {"id": row[0], "name": row[1], "email": row[2], "photos": row[3]}
            for row in top_contributors.all()
        ],
    }