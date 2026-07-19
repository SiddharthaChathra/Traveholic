# Database initialization and seeding
import uuid
from datetime import datetime, timedelta
import json

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    Transect, Sensor, SensorType, SensorStatus,
    User, UserRole, ShorelinePosition
)


async def init_db(session: AsyncSession) -> None:
    """Initialize database with seed data for Mangalore coast."""
    
    # Check if already initialized
    result = await session.execute(select(Transect).limit(1))
    if result.scalar_one_or_none():
        return  # Already initialized

    # Mangalore coast transects (approximate locations)
    transects_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Mangala Beach North",
            "geometry_wkt": "LINESTRING(74.833 12.877, 74.835 12.875)",
            "latitude": 12.876,
            "longitude": 74.834,
            "beach_name": "Mangala Beach",
            "baseline_distance_m": 100.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mangala Beach Central",
            "geometry_wkt": "LINESTRING(74.836 12.874, 74.838 12.872)",
            "latitude": 12.873,
            "longitude": 74.837,
            "beach_name": "Mangala Beach",
            "baseline_distance_m": 100.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mangala Beach South",
            "geometry_wkt": "LINESTRING(74.839 12.871, 74.841 12.869)",
            "latitude": 12.870,
            "longitude": 74.840,
            "beach_name": "Mangala Beach",
            "baseline_distance_m": 100.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Someshwar Beach North",
            "geometry_wkt": "LINESTRING(74.801 12.895, 74.803 12.893)",
            "latitude": 12.894,
            "longitude": 74.802,
            "beach_name": "Someshwar Beach",
            "baseline_distance_m": 120.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Someshwar Beach Central",
            "geometry_wkt": "LINESTRING(74.804 12.892, 74.806 12.890)",
            "latitude": 12.891,
            "longitude": 74.805,
            "beach_name": "Someshwar Beach",
            "baseline_distance_m": 120.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tannirbhavi Beach North",
            "geometry_wkt": "LINESTRING(74.798 12.915, 74.800 12.913)",
            "latitude": 12.914,
            "longitude": 74.799,
            "beach_name": "Tannirbhavi Beach",
            "baseline_distance_m": 150.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tannirbhavi Beach Central",
            "geometry_wkt": "LINESTRING(74.801 12.912, 74.803 12.910)",
            "latitude": 12.911,
            "longitude": 74.802,
            "beach_name": "Tannirbhavi Beach",
            "baseline_distance_m": 150.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Panambur Beach North",
            "geometry_wkt": "LINESTRING(74.808 12.930, 74.810 12.928)",
            "latitude": 12.929,
            "longitude": 74.809,
            "beach_name": "Panambur Beach",
            "baseline_distance_m": 100.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Panambur Beach Central",
            "geometry_wkt": "LINESTRING(74.811 12.927, 74.813 12.925)",
            "latitude": 12.926,
            "longitude": 74.812,
            "beach_name": "Panambur Beach",
            "baseline_distance_m": 100.0,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ullal Beach North",
            "geometry_wkt": "LINESTRING(74.855 12.820, 74.857 12.818)",
            "latitude": 12.819,
            "longitude": 74.856,
            "beach_name": "Ullal Beach",
            "baseline_distance_m": 80.0,
        },
    ]

    transects = []
    for t_data in transects_data:
        transect = Transect(**t_data)
        session.add(transect)
        transects.append(transect)

    await session.flush()

    # Add sensors for each transect
    sensor_configs = [
        # Tide gauges (one per beach)
        {"type": SensorType.TIDE_GAUGE, "name": "Mangala Tide Gauge", "transect_idx": 1,
         "lat": 12.873, "lon": 74.837, "config": {"sampling_rate_sec": 300, "datum": "MSL"}},
        {"type": SensorType.TIDE_GAUGE, "name": "Someshwar Tide Gauge", "transect_idx": 4,
         "lat": 12.891, "lon": 74.805, "config": {"sampling_rate_sec": 300, "datum": "MSL"}},
        {"type": SensorType.TIDE_GAUGE, "name": "Tannirbhavi Tide Gauge", "transect_idx": 6,
         "lat": 12.911, "lon": 74.802, "config": {"sampling_rate_sec": 300, "datum": "MSL"}},
        {"type": SensorType.TIDE_GAUGE, "name": "Panambur Tide Gauge", "transect_idx": 8,
         "lat": 12.926, "lon": 74.812, "config": {"sampling_rate_sec": 300, "datum": "MSL"}},
        {"type": SensorType.TIDE_GAUGE, "name": "Ullal Tide Gauge", "transect_idx": 9,
         "lat": 12.819, "lon": 74.856, "config": {"sampling_rate_sec": 300, "datum": "MSL"}},

        # Wave buoys (offshore)
        {"type": SensorType.WAVE_BUOY, "name": "Mangala Offshore Buoy", "transect_idx": 1,
         "lat": 12.860, "lon": 74.820, "config": {"sampling_rate_sec": 1800, "depth_m": 15}},
        {"type": SensorType.WAVE_BUOY, "name": "Someshwar Offshore Buoy", "transect_idx": 4,
         "lat": 12.880, "lon": 74.780, "config": {"sampling_rate_sec": 1800, "depth_m": 12}},
        {"type": SensorType.WAVE_BUOY, "name": "Panambur Offshore Buoy", "transect_idx": 8,
         "lat": 12.910, "lon": 74.790, "config": {"sampling_rate_sec": 1800, "depth_m": 10}},

        # Cameras
        {"type": SensorType.CAMERA, "name": "Mangala Beach Cam", "transect_idx": 1,
         "lat": 12.873, "lon": 74.837, "config": {"interval_sec": 3600, "resolution": "1920x1080"}},
        {"type": SensorType.CAMERA, "name": "Someshwar Beach Cam", "transect_idx": 4,
         "lat": 12.891, "lon": 74.805, "config": {"interval_sec": 3600, "resolution": "1920x1080"}},
        {"type": SensorType.CAMERA, "name": "Panambur Beach Cam", "transect_idx": 8,
         "lat": 12.926, "lon": 74.812, "config": {"interval_sec": 3600, "resolution": "1920x1080"}},

        # Weather stations
        {"type": SensorType.WEATHER, "name": "Mangalore Weather Station", "transect_idx": None,
         "lat": 12.914, "lon": 74.856, "config": {"sampling_rate_sec": 600}},
    ]

    for s_config in sensor_configs:
        transect_id = transects[s_config["transect_idx"]].id if s_config["transect_idx"] is not None else None
        sensor = Sensor(
            id=str(uuid.uuid4()),
            transect_id=transect_id,
            type=s_config["type"],
            name=s_config["name"],
            latitude=s_config["lat"],
            longitude=s_config["lon"],
            status=SensorStatus.ACTIVE,
            config=s_config["config"],
        )
        session.add(sensor)

    # Add default users
    users = [
        User(
            id=str(uuid.uuid4()),
            email="admin@ceip.local",
            name="CEIP Admin",
            role=UserRole.ADMIN,
            organization="Coastal Erosion Intelligence Platform",
        ),
        User(
            id=str(uuid.uuid4()),
            email="researcher@ceip.local",
            name="Research Team",
            role=UserRole.RESEARCHER,
            organization="NCCR / University",
        ),
        User(
            id=str(uuid.uuid4()),
            email="planner@dkdistrict.gov.in",
            name="District Planner",
            role=UserRole.PLANNER,
            organization="Dakshina Kannada District Administration",
        ),
    ]
    for user in users:
        session.add(user)

    # Add historical shoreline positions (simulated NCCR data)
    base_date = datetime(2015, 1, 1)
    for transect in transects:
        # Generate 10 years of semi-annual data
        for year in range(10):
            for month in [1, 7]:  # Pre and post monsoon
                date = datetime(base_date.year + year, month, 15)
                # Simulate erosion with seasonal variation and trend
                base_position = transect.baseline_distance_m
                trend = -0.3 * year  # 30cm/year erosion trend
                seasonal = 1.5 if month == 1 else -1.0  # Post-monsoon recovery
                noise = (hash(f"{transect.id}{date}") % 100) / 100 * 0.5
                position = base_position + trend + seasonal + noise
                
                shoreline = ShorelinePosition(
                    id=str(uuid.uuid4()),
                    transect_id=transect.id,
                    date=date,
                    position_m=position,
                    source="satellite",
                    confidence=0.85,
                    metadata={"method": "DSAS", "satellite": "Landsat-8"},
                )
                session.add(shoreline)

    await session.commit()
    print("Database initialized with Mangalore coast data")