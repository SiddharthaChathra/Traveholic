# Coastal Erosion Intelligence Platform (CEIP)
## Comprehensive Architecture Addressing All 8 Research Gaps

---

## 1. System Overview

**CEIP** is a unified platform that fuses multi-source coastal data (satellite, IoT sensors, crowdsourced smartphones, socio-economic) with AI models to provide real-time erosion monitoring, forecasting, and decision support for the Mangalore coast.

### 8 Research Gaps Addressed

| Gap | Component | Implementation |
|-----|-----------|----------------|
| 1. Low-cost Sensor Fusion | `SensorFusionService` | Kalman filter + Bayesian network fusing Arduino tide gauges, wave buoys, camera feeds |
| 2. Crowdsourced Mapping | `CrowdsourceService` | Mobile-responsive web app + Structure-from-Motion pipeline for smartphone shoreline extraction |
| 3. Monsoon ML Models | `MonsoonForecastModel` | LSTM/GRU with exogenous inputs (rainfall, wave height, wind) for seasonal forecasting |
| 4. Transfer Learning | `TLShoreNet` | Pre-trained U-Net (CoastTrain) fine-tuned on Mangalore Sentinel-2 scenes |
| 5. Explainable AI | `CoastXplainEngine` | Unsupervised shoreline behavior classification + SHAP explanations + natural language summaries |
| 6. Socio-Economic Risk | `RiskIndexModel` | MCDA-weighted index combining erosion susceptibility + population/infrastructure exposure |
| 7. Microplastic Linkage | `MicroplasticAnalyzer` | Correlation engine linking field-sampled microplastic content with erosion anomalies |
| 8. Edge AI Alerts | `EdgeAlertService` | TensorFlow Lite models for on-device (Raspberry Pi/Jetson) real-time erosion detection |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Satellite  │  │   IoT       │  │ Crowdsource │  │  Socio-Econ │       │
│  │  (Sentinel-2│  │  (Arduino   │  │  (Smartphone│  │  (Census,   │       │
│  │  Landsat)   │  │   Tide/Wave)│  │   Photos)   │  │   OSM, INCOIS)     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
└─────────│────────────────│────────────────│────────────────│──────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INGESTION & PREPROCESSING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  STAC Catalog    │  │  MQTT/HTTP       │  │  Image Pipeline  │          │
│  │  (Planetary     │  │  Ingestion       │  │  (EXIF, GPS,     │          │
│  │   Computer)      │  │  (Time-series DB)│  │   SfM, Ortho)    │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
└───────────│─────────────────────│─────────────────────│────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ML PIPELINE (Python/FastAPI)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ TLShoreNet      │  │ SensorFusion    │  │ MonsoonLSTM     │            │
│  │ (U-Net + TL)    │  │ (Kalman + Bayes)│  │ (GRU + Exog)    │            │
│  │ Shoreline Seg.  │  │ Multi-sensor    │  │ Seasonal Forecast│           │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                    │                      │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐            │
│  │ CoastXplain     │  │ RiskIndexModel  │  │ Microplastic    │            │
│  │ (Behavior Clust)│  │ (MCDA + ML)     │  │ Correlation     │            │
│  │ + SHAP + NLG    │  │ Hotspot Maps    │  │ Analysis        │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                    │                      │
│           └────────────────────┼────────────────────┘                      │
│                                ▼                                           │
│                    ┌─────────────────────┐                                 │
│                    │  Unified Prediction │                                 │
│                    │  & Alert Engine     │                                 │
│                    └──────────┬──────────┘                                 │
└───────────────────────────────│────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (FastAPI)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  REST + WebSocket endpoints for: predictions, alerts, maps, crowdsourcing  │
└───────────────────────────────│────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js + React + Leaflet)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Interactive Map (shoreline layers, risk heatmaps, sensor locations)     │
│  • Real-time Alert Dashboard (WebSocket push)                              │
│  • Explainable AI Panel (behavior classes, SHAP, natural language)         │
│  • Community Portal (photo upload, validation, gamification)               │
│  • Admin Console (sensor management, model retraining triggers)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models (SQLite + Prisma)

```prisma
// Core spatial-temporal models
model Transect {
  id            String   @id @default(cuid())
  name          String
  geometry      Bytes    // PostGIS LineString (WKT stored as bytes)
  latitude      Float
  longitude     Float
  beachName     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  shorelines    ShorelinePosition[]
  sensors       Sensor[]
  riskScores    RiskScore[]
}

model ShorelinePosition {
  id            String   @id @default(cuid())
  transectId    String
  transect      Transect @relation(fields: [transectId], references: [id])
  date          DateTime
  position      Float    // Distance from baseline (meters)
  source        String   // "satellite", "drone", "crowdsource", "gnss", "fused"
  confidence    Float
  metadata      Json?    // Satellite scene ID, cloud cover, etc.
  createdAt     DateTime @default(now())
  
  @@index([transectId, date])
}

model Sensor {
  id            String   @id @default(cuid())
  transectId    String?
  transect      Transect? @relation(fields: [transectId], references: [id])
  type          String   // "tide_gauge", "wave_buoy", "camera", "weather"
  name          String
  latitude      Float
  longitude     Float
  status        String   // "active", "maintenance", "offline"
  config        Json     // Calibration, sampling rate, etc.
  lastSeen     DateTime?
  createdAt     DateTime @default(now())
  
  readings      SensorReading[]
}

model SensorReading {
  id            String   @id @default(cuid())
  sensorId      String
  sensor        Sensor   @relation(fields: [sensorId], references: [id])
  timestamp     DateTime
  value         Float    // Water level (m), wave height (m), etc.
  quality       Float    // 0-1 quality flag
  createdAt     DateTime @default(now())
  
  @@index([sensorId, timestamp])
}

model CrowdsourcePhoto {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  imageUrl      String
  thumbnailUrl  String?
  latitude      Float
  longitude     Float
  altitude      Float?
  heading       Float?   // Camera heading
  pitch         Float?   // Camera pitch
  takenAt       DateTime
  uploadedAt    DateTime @default(now())
  status        String   // "pending", "validated", "rejected"
  shorelineGeoJson Bytes? // Extracted shoreline as GeoJSON
  validationNotes String?
  validatedBy   String?
  validatedAt   DateTime?
  
  @@index([takenAt])
  @@index([status])
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  role          String   @default("citizen") // "citizen", "researcher", "admin", "planner"
  organization  String?
  createdAt     DateTime @default(now())
  
  photos        CrowdsourcePhoto[]
  alerts        Alert[]
}

model ErosionPrediction {
  id            String   @id @default(cuid())
  transectId    String
  transect      Transect @relation(fields: [transectId], references: [id])
  predictionDate DateTime
  horizonDays   Int      // 7, 30, 90, 180, 365
  predictedPosition Float
  lowerBound    Float    // Prediction interval
  upperBound    Float
  modelVersion  String   // "monsoon-lstm-v1.2"
  confidence    Float
  features      Json     // Input features used
  createdAt     DateTime @default(now())
  
  @@index([transectId, predictionDate])
  @@index([horizonDays])
}

model RiskScore {
  id            String   @id @default(cuid())
  transectId    String
  transect      Transect @relation(fields: [transectId], references: [id])
  date          DateTime
  erosionRisk   Float    // 0-1
  populationExposure Float
  infraExposure Float
  economicValue Float
  compositeScore Float   // Weighted MCDA score
  rank          Int      // Priority ranking
  factors       Json     // Breakdown of contributing factors
  createdAt     DateTime @default(now())
  
  @@index([date])
  @@index([compositeScore])
}

model Alert {
  id            String   @id @default(cuid())
  transectId    String
  transect      Transect @relation(fields: [transectId], references: [id])
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  type          String   // "erosion_threshold", "storm_surge", "sensor_anomaly", "prediction_deviation"
  severity      String   // "info", "warning", "critical"
  message       String
  data          Json     // Supporting data
  acknowledged  Boolean  @default(false)
  acknowledgedBy String?
  acknowledgedAt DateTime?
  createdAt     DateTime @default(now())
  
  @@index([transectId, createdAt])
  @@index([severity, acknowledged])
}

model MicroplasticSample {
  id            String   @id @default(cuid())
  transectId    String
  transect      Transect @relation(fields: [transectId], references: [id])
  date          DateTime
  latitude      Float
  longitude     Float
  concentration Float    // particles/kg
  polymerTypes  Json     // {"PE": 45, "PP": 30, ...}
  depthCm       Float
  erosionRate   Float?   // Concurrent erosion rate
  correlation   Float?   // Pearson correlation with erosion
  notes         String?
  createdAt     DateTime @default(now())
}

model ModelArtifact {
  id            String   @id @default(cuid())
  name          String   // "tl_shorenet", "monsoon_lstm", "risk_index"
  version       String
  type          String   // "segmentation", "forecast", "risk", "classification"
  framework     String   // "pytorch", "tensorflow", "sklearn", "onnx"
  modelPath     String   // Path to serialized model
  metrics       Json     // Validation metrics
  trainingData  Json     // Data splits, hyperparameters
  isActive      Boolean  @default(false)
  deployedAt    DateTime?
  createdAt     DateTime @default(now())
}
```

---

## 4. ML Pipeline Details

### 4.1 TLShoreNet (Transfer Learning Shoreline Segmentation)

```python
# Architecture: U-Net with EfficientNet-B0 encoder pretrained on CoastTrain
# Fine-tune on 200+ manually annotated Sentinel-2 scenes from Mangalore

class TLShoreNet(nn.Module):
    def __init__(self, n_classes=2, pretrained=True):
        super().__init__()
        self.encoder = timm.create_model('efficientnet_b0', pretrained=pretrained, features_only=True)
        self.decoder = UNetDecoder(encoder_channels=[16, 24, 40, 112, 320])
        self.head = SegmentationHead(320, n_classes)
        
    def forward(self, x):
        features = self.encoder(x)
        decoded = self.decoder(features)
        return self.head(decoded)

# Training: 
# Phase 1: Freeze encoder, train decoder on Mangalore data (50 epochs)
# Phase 2: Unfreeze, fine-tune with low LR (1e-5) on full dataset (30 epochs)
# Augmentation: Cloud simulation, tidal variation, atmospheric effects
```

### 4.2 Sensor Fusion (Kalman + Bayesian)

```python
# State: [shoreline_position, velocity, acceleration]
# Observations: Satellite (monthly, σ=10m), Tide gauge (15min, σ=0.01m), 
#               Wave buoy (hourly, σ=0.1m), Camera (daily, σ=1m), Crowdsource (irregular, σ=3m)

class CoastalKalmanFilter:
    def __init__(self, dt=1/96):  # 15-min timestep
        self.dt = dt
        # State transition matrix (constant acceleration model)
        self.F = np.array([[1, dt, 0.5*dt**2],
                           [0, 1, dt],
                           [0, 0, 1]])
        # Process noise
        self.Q = np.diag([0.01, 0.001, 0.0001])
        
    def fuse(self, observations: Dict[str, Tuple[float, float]]) -> Tuple[float, float]:
        """
        observations: {source: (value, variance)}
        Returns: (fused_position, fused_variance)
        """
        # Bayesian fusion with source reliability weights
        pass
```

### 4.3 Monsoon LSTM Forecast

```python
# Inputs: [shoreline_history(24mo), wave_height(30d), rainfall(30d), wind_speed(30d), tide(30d)]
# Output: Shoreline position at horizons [7, 30, 90, 180, 365] days

class MonsoonLSTM(nn.Module):
    def __init__(self, input_size=5, hidden_size=128, num_layers=2, horizons=[7,30,90,180,365]):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.attention = Attention(hidden_size)
        self.heads = nn.ModuleDict({
            str(h): nn.Sequential(
                nn.Linear(hidden_size, 64),
                nn.ReLU(),
                nn.Linear(64, 1)
            ) for h in horizons
        })
        
    def forward(self, x, exogenous):
        # x: [batch, seq_len, 1] - shoreline history
        # exogenous: [batch, seq_len, 4] - wave, rain, wind, tide
        combined = torch.cat([x, exogenous], dim=-1)
        lstm_out, _ = self.lstm(combined)
        context = self.attention(lstm_out)
        return {h: head(context) for h, head in self.heads.items()}
```

### 4.4 CoastXplain (Explainable AI)

```python
# Unsupervised behavior classification + SHAP + Natural Language Generation

class CoastXplainEngine:
    def __init__(self):
        self.clusterer = TimeSeriesKMeans(n_clusters=4, metric="dtw")
        self.explainer = shap.TreeExplainer  # For XGBoost risk model
        self.templates = self._load_nlg_templates()
        
    def classify_behavior(self, shoreline_series: np.ndarray) -> Dict:
        """Returns: {class_id, class_name, description, confidence, key_features}"""
        # Classes: CC-0 Stable, CC-1 Seasonal, CC-2 Erosive, CC-3 Accretive
        cluster = self.clusterer.predict(shoreline_series.reshape(1, -1, 1))[0]
        return self._generate_explanation(cluster, shoreline_series)
        
    def explain_risk(self, risk_features: Dict) -> str:
        """SHAP-based natural language explanation"""
        shap_values = self.explainer.shap_values(risk_features)
        return self._nlg_from_shap(shap_values, risk_features)
```

### 4.5 Socio-Economic Risk Index (MCDA)

```python
# Composite Risk = w1*ErosionSusceptibility + w2*PopulationDensity + 
#                  w3*InfrastructureValue + w4*EconomicActivity + w5*Vulnerability

class RiskIndexModel:
    WEIGHTS = {
        'erosion_susceptibility': 0.35,
        'population_exposure': 0.25,
        'infrastructure_exposure': 0.20,
        'economic_value': 0.10,
        'social_vulnerability': 0.10
    }
    
    def compute(self, transect: Transect, date: datetime) -> RiskScore:
        # 1. Erosion susceptibility from ML predictions
        # 2. Population from WorldPop/GHS raster at transect buffer
        # 3. Infrastructure from OSM building footprints
        # 4. Economic value from land use + property records
        # 5. Vulnerability from census (literacy, income, housing)
        pass
```

---

## 5. API Endpoints (FastAPI)

```python
# Core endpoints
GET    /api/v1/transects                    # List all monitoring transects
GET    /api/v1/transects/{id}               # Transect details + latest data
GET    /api/v1/transects/{id}/shorelines    # Historical shoreline positions
GET    /api/v1/transects/{id}/predictions   # Erosion forecasts
GET    /api/v1/transects/{id}/risk          # Current risk score + factors
GET    /api/v1/transects/{id}/explain       # XAI explanation

# Sensor data
GET    /api/v1/sensors                      # Sensor network status
GET    /api/v1/sensors/{id}/readings        # Time-series readings
WS     /api/v1/sensors/stream               # Real-time sensor WebSocket

# Crowdsourcing
POST   /api/v1/crowdsource/upload           # Upload photo + metadata
GET    /api/v1/crowdsource/photos           # List pending/validated photos
POST   /api/v1/crowdsource/validate         # Researcher validation
GET    /api/v1/crowdsource/stats            # Participation stats

# Alerts
GET    /api/v1/alerts                       # Filterable alert list
WS     /api/v1/alerts/stream                # Real-time alert push
POST   /api/v1/alerts/{id}/acknowledge      # Acknowledge alert

# Models
GET    /api/v1/models                       # Registered model artifacts
POST   /api/v1/models/retrain               # Trigger retraining
GET    /api/v1/models/{name}/metrics        # Model performance

# Microplastic
GET    /api/v1/microplastic/samples         # Sample database
POST   /api/v1/microplastic/analyze         # Correlation analysis
```

---

## 6. Frontend Pages (Next.js App Router)

```
/                                    → Dashboard (map + key metrics)
/map                                 → Full-screen interactive map
/map/transect/[id]                   → Transect detail panel
/forecast                            → Monsoon forecast explorer
/risk                                → Risk heatmap + priority table
/explain/[transectId]                → XAI deep-dive
/crowdsource                         → Community portal
/crowdsource/upload                  → Photo upload (mobile-optimized)
/crowdsource/validate                → Researcher validation queue
/alerts                              → Alert management
/sensors                             → Sensor network monitor
/admin                               → Admin console
/admin/models                        → Model registry + retraining
/admin/sensors                       → Sensor provisioning
/docs                                → Auto-generated API docs
```

---

## 7. Deployment Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vercel/Netlify │────▶│   FastAPI on     │────▶│   SQLite/        │
│   (Frontend)     │     │   Railway/Render │     │   PostgreSQL     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Model Storage   │
                       │  (S3/R2 + MLflow)│
                       └──────────────────┘
```

### Docker Compose (Local Dev)

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes:
      - ./backend:/app
      - model_storage:/models
      - data:/data
    environment:
      - DATABASE_URL=sqlite:///data/ceip.db
      - MLFLOW_TRACKING_URI=http://mlflow:5000
      
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.8
    ports: ["5000:5000"]
    volumes:
      - model_storage:/mlflow
      
  # Optional: Simulated sensor data generator
  sensor-sim:
    build: ./simulators/sensor-sim
    depends_on: [backend]
    
volumes:
  model_storage:
  data:
```

---

## 8. Development Roadmap (8-Week Sprint Plan)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | **Foundation** | Prisma schema, FastAPI skeleton, Next.js + Leaflet map, SQLite setup |
| 2 | **Data Ingestion** | STAC catalog client, Sentinel-2 downloader, sensor simulator, crowdsource upload API |
| 3 | **TLShoreNet** | Pre-trained U-Net download, annotation tool, fine-tuning pipeline, inference API |
| 4 | **Sensor Fusion** | Kalman filter implementation, multi-source fusion API, synthetic data validation |
| 5 | **Monsoon LSTM** | ERA5/IMD data pipeline, LSTM training, forecast API, horizon evaluation |
| 6 | **XAI + Risk** | CoastXplain clustering, SHAP integration, MCDA risk index, explanation API |
| 7 | **Crowdsource + Microplastic** | Photo validation UI, SfM pipeline, microplastic correlation engine |
| 8 | **Integration + Deploy** | End-to-end testing, alert system, dashboard polish, Docker deploy, documentation |

---

## 9. Key Libraries & Dependencies

### Backend (Python 3.11+)
```txt
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
httpx==0.26.0
pystac-client==0.7.0
planetary-computer==1.2.0
rasterio==1.3.9
rioxarray==0.14.1
xarray==2024.2.0
numpy==1.26.4
pandas==2.2.0
scikit-learn==1.4.0
torch==2.2.0
torchvision==0.17.0
timm==0.9.12
segmentation-models-pytorch==0.3.3
tslearn==0.6.2
shap==0.44.0
mlflow==2.9.0
pymannkendall==1.4.3
scipy==1.12.0
joblib==1.3.2
```

### Frontend (Node 20+)
```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "leaflet": "1.9.4",
    "react-leaflet": "4.2.1",
    "supercluster": "8.0.1",
    "@types/leaflet": "1.9.12",
    "recharts": "2.12.0",
    "date-fns": "3.6.0",
    "zustand": "4.5.0",
    "react-hook-form": "7.51.0",
    "zod": "3.22.0",
    "@hookform/resolvers": "3.3.0",
    "clsx": "2.1.0",
    "tailwind-merge": "2.2.0",
    "lucide-react": "0.350.0",
    "sonner": "1.4.0",
    "ws": "8.16.0"
  },
  "devDependencies": {
    "typescript": "5.4.0",
    "@types/node": "20.12.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "tailwindcss": "3.4.0",
    "postcss": "8.4.0",
    "autoprefixer": "10.4.0",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## 10. Simulation Strategy (No Hardware Required)

Since you're laptop-only, all sensor data is simulated with realistic physics:

```python
# backend/simulators/sensor_simulator.py
class CoastalSensorSimulator:
    """Generates realistic synthetic sensor data for development"""
    
    def __init__(self, transects: List[Transect]):
        self.transects = transects
        self.tide_model = TideModel()  # Harmonic constituents for Mangalore
        self.wave_model = WaveModel()  # ERA5-derived seasonal patterns
        self.erosion_model = ErosionProcess()  # Stochastic shoreline evolution
        
    def generate_reading(self, sensor: Sensor, timestamp: datetime) -> SensorReading:
        if sensor.type == "tide_gauge":
            # Astronomical tide + surge + noise
            tide = self.tide_model.predict(sensor.latitude, sensor.longitude, timestamp)
            surge = self.wave_model.storm_surge(timestamp)
            noise = np.random.normal(0, 0.01)  # 1cm sensor noise
            return tide + surge + noise
            
        elif sensor.type == "wave_buoy":
            # JONSWAP spectrum + directional spreading
            hs, tp, dir = self.wave_model.significant_wave_height(
                sensor.latitude, sensor.longitude, timestamp)
            return hs + np.random.normal(0, 0.05)
            
        elif sensor.type == "camera":
            # Simulated shoreline position from erosion model + tidal offset
            position = self.erosion_model.position_at(sensor.transect_id, timestamp)
            tidal_offset = self.tide_model.predict(...) * BEACH_SLOPE
            return position + tidal_offset + np.random.normal(0, 0.5)
```

---

## 11. Sample Data Sources (Pre-loaded)

| Dataset | Source | Use Case |
|---------|--------|----------|
| NCCR Shoreline (1990-2016) | INCOIS | Training labels, validation |
| CoastTrain Labels | DLR/ESA | TLShoreNet pretraining |
| Sentinel-2 L2A | Copernicus/PC | Monthly shoreline extraction |
| Landsat 8/9 C2L2 | USGS/PC | 30-year historical baseline |
| ERA5 Wave/Reanalysis | ECMWF | Monsoon LSTM exogenous inputs |
| IMD Rainfall | India Met Dept | Monsoon forcing |
| WorldPop 2020 | WorldPop | Population exposure |
| OSM Buildings | OpenStreetMap | Infrastructure exposure |
| INCOIS Tide Gauges | INCOIS | Validation, calibration |

---

## 12. Success Metrics

| Component | Metric | Target |
|-----------|--------|--------|
| TLShoreNet | IoU (Mangalore test) | >0.85 |
| Sensor Fusion | RMSE vs GNSS | <2m |
| Monsoon LSTM | MAE (30-day horizon) | <3m |
| Monsoon LSTM | MAE (monsoon peak) | <5m |
| CoastXplain | Expert usability score | >4/5 |
| Risk Index | Correlation with damages | >0.7 |
| Crowdsource | Shoreline RMSE vs GPS | <4m |
| Alert System | False positive rate | <15% |
| End-to-end | Dashboard load time | <2s |

---

## 13. Next Steps

1. **Initialize monorepo structure** with `/frontend` (Next.js) and `/backend` (FastAPI)
2. **Set up Prisma + SQLite** with complete schema
3. **Build STAC catalog client** for Sentinel-2/Landsat search
4. **Create annotation tool** for Mangalore shoreline labeling
5. **Download pre-trained CoastTrain U-Net weights**
6. **Implement sensor simulator** for realistic development data