# Database models using SQLAlchemy 2.0 with async support
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, List
from sqlalchemy import (
    String, Float, DateTime, ForeignKey, Index, JSON, Text, Boolean, Integer, Enum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON


class Base(DeclarativeBase):
    pass


class SensorType(PyEnum):
    TIDE_GAUGE = "tide_gauge"
    WAVE_BUOY = "wave_buoy"
    CAMERA = "camera"
    WEATHER = "weather"


class SensorStatus(PyEnum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"


class PhotoStatus(PyEnum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class UserRole(PyEnum):
    CITIZEN = "citizen"
    RESEARCHER = "researcher"
    ADMIN = "admin"
    PLANNER = "planner"


class AlertType(PyEnum):
    EROSION_THRESHOLD = "erosion_threshold"
    STORM_SURGE = "storm_surge"
    SENSOR_ANOMALY = "sensor_anomaly"
    PREDICTION_DEVIATION = "prediction_deviation"


class AlertSeverity(PyEnum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class ModelType(PyEnum):
    SEGMENTATION = "segmentation"
    FORECAST = "forecast"
    RISK = "risk"
    CLASSIFICATION = "classification"


class Framework(PyEnum):
    PYTORCH = "pytorch"
    TENSORFLOW = "tensorflow"
    SKLEARN = "sklearn"
    ONNX = "onnx"


class Transect(Base):
    __tablename__ = "transects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    # WKT LineString stored as text
    geometry_wkt: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    beach_name: Mapped[str] = mapped_column(String(100), nullable=False)
    baseline_distance_m: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    shorelines: Mapped[List["ShorelinePosition"]] = relationship(
        back_populates="transect", cascade="all, delete-orphan"
    )
    sensors: Mapped[List["Sensor"]] = relationship(
        back_populates="transect", cascade="all, delete-orphan"
    )
    risk_scores: Mapped[List["RiskScore"]] = relationship(
        back_populates="transect", cascade="all, delete-orphan"
    )
    microplastic_samples: Mapped[List["MicroplasticSample"]] = relationship(
        back_populates="transect", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_transects_beach_name", "beach_name"),
        Index("ix_transects_location", "latitude", "longitude"),
    )


class ShorelinePosition(Base):
    __tablename__ = "shoreline_positions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    position_m: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    meta_data: Mapped[Optional[dict]] = mapped_column(SQLiteJSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped["Transect"] = relationship(back_populates="shorelines")

    __table_args__ = (
        Index("ix_shoreline_transect_date", "transect_id", "date"),
        Index("ix_shoreline_source", "source"),
    )


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=True
    )
    type: Mapped[SensorType] = mapped_column(Enum(SensorType), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[SensorStatus] = mapped_column(
        Enum(SensorStatus), default=SensorStatus.ACTIVE
    )
    config: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped[Optional["Transect"]] = relationship(back_populates="sensors")
    readings: Mapped[List["SensorReading"]] = relationship(
        back_populates="sensor", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_sensors_transect", "transect_id"),
        Index("ix_sensors_status", "status"),
    )


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    sensor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sensors.id"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[float] = mapped_column(Float, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sensor: Mapped["Sensor"] = relationship(back_populates="readings")

    __table_args__ = (
        Index("ix_sensor_reading_sensor_time", "sensor_id", "timestamp"),
        Index("ix_sensor_reading_time", "timestamp"),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.CITIZEN
    )
    organization: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    photos: Mapped[List["CrowdsourcePhoto"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    alerts: Mapped[List["Alert"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class CrowdsourcePhoto(Base):
    __tablename__ = "crowdsource_photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    heading: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pitch: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    taken_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[PhotoStatus] = mapped_column(
        Enum(PhotoStatus), default=PhotoStatus.PENDING
    )
    shoreline_geojson: Mapped[Optional[dict]] = mapped_column(SQLiteJSON, nullable=True)
    validation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    validated_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="photos")

    __table_args__ = (
        Index("ix_crowdsource_photo_taken_at", "taken_at"),
        Index("ix_crowdsource_photo_status", "status"),
        Index("ix_crowdsource_photo_location", "latitude", "longitude"),
    )


class ErosionPrediction(Base):
    __tablename__ = "erosion_predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=False
    )
    prediction_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    horizon_days: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_position_m: Mapped[float] = mapped_column(Float, nullable=False)
    lower_bound_m: Mapped[float] = mapped_column(Float, nullable=False)
    upper_bound_m: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    features: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped["Transect"] = relationship()

    __table_args__ = (
        Index("ix_prediction_transect_date", "transect_id", "prediction_date"),
        Index("ix_prediction_horizon", "horizon_days"),
    )


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    erosion_risk: Mapped[float] = mapped_column(Float, nullable=False)
    population_exposure: Mapped[float] = mapped_column(Float, default=0.0)
    infrastructure_exposure: Mapped[float] = mapped_column(Float, default=0.0)
    economic_value: Mapped[float] = mapped_column(Float, default=0.0)
    composite_score: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    factors: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped["Transect"] = relationship(back_populates="risk_scores")

    __table_args__ = (
        Index("ix_risk_score_date", "date"),
        Index("ix_risk_score_composite", "composite_score"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=False
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    type: Mapped[AlertType] = mapped_column(Enum(AlertType), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped["Transect"] = relationship()
    user: Mapped[Optional["User"]] = relationship(back_populates="alerts")

    __table_args__ = (
        Index("ix_alert_transect_created", "transect_id", "created_at"),
        Index("ix_alert_severity_acked", "severity", "acknowledged"),
    )


class MicroplasticSample(Base):
    __tablename__ = "microplastic_samples"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    transect_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("transects.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    concentration_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    polymer_types: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    depth_cm: Mapped[float] = mapped_column(Float, nullable=False)
    erosion_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    correlation: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transect: Mapped["Transect"] = relationship(back_populates="microplastic_samples")

    __table_args__ = (
        Index("ix_microplastic_transect_date", "transect_id", "date"),
    )


class ModelArtifact(Base):
    __tablename__ = "model_artifacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[ModelType] = mapped_column(Enum(ModelType), nullable=False)
    framework: Mapped[Framework] = mapped_column(Enum(Framework), nullable=False)
    model_path: Mapped[str] = mapped_column(String(500), nullable=False)
    metrics: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    training_data: Mapped[dict] = mapped_column(SQLiteJSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    deployed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_model_name_version", "name", "version", unique=True),
        Index("ix_model_active", "is_active"),
    )