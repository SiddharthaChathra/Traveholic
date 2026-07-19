from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class SensorType(str, Enum):
    TIDE_GAUGE = "tide_gauge"
    WAVE_BUOY = "wave_buoy"
    CAMERA = "camera"
    WEATHER = "weather"


class SensorStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"


class AlertType(str, Enum):
    EROSION_THRESHOLD = "erosion_threshold"
    STORM_SURGE = "storm_surge"
    SENSOR_ANOMALY = "sensor_anomaly"
    PREDICTION_DEVIATION = "prediction_deviation"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class UserRole(str, Enum):
    CITIZEN = "citizen"
    RESEARCHER = "researcher"
    ADMIN = "admin"
    PLANNER = "planner"


class PhotoStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class ModelType(str, Enum):
    SEGMENTATION = "segmentation"
    FORECAST = "forecast"
    RISK = "risk"
    CLASSIFICATION = "classification"


class Framework(str, Enum):
    PYTORCH = "pytorch"
    TENSORFLOW = "tensorflow"
    SKLEARN = "sklearn"
    ONNX = "onnx"


# Base schemas
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# Transect schemas
class TransectBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100)
    geometry_wkt: str = Field(..., description="LineString WKT")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    beach_name: str = Field(..., min_length=1, max_length=100)


class TransectCreate(TransectBase):
    pass


class TransectUpdate(BaseSchema):
    name: Optional[str] = None
    geometry_wkt: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    beach_name: Optional[str] = None


class TransectResponse(TransectBase):
    id: str
    created_at: datetime
    updated_at: datetime


# Shoreline Position schemas
class ShorelinePositionBase(BaseSchema):
    transect_id: str
    date: datetime
    position: float = Field(..., description="Distance from baseline in meters")
    source: str = Field(..., pattern="^(satellite|drone|crowdsource|gnss|fused)$")
    confidence: float = Field(..., ge=0, le=1)
    metadata: Optional[Dict[str, Any]] = None


class ShorelinePositionCreate(ShorelinePositionBase):
    pass


class ShorelinePositionResponse(ShorelinePositionBase):
    id: str
    created_at: datetime


# Sensor schemas
class SensorBase(BaseSchema):
    transect_id: Optional[str] = None
    type: SensorType
    name: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    config: Dict[str, Any] = Field(default_factory=dict)


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseSchema):
    transect_id: Optional[str] = None
    name: Optional[str] = None
    status: Optional[SensorStatus] = None
    config: Optional[Dict[str, Any]] = None


class SensorResponse(SensorBase):
    id: str
    status: SensorStatus
    last_seen: Optional[datetime]
    created_at: datetime


# Sensor Reading schemas
class SensorReadingBase(BaseSchema):
    sensor_id: str
    timestamp: datetime
    value: float
    quality: float = Field(default=1.0, ge=0, le=1)


class SensorReadingCreate(SensorReadingBase):
    pass


class SensorReadingResponse(SensorReadingBase):
    id: str
    created_at: datetime


# Crowdsource Photo schemas
class CrowdsourcePhotoBase(BaseSchema):
    image_url: str
    thumbnail_url: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None
    heading: Optional[float] = Field(None, ge=0, le=360)
    pitch: Optional[float] = Field(None, ge=-90, le=90)
    taken_at: datetime


class CrowdsourcePhotoCreate(CrowdsourcePhotoBase):
    pass


class CrowdsourcePhotoUpdate(BaseSchema):
    status: Optional[PhotoStatus] = None
    validation_notes: Optional[str] = None
    shoreline_geojson: Optional[Dict[str, Any]] = None


class CrowdsourcePhotoResponse(CrowdsourcePhotoBase):
    id: str
    user_id: str
    status: PhotoStatus
    shoreline_geojson: Optional[Dict[str, Any]] = None
    validation_notes: Optional[str] = None
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    uploaded_at: datetime


# User schemas
class UserBase(BaseSchema):
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.CITIZEN
    organization: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseSchema):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    organization: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime


# Erosion Prediction schemas
class ErosionPredictionBase(BaseSchema):
    transect_id: str
    prediction_date: datetime
    horizon_days: int = Field(..., gt=0)
    predicted_position: float
    lower_bound: float
    upper_bound: float
    model_version: str
    confidence: float = Field(..., ge=0, le=1)
    features: Dict[str, Any] = Field(default_factory=dict)


class ErosionPredictionCreate(ErosionPredictionBase):
    pass


class ErosionPredictionResponse(ErosionPredictionBase):
    id: str
    created_at: datetime


# Risk Score schemas
class RiskScoreBase(BaseSchema):
    transect_id: str
    date: datetime
    erosion_risk: float = Field(..., ge=0, le=1)
    population_exposure: float
    infra_exposure: float
    economic_value: float
    composite_score: float
    rank: int
    factors: Dict[str, Any] = Field(default_factory=dict)


class RiskScoreCreate(RiskScoreBase):
    pass


class RiskScoreResponse(RiskScoreBase):
    id: str
    created_at: datetime


# Alert schemas
class AlertBase(BaseSchema):
    transect_id: str
    user_id: Optional[str] = None
    type: AlertType
    severity: AlertSeverity
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseSchema):
    acknowledged: Optional[bool] = None
    acknowledged_by: Optional[str] = None


class AlertResponse(AlertBase):
    id: str
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime


# Microplastic Sample schemas
class MicroplasticSampleBase(BaseSchema):
    transect_id: str
    date: datetime
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    concentration_per_kg: float = Field(..., ge=0)
    polymer_types: Dict[str, int] = Field(default_factory=dict)
    depth_cm: float = Field(..., ge=0)
    erosion_rate: Optional[float] = None
    correlation: Optional[float] = None
    notes: Optional[str] = None


class MicroplasticSampleCreate(MicroplasticSampleBase):
    pass


class MicroplasticSampleResponse(MicroplasticSampleBase):
    id: str
    created_at: datetime


# Model Artifact schemas
class ModelArtifactBase(BaseSchema):
    name: str
    version: str
    type: ModelType
    framework: Framework
    model_path: str
    metrics: Dict[str, Any] = Field(default_factory=dict)
    training_data: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = False


class ModelArtifactCreate(ModelArtifactBase):
    pass


class ModelArtifactUpdate(BaseSchema):
    metrics: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    deployed_at: Optional[datetime] = None


class ModelArtifactResponse(ModelArtifactBase):
    id: str
    deployed_at: Optional[datetime] = None
    created_at: datetime


# Query/Filter schemas
class PaginationParams(BaseSchema):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class TransectFilter(BaseSchema):
    beach_name: Optional[str] = None
    bbox: Optional[List[float]] = None  # [min_lon, min_lat, max_lon, max_lat]


class ShorelineFilter(BaseSchema):
    transect_id: Optional[str] = None
    source: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SensorFilter(BaseSchema):
    transect_id: Optional[str] = None
    type: Optional[SensorType] = None
    status: Optional[SensorStatus] = None


class AlertFilter(BaseSchema):
    transect_id: Optional[str] = None
    type: Optional[AlertType] = None
    severity: Optional[AlertSeverity] = None
    acknowledged: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# Dashboard/Analytics schemas
class DashboardStats(BaseSchema):
    total_transects: int
    active_sensors: int
    total_photos: int
    pending_photos: int
    active_alerts: int
    critical_alerts: int
    avg_erosion_rate: float


class TransectSummary(BaseSchema):
    transect: TransectResponse
    latest_shoreline: Optional[ShorelinePositionResponse] = None
    latest_prediction: Optional[ErosionPredictionResponse] = None
    latest_risk: Optional[RiskScoreResponse] = None
    active_alerts: int
    sensors: List[SensorResponse] = Field(default_factory=list)


class MapLayerResponse(BaseSchema):
    type: str  # "geojson", "heatmap", "markers"
    data: Dict[str, Any]
    style: Dict[str, Any]


class XAIExplanation(BaseSchema):
    transect_id: str
    behavior_class: int  # 0: stable, 1: seasonal, 2: erosive, 3: accretive
    class_name: str
    confidence: float
    description: str
    key_features: Dict[str, float]
    shap_values: Optional[Dict[str, float]] = None
    natural_language: str


class ForecastResponse(BaseSchema):
    transect_id: str
    forecast_date: datetime
    horizons: Dict[int, Dict[str, float]]  # horizon_days -> {position, lower, upper, confidence}
    model_version: str
    monsoon_adjusted: bool


class RiskHeatmapResponse(BaseSchema):
    transect_id: str
    risk_score: float
    rank: int
    factors: Dict[str, float]
    geometry_wkt: str


# WebSocket message schemas
class WSMessageType(str, Enum):
    SENSOR_READING = "sensor_reading"
    ALERT = "alert"
    PREDICTION = "prediction"
    SHORELINE_UPDATE = "shoreline_update"
    PHOTO_UPLOAD = "photo_upload"
    HEARTBEAT = "heartbeat"


class WSMessage(BaseSchema):
    type: WSMessageType
    payload: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TransectDetail(TransectResponse):
    latest_shoreline: Optional[ShorelinePositionResponse] = None
    latest_risk: Optional[RiskScoreResponse] = None
    active_sensors: List[SensorResponse] = Field(default_factory=list)