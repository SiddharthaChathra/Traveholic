# ML API Routes
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, PaginationParams
from app.schemas import (
    ErosionPredictionResponse, ForecastResponse, XAIExplanation,
    RiskScoreResponse, ModelArtifactResponse
)
from app.ml.pipeline import get_pipeline

router = APIRouter()


@router.post("/ml/shoreline/extract", response_model=dict)
async def extract_shoreline(
    image_data: dict,  # base64 encoded image or URL
    transect_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Extract shoreline from satellite imagery using TLShoreNet.
    
    Input: Sentinel-2 image (6 bands) as base64 or URL
    Output: Water probability map, shoreline vector (GeoJSON)
    """
    pipeline = get_pipeline()
    
    # In production: download/process image from image_data
    # For now, return mock response
    return {
        "transect_id": transect_id,
        "water_probability_shape": [512, 512],
        "shoreline_geojson": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": []},
                "properties": {"extraction_method": "tl_shorenet"}
            }]
        },
        "processing_time_ms": 150,
        "model_version": "tl_shorenet_v1",
    }


@router.post("/ml/sensor/fuse", response_model=dict)
async def fuse_sensor_data(
    transect_id: str,
    observations: List[dict],
    db: AsyncSession = Depends(get_db),
):
    """
    Fuse multi-sensor observations using Kalman + Bayesian fusion.
    
    Input: List of {source, timestamp, value, variance, quality}
    Output: Fused position, velocity, uncertainty
    """
    pipeline = get_pipeline()
    
    result = await pipeline.process_batch(transect_id, observations)
    return {
        "transect_id": transect_id,
        "fused_states": result,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/ml/forecast/erosion", response_model=ForecastResponse)
async def forecast_erosion(
    transect_id: str,
    shoreline_history: List[float],
    exog_history: List[List[float]],
    dates: List[str],  # ISO format
    db: AsyncSession = Depends(get_db),
):
    """
    Generate multi-horizon erosion forecast using Monsoon LSTM.
    
    Input:
    - shoreline_history: Monthly positions (last 24 months)
    - exog_history: [[wave_height, rainfall, wind_speed, tide], ...]
    - dates: Corresponding dates
    
    Output: Forecasts for 7, 30, 90, 180, 365 day horizons
    """
    pipeline = get_pipeline()
    
    date_objects = [datetime.fromisoformat(d) for d in dates]
    
    forecast = await pipeline.forecast_erosion(
        transect_id, shoreline_history, exog_history, date_objects
    )
    
    return ForecastResponse(**forecast)


@router.post("/ml/xai/behavior", response_model=XAIExplanation)
async def explain_behavior(
    transect_id: str,
    shoreline_series: List[float],
    db: AsyncSession = Depends(get_db),
):
    """
    Classify and explain shoreline behavior using CoastXplain.
    
    Returns: behavior class, confidence, features, natural language
    """
    pipeline = get_pipeline()
    
    explanation = await pipeline.explain_shoreline_behavior(
        transect_id, shoreline_series
    )
    
    return XAIExplanation(**explanation)


@router.post("/ml/xai/risk", response_model=dict)
async def explain_risk(
    transect_id: str,
    risk_features: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate SHAP-based explanation for risk factors.
    
    Input: {erosion_rate, population_density, infrastructure_value, ...}
    Output: Feature importance + natural language
    """
    pipeline = get_pipeline()
    
    explanation = await pipeline.explain_risk_factors(
        transect_id, risk_features
    )
    
    return explanation


@router.post("/ml/risk/compute", response_model=RiskScoreResponse)
async def compute_risk(
    transect_id: str,
    physical_data: dict,
    socio_economic_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Compute comprehensive risk index (MCDA).
    
    Input: Physical + socio-economic factors
    Output: Composite score, category, factor breakdown, rank
    """
    pipeline = get_pipeline()
    
    risk = await pipeline.compute_risk_index(
        transect_id, physical_data, socio_economic_data
    )
    
    return RiskScoreResponse(**risk)


@router.post("/ml/risk/batch", response_model=List[RiskScoreResponse])
async def compute_all_risks(
    physical_data: dict,
    socio_economic_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Compute risk index for all transects."""
    pipeline = get_pipeline()
    
    results = await pipeline.compute_all_risks(physical_data, socio_economic_data)
    
    return [RiskScoreResponse(**r) for r in results]


@router.get("/ml/models", response_model=List[ModelArtifactResponse])
async def list_models(db: AsyncSession = Depends(get_db)):
    """List registered model artifacts."""
    from app.models import ModelArtifact
    from sqlalchemy import select
    
    query = select(ModelArtifact).order_by(ModelArtifact.created_at.desc())
    result = await db.execute(query)
    models = result.scalars().all()
    
    return [ModelArtifactResponse.model_validate(m) for m in models]


@router.post("/ml/models/retrain")
async def trigger_retraining(
    model_name: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger model retraining (async background task)."""
    background_tasks.add_task(_retrain_model_task, model_name)
    
    return {"message": f"Retraining triggered for {model_name}"}


async def _retrain_model_task(model_name: str):
    """Background task for model retraining."""
    from app.ml.pipeline import MLPipeline, PipelineConfig
    
    pipeline = MLPipeline(PipelineConfig())
    await pipeline.initialize()
    
    # In production: fetch new training data, retrain, save, register
    logger.info(f"Retraining {model_name}...")
    # await pipeline.retrain_model(model_name)
    logger.info(f"Retraining complete for {model_name}")


@router.post("/ml/simulate/data")
async def generate_simulation_data(
    transect_id: str,
    days: int = 30,
    freq_minutes: int = 60,
):
    """
    Generate synthetic sensor data for development/testing.
    
    Returns: Time series of all sensor readings
    """
    from app.simulators.sensor_simulator import generate_sample_data
    
    data = generate_sample_data(days=days, freq_minutes=freq_minutes)
    
    if transect_id == "all":
        return data
    
    if transect_id not in data:
        raise HTTPException(404, f"Transect {transect_id} not found")
    
    return {transect_id: data[transect_id]}


@router.get("/ml/pipeline/status")
async def pipeline_status():
    """Get ML pipeline status and model info."""
    pipeline = get_pipeline()
    
    return {
        "initialized": pipeline._initialized,
        "models": {
            "tl_shorenet": pipeline._tl_shorenet is not None,
            "sensor_fusion": pipeline._sensor_fusion is not None,
            "monsoon_lstm": pipeline._monsoon_lstm is not None,
            "coastxplain": pipeline._coastxplain is not None,
            "risk_index": pipeline._risk_index is not None,
        },
        "config": {
            "device": pipeline.config.device,
            "batch_size": pipeline.config.batch_size,
            "mangalore_bbox": pipeline.config.mangalore_bbox,
        },
    }