from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Coastal Erosion Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./ceip.db"
    DATABASE_ECHO: bool = False

    # Satellite Data
    PLANETARY_COMPUTER_API_KEY: Optional[str] = None
    SENTINEL2_COLLECTION: str = "sentinel-2-l2a"
    LANDSAT_COLLECTION: str = "landsat-c2-l2"
    STAC_API_URL: str = "https://planetarycomputer.microsoft.com/api/stac/v1"

    # Mangalore Coast Bounds
    MANGALORE_BBOX: List[float] = [74.7, 12.7, 75.0, 13.1]
    MANGALORE_CENTER: List[float] = [74.85, 12.9]

    # Time Configuration
    DEFAULT_LOOKBACK_DAYS: int = 365
    MAX_LOOKBACK_DAYS: int = 3650
    MONSOON_MONTHS: List[int] = [6, 7, 8, 9]

    # Sensor Simulation
    SIMULATION_ENABLED: bool = True
    SENSOR_READING_INTERVAL_SECONDS: int = 300
    TIDE_GAUGE_NOISE_CM: float = 1.0
    WAVE_BUOY_NOISE_M: float = 0.05
    CAMERA_SHORELINE_NOISE_M: float = 0.5

    # ML Models
    MODEL_DIR: str = "./models"
    TL_SHORENET_WEIGHTS: str = "tl_shorenet_mangalore.pth"
    MONSOON_LSTM_WEIGHTS: str = "monsoon_lstm.pth"
    RISK_INDEX_WEIGHTS: str = "risk_index.pkl"

    # Model Inference
    INFERENCE_DEVICE: str = "cpu"
    BATCH_SIZE: int = 4
    CONFIDENCE_THRESHOLD: float = 0.5

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()