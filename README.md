# Coastal Erosion Intelligence Platform (CEIP)

A comprehensive AI-powered platform for monitoring, forecasting, and managing coastal erosion along the Mangalore coast, Karnataka, India.

## 🌊 Overview

CEIP integrates multi-source coastal data (satellite imagery, IoT sensors, crowdsourced observations) with advanced machine learning models to provide real-time erosion monitoring, seasonal forecasting, and explainable risk assessment for coastal management.

### Key Features

| Feature | Description | Research Gap Addressed |
|---------|-------------|------------------------|
| **TLShoreNet** | Transfer learning U-Net (EfficientNet-B0) for shoreline segmentation from Sentinel-2 | Gap 4: Transfer Learning |
| **Sensor Fusion** | Kalman filter + Bayesian fusion of tide gauges, wave buoys, cameras, crowdsourcing | Gap 1: Low-cost Sensor Fusion |
| **Monsoon LSTM** | Multi-horizon LSTM with exogenous inputs (waves, rain, wind, tide) | Gap 3: Monsoon-specific ML |
| **CoastXplain** | Unsupervised behavior classification + SHAP explanations + natural language | Gap 5: Explainable AI |
| **Risk Index** | MCDA-weighted composite risk (erosion + population + infrastructure + vulnerability) | Gap 6: Socio-economic Integration |
| **Crowdsourcing** | Mobile-responsive photo upload with SfM shoreline extraction | Gap 2: Crowdsourced Mapping |
| **Edge Alerts** | TensorFlow Lite models for on-device erosion detection | Gap 8: Real-time Edge AI |

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│   Satellite  │    IoT       │ Crowdsource  │   Socio-Econ     │
│  (Sentinel-2 │  (Arduino    │  (Smartphone │   (Census, OSM,  │
│  Landsat)    │   Tide/Wave) │   Photos)    │    INCOIS)       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬─────────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INGESTION & PREPROCESSING                    │
│  STAC Catalog  •  MQTT/HTTP  •  Image Pipeline (EXIF, SfM)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ML PIPELINE (Python/FastAPI)             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ TLShoreNet   │ │ Sensor Fusion│ │ Monsoon LSTM │             │
│  │ (Segmentation)│ │ (Kalman+Bayes)│ │ (Forecasting)│             │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
│         │                │                │                      │
│  ┌──────┴────────────────┴────────────────┴───────┐             │
│  │         Unified Prediction & Alert Engine       │             │
│  └──────────────────────┬──────────────────────────┘             │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                       │
│  REST + WebSocket endpoints for predictions, alerts, maps      │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + React)                    │
│  • Interactive Leaflet Map  • Real-time Alerts                  │
│  • Explainable AI Panel    • Community Portal                   │
│  • Forecast Charts         • Risk Heatmaps                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 20+ (for frontend development)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/ceip.git
cd ceip

# Copy environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start all services
docker-compose up -d

# Access the platform
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -e .  # install in development mode

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev

# Access at http://localhost:3000
```

## 📦 Project Structure

```
ceip/
├── backend/                    # FastAPI ML Backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── routes/        # Transects, Sensors, Crowdsource, Alerts, ML, Dashboard
│   │   ├── core/              # Configuration
│   │   ├── db/                # Database session & init
│   │   ├── ml/                # ML Models & Services
│   │   │   ├── tl_shorenet.py        # Transfer Learning Shoreline Segmentation
│   │   │   ├── monsoon_lstm.py       # Monsoon LSTM Forecasting
│   │   │   ├── coastxplain.py        # Explainable AI Engine
│   │   │   ├── risk_index.py         # MCDA Risk Index
│   │   │   └── pipeline.py           # ML Pipeline Orchestrator
│   │   ├── models/            # SQLAlchemy Models
│   │   ├── schemas/           # Pydantic Schemas
│   │   ├── services/          # Business Logic Services
│   │   └── simulators/        # Synthetic Sensor Data Generator
│   ├── alembic/               # Database Migrations
│   ├── tests/                 # Unit Tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js React Frontend
│   ├── src/
│   │   ├── app/               # App Router Pages
│   │   ├── components/        # React Components
│   │   ├── lib/               # API Client, Store, Utils
│   │   └── styles/            # Global Styles
│   ├── public/                # Static Assets
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml          # Multi-container Orchestration
├── ARCHITECTURE.md             # Detailed Architecture Document
└── README.md
```

## 🔬 ML Models

### 1. TLShoreNet (Shoreline Segmentation)
- **Architecture**: U-Net with EfficientNet-B0 encoder
- **Transfer Learning**: Pre-trained on CoastTrain (global), fine-tuned on Mangalore Sentinel-2
- **Input**: 6-band Sentinel-2 (B2, B3, B4, B8, B11, B12) normalized to [0,1]
- **Output**: Water probability map → shoreline vector extraction
- **Accuracy**: Target IoU > 0.85 on Mangalore test set

### 2. Sensor Fusion (Kalman + Bayesian)
- **State**: [position, velocity, acceleration] per transect
- **Sources**: Satellite (monthly, σ=10m), Tide gauge (15min, σ=1cm), Wave buoy (hourly, σ=5cm), Camera (daily, σ=0.5m), Crowdsource (irregular, σ=3m)
- **Method**: Kalman prediction + Bayesian precision-weighted update

### 3. Monsoon LSTM (Multi-horizon Forecasting)
- **Inputs**: 24-month shoreline history + exogenous [Hs, rainfall, wind, tide]
- **Architecture**: 2-layer LSTM (128 hidden) + attention + horizon-specific heads
- **Horizons**: 7, 30, 90, 180, 365 days
- **Monsoon Adaptation**: Learned monthly embeddings + monsoon indicator

### 4. CoastXplain (Explainable AI)
- **Behavior Classes**: Stable (CC-0), Seasonal (CC-1), Erosive (CC-2), Accretive (CC-3)
- **Method**: DTW k-means clustering + feature extraction + SHAP + natural language generation
- **Output**: Class label, confidence, feature importance, plain-language summary

### 5. Risk Index (MCDA)
- **Weights**: Erosion 35%, Population 25%, Infrastructure 20%, Economic 10%, Vulnerability 10%
- **Normalization**: Linear/log/sigmoid per factor
- **Output**: Composite score [0,1], category, rank, factor breakdown

## 🌍 Mangalore Coast Configuration

The platform is pre-configured for 10 transects across 5 beaches:

| Beach | Transects | Baseline (m) | Erosion Rate (m/yr) | Seasonal Amp (m) |
|-------|-----------|--------------|---------------------|------------------|
| Mangala Beach | 3 | 100 | -0.28 to -0.35 | 1.8-2.5 |
| Someshwar Beach | 2 | 120 | -0.38 to -0.42 | 2.8-3.0 |
| Tannirbhavi Beach | 2 | 150 | -0.15 to -0.18 | 1.2-1.5 |
| Panambur Beach | 2 | 100 | -0.20 to -0.25 | 1.8-2.0 |
| Ullal Beach | 1 | 80 | -0.50 | 3.5 |

**Monsoon Months**: June-September (Southwest Monsoon)
**Bounding Box**: [74.7, 12.7, 75.0, 13.1]

## 📡 API Endpoints

### Core Resources
```
GET    /api/v1/transects                    # List transects
GET    /api/v1/transects/{id}               # Transect detail
GET    /api/v1/transects/{id}/shorelines    # Historical shorelines
GET    /api/v1/transects/{id}/predictions   # Erosion forecasts
GET    /api/v1/transects/{id}/risk          # Risk score
GET    /api/v1/transects/{id}/explain       # XAI explanation
GET    /api/v1/beaches                      # List beaches
GET    /api/v1/map/transects                # GeoJSON for map
```

### Sensors
```
GET    /api/v1/sensors                      # Sensor network
GET    /api/v1/sensors/{id}/readings        # Time-series data
GET    /api/v1/sensors/{id}/latest          # Latest reading
GET    /api/v1/sensors/stats/summary        # Network summary
WS     /api/v1/sensors/stream               # Real-time sensor data
```

### Crowdsourcing
```
POST   /api/v1/crowdsource/upload           # Upload photo
GET    /api/v1/crowdsource/photos           # List photos
POST   /api/v1/crowdsource/photos/{id}/validate  # Validate (researcher)
GET    /api/v1/crowdsource/stats            # Participation stats
```

### Alerts
```
GET    /api/v1/alerts                       # Filterable alerts
POST   /api/v1/alerts/{id}/acknowledge      # Acknowledge
WS     /api/v1/alerts/stream                # Real-time alerts
GET    /api/v1/alerts/stats                 # Alert statistics
```

### ML Services
```
POST   /api/v1/ml/shoreline/extract         # TLShoreNet inference
POST   /api/v1/ml/sensor/fuse               # Sensor fusion
POST   /api/v1/ml/forecast/erosion          # Monsoon LSTM forecast
POST   /api/v1/ml/xai/behavior              # Behavior classification
POST   /api/v1/ml/xai/risk                  # Risk explanation
POST   /api/v1/ml/risk/compute              # MCDA risk index
POST   /api/v1/ml/risk/batch                # All transects risk
GET    /api/v1/ml/pipeline/status           # Pipeline status
```

## 🗄 Database Schema (SQLite/PostgreSQL)

Key tables:
- `transects` - Monitoring cross-shore profiles
- `shoreline_positions` - Historical shoreline measurements
- `sensors` - IoT sensor registry
- `sensor_readings` - Time-series sensor data
- `crowdsource_photos` - Community-contributed images
- `erosion_predictions` - ML forecast outputs
- `risk_scores` - MCDA risk index results
- `alerts` - System-generated alerts
- `microplastic_samples` - Microplastic-erosion correlation
- `model_artifacts` - ML model registry

## 🔧 Configuration

### Environment Variables (Backend)
```bash
# Application
APP_NAME="Coastal Erosion Intelligence Platform"
DEBUG=true
API_V1_PREFIX="/api/v1"

# Database
DATABASE_URL="sqlite+aiosqlite:///./ceip.db"

# Satellite Data
PLANETARY_COMPUTER_API_KEY=""  # Optional for higher rate limits

# Mangalore Configuration
MANGALORE_BBOX=[74.7, 12.7, 75.0, 13.1]
MONSOON_MONTHS=[6, 7, 8, 9]

# Sensor Simulation
SIMULATION_ENABLED=true
SENSOR_READING_INTERVAL_SECONDS=300

# ML Models
MODEL_DIR="./models"
INFERENCE_DEVICE="cpu"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

### External API Keys (Optional)
- `PLANETARY_COMPUTER_API_KEY` - Microsoft Planetary Computer (higher STAC rate limits)
- `IMD_API_KEY` - India Meteorological Department (rainfall data)
- `INCOIS_API_KEY` - Indian National Centre for Ocean Information Services (tide data)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📊 Monitoring & Observability

- **Health Check**: `GET /health`
- **Metrics**: Prometheus metrics at `/metrics` (when enabled)
- **Logs**: Structured JSON logging
- **MLflow**: Experiment tracking at `http://localhost:5000`

## 🚢 Deployment

### Production Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes (Helm)
```bash
helm install ceip ./helm/ceip -n ceip --create-namespace
```

### Environment-Specific Configs
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production (with nginx, SSL, monitoring)
- `docker-compose.test.yml` - CI/CD testing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- **Python**: Black, isort, ruff
- **TypeScript/React**: ESLint, Prettier
- **Commits**: Conventional Commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CoastSat** (Vos et al.) - Open-source shoreline extraction toolkit
- **CoastTrain** (DLR/ESA) - Global shoreline segmentation dataset
- **CoastXplain** (de Vries et al.) - Explainable coastal change classification
- **Planetary Computer** - Microsoft's planetary-scale environmental data platform
- **INCOIS/NCCR** - Indian coastal monitoring data
- **OpenStreetMap** - Infrastructure and population data

## 📚 References

1. Vos, K., et al. "CoastSat: A Google Earth Engine-enabled shoreline mapping." *Environmental Modelling & Software* (2020).
2. de Vries, S., et al. "CoastXplain: Interpretable coastal behaviour classification." *Coastal Engineering* (2023).
3. Harley, M.D., et al. "Coastal imaging from community smartphones." *Coastal Engineering* (2023).
4. NCCR. "National Assessment of Shoreline Change for Indian Coast." (2018).
5. INCOIS. "Shoreline Change Atlas for Karnataka Coast." (2022).

## 📞 Contact

For questions or collaboration inquiries:
- **Project Lead**: [Your Name] - [email@institution.edu]
- **Institution**: [Your University/Organization]
- **GitHub Issues**: For bug reports and feature requests

---

**Built for the Mangalore Coast** • **Powered by AI & Open Science** 🌊🤖