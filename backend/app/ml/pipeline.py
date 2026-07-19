# ML Pipeline Orchestrator
"""
Main ML pipeline that coordinates all models:
- TLShoreNet: Shoreline segmentation
- Sensor Fusion: Multi-source data fusion
- Monsoon LSTM: Seasonal forecasting
- CoastXplain: Explainable AI
- Risk Index: Socio-economic risk
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class PipelineConfig:
    """Configuration for ML pipeline."""
    # Model paths
    tl_shorenet_path: str = "./models/tl_shorenet_mangalore.pth"
    monsoon_lstm_path: str = "./models/monsoon_lstm.pth"
    risk_index_weights: Optional[Dict[str, float]] = None
    
    # Inference settings
    device: str = "cpu"
    batch_size: int = 4
    confidence_threshold: float = 0.5
    
    # Pipeline schedule
    satellite_processing_interval_hours: int = 24
    sensor_fusion_interval_minutes: int = 15
    forecast_interval_hours: int = 6
    risk_update_interval_hours: int = 24
    
    # Mangalore specific
    mangalore_bbox: List[float] = None  # [min_lon, min_lat, max_lon, max_lat]
    monsoon_months: List[int] = None


class MLPipeline:
    """
    Orchestrates all ML models for the coastal erosion platform.
    """
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        
        # Set defaults
        if config.mangalore_bbox is None:
            config.mangalore_bbox = [74.7, 12.7, 75.0, 13.1]
        if config.monsoon_months is None:
            config.monsoon_months = [6, 7, 8, 9]
        
        # Initialize models (lazy loading)
        self._tl_shorenet = None
        self._sensor_fusion = None
        self._monsoon_lstm = None
        self._coastxplain = None
        self._risk_index = None
        
        self._initialized = False
    
    async def initialize(self):
        """Initialize all models."""
        if self._initialized:
            return
        
        logger.info("Initializing ML pipeline...")
        
        # Import here to avoid circular imports
        from app.ml.tl_shorenet import TLShoreNetInference
        from app.services.sensor_fusion import SensorFusionService
        from app.ml.monsoon_lstm import MonsoonForecastService
        from app.ml.coastxplain import XAIService
        from app.ml.risk_index import RiskIndexModel, MCDARiskIndex
        
        try:
            # TLShoreNet
            if self.config.tl_shorenet_path:
                try:
                    self._tl_shorenet = TLShoreNetInference(
                        self.config.tl_shorenet_path,
                        device=self.config.device,
                    )
                    logger.info("TLShoreNet loaded")
                except Exception as e:
                    logger.warning(f"TLShoreNet not loaded: {e}")
            
            # Sensor Fusion
            self._sensor_fusion = SensorFusionService()
            logger.info("Sensor Fusion initialized")
            
            # Monsoon LSTM
            if self.config.monsoon_lstm_path:
                try:
                    self._monsoon_lstm = MonsoonForecastService(
                        self.config.monsoon_lstm_path,
                        device=self.config.device,
                    )
                    logger.info("Monsoon LSTM loaded")
                except Exception as e:
                    logger.warning(f"Monsoon LSTM not loaded: {e}")
            
            # CoastXplain
            self._coastxplain = XAIService()
            logger.info("CoastXplain initialized")
            
            # Risk Index
            risk_mcd = MCDARiskIndex(weights=self.config.risk_index_weights)
            self._risk_index = RiskIndexModel(risk_mcd)
            logger.info("Risk Index initialized")
            
            self._initialized = True
            logger.info("ML pipeline initialization complete")
            
        except Exception as e:
            logger.error(f"ML pipeline initialization failed: {e}")
            raise
    
    # TLShoreNet methods
    async def extract_shoreline_from_satellite(
        self,
        image: "np.ndarray",
        transform: "rasterio.Affine",
        crs: "rasterio.crs.CRS",
    ) -> Dict:
        """Extract shoreline from Sentinel-2 image."""
        if self._tl_shorenet is None:
            raise RuntimeError("TLShoreNet not initialized")
        
        from app.ml.tl_shorenet import extract_shoreline, shoreline_to_geojson
        
        # Run inference
        water_prob = self._tl_shorenet.predict(image)
        
        # Extract shoreline vector
        shoreline_mask = extract_shoreline(
            water_prob,
            threshold=self.config.confidence_threshold,
        )
        
        # Convert to GeoJSON
        geojson = shoreline_to_geojson(shoreline_mask, transform, crs)
        
        return {
            "water_probability": water_prob,
            "shoreline_mask": shoreline_mask,
            "shoreline_geojson": geojson,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    # Sensor Fusion methods
    async def process_sensor_reading(
        self,
        transect_id: str,
        source: str,
        timestamp: datetime,
        value: float,
        variance: float,
        quality: float = 1.0,
    ) -> Dict:
        """Process a single sensor reading through fusion."""
        if self._sensor_fusion is None:
            raise RuntimeError("Sensor Fusion not initialized")
        
        state = self._sensor_fusion.process_observation(
            transect_id, source, timestamp, value, variance, quality
        )
        
        return {
            "transect_id": transect_id,
            "fused_position": state.position,
            "fused_velocity": state.velocity,
            "position_uncertainty": state.position_variance ** 0.5,
            "timestamp": timestamp.isoformat(),
        }
    
    async def fuse_time_series(
        self,
        transect_id: str,
        observations: List[Dict],
    ) -> List[Dict]:
        """Fuse a batch of observations over time."""
        if self._sensor_fusion is None:
            raise RuntimeError("Sensor Fusion not initialized")
        
        from app.services.sensor_fusion import SensorObservation
        
        obs_objects = [
            SensorObservation(
                source=o["source"],
                timestamp=o["timestamp"] if isinstance(o["timestamp"], datetime) 
                          else datetime.fromisoformat(o["timestamp"]),
                value=o["value"],
                variance=o["variance"],
                quality=o.get("quality", 1.0),
            )
            for o in observations
        ]
        
        states = self._sensor_fusion.process_batch(transect_id, obs_objects)
        
        return [
            {
                "timestamp": s.timestamp.isoformat(),
                "position": s.position,
                "velocity": s.velocity,
                "acceleration": s.acceleration,
                "position_uncertainty": s.position_variance ** 0.5,
            }
            for s in states
        ]
    
    # Monsoon LSTM methods
    async def forecast_erosion(
        self,
        transect_id: str,
        shoreline_history: List[float],
        exog_history: List[List[float]],
        dates: List[datetime],
    ) -> Dict:
        """Generate multi-horizon erosion forecast."""
        if self._monsoon_lstm is None:
            raise RuntimeError("Monsoon LSTM not initialized")
        
        import numpy as np
        
        results = self._monsoon_lstm.forecast(
            np.array(shoreline_history),
            np.array(exog_history),
            np.array(dates),
        )
        
        return {
            "transect_id": transect_id,
            "forecast_date": datetime.utcnow().isoformat(),
            "horizons": results,
            "model_version": "monsoon_lstm_v1",
        }
    
    # CoastXplain methods
    async def explain_shoreline_behavior(
        self,
        transect_id: str,
        shoreline_series: List[float],
    ) -> Dict:
        """Get XAI explanation for shoreline behavior."""
        if self._coastxplain is None:
            raise RuntimeError("CoastXplain not initialized")
        
        import numpy as np
        
        # Train if needed (in practice, train on all transects)
        if not self._coastxplain.is_trained:
            # For now, skip training and use heuristic
            logger.warning("CoastXplain not trained, using default explanation")
        
        explanation = self._coastxplain.explain_transect(transect_id, np.array(shoreline_series))
        return explanation
    
    async def explain_risk_factors(
        self,
        transect_id: str,
        risk_features: Dict[str, float],
    ) -> Dict:
        """Get XAI explanation for risk factors."""
        if self._coastxplain is None:
            raise RuntimeError("CoastXplain not initialized")
        
        return self._coastxplain.explain_risk(transect_id, risk_features)
    
    # Risk Index methods
    async def compute_risk_index(
        self,
        transect_id: str,
        physical_data: Dict,
        socio_economic_data: Dict,
    ) -> Dict:
        """Compute comprehensive risk index."""
        if self._risk_index is None:
            raise RuntimeError("Risk Index not initialized")
        
        return self._risk_index.compute_transect_risk(
            transect_id, physical_data, socio_economic_data
        )
    
    async def compute_all_risks(
        self,
        physical_data: Dict[str, Dict],
        socio_economic_data: Dict[str, Dict],
    ) -> List[Dict]:
        """Compute risk for all transects."""
        if self._risk_index is None:
            raise RuntimeError("Risk Index not initialized")
        
        return self._risk_index.compute_all_transects(physical_data, socio_economic_data)
    
    # Pipeline execution methods
    async def run_satellite_processing(self, db) -> Dict:
        """Scheduled task: Process new satellite imagery."""
        logger.info("Running satellite processing...")
        
        # In production:
        # 1. Query STAC for new Sentinel-2 scenes over Mangalore
        # 2. Download and preprocess
        # 3. Run TLShoreNet inference
        # 4. Extract shorelines
        # 5. Store in database
        # 6. Trigger sensor fusion update
        
        return {"status": "completed", "processed_scenes": 0}
    
    async def run_sensor_fusion_update(self, db) -> Dict:
        """Scheduled task: Update sensor fusion for all transects."""
        logger.info("Running sensor fusion update...")
        
        # In production:
        # 1. Fetch latest sensor readings
        # 2. Run fusion for each transect
        # 3. Store fused positions
        # 4. Check for anomalies/alerts
        
        return {"status": "completed", "transects_updated": 0}
    
    async def run_forecast_generation(self, db) -> Dict:
        """Scheduled task: Generate erosion forecasts."""
        logger.info("Running forecast generation...")
        
        # In production:
        # 1. Get historical shoreline + exogenous data
        # 2. Run Monsoon LSTM for each transect
        # 3. Store predictions
        # 4. Check threshold alerts
        
        return {"status": "completed", "forecasts_generated": 0}
    
    async def run_risk_update(self, db) -> Dict:
        """Scheduled task: Update risk index."""
        logger.info("Running risk index update...")
        
        # In production:
        # 1. Fetch latest physical + socio-economic data
        # 2. Compute risk index
        # 3. Identify priority hotspots
        # 4. Generate alerts for critical areas
        
        return {"status": "completed", "transects_assessed": 0}


# Global pipeline instance
_pipeline: Optional[MLPipeline] = None


def get_pipeline() -> MLPipeline:
    """Get global ML pipeline instance."""
    global _pipeline
    if _pipeline is None:
        config = PipelineConfig()
        _pipeline = MLPipeline(config)
    return _pipeline


async def initialize_pipeline(config: Optional[PipelineConfig] = None) -> MLPipeline:
    """Initialize global ML pipeline."""
    global _pipeline
    if config is None:
        config = PipelineConfig()
    _pipeline = MLPipeline(config)
    await _pipeline.initialize()
    return _pipeline